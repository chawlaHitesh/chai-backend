import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { verifyId } from "../utils/verifyId.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    const owner=req?.user?._id
    if (!content) {
        throw new ApiError(400,"Content Is Required Field.")
    }
    const response=await Tweet.create({
        content,
        owner
    })
    if (!response) {
        throw new ApiError(400,"Something went wrong")
    }
    res.status(200).json(new ApiResponse(200,response))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req?.params
    const verifiedUserId=verifyId(userId)
    const response=await Tweet.aggregate([
        {
            $match:{
                owner:verifiedUserId
            }
        },{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        fullname:1,
                        avatar:1,
                        _id:1
                    }
                }]
            }
        },{
            $addFields:{
                owner:{$first:"$owner"}
            }
        }
    ])
    res.status(200).json(new ApiResponse(200,response))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req?.params 
    const verifiedTweetId=verifyId(tweetId)
    const {content}=req?.body
    if (!content) {
        throw new ApiError(400,"SomeThing Wnet Wrong")
    }
    const response=await Tweet.findOneAndUpdate({
        $and:[
            {_id:verifiedTweetId},
            {owner:req?.user?._id}
        ]
    },{
        $set:{
            content:req?.body?.content
        }
    },{
        new:true
    })
    if (!response) {
        throw new ApiError(400,"Oops! We couldn't find the tweet you're trying to update. It might not exist or it's possible that you didn't create this tweet")
    }
    res.status(200).json(new ApiResponse(200,response))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req?.params 
    const owner=req?.user?._id
    const verifiedTweetId=verifyId(tweetId)
    const response=await Tweet.findOneAndDelete({
        $and:[
            {_id:tweetId},
            {owner}
        ]
    })
    if (!response) {
        throw new ApiError(400,"Oops! We couldn't find the tweet you're trying to delete. It might not exist or it's possible that you didn't create this tweet.")
    }
    res.status(200).json(new ApiResponse(200,"Tweet Delete SuccessFully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

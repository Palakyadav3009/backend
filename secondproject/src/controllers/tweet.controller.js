import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const user  = req.user?._id;
    const {content} = req.body;

    if(!content){
        throw new ApiError(400, "Content is Required");
    }

    const tweet= await Tweet.create({
        content: content,
        owner: user
    })
    if (!tweet) {
        throw new ApiError(500, "Error in creating tweet");
     }

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const  {userId} = req.params;
    console.log("user: ", userId)

     if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user Id")
     }
    
    try {

        const tweets=await Tweet.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "_id",
                    foreignField: "owner",
                    as: "user"

                }

            },
            {
                $lookup:{
                    from: "likes",
                    localField: "_id",
                    foreignField: "tweet",
                    as: "tweetlikes",
                    pipeline:[
                        {
                            $project:{
                                likedby:1
                            }
                        }
                    ]
            }
            },
            {
              $addFields:{
                likescount :{
                    $size: "$tweetlikes"
                }   
                
                
            }
        },
        {
            $project:{

                    "_id": 1,           
                    "content": 1,
                    "user.username": 1,
                    "likesCount" : 1,
                    "tweetlikes.likedBy": 1
            }
        },



        ]);

        console.log("tweets :", tweets)

        if (!tweets?.length) {
            throw new ApiError(500, "Error fetching your tweets")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, {tweets}, "Tweets fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Getting error in fetching the tweets.")
        
    }



})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} =req.body 
    const{tweetId} = req.params;

    if(!content){
        throw new ApiError(400, "Content is Required");
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiErrors(400, "Invalid Tweet Id");
     }

    const tweet  = await Tweet.findByIdAndUpdate( req.user?._id,{
       
        tweetId,
        $set:{content},
        

        },{new:true}
    )
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    console.log("tweet: ", tweet)
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {tweet}, "Tweet updated successfully.")
    )



})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
  
    if (!isValidObjectId(tweetId)) {    
        throw new ApiErrors(400, "Invalid Tweet Id");
     }
     const tweet = await Tweet.findById(tweetId);
     
     if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    //check user owns the tweet
    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiErrors(
           400,
           "You can not delete the tweet as you are not the owner"
        );
     }

     await Tweet.findByIdAndDelete(tweetId);

    //return response
    res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!videoId){
        throw new ApiError(400, "Please provide video id")
    }

    const user = req.user?._id 

   try {
     const video = await Video.findById(videoId)
     if (!video) {   
         throw new ApiError(404, "Video not found")
     }
 
    const isLiked= await Like.findOne({
         video:videoId,
         likedBy:user
     })
     if(isLiked){
         const removeLike=await Like.findOneAndDelete({
             video:videoId,
             likedBy:user
         })
         if(!removeLike){
             throw new ApiError(500, "Error in deleing the previous like on this video.")
         }
         return res
         .status(200)
         .json(
             new ApiResponse(200, {}, "Unliked the video.")
         )
 
         
     }else{
 
         const createLike = await Like.create({
             video:videoId,
             likedBy:user
         })
         if (!createLike){
             throw new ApiError(500, "Error in creating the like document on this video.")
         }
 
         return res
         .status(200)
         .json(
             new ApiResponse(200, {}, "Liked the video.")
         )
     }
   } catch (error) {
    throw new ApiError(500, "Getting error in toggle the like on this video")
    
   }

        
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId){
        throw new ApiError(400, "Please provide comment id")
    }

    const user = req.user?._id
    if (!user){
        throw new ApiError(401, "Please login to like the comment")
    }

    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(404, "Video not found")
    }

   const comment = await Comment.findById(commentId)
   if(!comment){
    throw new ApiError(500, "Comment not found.")
}
   const isLiked = await Like.findOne({likedBy: user, comment:commentId})
   if (isLiked){
    const deleteLike = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: user
    })
    if(!deleteLike){
        throw new ApiError(500, "Error in deleting the like on this comment.")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Unliked the comment.")
    )
}else {
    const createLike = await Like.create({
        comment: commentId,
        likedBy: user 
    })

    if(!createLike){
        throw new ApiError(500, "Error in creating the like document on this comment.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Liked the comment.")
    )
}

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(400, "Please provide the tweet ID.")
    }

    const user = req.user?._id

    // console.log("tweetId: " , tweetId)
    // console.log("user: " , user)

    try {
        const tweet = await Tweet.findById(tweetId)
    
        // console.log("tweet: " , tweet)

        if(!tweet){
            throw new ApiError(500, "tweet not found.")
        }
    
        const isLiked = await Like.findOne({
            tweet: tweetId,
            likedBy: user
        })
    
        // console.log("isLiked: " , isLiked)

        if (isLiked){
            const deleteLike = await Like.findOneAndDelete({
                tweet: tweetId,
                likedBy: user
            })
    
            // console.log("deleteLike: " , deleteLike)

            if(!deleteLike){
                throw new ApiError(500, "Error in deleting the tweet on this comment.")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Unliked the tweet.")
            )
        }
        else {
            const createLike = await Like.create({
                tweet: tweetId,
                likedBy: user 
            })

            // console.log("createLike: " , createLike)
    
            if(!createLike){
                throw new ApiError(500, "Error in creating the like document on this tweet.")
            }
    
            return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Liked the tweet.")
            )
        }
    
    } 
    catch (error) {
        throw new ApiError(500, "Getting error in toggling the like on this tweet.")
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user = req.user?._id
    if(!user){
        throw new ApiError(401, "Please login to get liked videos.")
    }

    const likedVideos = await Like.aggregate([
        {
            $set: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
             },
        },
        {
            $lookup:{
                from : 'videos',
                localField: video ,
                foreignField: '_id',
                as: 'videos',
                pipeline:[
                    {
                        $match:{
                            isPublished: true
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes",
                            pipeline: [
                                {
                                    $count: "totalLikes"
                                }
                            ]
                    }
                }
                ]

            }
           
        },
        {
            $lookup:{
                from:"users",
                localField: "owner",
                foreignField: "_id",
                as:"videoOwner",
                pipeline:[
                    {
                        $project:{

                            username : 1,
                            email:1,
                            fullName:1 
                        }
                    }
                ]
            }
        },{
            $addFields:{
                likes :{
                    $first :"$likes.totalLikes"
                },
                videoOwner:{
                    $first:"$videoOwner"
                }
            }
        },
        {
            $project:{
                _id : 1,
                videoFile:1,
                thumbnail:1,
                title:1,
                description: 1,
                duration: 1,
                createdAt: 1,
                views: 1,
                likes: 1,
                videoOwner: 1
            }
        },
        {
            $project:{
                _id: 1,
                createdAt: 1,
                videos: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1,
                    likes: 1,
                    videoOwner: 1
                },

            }
        }
    ])

    if(!likedVideos.length===0){
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Nobody liked any video till now.")
        )
    }
    else {
        return res
        .status(200)
        .json(
            new ApiResponse(200, allLikedVideos, "All liked video fetched from database.")
        ) 
    }

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
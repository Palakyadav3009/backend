import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //Extracting properties from an object: It extracts specific properties (page, limit, query, sortBy, sortType, and userId) from the req.query object in your Express application.
  // Assigning them to variables: It assigns these extracted properties to individual variables with the same names (page, limit, etc.). Additionally, it provides default values (1 for page and limit) if the properties are not present in the req.query object.
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  if (!query) {
    throw new ApiError(400, "Please give query to retrieve video.");
  }

  if (!sortBy) {
    throw new ApiError(400, "Please give sortBy value to sort the videos.");
  }

  if (!sortType) {
    throw new ApiError(400, "Please give sortType value of video.");
  }

  if (!userId) {
    throw new ApiError(400, "Please give user Id.");
  }

  const videos = await Video.aggregate([
    {
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "userDetail",
        pipeline: [
          {
            $project: {
              username: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",

        pipeline: [
          {
            $count: "totalLikes",
          },
        ],
      },
    },
    {
      $addFields: {
        likescount: {
          $cond: {
            if: { $eq: [{ size: "$likes.totalLikes" }, 0] },
            then: 0,
            else: "$likes.totalLikes",
          },
        },
        owner: {
          $first: "$owner.username",
        },
      },
    },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
        likes: 1,
      },
    },
    { $sort: { [sortBy]: sortType === asc ? 1 : -1 } },
    { $skip: skip },
    { $limit: pageSize },
  ]);
  // console.log("videos :", videos)
  if (videos.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No video available."));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, { videos }, "Video fetched successfully."));
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiErrors(401, "All feilds are required");
  }

  const videoLocalPath = await req.files?.videoFile[0].path;
  if (!videoLocalPath) {
    throw new ApiErrors(404, "Video file is required");
  }
  const thumbnailLocalPath = await req.files?.thumbnail[0].path;
  if (!thumbnailLocalPath) {
    throw new ApiErrors(404, "thumbnail  is required");
  }

  const videoFile = await uploadCloudinary(videoLocalPath);
  const thumbnailFile = await uploadCloudinary(thumbnailLocalPath);
  if (!videoFile) {
    throw new ApiErrors(400, "Video File not found");
  }

  if (!thumbnailFile) {
    throw new ApiErrors(400, "Thumbnail File not found");
  }

  const video = await Video.create({
    title,
    description,
    duration: videoFile.duration,

    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },

    thumbnailFile: {
      url: thumbnailFile.url,
      public_id: thumbnailFile.public_id,
    },

    isPublished: true,
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiErrors(400, "Video not found");
  }
  const videoUpload = await Video.findById(video._id);

  if (!videoUpload) {
    throw new ApiErrors(500, "Video uploading is failed! Try again... ");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, video, "Video Uploaded SuccessFully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide valid video id");
  }

  const video2 = await Video.findById(videoId);

  if(!video2){
    throw new ApiErrors(404, "Video not found");
  }

 const video  = await Video.aggregate([
    {
        $match:{
            _id :new mongoose.Types.ObjectId(videoId)
        }
    },
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"userDetail"
        }

    },
    {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"video",
            as:"likes"
        }
    }
 ])




 
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

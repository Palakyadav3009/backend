//REGISTER
//where ever User.some other types method  is used these are from mongodb from mongoose
//and user.ispasswrod these are those which we build jo database se vapas lioya h uska insist liya h

// asynchandler is used for checking web req handling
//async is ineternal method
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiErrors.js"
import { User} from "../models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

//here we are generating new tokens
const generateAccessAndRefereshTokens =async(userId)=>{
    try {   //whenever we run this method generateAccessAndRefereshTokens ye apne aap
       //user ko bhi find krlega
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()  //generate accessToken  karelga khud se
        const refreshToken = user.generateRefreshToken() //generate refreshToken karelga khud se

        user.refreshToken = refreshToken             //refreshToken ne database me save bhi akradiya
        await user.save({ validateBeforeSave: false })    //ye save hogya

        return {accessToken, refreshToken}     //accessToken bhi genrate hogya
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
        
    }
}


const registerUser = asyncHandler(async(req,res)=>{
  //get user details from frontend
  //validation -not empty
  //check if user is already exists : check karege by email or username
  //check for images,check for avatar
  //upload them on cloudinary,avatar
  //create user object -create entry in db
  // remove password and refersh token field from response
  //check for user creation -  return response 






//step1   //get user details from frontend
const {fullName, email, password,username} = req.body
//console.log('email',email);


// if(fullname ===''){
//     throw new ApiError(400,'fullname is required')
// } sabko esai check kro ya toh niche vala dekho vese bhi kar skte h


//step2   //validation -not empty
if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
) {
    throw new ApiError(400, "All fields are required")
}



//step3  //check if user is already exists : check karege by email or username
const existedUser = await User.findOne({
    $or: [{ username }, { email }]
})

if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
}
//console.log(req.files);


//step4   //check for images,check for avatar
const avatarLocalPath = req.files?.avatar[0]?.path;
//const coverImageLocalPath = req.files?.coverImage[0]?.path;

let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
}

//step 5   //upload them on cloudinary,avatar
const avatar = await uploadCloudinary(avatarLocalPath)
 const coverImage =await uploadCloudinary(coverImageLocalPath)

 if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
}
//step 6   //create user object -create entry in db
const user =await User.create({
    fullName,
    avatar: avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})
//step 7 // remove password and refersh token field from response
const createdUser = await User.findById(user._id).select(  "-password -refreshToken") // here - its a negative sign jiske agye bhi ye  laga vo chiz nai chahie



if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
}
//step 8   //check for user creation -  return response 
return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)
                                                         

});


const loginUser =asyncHandler(async(req,res)=>{
     // req body -> data
    // username or email
    //find the user that exists or not
    //password check
    //access and referesh token
    //send cookie
    


      // req body -> data
    const{email,password,username} =req.body
    console.log('email',email);
       // username or email
    if (!username && !email) {
        throw new ApiError(400,"EMail is required")
        
    }
    // if (!(username || email)) {
    //     throw new ApiError(400,"EMail is required")
        
    // }



      //find the user that exists or not
      const user = await User.findOne({
        $or :[{username},{email}]      // here we can directly serach email or username like
                                       //findone({email}) but we want both to search if username 
                                         //exist or email exists thats why we used $or:[]
                                         //these are mongodb operators
      })
 

      //if user does not exist
      if(!user){
        throw new ApiError(404,"User does not exist")
      }

      //if user exist check the password
      //for password we already built bycrpt password
      const isPasswordValid =await user.isPasswordCorrect(password);
      if(!isPasswordValid){
        throw new ApiError(401,"password incorrect ")
      }

       //if password is correct access and referesh token banao
      // here we will use access and referesh token again and again so we are making a method and by that we can call access and referesh token anywhere in our code
      const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)


      
      //here we have to check that is it ok to call db again like it should not expensive its depend on the use case

      const loggedInUser =await User.findById(user._id).select(' -password -refreshToken')
      //ab isko cookies me bhejo

      const options = { /// can only edit by server
        httpOnly : true ,   
        secure:true
      }

      return res.status(200)
      .cookie('accessToken',accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken   //this thing we are doing what if user want to save them 
            } ,                                                 // for themselves
              "User logged in Succesfully"
            )
      )

});

const logoutUser = asyncHandler(async(req,res)=>{
    //like we dont have a access of req.user
    //we can do middleware thing here also but we have to reuse these again and again 
    //and if we write here we cant use it again thats we make auth middleware

    //jab hi logout karna user ko //how to check which user it is //so here we will build custom middleware "authmiddleware"

    //now we can access req.user after building middleware all of thing
   // req.user._id        // user milgy

   await User.findByIdAndUpdate(
    req.user._id,
    {
        // $set:{    // set use kiu krte hai jaba jaha jaha update or change krna ho vaha set krke uske andr daldo jo bhi update krna ho.
        //     refreshToken: 1 // this removes the field from document
        // }

        $unset:{
            refreshToken:1
        }
    },
        {
            new: true
        }
    
   )
   //cookiess
   const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)  //by cookieparser
.clearCookie("refreshToken", options)  //already remove it from db now removing from user
.json(new ApiResponse(200, {}, "User logged Out"))

});

//making this so that when we get access refresh token from frontend should there endpoint same as referesh token in backend database endpoint 
//bas chceck kr rae dono endpoint same hone cahiye
const refreshAccessToken = asyncHandler(async(req,res)=>{

    //refersh token cookies se accesss kr skte hai 
 const incomingRefreshToken =   req.cookies.refreshToken || req.body.refreshToken 
 //agar koi mobile me use kr ra ho toh  req.body.refreshToken
 if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
}

try {
    //ab jo token araha hoga usse verify bhi toh krna hoga
    //change the encoded token into decoded token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    //checking that user 
    const user =await User.findById(decodedToken?._id)
    //if we dont get that user
    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }
    //now matching  the tokens
    if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    
    }
    //what if they matched we wil generate new refersh token
    //but phle cookies m bhejege
    const options = { 
        httpOnly: true,
        secure: true
    }
    //now generating
    const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
    
}
                                      
});

const changeCurrentPassword  = asyncHandler(async (req, res) => {
    //ab isme bhasad nahi h ki user exist krta hai ki ni 
    //vo sab hm jwt middleware se karalenge

    const {oldPassword,newPassword} =req.body;

  const user =await  User.findById(req.user?._id)
  //old pass is correct or not
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
}

//new password
user.password = newPassword
await user.save ({validateBeforeSave:false})
return res
.status(200)
.json(new ApiResponse(200, {}, "Password changed successfully"))
});

const getCurrentUser = asyncHandler(async(req,res) => {

    return res
    .status(200)
    .json(200,req.user,'current user')
});

const updateAccountDetails  =asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if (!(fullName || email)) {
        throw new ApiError(400, "All fields are required")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,{
            $set:{
                fullName: fullName,
                email: email
            }
        },{new:true} //update hone k bad jo information hoti vo return hoti h
    ).select("-password") //jo field nahi chahie

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

});

const updateUserAvatar  = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path      /// by this we can also store directly in db withoutcloudinary

    if(!avatarLocalPath){
        throw new ApiError(404, "avatar file is missing")

    }

    const avatar = await uploadCloudinary(avatarLocalPath)

    //if it get upload but get any url 
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")

    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        }, {new: true}



    ).select("-password")

    return res    //response bhejna
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar image updated successfully")
    )

})
const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})


const getUserChannelProfile  =asyncHandler(async(req,res)=>{
    const {username}=req.params      //destruccte krlia username ko  //paramas give us urls
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
    const channel = await User.aggregate([
        {  //these are pipelines
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",  //Subscription model se sari chize lowercase m cnvrt hojti                                    //or plural m hojati h means ek s laga do last m          
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscription",  //Subscription model se sari chize lowercase m cnvrt hojti
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
               subscribersCount: {
                $size :"$subscribers"  //size is used to count the number of subscribers
                                     //"$subscribers" use $ here becasue it is a field
               },
               channelsSubscribedToCount:{
                $size: "$subscribedTo"
               },
               isSubscribed:{
                $cond:{   //$cond me 3 chize hoti h if then else
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]} ,
                    then :true,
                    else:false
                }

               }
            }
        },
        {
            $project:{           //it give selcted things
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                createdAt:1


            }
        }
      
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate(
        [
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"watchHistory",
                    foreignField:"_id",
                    as:"watchHistory",
                    pipeline:[
                        {  //sub pipeline
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1

                                    }

                            }
                        ]
                        }

                    }
                ]
                }
            },{
                $addFields:{
                    owner:{  ///array milta h isliye kiya
                        $first: "$owner"  //array m se first value niklne k liye
            }
                }
            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory,
            "Watch history fetched successfully")
    )

})


export {
registerUser,
loginUser,
logoutUser,
refreshAccessToken,
changeCurrentPassword,
getCurrentUser,
updateAccountDetails,
updateUserAvatar,
updateUserCoverImage,
getUserChannelProfile,
getWatchHistory
}


//here steps are not for the way to always use like this its different for the other use cases 
//here its just a logic building how we have to check or how to build these things
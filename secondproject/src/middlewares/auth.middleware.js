//building custom middleware
//this middleware verify that user exists or not

//why verift JWT because when you logged in the user e give them accesstoke and refernce token by this we were checking that user have correct token or not
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
 try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", ""); //what if accesstoken is not there thatswhy we use ?.
   
   if(!token){
       throw new ApiError(401, "Unauthorized request")
   }
   
   //what if we do have a token 
   //we will that token is correct or not so for that we use JWT
   
   const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
       
   const user = await User.findById(decodedToken?._id).select("-password -refreshToken")  // _id kiu model me hmne ese hi bnya h
   
    
   if (!user) {
               
       throw new ApiError(401, "Invalid Access Token")
   }
   //agar user hai toh
   req.user= user;
   //jab finally kam hogya h 
   next()
   
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
 }





});

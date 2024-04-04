import { Router } from "express";
import {  loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

 /// just like we are making a app from express here we are making router from express
 const router = Router();


// this thing is calling by a users in app.js whenever somepne click on users this thing will be called
router.route("/register").post(
    upload.fields([            // this is middleware
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)    

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)  //thats why we use next in authmiddleware
 router.route('/refresh-token').post(refreshAccessToken)
 router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile) //because we use params 
router.route("/history").get(verifyJWT, getWatchHistory)
export default router
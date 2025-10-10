import express, { Router } from "express";
import {
  registerUser,
  loginUser,
  logout,
  changeCurrentPassword,
  refreshAccessToken,
  updateEmail,
  changedAvatar,
  chnageCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getCurrentUser,
  removeAvatar,
  changeUsername,
  changeEmail,
  removeCoverImage
} from "../contollers/user.controller.js";
// import  {secondUser}  from '../contollers/user.controller.js'
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logout);
router.route("/change-password").patch(verifyJwt, changeCurrentPassword);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/update-user").patch(verifyJwt, updateEmail);
router.route("/change-avatar").patch(verifyJwt, upload.single("avatar"), changedAvatar);
router.route("/remove-avatar").patch(verifyJwt,removeAvatar)
router.route("/change-coverimage").patch(verifyJwt, upload.single("coverImage"), chnageCoverImage);
router.route("/user-channel/:username").get(verifyJwt,getUserChannelProfile);
router.route("/watch-history").get(verifyJwt, getWatchHistory);
router.route("/change-username").patch(verifyJwt,changeUsername)
router.route("/change-email").patch(verifyJwt,changeEmail)
router.route("/remove-coverimage").patch(verifyJwt,removeCoverImage)

router.route("/current-user").get(verifyJwt, getCurrentUser);
export default router;

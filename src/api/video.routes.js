import express,{Router} from "express";
import serverless from "serverless-http";
import multer from "multer";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { 
  deleteLike, 
  getAllvideo, 
  getsingleVideo, 
  getUserVideoCount, 
  likeVideo, 
  publishVideo 
} from "../contollers/video.controller.js";


const videoRouter = Router();


// Multer setup
const storage = multer.memoryStorage(); // store files in memory (works for serverless)
const upload = multer({ storage });

// Routes
videoRouter.post("/upload-video", verifyJwt, upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), publishVideo);

videoRouter.route("/get-video").get(getAllvideo);
videoRouter.route("/:id").get(getsingleVideo);
videoRouter.route("/like/:id").get(verifyJwt, likeVideo);
videoRouter.route("/deletelike/:id").delete(verifyJwt, deleteLike);
videoRouter.route("/countVideo/:id").get(verifyJwt, getUserVideoCount);

export default videoRouter;

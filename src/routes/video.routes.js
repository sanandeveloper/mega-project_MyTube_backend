
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteLike, getAllvideo, getsingleVideo, likeVideo, publishVideo } from "../contollers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const videoRouter= Router()


videoRouter.route("/upload-video").post(verifyJwt,upload.fields(
    [{
        name:"videoFile",
        maxCount: 1
    },
{
    name:"thumbnail",
    maxCount:1
}]
),publishVideo)

videoRouter.route("/get-video").get(getAllvideo)
videoRouter.route("/:id").get(getsingleVideo)
videoRouter.route("/like/:id").get(verifyJwt,likeVideo)
videoRouter.route("/deletelike/:id").delete(verifyJwt,deleteLike)



export default videoRouter


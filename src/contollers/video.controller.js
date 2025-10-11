import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import { uploadCloundiary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  console.log("title", title, "description", description);

  if (!title && !description) {
    throw new ApiError("400", "title and description is required");
  }

  const videoLocalPath = await req.files?.videoFile?.[0]?.path;

  const thumbanilPath = await req.files?.thumbnail?.[0].path;

  const uploadThumbnail = await uploadCloundiary(thumbanilPath);

  console.log("video local path", videoLocalPath);
  console.log("video local path", uploadThumbnail);
  if (!videoLocalPath) {
    throw new ApiError("400", "video is required");
  }

  const upload = await uploadCloundiary(videoLocalPath);
  console.log("upload....", upload);

  if (!upload) {
    throw new ApiError("400", "video not found");
  }

  // console.log("userId",userid)

  const newVideo = await Video.create({
    title,
    description,
    thumbnail: uploadThumbnail.url,
    videoFile: upload.url,
    owner: req.user?._id,
  });
  if (!newVideo) {
    throw new ApiError(400, "something went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { data: newVideo }, "video uploaded succesfully"),
    );
});

const getAllvideo = asyncHandler(async (req, res) => {
  
  const {page,limit,search=""}= req.query
  
  console.log("pages",page)
  console.log("limits",limit)
  console.log("searchtext",search)
   const pages=Number(page)
   const limits=Number(limit)
   const skip=(pages-1)*limits

   const totalVideos= await Video.countDocuments()
    const searchFilter = search
    ? { title: { $regex: search, $options: "i" } }
    : {};

   const totalpages= Math.ceil(totalVideos/limit)
   console.log("total pages",totalpages)

  const videos = await Video.find(searchFilter)
    .populate("owner", "fullName avatar username").sort({"createdAt":-1}).skip(skip).limit(limits)
  

  console.log("req.video", req.video);

  return res
    .status(200)
    .json(new ApiResponse(200, {videos,totalpages, hasNextPage: true,hasPrevPage:false}, "video fetched succesfully"));
});

const getsingleVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log("single video id", id);

  const video = await Video.findById(id).populate("owner", "avatar fullName");
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  console.log("req.user", req.user);

  if (req.user && !video.viewers.includes(req.user?._id)) {
    video.views += 1;
    video.viewers.push(req.user?._id);
    await video.save();
  }

  console.log("video.viwers", video.viewers);

  return res
    .status(200)
    .json(new ApiResponse(200, { data: video }, "video fetched succesfully"));
});

const likeVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  if (req.user && !video.likedVideo.includes(req.user?._id)) {
    video.likedVideo.push(req.user?._id);
    await video.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video liked succesfully"));
});

const deleteLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("video_id", id);

  const video = await Video.findById(id);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const hasuserlike = await video.likedVideo.includes(req.user?._id);

  if (hasuserlike) {
    video.likedVideo = video.likedVideo.filter(
      (uid) => uid.toString() !== req.user?._id.toString(),
    );
    await video.save();
  } else {
    throw new ApiError(400, "User has not liked this video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "user unliked succesfully"));
});

const getUserVideoCount = asyncHandler(async(req,res)=>{

  const {id}=req.params
  console.log("videoid...",id)

  if (!id) {
    throw new ApiError(404,"user id not found")
  }

  const countVideos= await Video.find({owner:id}).populate("owner", "username avatar")


  if (!countVideos) {
     throw new ApiError(404,"video not found or something went wrong")
  }

  return res.status(200).json( new ApiResponse(200,countVideos,"user video count succesfully"))



})


export {getUserVideoCount, publishVideo, getAllvideo, getsingleVideo, likeVideo, deleteLike };

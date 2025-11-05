import { asyncHandler } from "../utils/ayncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadCloundiary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (user_id) => {
  try {
    const user = await User.findById(user_id);
    console.log("accestoken generatering...");

    const accessToken = user.generateAccessToken();
    console.log("accestoken generaterd", accessToken);

    const refreshToken = user.genrateRefreshToken();

    console.log("refreshToken generaterd", refreshToken);

    user.refreshToken = accessToken;

    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log("acces token not generated", error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1: step to register user
  // 2: take input from frontend
  // 3: validate
  // 4: use middle ware in routes
  // 5: check coverImage and avatar
  // 6: upload file on cloudinary,check
  // 7: created user object and send data
  // 8: after this remove password ad token from data
  // 9: return res

  console.log("req.body =>", req.body);
  console.log("req.files =>", req.files);
  console.log("👉 req.body.password:", req.body.password);

  const { fullName, email, password, username } = req.body;

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all field are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "username or email already registerd");
  }
  console.log("existedUser=>", existedUser);

  console.log("req.fils", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0].path || null;

  console.log("localpathavatar :", avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar files is required");
  }

  const avatar = await uploadCloundiary(avatarLocalPath);

  console.log("avatar", avatar);
  const coverImage = await uploadCloundiary(coverImageLocalPath);
  console.log("coverImage", coverImage);

  if (!avatar) {
    throw new ApiError(400, "avatar files are required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    username: username.toLowerCase(),
    email,
  });

  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(501, "something went wrong while registerd user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user registerd succesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body;

  // console.log("email",email,"username",username)
  console.log("login", login);

  if (!(login || email)) {
    throw new ApiError("400", "email or password is required");
  }
  const query = (await login.includes("@"))
    ? { email: login }
    : { username: login };

  const user = await User.findOne(query);
  console.log("user", user);

  if (!user) {
    throw new ApiError(404, "email or password is incorrect");
  }

  const isvalidPassword = await user.isPasswordCorrect(password);
  console.log("isvalidPassword", isvalidPassword);

  if (!isvalidPassword) {
    throw new ApiError(404, "email or password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-refreshToken -password ",
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  console.log("datafetched");

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "user logged in succuefully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id, {
    $unset: { refreshToken: 1 },
  });

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken = req.cookie?.accessToken || req.body.accessToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    if (!decodedToken) {
      throw new ApiError(400, "inavlid refresh token");
    }

    if (!incommingRefreshToken !== decodedToken) {
      throw new ApiError(400, "inavlid token not matched");
    }

    const user = User.findById(decodedToken?._id);

    const { accessToken, newRefreshToken } = generateAccessandRefreshToken(
      user._id,
    );
    const option = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            refreshToken: newRefreshToken,
          },
          "token is refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(400, "token not refreshed");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  console.log(
    "oldpassword=>",
    oldPassword,
    "newpassword=>",
    newPassword,
    "confirmPassword=>",
    confirmPassword,
  );

  console.log("oldpassword", oldPassword);
  console.log("oldpassword", newPassword);

  if (!oldPassword) {
    throw new ApiError(400, "please enter old password");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "please enter the match password");
  }

  const user = await User.findById(req.user?._id);
  const PassowrdCorrect = await user.isPasswordCorrect(oldPassword);

  if (!PassowrdCorrect) {
    throw new ApiError(400, "old password is inccorect");
  }

  user.password = newPassword;
  user.passwordUpdatedAt = new Date();

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { passwordUpdatedAt: user.passwordUpdatedAt },
        "Password changed successfully",
      ),
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user fetched succesfully"));
});

const updateEmail = asyncHandler(async (req, res) => {
  console.log("req.body", req.body);
  const { fullName } = req.body;
  if (!fullName) {
    throw new ApiError(400, "email and fullname are required");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      fullName: fullName,
    },
  }).select("-password");
  if (!user) {
    throw new ApiError(500, "email and fullame not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, " name changed succesfully"));
});

const changedAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) {
    throw new ApiError(400, "avatar path not found");
  }

  const avatar = await uploadCloundiary(avatarPath);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar changed Succesfully"));
});

const chnageCoverImage = asyncHandler(async (req, res) => {
  const coverImagePath = req.file?.path;
  if (!coverImagePath) {
    throw new ApiError(400, "cover image not found");
  }

  const coverimage = await uploadCloundiary(coverImagePath);
  if (!coverimage) {
    throw new ApiError(400, "file not upload on cloundiar");
  }
  let user = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        coverImage: coverimage?.url,
      },
    },
  ).select("-password");
  user.coverImage = coverimage?.url;
  if (!user) {
    throw new ApiError(400, "user not found");
  }
  n;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image changed successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  console.log("req.user.id", req.user._id);

  console.log("username", username);

  if (!username) {
    throw new ApiError(400, "username not found");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "userVideos",
      },
    },

    {
      $addFields: {
        channelSubscriber: {
          $size: "$subscriber",
        },
        channelSubscribedTo: {
          $size: "$subscribedTo",
        },
        allUserVideos: {
          $size: "$userVideos",
        },

        isSubscribed: {
          $cond: {
            if: {
              $in: [
                new mongoose.Types.ObjectId(req.user?._id),
                "$subscriber.subscriber",
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        channelSubscriber: 1,
        channelSubscribedTo: 1,
        isSubscribed: 1,
        email: 1,
        coverImage: 1,
        allUserVideos: 1,
        allLikedUser: 1,
      },
    },
  ]);

  // Fix the empty array check
  if (!channel || channel.length === 0) {
    throw new ApiError(400, "channel does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "channel fetched successfully")); // Return first element
});
const removeAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        avatar: "",
      },
    },
    {
      new: true,
    },
  ).select("-password");

  if (!user) {
    throw new ApiError(400, "user not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "avatar remove succesffuly"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watch History",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    avatar: 1,
                    fullName: 1,
                    username: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched sucessfully",
      ),
    );
});

const changeUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  console.log("username", username);

  if (!username) {
    throw new ApiError(400, "username not found");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username,
      },
    },
    {
      new: true,
    },
  ).select("-password");
  if (!user) {
    throw new ApiError(400, "user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "username changed successfully"));
});

const changeEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $set: {
        email: email,
      },
    },
    {
      new: true,
    },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "email changed succesfully"));
});

const removeCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,

    {
      $unset: {
        coverImage: "",
      },
    },
  );

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "cover image removed succesfully"));
});

export {
  registerUser,
  loginUser,
  logout,
  changeCurrentPassword,
  refreshAccessToken,
  updateEmail,
  changedAvatar,
  chnageCoverImage,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  removeAvatar,
  changeUsername,
  changeEmail,
  removeCoverImage,
};

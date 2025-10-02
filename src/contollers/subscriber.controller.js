

import mongoose, { Schema } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import { User } from "../models/user.model.js";





const channelSubscriber = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { channelId } = req.params;

  if (!channelId || !userId) {
    throw new ApiError(400, "Channel ID and User ID are required.");
  }

  // Prevent subscribing to own channel
  if (userId.equals(channelId)) {
    throw new ApiError(409, "You cannot subscribe to your own channel.");
  }

  // Check if already subscribed
  const existingSubscriber = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscriber) {
    throw new ApiError(400, "User already subscribed to this channel.");
  }

  // Create subscription
  const channelSubscribed = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });

  if (!channelSubscribed) {
    throw new ApiError(500, "Something went wrong while subscribing.");
  }

  // Count subscribers for UI update
  const subscriberCount = await Subscription.countDocuments({
    channel: channelId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscription: channelSubscribed,
        totalSubscribers: subscriberCount,
      },
      "Channel subscribed successfully."
    )
  );
});








const deleteSubscriber=asyncHandler(async(req,res)=>{

const user_id=req.user?._id
console.log("user_id",user_id)

const {channelId}=req.params
console.log("channeId",channelId)


const deleted =await Subscription.findOneAndDelete(
  {
    channel:channelId,
    subscriber:user_id
  }
)

if (!deleted) {
   throw new ApiError(500,"internal server error occured")
}


return res
.status(200)
.json(
  new ApiResponse(200,{},"subscriber deleted suuccesfully")
)





})

export {
  channelSubscriber,
  deleteSubscriber,
 
}
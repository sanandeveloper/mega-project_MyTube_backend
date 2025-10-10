

import mongoose, { Schema } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import { User } from "../models/user.model.js";





const channelSubscriber = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { channelId } = req.params;

  console.log("userid", userId);
  console.log("channel", channelId);

  // Validation
  if (!channelId || !userId) {
    throw new ApiError(400, "Channel ID and User ID are required.");
  }

  // Validate channelId format
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID format.");
  }

  // Convert channelId string to ObjectId for comparison
  const channelObjectId = new mongoose.Types.ObjectId(channelId);

  // Check if user is trying to subscribe to their own channel
  if (userId.equals(channelObjectId)) {
    throw new ApiError(409, "You cannot subscribe to your own channel.");
  }

  // Check if channel exists
  const channelExists = await User.findById(channelObjectId);
  if (!channelExists) {
    throw new ApiError(404, "Channel does not exist.");
  }

  // Check for existing subscription
  const existingSubscriber = await Subscription.findOne({
    subscriber: userId,
    channel: channelObjectId,
  });

  if (existingSubscriber) {
    throw new ApiError(400, "User already subscribed to this channel");
  }

  // Create subscription
  const channelSubscribed = await Subscription.create({
    subscriber: userId,
    channel: channelObjectId,
  });

  if (!channelSubscribed) {
    throw new ApiError(500, "Something went wrong while subscribing.");
  }
  const subscriberCount = await Subscription.countDocuments({
    channel: channelObjectId,
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

const deleteSubscriber = asyncHandler(async (req, res) => {
  const user_id = req.user?._id;
  const { channelId } = req.params;

  console.log("user_id", user_id);
  console.log("channelId", channelId);

  // Validation
  if (!channelId) {
    throw new ApiError(400, "Channel ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID format.");
  }

  // Convert channelId to ObjectId
  const channelObjectId = new mongoose.Types.ObjectId(channelId);

  // Find and delete the subscription
  const deleted = await Subscription.findOneAndDelete({
    channel: channelObjectId,
    subscriber: user_id,
  });

  console.log("Deleted subscription:", deleted);

  if (!deleted) {
    throw new ApiError(404, "Subscription not found or already deleted");
  }

  // Get updated subscriber count
  const subscriberCount = await Subscription.countDocuments({
    channel: channelObjectId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedSubscription: deleted,
        totalSubscribers: subscriberCount,
      },
      "Subscription deleted successfully"
    )
  );
});

export {
  channelSubscriber,
  deleteSubscriber,
 
}
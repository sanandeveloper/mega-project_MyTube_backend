import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"



const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    views:{
     type:Number,
     default:0
    },
    like:{
     type:Number,
     default:0
    },
    likedVideo:[
      {
        type:Schema.Types.ObjectId,
        ref:"User"
      }
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
      viewers: [
    {
      type:Schema.Types.ObjectId,
      ref: "User",
    }
  ],
    isPublished:{
        type:Boolean,
        default:true
    }
  },
  { timestamps: true },
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);

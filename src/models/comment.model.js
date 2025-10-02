import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"



const commentSchema= new Schema({

 content:{
    type:String,
    required:true,
 },
 
 commentVideo:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Video"
 },
 commentOwner:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"User"

 }



},{timestamps:true})


export const Comment=mongoose.model("Comment",commentSchema)
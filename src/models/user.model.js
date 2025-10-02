import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv"

dotenv.config()


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique:true
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    passwordUpdatedAt:{
     type:String
    },
    refreshToken:{
      type: String
    }
  },
  { timestamps: true },
);





userSchema.pre("save", async function (next) {
  console.log("Running pre-save hook...");
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  console.log("Hashed password before save:", this.password);
  next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
  console.log("👉 Input password:", password);
  console.log("👉 Hashed password:", this.password);
  const result = await bcrypt.compare(password, this.password);
  console.log("👉 bcrypt.compare result:", result);
  return result;
};


userSchema.methods.generateAccessToken = function () {

   return jwt.sign(
    {
   
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACESS_TOKEN_EXPIRAY,
    },
  );
};

userSchema.methods.genrateRefreshToken=function () {
   return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRAY
    }
)
}

export const User = mongoose.model("User", userSchema);

import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import app from "./app.js";

import connectDB from "./db/db.js";
const PORT = process.env.PORT || 7000;

connectDB()
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("error account while database connect to express", err);
  });

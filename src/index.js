import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});



import connectDB from "./db/db.js";


connectDB()
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("error account while database connect to express", err);
  });

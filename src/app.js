import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes.js";
import dotenv from "dotenv"
dotenv.config()

console.log("Start");

function greet() {
    console.log("hello finished 1");

  setTimeout(() => {
  console.log("Timer finished 1");
}, 0);
}
greet()

setTimeout(() => {
  console.log("Timer finished");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise done");
});

console.log("End");


const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 7000 ,
}));
app.use(
  express.json({
    limit: "16kb",
  }),
);
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

console.log("hello world")


app.use("/api/v1/users",router);

import videoRouter from "./routes/video.routes.js";
app.use("/api/v1/video",videoRouter)
import { subsRoute } from "./routes/subscriber.routes.js";
app.use("/api/v1/subscriber",subsRoute)

export default app

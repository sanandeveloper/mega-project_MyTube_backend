import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes.js";
import dotenv from "dotenv"
dotenv.config()



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

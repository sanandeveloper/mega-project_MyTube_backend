import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();
import userRouter from "./api/user.routes.js";
import videoRouter from "./api/video.routes.js";
import { subsRoute } from "./api/subscriber.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
);
app.use(
  express.json({
    limit: "16kb",
  }),
);
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscriber", subsRoute);



export default app;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 7000;

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 7000,
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

console.log("hello world");
app.get("/",(req,res)=>{

res.send("hello wolrd")
})

app.use("/api/v1/users", router);

import videoRouter from "./routes/video.routes.js";
app.use("/api/v1/video", videoRouter);
import { subsRoute } from "./routes/subscriber.routes.js";
app.use("/api/v1/subscriber", subsRoute);
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });

export default app;

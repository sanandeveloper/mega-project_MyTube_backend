

import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { channelSubscriber, deleteSubscriber } from "../contollers/subscriber.controller.js";


const subsRoute=Router()


subsRoute.route("/:channelId").post(verifyJwt,channelSubscriber)
subsRoute.route("/delete/:channelId").delete(verifyJwt,deleteSubscriber)


export{subsRoute}
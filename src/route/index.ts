import express from "express";
import roomRouter from "./room/room.routes.js";
const apiRouter = express.Router();

apiRouter.use("/rooms", roomRouter);

export default apiRouter;
import express from "express";
import roomRouter from "./room/room.routes.js";
import participantRouter from "./participant/participant.route.js";
const apiRouter = express.Router();

apiRouter.use("/rooms", roomRouter);
apiRouter.use("/participants", participantRouter);

export default apiRouter;
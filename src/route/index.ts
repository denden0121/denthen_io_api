import express from "express";
import roomRouter from "./room.routes.js";
import participantRouter from "./user.route.js";
import vscodeRouter from "./vscode.route.js";
const apiRouter = express.Router();
import { userAuthorization } from "@/middleware/auth.middleware.js";
import  { type Request, type Response, type NextFunction } from "express";


apiRouter.use("/rooms", roomRouter);
apiRouter.use("/participants", participantRouter);
apiRouter.use("/vscodes", vscodeRouter);
apiRouter.use(userAuthorization);
// apiRouter.get("/dashboard", (req: Request, res: Response) => {
// 	const code = req.body;
// 	res.status(200).json({ success: true, message: `Welcome to dashboard ${res.locals.userPayload.username}`, data: code});
// });



export default apiRouter;
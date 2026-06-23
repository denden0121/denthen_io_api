import express from "express";
const router = express.Router();
import type { Request, Response, NextFunction } from "express";

router.get("/dashboard", (req: Request, res: Response) => {
	const code = req.body;
	res.status(200).json({ success: true, message: `Welcome to dashboard ${res.locals.userPayload.username}`, data: code});
});



export default router;

import type { Request, Response, NextFunction } from "express";
import { createRoom } from "@/model/roomModel.js";

export async function generateSpecialKey (req: Request, res: Response, next: NextFunction) {

	const { username } = req.body;

	try {
		if (!username) {
			return ;
		}
        const newRoom = await createRoom(username);
		res.locals.newRoom = await newRoom;
		return next();

	} catch (error) {
		res.status(400).json({
			error: error,
		})
		
	}
}
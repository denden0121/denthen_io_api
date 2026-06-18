import  { type Request, type Response, type NextFunction } from "express";
import { createRoom } from "@/service/room/room.service.js";
import * as crypto from "node:crypto";
import { type ICreateRoomResponse } from "@/model/room.model.js";

export async function generateRoomCode (req: Request, res: Response, next: NextFunction) {
	const { username } = req.body;
	const roomCode =  crypto.randomBytes(4).toString('hex');
	try {
		if (!username || !roomCode) {
			return res.status(400).json({
				error: "Failed to create room: No data add to database.",
			})
		}
        const newRoom = await createRoom(username, roomCode);
		if (!newRoom) {
			return res.status(400).json({
				error: "Failed to create room: No data add to database.",
			})
		}
		res.locals.newRoom =  newRoom as ICreateRoomResponse;
		return next();
	} catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error || "An unexpected error occurred."
        });
	}
}

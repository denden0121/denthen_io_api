import type { Request, Response, NextFunction } from "express";
import { createParticipant } from "@/model/participantModel.js";

export async function generateParticipantKey (req: Request, res: Response, next: NextFunction) {

	const { roomCode, username } = req.body;

	try {
		if ( !roomCode || !username ) {
		res.status(400).json({
			message: "Invalid data"
		})
		
		}
		const newParticipant = await createParticipant(roomCode, username);
		res.locals.newParticipant = await newParticipant;
		return next();

	} catch (error) {
		res.status(400).json({
			error: error,
		})
		
	}
}
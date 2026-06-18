import type { Request, Response, NextFunction } from "express";
import { createParticipant } from "@/service/participant/participant.service.js";
import { type IParticipant } from "@/model/participant.model.js";

export async function generateParticipantKey (req: Request, res: Response, next: NextFunction) {
	const { roomCode, username } = req.body;
	try {
		if ( !roomCode || !username ) {
			return res.status(400).json({
				error: "Failed to create participant key: No data add to database.",
			})
		}
		const newParticipant = await createParticipant(roomCode, username);
		if (!newParticipant) {
			return res.status(400).json({
				error: "Failed to create participant key: No data add to database.",
			})
		}
		res.locals.newParticipant =  newParticipant as IParticipant;
		return next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
			message: error || "An unexpected error occurred."
		});
	}
}
import crypto, { type UUID } from "crypto";
import type { Request, Response, NextFunction } from "express";


export async function generateParticipant (req: Request, res: Response, next: NextFunction) {

	try {
		const room_code = crypto.randomUUID();
		const participant_code = crypto.randomUUID();

		if (!participant_code) {
			return ;
		}

		res.locals.roomCode = `participant_{room_code}_${participant_code}`;
		return next();

	} catch (error) {
		res.status(400).json({
			error: error,
		})
		
	}
}

export async function generateAdmin (req: Request, res: Response, next: NextFunction) {

	try {
		const room_code = crypto.randomUUID();
		const admin_code = crypto.randomUUID();

		if (!admin_code) {
			return ;
		}

		res.locals.roomCode = `participant_{room_code}_${admin_code}`;
		return next();

	} catch (error) {
		res.status(400).json({
			error: error,
		})
		
	}
}
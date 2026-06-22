import type { Request, Response, NextFunction } from "express";
import { createParticipant } from "@/service/participant.service.js";
import { type IParticipant } from "@/model/participant.model.js";
import { checkRoomCode } from "@/service/room.service.js";
import { AppError } from "@/util/appError.js";
import { CreateParticipantSchema } from "@/schema/room.schema.js";

export async function generateParticipantKey (req: Request, res: Response, next: NextFunction) {
	try {
		const { roomCode, username } = CreateParticipantSchema.parse(req.body);
		const isRoomCodeValid = await checkRoomCode(roomCode);
		const joinRoomId = isRoomCodeValid.id;
		const newParticipant = await createParticipant(joinRoomId, username);
		res.locals.newParticipant =  newParticipant as IParticipant;
		return next();
	} catch (error) {
		return next(error);
	}
}
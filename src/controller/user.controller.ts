import type { Request, Response, NextFunction } from "express";
import { createNewParticipant } from "@/service/user.service.js";
import { type ITUser } from "@/model/user.model.js";
import { checkRoomCode } from "@/service/room.service.js";
import { AppError } from "@/util/appError.js";
import { CreateParticipantSchema } from "@/schema/room.schema.js";

export async function generateNewParticipant (req: Request, res: Response, next: NextFunction) {
	try {
		const { roomCode, username } = CreateParticipantSchema.parse(req.body);
		const isRoomCodeValid = await checkRoomCode(roomCode);
		const roomId = isRoomCodeValid.id;
		const newParticipant = await createNewParticipant(roomId, username);
		res.locals.newParticipant =  newParticipant as ITUser;
		res.locals.roomCode = roomCode;
		return next();
	} catch (error) {
		return next(error);
	}
}


export const handleParticipantSpecialKey =  (req: Request, res: Response) => {
	try {
		if (!res.locals.newParticipant || !res.locals.roomCode) {
			throw new AppError(500, 'Data lost in translation.');
		}
		else {
			const {username, role} = res.locals?.newParticipant
			const roomCode = res.locals.roomCode;
			return  res.status(200).json({
				success: true,
				message: "Participant Created Successfully",
				data: {
					roomCode: roomCode,
					specialKey: `${role}_${roomCode}_${username}`
				}	
			})
		}
	} catch (error) {
        throw error; 
	}
};
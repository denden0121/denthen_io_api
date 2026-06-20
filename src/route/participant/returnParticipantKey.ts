import { Router, type Request, type Response } from "express";
import { error } from "node:console";
const router = Router();

export const returnParticipantKey =  (req: Request, res: Response) => {

	try {
		if (!res.locals.newParticipant) {
			res.status(400).json({
				error: error,
				message: "Failed to Create Participant"
			})
		}
		else {
			const {room_id, participant_code, username} = res.locals?.newParticipant
			return  res.status(200).json({
				success: true,
				message: "Participant Created Successfully",
				data: {
					specialKey: `participant_${room_id}_${participant_code}_${username}`
				}	
			})
		}
	} catch (error) {
	  return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error || "An unexpected error occurred."
        });
	}

};

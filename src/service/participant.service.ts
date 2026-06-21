import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { type IParticipant } from "@/model/participant.model.js";
import { error } from "node:console";
import { Router, type Request, type Response } from "express";
const router = Router();


export const createParticipant = async (joinRoomId: UUID, username: string): Promise<IParticipant> => {
	try {
		const { rows } = await pool.query<IParticipant>(
			'INSERT INTO participant (room_id, username) VALUES ($1, $2) RETURNING *',
            [joinRoomId, username]
        );
		if (!rows || rows.length === 0) {
			throw new Error('Failed to create participant: No data inserted to database.');
		}
        return rows[0]!; 
    } catch (error) {
		console.error("Model Error:", error);
        throw error; 
    }
};

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

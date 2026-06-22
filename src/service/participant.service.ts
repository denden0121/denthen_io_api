import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { type IParticipant } from "@/model/participant.model.js";
import { error } from "node:console";
import { Router, type Request, type Response } from "express";
import { AppError } from "@/util/appError.js";
import type { ZodError } from "zod";
const router = Router();


export const createParticipant = async (joinRoomId: UUID, username: string): Promise<IParticipant> => {
	try {
		const { rows } = await pool.query<IParticipant>(
			'INSERT INTO participant (room_id, username) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING *',
            [joinRoomId, username]
        );
		if (rows.length === 0) {
			throw new AppError(400, 'Username already exist in this room: No data inserted to database.');
		}
		if (!rows) {
			throw new AppError(500, 'Server problem: No data inserted to database.');
		}
		return rows[0]!; 
    } catch (error) {
        throw error; 
    }
};

export const handleParticipantSpecialKeySuccess =  (req: Request, res: Response) => {
	try {
		if (!res.locals.newParticipant) {
			throw new AppError(500, 'Data lost in translation.');
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
        throw error; 
	}
};
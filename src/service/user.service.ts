import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { type IParticipant } from "@/model/participant.model.js";
import { error } from "node:console";
import { Router, type Request, type Response } from "express";
import { AppError } from "@/util/appError.js";
import type { ZodError } from "zod";
import { type ITUser } from "@/model/user.model.js";
const router = Router();


export const createNewParticipant = async (roomId: UUID, username: string): Promise<ITUser> => {
	try {
		const { rows } = await pool.query<ITUser>(
			'INSERT INTO t_user (room_id, username, role) VALUES ($1, $2, $3) RETURNING *',
            [roomId, username, 'participant']
        );
		if (rows.length === 0) {
			throw new AppError(400, 'Username already exist in this room.');
		}
		if (!rows) {
			throw new AppError(500, 'Server problem: No data inserted to database.');
		}
		return rows[0]!; 
    } catch (error) {
        throw error; 
    }
};

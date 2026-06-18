import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { ICreateRoomResponse, IParticipant } from "@/model/room.model.js";
import { error } from "node:console";

export const createParticipant = async (roomCode: UUID, username: string): Promise<IParticipant> => {
	try {
		const { rows } = await pool.query<IParticipant>(
			'INSERT INTO participant (room_id, username) VALUES ($1, $2) RETURNING *',
            [roomCode, username]
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


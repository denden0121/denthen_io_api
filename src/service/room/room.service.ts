import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { type ICreateRoomResponse } from "@/model/room.model.js";
import { error } from "node:console";

export const createRoom = async (username: string, roomCode: string): Promise<ICreateRoomResponse>  => {
	try {
		const { rows } = await pool.query<ICreateRoomResponse>(
			'INSERT INTO room (room_code, username) VALUES ($1, $2) RETURNING *',
			[roomCode, username]
		);
		if (!rows || rows.length === 0) {
			throw new Error('Failed to create room: No data returned from database.');
		} 
		return rows[0]!; 
	} catch (error) {
		console.error("Service Error:", error);
		throw error; 
	}
};

export const selectRoom = async (room_id: UUID, user_code: UUID): Promise<ICreateRoomResponse> => {
	try {
		const queryText = 'SELECT * FROM room WHERE room_id = $1 AND admin_code = $2;';
        const { rows } = await pool.query<ICreateRoomResponse>(queryText, [room_id, user_code]);
		if (!rows || rows.length === 0) {
			throw new Error('Failed to select room: No data returned from database.');
		}
        return rows[0]!;
	} catch (error) {
		console.error("Service Error:", error);
		throw error; 
	}
}


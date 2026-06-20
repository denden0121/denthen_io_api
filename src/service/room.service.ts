import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { type ICreateRoomResponse, type IRoom } from "@/model/room.model.js";
import { type IParticipant } from "@/model/participant.model.js";
import { AppError } from "@/util/appError.js";

export const createRoom = async (username: string, roomCode: string): Promise<ICreateRoomResponse>  => {
	try {
		const { rows } = await pool.query<ICreateRoomResponse>(
			'INSERT INTO room (room_code, username) VALUES ($1, $2) RETURNING *',
			[roomCode, username]
		);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to create room entry in the database.");
		} 
		return rows[0]!; 
	} catch (error) {
		throw error; 
	}
};

export const checkRoomCode = async (room_code: string): Promise<IRoom> => {
	try {
		const queryText = 'SELECT * FROM room WHERE room_code = $1;';
        const { rows } = await pool.query<IRoom>(queryText, [room_code]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to create room entry in the database.");
		}
        return rows[0]!;
	} catch (error) {
		throw error; 
	}
}

export const selectRoomAsAdmin = async (room_code: string, admin_code: string): Promise<ICreateRoomResponse> => {
	try {
		const queryText = 'SELECT * FROM room WHERE room_code = $1 AND admin_code = $2;';
        const { rows } = await pool.query<ICreateRoomResponse>(queryText, [room_code, admin_code]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to create room entry in the database.");
		}
        return rows[0]!;
	} catch (error) {
		throw error; 
	}
}


export const selectRoomAsParticipant = async (room_id: UUID, participant_code: UUID): Promise<IParticipant> => {
	try {
		const queryText = 'SELECT * FROM participant WHERE room_id = $1 AND participant_code = $2;';
        const { rows } = await pool.query<IParticipant>(queryText, [room_id, participant_code]);
		if (!rows || rows.length === 0) {
            throw new AppError(500, "Failed to create room entry in the database.");
		}
        return rows[0]!;
	} catch (error) {
		throw error; 
	}
}



import pool from "@/config/db.js";
import type { UUID } from "node:crypto";
import { type ICreateRoomResponse, type IRoom } from "@/model/room.model.js";
import { AppError } from "@/util/appError.js";
import { type HandleDocumentSchemaInput, type HandleDocumentSchema } from "@/schema/vscode.schema.js";

export const insertWorkspace = async (workspace: HandleDocumentSchemaInput) => {
	try {
		const { rows } = await pool.query(
			'INSERT INTO workspace (room_id, user_code, user_role, code, type, file_extension) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[]
		);
		if (!rows || rows.length === 0) {
			throw new AppError(500, 'Server error: No data inserted to database.');
		}
		return rows[0]!; 
	} catch (error) {
		throw error; 
	}
};

export const getUserFullInfo = async (payload: unknown) => {
	try {
		const { rows } = await pool.query(
			'INSERT INTO workspace (room_id, user_code, user_role, code, type, file_extension) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[]
		);
		if (!rows || rows.length === 0) {
			throw new AppError(500, 'Server error: No data inserted to database.');
		}
		return rows[0]!; 
	} catch (error) {
		throw error; 
	}
};

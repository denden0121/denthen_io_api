import pool from "@/config/db.js";
import { type IMyTokenPayload } from "@/model/room.model.js";
import { AppError } from "@/util/appError.js";
import { type HandleDocumentSchemaInput, type HandleDocumentSchema } from "@/schema/vscode.schema.js";
import { generateAccessToken, generateRefreshToken } from "./auth.service.js";
import jwt, { type JwtPayload } from 'jsonwebtoken';

export const insertWorkspace = async (payload: IMyTokenPayload, validatedDocument: HandleDocumentSchemaInput) => {
	try {
		const { rows } = await pool.query(
			'INSERT INTO workspace (room_id, user_id, user_role, code, type, file_extension) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[payload.user.roomId, payload.user.userId, payload.user.role, validatedDocument.code, validatedDocument.type, validatedDocument.fileExtension]
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


export const jwtSign = async (data: any, clientType: any) => {
	try {
		const payload = {
			clientType: clientType,
			user: {
				userId: data.user.id,
				roomId: data.user.room_id,
				username: data.user.username,
				role: data.user.role
			}
		}
		const json = {
			clientType: clientType,
			user: {
				username: data.user.username,
				role: data.user.role,
				createdAt: data.user.joined_at
			}
		}
		const accessToken = await generateAccessToken(payload);
		const refreshToken = await generateRefreshToken(payload);
		const decoded = jwt.decode(refreshToken) as JwtPayload | null;
		if (!decoded || typeof decoded === 'string' || !decoded.exp) {
			throw new AppError(500, "Internal state error: Data context was lost in transition.");
		}
		const expiresAtDate = new Date(decoded.exp * 1000);
		return {
			accessToken: accessToken,
			refreshToken: refreshToken,
			refreshTokenExpiresAt: expiresAtDate,
			json: json
		};
	} catch (error) {
		throw error;
	}
	
}

export const jwtSignNew = async (data: any) => {
	try {
		const payload = {
		roomCode: data.userData.room_code,
		username: data.userData.username,
		role: data.userRole
		}
		const json = {
			roomCode: data.userData.room_code,
			username: data.userData.username,
			createdAt: data.userData.created_at
		}
		const accessToken = await generateAccessToken(payload);
		const refreshToken = await generateRefreshToken(payload);
		const decoded = jwt.decode(refreshToken) as JwtPayload | null;
		if (!decoded || typeof decoded === 'string' || !decoded.exp) {
			throw new AppError(500, "Internal state error: Data context was lost in transition.");
		}
		const expiresAtDate = new Date(decoded.exp * 1000);
		return {
			accessToken: accessToken,
			refreshToken: refreshToken,
			refreshTokenExpiresAt: expiresAtDate,
			json: json
		};
	} catch (error) {
		throw error;
	}
	
}



export const deleteRefreshToken = async (role: string, newAdminCode: any, clientType:any) => {
	try {
		const queryText = "DELETE FROM refresh_token WHERE user_code = $1 AND client_type = $2;";
		const { rows } = await pool.query(queryText, [newAdminCode, clientType]);
		return rows.length > 0 ? rows[0] : null;
	} catch (error) {
		throw new AppError(500, "Failed to delete refresh token in the database.");
	}
};


export const insertRefreshToken = async (role: string, userCode: string, refreshToken: string, expiresAt: Date, clientType: any)=> {
		try {
			const queryText = `
				INSERT INTO refresh_token (user_code, token_hash, expires_at, client_type) 
				VALUES ($1, $2, $3, $4) 
				ON CONFLICT (user_code, client_type) 
				DO UPDATE SET 
					token_hash = EXCLUDED.token_hash,
					expires_at = EXCLUDED.expires_at,
					updated_at = NOW()
				RETURNING *;
			`;
			const { rows } = await pool.query(queryText, [userCode, refreshToken, expiresAt, clientType]);
			if (rows.length === 0) {
				return false;
			}
			if (!rows) {
				throw new AppError(500, 'Server problem: No data inserted to database.');
			}
			return rows.length > 0 ? rows[0] : null;
		} catch (error) {
			throw error;
		}
};

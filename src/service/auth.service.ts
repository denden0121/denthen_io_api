import pool from "@/config/db.js";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
import { selectAdminCode, selectParticipantCode, checkRoomCode, validateUser } from "./room.service.js";
import type { UUID } from "node:crypto";
import { type IRoom, type IMyTokenPayload } from "@/model/room.model.js";
import { AppError } from "@/util/appError.js";
import { type SpecialKeyPayloadInput, type RefreshTokenSchemaInput } from "@/schema/room.schema.js";

// const authSecret = process.env.AUTH_SECRET || "01c31f5e51d3b19d5feec8308cf695cede83a137354dd97059490b26af846cd3";
// const authExpiresIn = process.env.AUTH_SECRET_EXPIRES_IN || "30s";
// const authRefreshToken = process.env.AUTH_REFRESH_SECRET  || "654fc594fdcdfceef67c26179534865bc98a908ccfcee97372807e418badcc87";
// const authRefreshTokenExpiresIn = process.env.AUTH_REFRESH_SECRET_EXPIRES_IN  || "1d";

const authSecret = "01c31f5e51d3b19d5feec8308cf695cede83a137354dd97059490b26af846cd3";
const authExpiresIn =  "5m";
const authRefreshToken =  "654fc594fdcdfceef67c26179534865bc98a908ccfcee97372807e418badcc87";
const authRefreshTokenExpiresIn = "1d";

export const isRefreshToken = async (role: string, refreshToken: string, newAdminCode: any) => {
	if (role === "admin") {
		try {
			const queryText = "SELECT * FROM refresh_token WHERE token_hash = $1 AND user_code = $2;";
			const { rows } = await pool.query(queryText, [refreshToken, newAdminCode]);
			return rows.length > 0 ? rows[0] : null;
		} catch (error) {
			throw new AppError(500, "Failed to delete refresh token in the database.");
		}
	}
	if (role === "participant") {
		try {
			const queryText = "SELECT * FROM refresh_token WHERE token_hash = $1 AND user_code = $2;";
			const { rows } = await pool.query(queryText, [refreshToken, newAdminCode]);
			return rows.length > 0 ? rows[0] : null;
		} catch (error) {
			throw new AppError(500, "Failed to delete refresh token in the database.");
		}
	}
};


// export const validateAdminKey = async (validatedSpecialKey: SpecialKeyPayloadInput) => {
// 	try {
// 		const getRoomId = await checkRoomCode(validatedSpecialKey.code);
// 		const response = await selectRoomAsAdmin(getRoomId.id, validatedSpecialKey.username);
// 		return {
// 			userData: response,
// 			userRole: "admin"
// 		};
// 	} catch (error) {
// 		throw error;
// 	}
// }

// export const validateParticipantKey = async (validatedSpecialKey: SpecialKeyPayloadInput) => {
// 	try {
// 		const response = await selectRoomAsParticipant(validatedSpecialKey.code, validatedSpecialKey.username);
// 		return {
// 			userData: response,
// 			userRole: "participant"
// 		};
// 	} catch (error) {
// 		throw error;
// 	}
// }

export const validateSpecialKey = async (validated: SpecialKeyPayloadInput) => {
	try {
		const getRoomId = await checkRoomCode(validated.specialKey.code);
		const response = await validateUser(getRoomId.id, validated.specialKey.username, validated.specialKey.role);
		return {
			user: response,
		};
	} catch (error) {
		throw error;
	}
}

// export const checkSpecialKey = async (validatedSpecialKey: SpecialKeyPayloadInput)  => {
// 	try {
// 		// const userData = validatedSpecialKey.role === "admin" ? validateAdminKey(validatedSpecialKey) : validateParticipantKey(validatedSpecialKey);
// 		const userData = validateSpecialKey(validatedSpecialKey);
// 		return userData;
// 	} catch (error) {
// 		throw error;
// 	}
// };


export const checkPermission = async (response: any)  => {
	console.log(`Check Permission: ${response}`);
	return response;
};


export const generateAccessToken = async (payload: any) => {
	try {
		if (!authSecret) {
			throw new AppError(500, "JWT Configuration Failure: authSecret is undefined.");
		}
		return jwt.sign(payload, authSecret, {
			expiresIn: authExpiresIn,
		});
	} catch (error) {
		throw error;
	}
}

export const generateRefreshToken = async (payload: any) => {
	try {
		if (!authRefreshToken) {
			throw new AppError(500, "JWT Configuration Failure: authSecret is undefined.");
		}
		return jwt.sign(payload, authRefreshToken, {
			expiresIn: authRefreshTokenExpiresIn,
		});
	} catch (error) {
		throw error;
	}
}

export const sendCookie = async () => {

}
// {
//     "user": {
//         "id": "61da0281-fe56-4042-87ef-d1161e631791",
//         "room_id": "a7bf5bc8-a84a-4f8a-97a0-fce9e3e358f3",
//         "username": "denz",
//         "role": "participant",
//         "joined_at": "2026-06-23T16:56:27.328Z"
//     }
// }
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

// const newPayload = {
// 	userId: verified.userId,
// 	roomId: verified.roomId,
// 	username: verified.username,
// 	role: verified.role
// }
export const jwtVerifyRefreshToken = async (validatedRefreshToken: RefreshTokenSchemaInput) => {
	try {
		const verified = jwt.verify(validatedRefreshToken, authRefreshToken) as unknown as IMyTokenPayload;
			
		// "clientType": "web",
		// "user": {
		//     "userId": "2da8593c-dbd4-4f7e-9564-d7f65cfc5206",
		//     "roomId": "6b5e8568-a1c0-4ba6-9afa-9dd24a0941ef",
		//     "username": "kyle",
		//     "role": "participant"
		// },
		// "iat": 1782285095,
		// "exp": 1782371495
		const newPayload = {
			clientType: verified.clientType,
			user: {
				userId: verified.user.userId,
				roomId: verified.user.roomId,
				username: verified.user.username,
				role: verified.user.role
			}
		}
		const accessToken = await generateAccessToken(newPayload);
		const refreshToken = await generateRefreshToken(newPayload);
		const decoded = jwt.decode(refreshToken) as JwtPayload | null;
		if (!decoded || typeof decoded === 'string' || !decoded.exp) {
			throw new Error(" expiration timestamp.");
		}
		const expiresAtDate = new Date(decoded.exp * 1000);
		return {
			accessToken: accessToken,
			refreshToken: refreshToken,
			refreshTokenExpiresAt: expiresAtDate,
			newPayload
	};
		
	} catch (error) {
    	throw error;
	}
	
}

export const getTokenPayload = async (validatedRefreshToken: RefreshTokenSchemaInput) => {
	try {
		const verified = jwt.verify(validatedRefreshToken, authRefreshToken);
		return verified;
	} catch (error) {
    	throw error;
	}
	
}

export const getUserCode = async (userPayload: any) => {
	try {
		const role = userPayload.role;
		const roomCode = userPayload.roomCode
		const username = userPayload.username
		if (role === "admin") {
			const response = await selectAdminCode(roomCode, username);
			return response;
		}
		else {
			const response = await selectParticipantCode(roomCode, username);
			return response;
		}
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
	// if (role === "participant") {
	// 	try {
	// 		const queryText = "DELETE FROM refresh_token WHERE user_code = $1;";
	// 		const { rows } = await pool.query(queryText, [newAdminCode]);
	// 		return rows.length > 0 ? rows[0] : null;
	// 	} catch (error) {
	// 		throw new AppError(500, "Failed to delete participant refresh token in the database.");
	// 	}
	// }
};


export const insertRefreshToken = async (role: string, userCode: string, refreshToken: string, expiresAt: Date, clientType: any)=> {
		try {
			// const queryText =
			// 	"INSERT INTO refresh_token (user_code, token_hash, expires_at, client_type) VALUES ($1, $2, $3) ON CONFLICT (user_code) DO NOTHING RETURNING  *";
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
	// if (role === "participant") {
	// 	try {
	// 		const queryText =
	// 			"INSERT INTO refresh_token (user_code, token_hash, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_code) DO NOTHING RETURNING  *";
	// 		const { rows } = await pool.query(queryText, [userCode, refreshToken, expiresAt]);
	// 		if (rows.length === 0) {
	// 			return false;
	// 		}
	// 		if (!rows) {
	// 			throw new AppError(500, 'Server problem: No data inserted to database.');
	// 		}
	// 		return rows.length > 0 ? rows[0] : null;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
};

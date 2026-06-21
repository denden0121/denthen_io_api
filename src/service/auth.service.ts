import pool from "@/config/db.js";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
import { selectRoomAsAdmin, selectRoomAsParticipant, selectAdminCode } from "./room.service.js";
import type { UUID } from "node:crypto";
import { type IRoom, type IMyTokenPayload } from "@/model/room.model.js";
import { AppError } from "@/util/appError.js";
import { type SpecialKeyPayloadInput, type RefreshTokenSchemaInput } from "@/schema/room.schema.js";

// const authSecret = process.env.AUTH_SECRET || "01c31f5e51d3b19d5feec8308cf695cede83a137354dd97059490b26af846cd3";
// const authExpiresIn = process.env.AUTH_SECRET_EXPIRES_IN || "30s";
// const authRefreshToken = process.env.AUTH_REFRESH_SECRET  || "654fc594fdcdfceef67c26179534865bc98a908ccfcee97372807e418badcc87";
// const authRefreshTokenExpiresIn = process.env.AUTH_REFRESH_SECRET_EXPIRES_IN  || "1d";

const authSecret = "01c31f5e51d3b19d5feec8308cf695cede83a137354dd97059490b26af846cd3";
const authExpiresIn =  "30s";
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
};


export const validateAdminKey = async (validatedSpecialKey: SpecialKeyPayloadInput) => {
	try {
		const response = await selectRoomAsAdmin(validatedSpecialKey.code, validatedSpecialKey.id);
		return {
			userData: response,
			userRole: "admin"
		};
	} catch (error) {
		throw error;
	}
}

export const validateParticipantKey = async (validatedSpecialKey: SpecialKeyPayloadInput) => {
	// try {
	// 	const specialKeyArr = specialKey.split("_");
	// 	const [role, roomId, participantCode, username] = specialKeyArr;
	// 	if (!role || !roomId || !participantCode || !username) {
	// 		throw new AppError(400, "Missing required parameter: specialKey");
	// 	}
	// 	const response = await selectRoomAsParticipant(roomId as UUID, participantCode as UUID);
	// 	return {
	// 		userData: response,
	// 		userRole: "participant"
	// 	};
	// } catch (error) {
	// 	throw error;
	// }
}


// export const validateAdminKey = async (specialKey: string) => {
// 	try {
// 		const specialKeyArr = specialKey.split("_");
// 		const [role, roomCode, adminCode, username] = specialKeyArr;
// 		if (!role || !roomCode || !adminCode || !username) {
// 			throw new AppError(400, "Missing required parameter: specialKey");
// 		}
// 		const response = await selectRoomAsAdmin(roomCode, adminCode as UUID);
// 		return {
// 			userData: response,
// 			userRole: "admin"
// 		};
// 	} catch (error) {
// 		throw error;
// 	}
// }

// export const validateParticipantKey = async (specialKey: string) => {
// 	try {
// 		const specialKeyArr = specialKey.split("_");
// 		const [role, roomId, participantCode, username] = specialKeyArr;
// 		if (!role || !roomId || !participantCode || !username) {
// 			throw new AppError(400, "Missing required parameter: specialKey");
// 		}
// 		const response = await selectRoomAsParticipant(roomId as UUID, participantCode as UUID);
// 		return {
// 			userData: response,
// 			userRole: "participant"
// 		};
// 	} catch (error) {
// 		throw error;
// 	}
// }

export const checkSpecialKey = async (validatedSpecialKey: SpecialKeyPayloadInput)  => {
	try {
		const userData = validatedSpecialKey.role === "admin" ? validateAdminKey(validatedSpecialKey) : validateParticipantKey(validatedSpecialKey);
		return userData;
	} catch (error) {
		throw error;
	}
};
// export const checkSpecialKey = async (specialKey: string)  => {
// 	try {
// 		const specialKeyArr = specialKey.split("_");
// 		const [user_role, , , ] = specialKeyArr;
// 		const userData = user_role === "admin" ? validateAdminKey(specialKey) : validateParticipantKey(specialKey);
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

export const jwtSign = async (data: any) => {
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

export const jwtVerifyRefreshToken = async (validatedRefreshToken: RefreshTokenSchemaInput) => {
	try {
		const verified = jwt.verify(validatedRefreshToken, authRefreshToken) as unknown as IMyTokenPayload;
		const newPayload = {
			roomCode: verified.roomCode,
			username: verified.username,
			role: verified.userRole
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
			refreshTokenExpiresAt: expiresAtDate
	};
		
	} catch (error) {
    	throw error;
	}
	
}

export const getTokenPayload = async (validatedRefreshToken: RefreshTokenSchemaInput) => {
	try {
		const verified = jwt.verify(validatedRefreshToken, authRefreshToken);
		// const verified = jwt.verify(validatedRefreshToken, authRefreshToken) as unknown as IMyTokenPayload;
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
		const response = await selectAdminCode(roomCode, username);
		return response;
	} catch (error) {
		throw error;
	}
}


export const deleteRefreshToken = async (role: string, newAdminCode: any) => {
	if (role === "admin") {
		try {
			const queryText = "DELETE FROM refresh_token WHERE user_code = $1;";
			const { rows } = await pool.query(queryText, [newAdminCode]);
			return rows.length > 0 ? rows[0] : null;
		} catch (error) {
			throw new AppError(500, "Failed to delete refresh token in the database.");
		}
	}
};


export const insertRefreshToken = async (role: string, userCode: UUID, refreshToken: string, expiresAt: Date)=> {
	if (role === "admin") {
		try {
			const queryText =
				"INSERT INTO refresh_token (user_code, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *";
			const { rows } = await pool.query(queryText, [userCode, refreshToken, expiresAt]);
			return rows.length > 0 ? rows[0] : null;
		} catch (error) {
			throw new AppError(500, "Failed to insert refresh token in the database.");
		}
	}
};

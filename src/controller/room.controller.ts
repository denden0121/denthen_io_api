import  { type Request, type Response, type NextFunction } from "express";
import { createNewRoomWithAdmin } from "@/service/room.service.js";
import * as crypto from "node:crypto";
import {  jwtSign, jwtVerifyRefreshToken, getTokenPayload, validateSpecialKey } from '@/service/auth.service.js';
import { deleteRefreshToken, insertRefreshToken, isRefreshToken } from "@/service/auth.service.js";
import { AppError } from "@/util/appError.js";
import { CreateRoomSchema, SpecialKeyPayloadSchema, RefreshTokenSchema } from "@/schema/room.schema.js";

export const generateRoomCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
		const validateBody = CreateRoomSchema.parse(req.body);
		const { username } = validateBody;
		const roomCode = crypto.randomBytes(4).toString('hex');
        const newRoomWithAdmin = await createNewRoomWithAdmin(roomCode, username);
        res.locals.newRoomWithAdmin = newRoomWithAdmin;
        return next();
    } catch (error) {
        return next(error);	
    }
};

export const handleSpecialKeySuccess = (req: Request, res: Response, next: NextFunction) => {
	try {
		const newRoomWithAdmin = res.locals?.newRoomWithAdmin;
		console.log(newRoomWithAdmin)
		if (!newRoomWithAdmin) {
            throw new AppError(500, "Internal state error: Data context was lost in transition.");
		}
		else {
			return  res.status(200).json({
				success: true,
				message: "Room Created Successfully",
				data: {
					roomCode: newRoomWithAdmin.room.room_code,
					specialKey: `${newRoomWithAdmin.user.role}_${newRoomWithAdmin.room.room_code}_${newRoomWithAdmin.user.username}`
				}	
			})
		}
	} catch (error) {
        return next(error);	
	}
};

export const validateRoomAccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { clientType, specialKey } = req.body;
		if (!specialKey) {
			throw new AppError(400, "Missing required parameter: specialKey");
		}
		const specialKeyArr = specialKey.split("_");
        const [role, code, username] = specialKeyArr;
		console.log(role, code, username);
		const validated = SpecialKeyPayloadSchema.parse({
			clientType,
			specialKey: {
				role, code, username
			}
		})
		const response = await validateSpecialKey(validated);
		res.locals.data = response;
		res.locals.clientType = clientType;
		next();
	} catch (error) {
        return next(error);
	}
};


export const handleJoinRoomSuccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = res.locals.data;
		const clientType = res.locals.clientType;
		if (!data) {
            throw new AppError(500, "Internal state error: Data context was lost in transition.");
        }
		const response = await jwtSign(data, clientType);
		const isLogged = await insertRefreshToken(data.user.role, data.user.id, response.refreshToken, response.refreshTokenExpiresAt, clientType);
		if (!isLogged) {
			await deleteRefreshToken(data.user.role, data.user.id, clientType)
			await insertRefreshToken(data.user.role, data.user.id, response.refreshToken, response.refreshTokenExpiresAt, clientType);
		}
		res.cookie("MY_ACCESS_TOKEN", response.accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 5 * 60 * 1000, 
		});
		res.cookie("MY_ACCESS_REFRESH_TOKEN", response.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge:  24 * 60 * 60 * 1000,
		});
		res.status(200).json(response.json);
	} catch (error) {
        return next(error);
	}
}

export const generateNewRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const myAccessRefreshToken = req.cookies.MY_ACCESS_REFRESH_TOKEN;
		if (!myAccessRefreshToken)  {
			throw new AppError(400, "Missing refresh token");
		}
		const validatedRefreshToken = RefreshTokenSchema.parse(myAccessRefreshToken);
		const verifyToken = await jwtVerifyRefreshToken(validatedRefreshToken);
		const userPayload = await getTokenPayload(validatedRefreshToken);

		// // Set new refresh token data
		const newRole = verifyToken.newPayload.user.role;
		const newAdminCode = verifyToken.newPayload.user.userId;
		const newClientType = verifyToken.newPayload.clientType;
		const newRefreshToken = verifyToken.refreshToken;
		const newRefreshTokenExpiresAt = verifyToken.refreshTokenExpiresAt;
		
		//check if refresh token exist in database
		const response = await insertRefreshToken(newRole, newAdminCode, newRefreshToken, newRefreshTokenExpiresAt, newClientType);
		if (!response) {
			// delete old refresh token in db
			await deleteRefreshToken(newRole, newAdminCode, newClientType);
			// // insert new refresh token in db
			await insertRefreshToken(newRole, newAdminCode, newRefreshToken, newRefreshTokenExpiresAt, newClientType);
		}
		res.cookie("MY_ACCESS_TOKEN", verifyToken.accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 5 * 60 * 1000, 
		});
		res.cookie("MY_ACCESS_REFRESH_TOKEN", verifyToken.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge:  24 * 60 * 60 * 1000,
		});
		res.status(200).json({
			message: "Generated new token"
		});
	} catch (error) {
        return next(error);
	}
}



import  { type Request, type Response, type NextFunction } from "express";
import { createRoom } from "@/service/room.service.js";
import * as crypto from "node:crypto";
import { type ICreateRoomResponse } from "@/model/room.model.js";
import { checkSpecialKey, checkPermission, jwtSign, jwtVerifyRefreshToken } from '@/service/auth.service.js';
import { deleteRefreshToken, insertRefreshToken } from "@/service/auth.service.js";
import { AppError } from "@/util/appError.js";
import { z } from "zod";
import { CreateRoomSchema, type CreateRoomInput, SpecialKeyPayloadSchema } from "@/schema/room.schema.js";

export const generateRoomCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
		const validateBody = CreateRoomSchema.parse(req.body);
		const { username } = validateBody;
		const roomCode = crypto.randomBytes(4).toString('hex');
        const newRoom = await createRoom(username, roomCode);
        res.locals.newRoom = newRoom as ICreateRoomResponse;
        return next();
    } catch (error) {
        return next(error);	
    }
};

export const handleSpecialKeySuccess = (req: Request, res: Response, next: NextFunction) => {
	try {
		const newRoom = res.locals?.newRoom as ICreateRoomResponse;
		if (!newRoom) {
            throw new AppError(500, "Internal state error: Data context was lost in transition.");
		}
		else {
			const {room_code, admin_code, username} = newRoom;
			return  res.status(200).json({
				success: true,
				message: "Room Created Successfully",
				data: {
					specialKey: `admin_${room_code}_${admin_code}_${username}`
					}	
			})
		}
	} catch (error) {
        return next(error);	
	}
};

export const validateRoomAccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { specialKey } = req.body;
		if (!specialKey) {
			throw new AppError(400, "Missing required parameter: specialKey");
		}
		const specialKeyArr = specialKey.split("_");
        const [role, code, id, username] = specialKeyArr;
		const validateSpecialKey = SpecialKeyPayloadSchema.parse({
			role,
			code,
			id,
			username
		})
		const response = await checkSpecialKey(validateSpecialKey);
		res.locals.data = response;
		next();
	} catch (error) {
        return next(error);
	}
};


export const handleJoinRoomSuccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = res.locals.data;
		if (!data) {
            throw new AppError(500, "Internal state error: Data context was lost in transition.");
        }
		const response = await jwtSign(data);
		// delete refresh token in db
		await deleteRefreshToken(data.userRole, data.userData)
		// insert new refresh token in db
		await insertRefreshToken(data.userRole, data.userData.admin_code, response.refreshToken, response.refreshTokenExpiresAt);
		res.cookie("MY_ACCESS_TOKEN", response.accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 30 * 1000, 
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


export const generateNewRefreshToken = async (req: Request, res: Response) => {
	const myAccessRefreshToken = req.cookies.MY_ACCESS_REFRESH_TOKEN;
	if (!myAccessRefreshToken) return res.status(400).json({ message: "Invalid refresh token" });
	try {
		const verifyToken = await jwtVerifyRefreshToken(myAccessRefreshToken);
		console.log(verifyToken);
		// const deleteToken = await deleteRefreshToken(data.userRole, data.userData)
		// // insert new refresh token in db
		// const insertToken = await insertRefreshToken(data.userRole, data.userData.admin_code, response.refreshToken, response.refreshTokenExpiresAt);
		res.cookie("MY_ACCESS_TOKEN", verifyToken.accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 30 * 1000, 
		});
		res.cookie("MY_ACCESS_REFRESH_TOKEN", verifyToken.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge:  24 * 60 * 60 * 1000,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Internal Server Error",
			message: error || "An unexpected error occurred."
		});
	}
}



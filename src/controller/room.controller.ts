import  { type Request, type Response, type NextFunction } from "express";
import { createRoom } from "@/service/room.service.js";
import * as crypto from "node:crypto";
import { type ICreateRoomResponse } from "@/model/room.model.js";
import { checkSpecialKey, jwtSign, jwtVerifyRefreshToken, getTokenPayload, getUserCode } from '@/service/auth.service.js';
import { deleteRefreshToken, insertRefreshToken, isRefreshToken } from "@/service/auth.service.js";
import { AppError } from "@/util/appError.js";
import { CreateRoomSchema, SpecialKeyPayloadSchema, RefreshTokenSchema } from "@/schema/room.schema.js";

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

// export const validateRoomAccess = async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const { specialKey } = req.body;
// 		if (!specialKey) {
// 			throw new AppError(400, "Missing required parameter: specialKey");
// 		}
// 		const specialKeyArr = specialKey.split("_");
//         const [role, code, id, username] = specialKeyArr;
// 		const validateSpecialKey = SpecialKeyPayloadSchema.parse({
// 			role,
// 			code,
// 			id,
// 			username
// 		})
// 		const response = await checkSpecialKey(validateSpecialKey);
// 		res.locals.data = response;
// 		next();
// 	} catch (error) {
//         return next(error);
// 	}
// };


export const handleJoinRoomSuccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = res.locals.data;
		if (!data) {
            throw new AppError(500, "Internal state error: Data context was lost in transition.");
        }
		const response = await jwtSign(data);
		
		const isToken = await isRefreshToken(data.userRole, response.refreshToken, data.userData.admin_code);
		if (isToken) {
			// delete refresh token in db
			console.log("Delete token first");
			await deleteRefreshToken(data.userRole, data.userData)
		}
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


export const generateNewRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const myAccessRefreshToken = req.cookies.MY_ACCESS_REFRESH_TOKEN;
		if (!myAccessRefreshToken)  {
			throw new AppError(400, "Missing refresh token");
		}
		const validatedRefreshToken = RefreshTokenSchema.parse(myAccessRefreshToken);
		const verifyToken = await jwtVerifyRefreshToken(validatedRefreshToken);
		const userPayload = await getTokenPayload(validatedRefreshToken);
		const userCodeAndRole = await getUserCode(userPayload);

		// Set new refresh token data
		const newRole = userCodeAndRole.role;
		const newAdminCode = userCodeAndRole.adminCode;
		const newRefreshToken = verifyToken.refreshToken;
		const newRefreshTokenExpiresAt = verifyToken.refreshTokenExpiresAt;
		
		// (role: string, refreshToken: string, newAdminCode: any)
		//check if refresh token exist in database
		const response = await isRefreshToken(newRole, validatedRefreshToken, newAdminCode);
		if (!response) {
			throw new AppError(400, "Refresh Token is not valid");
		}
		// delete old refresh token in db
		await deleteRefreshToken(newRole, newAdminCode);
		// // insert new refresh token in db
		await insertRefreshToken(newRole, newAdminCode, newRefreshToken, newRefreshTokenExpiresAt);
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
		res.status(200).json({
			message: "Generated new token"
		});
	} catch (error) {
        return next(error);
	}
}



import  { type Request, type Response, type NextFunction } from "express";
import { createNewRoomWithAdmin } from "@/service/room.service.js";
import * as crypto from "node:crypto";
import { type ICreateRoomResponse } from "@/model/room.model.js";
import { checkSpecialKey, jwtSign, jwtVerifyRefreshToken, getTokenPayload, getUserCode } from '@/service/auth.service.js';
import { deleteRefreshToken, insertRefreshToken, isRefreshToken } from "@/service/auth.service.js";
import { AppError } from "@/util/appError.js";
import { CreateRoomSchema, SpecialKeyPayloadSchema, RefreshTokenSchema } from "@/schema/room.schema.js";
import { checkRoomId } from "@/service/room.service.js";

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
		const isLogged = await insertRefreshToken(data.userRole, data.userData.admin_code, response.refreshToken, response.refreshTokenExpiresAt);
		if (!isLogged) {
			await deleteRefreshToken(data.userRole, data.userData.admin_code)
			await insertRefreshToken(data.userRole, data.userData.admin_code, response.refreshToken, response.refreshTokenExpiresAt);
		}
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

export const handleParticipantJoinRoomSuccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const newData = res.locals.data;
		if (!newData) {
            throw new AppError(500, "Internal state error: Data context was lost in transition.");
        }
		const {room_code} = await checkRoomId(newData.userData.room_id);

		const data = {
			userData: {
				id: newData.userData.id,
				room_id: newData.userData.room_id,
				room_code: room_code,
				participant_code:  newData.userData.participant_code,
				username:  newData.userData.username,
				joined_at:  newData.userData.joined_at,
			},
			userRole: "participant"
		}
		const response = await jwtSign(data);
		
		const isLogged = await insertRefreshToken(newData.userRole, newData.userData.participant_code, response.refreshToken, response.refreshTokenExpiresAt);
		if (!isLogged) {
			await deleteRefreshToken(data.userRole, data.userData.participant_code)
			await insertRefreshToken(data.userRole, data.userData.participant_code, response.refreshToken, response.refreshTokenExpiresAt);
		}
		// insert new refresh token in db
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

		console.log(userCodeAndRole)
		// // Set new refresh token data
		const newRole = userCodeAndRole.role;
		const newAdminCode = userCodeAndRole.adminCode;
		const newRefreshToken = verifyToken.refreshToken;
		const newRefreshTokenExpiresAt = verifyToken.refreshTokenExpiresAt;
		
		// // (role: string, refreshToken: string, newAdminCode: any)
		//check if refresh token exist in database
		const response = await insertRefreshToken(newRole, newAdminCode, newRefreshToken, newRefreshTokenExpiresAt);
		if (!response) {
			// delete old refresh token in db
			await deleteRefreshToken(newRole, newAdminCode);
			// // insert new refresh token in db
			await insertRefreshToken(newRole, newAdminCode, newRefreshToken, newRefreshTokenExpiresAt);
		}
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



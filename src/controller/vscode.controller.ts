import { AppError } from "@/util/appError.js";
import { HandleDocumentSchema } from "@/schema/vscode.schema.js";
import type { Request, Response, NextFunction } from "express";
import { insertWorkspace } from "@/service/vscode.service.js";
import { validateSpecialKey } from "@/service/auth.service.js";
import { SpecialKeyPayloadSchema } from "@/schema/room.schema.js";
import { jwtSign, insertRefreshToken, deleteRefreshToken } from "@/service/auth.service.js";

export const handleDocument = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payload = res.locals.userPayload
		const validatedDocument = HandleDocumentSchema.parse(req.body);
		const response = await insertWorkspace(payload, validatedDocument);
		res.status(200).json({
			success: true,
			message: "Successfully post document to virtual ide",
			response
		})
	} catch (error) {
		return next(error)
	}
}

export const validateRoomAccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { specialKey } = req.body;
		if (!specialKey) {
			throw new AppError(400, "Missing required parameter: specialKey");
		}
		const specialKeyArr = specialKey.split("_");
		const [role, code, username] = specialKeyArr;
		console.log(role, code, username);
		const validatedSpecialKey = SpecialKeyPayloadSchema.parse({
			role,
			code,
			username
		})
		const response = await validateSpecialKey(validatedSpecialKey);
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
		const isLogged = await insertRefreshToken(data.user.role, data.user.id, response.refreshToken, response.refreshTokenExpiresAt);
		if (!isLogged) {
			await deleteRefreshToken(data.user.role, data.user.id)
			await insertRefreshToken(data.user.role, data.user.id, response.refreshToken, response.refreshTokenExpiresAt);
		}
		res.status(200).json({
			success: true,
			message: "Successfully Sync to Virtual IDE",
			accessToken: response.accessToken,
			refreshToken: response.refreshToken,
			user: response.json
		});
	} catch (error) {
		return next(error);
	}
}
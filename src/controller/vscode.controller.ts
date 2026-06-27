import { AppError } from "@/util/appError.js";
import { HandleDocumentSchema } from "@/schema/vscode.schema.js";
import type { Request, Response, NextFunction } from "express";
import { insertWorkspace } from "@/service/vscode.service.js";
import { validateSpecialKey } from "@/service/auth.service.js";
import { SpecialKeyPayloadSchema } from "@/schema/room.schema.js";
import { jwtSign, insertRefreshToken, deleteRefreshToken } from "@/service/vscode.service.js";

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
		const { clientType, specialKey } = req.body;
		if (!specialKey) {
			throw new AppError(400, "Missing required parameter: specialKey");
		}
		const specialKeyArr = specialKey.split("_");
		const [role, code, username] = specialKeyArr;
		console.log(role, code, username);
		const validatedSpecialKey = SpecialKeyPayloadSchema.parse({
			clientType,
			specialKey: {
				role,
				code,
				username
			}
		})
		const response = await validateSpecialKey(validatedSpecialKey);
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
			await insertRefreshToken(data.user.role, data.user.id, response.refreshToken, response.refreshTokenExpiresAt ,clientType);
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



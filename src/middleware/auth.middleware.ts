import jwt from "jsonwebtoken";
import  { type Request, type Response, type NextFunction } from "express";
const authSecret = "01c31f5e51d3b19d5feec8308cf695cede83a137354dd97059490b26af846cd3";
import { AppError } from "@/util/appError.js";
import { AccessTokenSchema } from "@/schema/room.schema.js";
import { type IMyTokenPayload } from "@/model/room.model.js";

export const  userAuthorization =  async(req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.cookies.MY_ACCESS_TOKEN) {
			throw new AppError(400, "Missing Access Token");
		}
		const validatedAccessToken = AccessTokenSchema.parse(req.cookies.MY_ACCESS_TOKEN);
		const verified = jwt.verify(validatedAccessToken, authSecret);
		const payload = verified as IMyTokenPayload;
		res.locals.userPayload = payload;
		return next();
	} catch (error) {
		throw error;
	}
}

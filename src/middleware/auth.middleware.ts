import jwt from "jsonwebtoken";
import  { type Request, type Response, type NextFunction } from "express";
const authSecret = "01c31f5e51d3b19d5feec8308cf695cede83a137354dd97059490b26af846cd3";
import { AppError } from "@/util/appError.js";
import { AccessTokenSchema } from "@/schema/room.schema.js";
import { type IMyTokenPayload } from "@/model/room.model.js";


export const userAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Check cookies first (Web), fallback to Authorization header (VSCode)
        let token = req.cookies?.MY_ACCESS_TOKEN;

        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1]; // Extract the raw JWT string
            }
        }

        // 2. If it's missing from BOTH places, reject the request
        if (!token) {
            throw new AppError(400, "Missing Access Token");
        }

        // 3. Validate and verify the token exactly like you did before
        const validatedAccessToken = AccessTokenSchema.parse(token);
        const verified = jwt.verify(validatedAccessToken, authSecret);
        
        const payload = verified as IMyTokenPayload;
        res.locals.userPayload = payload;
        
        return next();
    } catch (error) {
        // Pass the error cleanly to your global error handling middleware
        return next(error);
    }
};

// export const  userAuthorization =  async(req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		if (!req.cookies.MY_ACCESS_TOKEN) {
// 			throw new AppError(400, "Missing Access Token");
// 		}
// 		const validatedAccessToken = AccessTokenSchema.parse(req.cookies.MY_ACCESS_TOKEN);
// 		const verified = jwt.verify(validatedAccessToken, authSecret);
// 		const payload = verified as IMyTokenPayload;
// 		res.locals.userPayload = payload;
// 		return next();
// 	} catch (error) {
// 		throw error;
// 	}
// }

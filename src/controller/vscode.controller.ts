import { AppError } from "@/util/appError.js";
import { HandleDocumentSchema } from "@/schema/vscode.schema.js";
import type { Request, Response, NextFunction } from "express";
import { success } from "zod";


export const handleDocument = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validatedDocument = HandleDocumentSchema.parse(req.body);
		console.log(validatedDocument);
		res.status(200).json({
			success: true,
			validatedDocument
		})
	} catch (error) {
		return next(error)
	}
}
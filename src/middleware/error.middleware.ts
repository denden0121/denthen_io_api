import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from 'zod';
import { AppError } from "@/util/appError.js";

export const globalErrorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
	if (error && (error.name === 'ZodError' || error instanceof ZodError)) {
		// bypass the generic compiler roadblock
		const zodIssues = (error as any).issues || (error as any).errors || [];
		const formattedErrors = zodIssues.map((err: any) => ({
			field: Array.isArray(err.path) ? err.path.join('.') : 'field',
			message: err.message || 'Invalid value',
		}));
		return res.status(400).json({
			success: false,
			message: "Validation Failed",
			errors: formattedErrors,
		});
	}

    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

// // src/middleware/error.middleware.ts
// import { type Request, type Response, type NextFunction } from 'express';
// import { AppError } from '@/util/appError.js';

// export const globalErrorHandler = (
//     err: any, 
//     req: Request, 
//     res: Response, 
//     next: NextFunction
// ) => {
//     const statusCode = err instanceof AppError ? err.statusCode : 500;
//     const message = err.message || "An unexpected internal server error occurred.";

//     return res.status(statusCode).json({
//         success: false,
//         message,
//         error: process.env.NODE_ENV === 'development' ? err.stack : null
//     });
// };
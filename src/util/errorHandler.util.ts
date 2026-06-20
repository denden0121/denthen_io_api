import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from 'zod';
import { AppError } from "./appError.js";

export const globalErrorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
	let isZod = false;
    let zodIssues: any[] = [];

    if (error && (error.name === 'ZodError' || error.constructor?.name === 'ZodError')) {
		console.log("zod error");
        isZod = true;
        zodIssues = error.issues || error.errors || [];
    } 
    // 2. 🏆 THE FAIL-SAFE: If the error message starts with Zod's distinct JSON bracket array syntax
    else if (error && typeof error.message === 'string' && error.message.trim().startsWith('[')) {
        try {
            const parsed = JSON.parse(error.message);
            // Verify it actually looks like a Zod issues array
            if (Array.isArray(parsed) && parsed.length > 0 && 'code' in parsed[0]) {
                isZod = true;
                zodIssues = parsed;
            }
        } catch (e) {
        }
    }

    if (isZod) {
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
	console.log("app error");

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

// import  { type Request, type Response, type NextFunction } from "express";
// import { ZodError } from "zod";

// export const sendError = (
//     res: Response,          
//     statusCode: number, 
//     message: string, 
//     error: any = null
// ) => {
	
// 	if (error instanceof ZodError) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Validation error',
//             errors: error.flatten().fieldErrors 
//         });
//     }
//     return res.status(statusCode).json({
//         success: false,
//         message,
//         error: error ? error.message || error : null
//     });
// };


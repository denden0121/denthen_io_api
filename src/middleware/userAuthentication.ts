import {  type Request, type Response, type NextFunction } from 'express';

const dummmyUser = {
	user_code: "adfec931-869b-4043-91e5-9dd12ef691cd",
	user_role: "admin"
}

export async function userAuthentication (req: Request, res: Response, next: NextFunction) {


	if (!res.locals.userCode || !res.locals.userRole) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Missing required parameters."
		});
	}

	try {
		const user_code = res.locals.userCode
		const user_role = res.locals.userRole

		if (user_code === dummmyUser.user_code && user_role == dummmyUser.user_role) {
			return next();
		}	

		return res.status(401).json({
			error: "Unauthorized access",
			message: "Invalid data: authentication system failure"
		});	
	} catch (err) {
		return res.status(401).json({
			error: err,
			message: `${err}: authentication system failure`
		});	
	}

};
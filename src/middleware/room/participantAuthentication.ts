import {  type Request, type Response, type NextFunction } from 'express';

const dummmyParticipant = {
	participant_code: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}

export async function participantAuthentication (req: Request, res: Response, next: NextFunction) {

	const { participant_code } = req.body;

	if (participant_code) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Missing required parameters: participant_code are required."
		});
	}

	try {
		if (participant_code === dummmyParticipant.participant_code) {
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
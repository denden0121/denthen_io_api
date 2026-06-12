import {  type Request, type Response, type NextFunction } from 'express';
import { selectRoom } from '@/model/roomModel.js';

export async function roomAuthentication (req: Request, res: Response, next: NextFunction) {

	const { specialKey } = req.body;

	const response = specialKey.split("_");
	const [user_role, room_code, user_code] = response;
	
	if (!user_role || !user_code || !user_code) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Missing required parameters"
		});
	}
	
	console.log(specialKey);
	console.log(user_role)
	console.log(room_code)
	console.log(user_code)
	const roomData = await selectRoom(room_code, user_code);
	console.log(roomData)

	try {
		if (user_role !== "admin") {
			console.log('not admin')
			return res.status(400).json({
				error: "Bad Request",
				message: "Failed to join a room"
			});
		}
		if (!roomData) {
			console.log('no room data')
			return res.status(400).json({
				error: "Bad Request",
				message: "Failed to join a room"
			});
		}	
		
		console.log('room data sent')
		res.locals.roomData = await roomData;

		return next();

	} catch (err) {
		return res.status(401).json({
			error: err,
			message: `${err}`
		});	
	}

};
import { Router, type Request, type Response } from "express";
import { error } from "node:console";
const router = Router();

export const joinRoom = router.post("/", (req: Request, res: Response) => {

	try {
		if (!res.locals.roomData) {
			console.log('return token no room data')
			res.status(400).json({
				error: error,
				message: "Failed to join a room"
			})
		}
		else {
			res.status(200).json({
				success: true,
				message: "Room Join Successfully",
				data: {
					information: res.locals?.roomData
				}
			})
		}
	} catch (error) {
			console.log('return token error')
		console.error("Model Error:", error);
		throw error; 
		
	}

});


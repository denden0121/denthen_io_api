import { Router, type Request, type Response } from "express";
import { error } from "node:console";
const router = Router();

export const joinRoom = (req: Request, res: Response) => {
	try {
		if (!res.locals.roomData || !res.locals.userRole) {
			console.log('return token no room data')
			res.status(400).json({ error: error, message: "Failed to join a room" })
		}
		else {
			// res.status(200).json({ success: true, message: "Room Join Successfully",
			// 	data: {
			// 		information: res.locals?.roomData,
			// 		role: res.locals?.userRole
			// 	}
			// })
			const payloadRole = res.locals?.userRole;
			if (payloadRole === "admin") {
				const payloadCode = res.locals?.roomData.admin_code;
				const payloadUsername = res.locals?.roomData.username;
				const payload = {
					code: payloadCode,
					username: payloadUsername,
					role: payloadRole,
				}
			} 
			if (payloadRole === "participant") {
				const payloadCode = res.locals?.roomData.participant_code;
				const payloadUsername = res.locals?.roomData.username;
				const payload = {
					code: payloadCode,
					username: payloadUsername,
					role: payloadRole,
				}
			}
		}
		
	} catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error || "An unexpected error occurred."
        });
	}

};


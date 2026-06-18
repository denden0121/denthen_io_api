import { Router, type Request, type Response } from "express";
import { error } from "node:console";
const router = Router();

export const returnSpecialKey = (req: Request, res: Response) => {

	try {
		if (!res.locals.newRoom) {
			return res.status(400).json({
				error: error,
				message: "Failed to Create Room"
			})
		}
		else {
			const {room_code, admin_code, username} = res.locals?.newRoom
			return  res.status(200).json({
				success: true,
				message: "Room Created Successfully",
				data: {
					specialKey: `admin_${room_code}_${admin_code}_${username}`
					}
			})
		}
		
	} catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error || "An unexpected error occurred."
        });
	}

};




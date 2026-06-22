import { Router, type Request, type Response } from 'express';
const router = Router();


export const showRoomParticipants = router.post("/", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Successfully Join a room",
		token: "f47ac10b-58cc-f47ac10b-58cc-f47ac10b-58cc"
	})
});


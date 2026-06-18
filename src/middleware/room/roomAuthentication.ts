import {  type Request, type Response, type NextFunction } from 'express';
import { selectRoom } from '@/service/room/room.service.js';

export async function roomAuthentication (req: Request, res: Response, next: NextFunction) {
	const { specialKey } = req.body;
	if (!specialKey) {
		return res.status(400).json({ error: "Bad Request", message: "Missing required parameters"});
	}
	const specialKeyArr = specialKey.split("_");
	const [user_role, room_id, user_code] = specialKeyArr;
	if (!user_role || !user_code || !user_code) {
		return res.status(400).json({ error: "Bad Request", message: "Missing required parameters"});
	}
	const roomData = await selectRoom(room_id, user_code);
	try {
		if (user_role !== "admin" || !roomData) {
			return res.status(400).json({ error: "Bad Request", message: "Failed to join a room" });
		}
		res.locals.roomData = await roomData;
		return next();
	} catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error || "An unexpected error occurred."
        });
	}
};

// git add scr/model/room.model.ts 
// git commit -m "feat(room): add room interface & type"

// Changes not staged for commit:
//   (use "git add/rm <file>..." to update what will be committed)
//   (use "git restore <file>..." to discard changes in working directory)
//         modified:   .env
//         modified:   package-lock.json
//         modified:   package.json
//         modified:   src/config/db.ts
//         modified:   src/config/generateParicipantTable.ts
//         deleted:    src/config/generateSpecialKey.ts
//         modified:   src/index.ts
//         deleted:    src/middleware/cors.ts
//         deleted:    src/middleware/participantAuthentication.ts
//         deleted:    src/middleware/roomAuthentication.ts
//         deleted:    src/middleware/userAuthentication.ts
//         deleted:    src/model/participantModel.ts
//         deleted:    src/model/roomModel.ts
//         deleted:    src/route/joinRoom.ts
//         deleted:    src/route/returnParticipantKey.ts
//         deleted:    src/route/returnSpecialKey.ts
//         deleted:    src/route/ticket.ts

// Untracked files:
//   (use "git add <file>..." to include in what will be committed)
//         src/config/auth.config.ts
//         src/config/middleware.config.ts
//         src/controller/
//         src/middleware/global/
//         src/middleware/room/
//         src/model/participant.model.ts
//         src/model/room.model.ts
//         src/route/index.ts
//         src/route/room/
//         src/route/ticket/
//         src/service/
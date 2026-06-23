import express from "express";
import { generateNewParticipant, handleParticipantSpecialKey } from "@/controller/user.controller.js";
import { validateRoomAccess, handleParticipantJoinRoomSuccess } from "@/controller/room.controller.js";
import { generateNewRefreshToken } from "@/controller/room.controller.js";

const router = express.Router();

router.post('/create', generateNewParticipant, handleParticipantSpecialKey);
router.post('/join', validateRoomAccess, handleParticipantJoinRoomSuccess);
router.post('/refresh', generateNewRefreshToken);

export default router;

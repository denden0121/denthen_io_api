import express from "express";
import { generateParticipantKey } from "@/controller/participant.controller.js";
import { handleParticipantSpecialKeySuccess } from "@/service/participant.service.js";
import { validateRoomAccess, handleParticipantJoinRoomSuccess } from "@/controller/room.controller.js";
import { generateNewRefreshToken } from "@/controller/room.controller.js";

const router = express.Router();

router.post('/create', generateParticipantKey, handleParticipantSpecialKeySuccess);
router.post('/join', validateRoomAccess, handleParticipantJoinRoomSuccess);
router.post('/refresh', generateNewRefreshToken);

export default router;

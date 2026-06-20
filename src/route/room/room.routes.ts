import express from "express";
import { generateRoomCode, validateRoomAccess, handleJoinRoomSuccess, generateNewRefreshToken, handleSpecialKeySuccess } from "@/controller/room.controller.js";
// import { joinRoom } from "./joinRoom.js"; check it

const router = express.Router();

router.post('/create', generateRoomCode, handleSpecialKeySuccess);
router.post('/join', validateRoomAccess, handleJoinRoomSuccess);
router.post('/refresh', generateNewRefreshToken);

export default router;
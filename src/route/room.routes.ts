import express from "express";
import { generateRoomCode, validateRoomAccess, handleJoinRoomSuccess, generateNewRefreshToken, handleSpecialKeySuccess } from "@/controller/room.controller.js";

const router = express.Router();

router.post('/create', generateRoomCode, handleSpecialKeySuccess); // done
router.post('/join', validateRoomAccess, handleJoinRoomSuccess); 
router.post('/refresh', generateNewRefreshToken);

export default router;
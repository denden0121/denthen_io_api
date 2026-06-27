import express from "express";
import { generateRoomCode, validateRoomAccess, handleJoinRoomSuccess, generateNewRefreshToken, handleSpecialKeySuccess, getCommit } from "@/controller/room.controller.js";

const router = express.Router();

router.post('/create', generateRoomCode, handleSpecialKeySuccess);
router.post('/join', validateRoomAccess, handleJoinRoomSuccess); 
router.post('/refresh', generateNewRefreshToken);
router.get('/commit', getCommit);

export default router;


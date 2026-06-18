import express from "express";
import { generateRoomCode } from "@/controller/room/room.controller.js";
import { returnSpecialKey } from "./returnSpecialKey.js";
import { roomAuthentication } from "@/middleware/room/roomAuthentication.js";
import { joinRoom } from "./joinRoom.js";

const router = express.Router();

router.post('/create', generateRoomCode, returnSpecialKey);
router.post('/join', roomAuthentication, joinRoom);	


export default router;
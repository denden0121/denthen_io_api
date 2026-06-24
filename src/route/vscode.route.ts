import express from "express";
const router = express.Router();
import { handleDocument } from "@/controller/vscode.controller.js";
import {  generateNewRefreshToken, handleSpecialKeySuccess } from "@/controller/room.controller.js";
import { validateRoomAccess, handleJoinRoomSuccess} from "@/controller/vscode.controller.js";

router.post("/export", handleDocument);
router.post('/join', validateRoomAccess, handleJoinRoomSuccess); 


export default router;



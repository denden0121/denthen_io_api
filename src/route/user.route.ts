import express from "express";
import { generateNewParticipant, handleParticipantSpecialKey } from "@/controller/user.controller.js";

const router = express.Router();

router.post('/create', generateNewParticipant, handleParticipantSpecialKey);

export default router;

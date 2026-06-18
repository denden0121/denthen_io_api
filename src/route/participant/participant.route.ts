import express from "express";
import { generateParticipantKey } from "@/controller/participant/participant.controller.js";
import { returnParticipantKey } from "./returnParticipantKey.js";

const router = express.Router();

router.post('/create', generateParticipantKey, returnParticipantKey);

export default router;
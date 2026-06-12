import express from "express";
import '@/config/db.js';
import { roomAuthentication } from "./middleware/roomAuthentication.js";
import { userAuthentication } from "./middleware/userAuthentication.js";
import { corsMiddleware } from "./middleware/cors.js";
import { generateSpecialKey } from "@/config/generateSpecialKey.js";
import { returnSpecialKey } from "./route/returnSpecialKey.js";
import {  joinRoom } from "./route/joinRoom.js";
import { generateParticipantKey } from "./config/generateParticipantKey.js";
import { returnParticipantKey } from "./route/returnParticipantKey.js";

const app = express();
app.use(express.json());
app.use(corsMiddleware);


app.use('/create', generateSpecialKey, returnSpecialKey);
app.use('/create/participant', generateParticipantKey, returnParticipantKey);
app.use('/join', roomAuthentication, joinRoom);	


const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

import express from "express";
import 'dotenv/config';
import '@/config/db.js';
import { configureGlobalMiddlewares } from "./config/middleware.config.js";
import apiRouter from "./route/index.js";

// refactor
import { generateParticipantKey } from "./config/generateParticipantKey.js";
import { returnParticipantKey } from "./route/room/returnParticipantKey.js";


const app = express();

// global middlewares
configureGlobalMiddlewares(app);

// api routers
app.use("/api", apiRouter);
app.use('/create/participant', generateParticipantKey, returnParticipantKey);




const PORT = process.env.APP_PORT as string;
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

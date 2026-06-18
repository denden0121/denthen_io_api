import express from "express";
import 'dotenv/config';
import '@/config/db.js';
import { configureGlobalMiddlewares } from "./config/middleware.config.js";
import apiRouter from "./route/index.js";


const app = express();

// global middlewares
configureGlobalMiddlewares(app);

// api routers
app.use("/api", apiRouter);

const PORT = process.env.APP_PORT as string;
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

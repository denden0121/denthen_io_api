import express from "express";
import 'dotenv/config';
import '@/config/db.js';
import { configureGlobalMiddlewares } from "./config/middleware.config.js";
import apiRouter from "./route/index.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";

const app = express();

// global middlewares
configureGlobalMiddlewares(app);

// api routers
app.use("/api", apiRouter);

// global error handler
app.use(globalErrorHandler);

const PORT = process.env.APP_PORT as string;
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

import express from "express";
import 'dotenv/config';
import '@/config/db.js';
import { configureGlobalMiddlewares } from "./config/middleware.config.js";
import { configureWebSockets } from "./config/socket.config.js";
import apiRouter from "./route/index.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.APP_PORT as string || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"]
	}
});

configureWebSockets(io);

// global middlewares
configureGlobalMiddlewares(app);

// api routers
app.use("/api", apiRouter);

// global error handler
app.use(globalErrorHandler);

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

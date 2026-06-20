import { AppError } from "./appError.js";
throw new AppError(500, "Internal state error: Data context was lost in transition.");
throw new AppError(500, "Failed to delete refresh token in the database.");
throw new AppError(500, "Failed to create room entry in the database.");
throw new AppError(400, "Missing required parameter: specialKey");
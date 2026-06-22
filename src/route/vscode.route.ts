import express from "express";
const router = express.Router();
import { handleDocument } from "@/controller/vscode.controller.js";

router.post("/document", handleDocument);


export default router;
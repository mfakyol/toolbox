import { Router } from "express";
import { fontUpload } from "../middleware/upload.js";
import { convertFontHandler } from "../controllers/font.controller.js";

const router = Router();

router.post("/font/convert", fontUpload.single("font"), convertFontHandler);

export default router;

import { Router } from "express";
import { fontUpload } from "../middleware/upload.js";
import { conversionLimiter } from "../middleware/rateLimit.js";
import { convertFontHandler } from "../controllers/font.controller.js";

const router = Router();

router.post(
  "/font/convert",
  conversionLimiter,
  fontUpload.single("font"),
  convertFontHandler
);

export default router;

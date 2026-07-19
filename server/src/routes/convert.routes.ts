import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { conversionLimiter } from "../middleware/rateLimit.js";
import { convert } from "../controllers/convert.controller.js";

const router = Router();

router.post("/convert", conversionLimiter, upload.single("image"), convert);

export default router;

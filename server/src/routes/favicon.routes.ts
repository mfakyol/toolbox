import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { faviconHandler } from "../controllers/favicon.controller.js";

const router = Router();

router.post("/favicon", upload.single("image"), faviconHandler);

export default router;

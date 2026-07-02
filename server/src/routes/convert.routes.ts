import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { convert } from "../controllers/convert.controller.js";

const router = Router();

router.post("/convert", upload.single("image"), convert);

export default router;

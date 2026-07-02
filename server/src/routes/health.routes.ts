import { Router } from "express";
import { FORMAT_LIST } from "../constants/formats.js";
import { FONT_FORMAT_LIST } from "../constants/fontFormats.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    imageFormats: FORMAT_LIST,
    fontFormats: FONT_FORMAT_LIST,
  });
});

export default router;

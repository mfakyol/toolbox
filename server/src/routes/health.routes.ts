import { Router } from "express";
import mongoose from "mongoose";
import { FORMAT_LIST } from "../constants/formats.js";
import { FONT_FORMAT_LIST } from "../constants/fontFormats.js";

const router = Router();

router.get("/health", (_req, res) => {
  // readyState 1 = connected. Reflect the DB so a load balancer / uptime check
  // sees a non-200 when the app can't actually serve requests.
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? "ok" : "degraded",
    db: dbReady ? "up" : "down",
    imageFormats: FORMAT_LIST,
    fontFormats: FONT_FORMAT_LIST,
  });
});

export default router;

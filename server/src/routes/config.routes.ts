import { Router } from "express";
import { config } from "../config/index.js";

const router = Router();

// Public runtime config the client reads on load to decide whether to show the
// login flow and the admin/users area. Flipping AUTH_REQUIRED in the server
// environment changes this without rebuilding the client.
router.get("/config", (_req, res) => {
  res.json({ authRequired: config.authRequired });
});

export default router;

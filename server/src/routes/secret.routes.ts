import { Router } from "express";
import { requireAuth, requirePasswordChanged } from "../middleware/auth.js";
import {
  create,
  list,
  meta,
  reveal,
} from "../controllers/secret.controller.js";

const router = Router();

// Creating and listing secrets require a logged-in (password-changed) user.
router.post("/secrets", requireAuth, requirePasswordChanged, create);
router.get("/secrets", requireAuth, requirePasswordChanged, list);

// Viewing is public by default; per-secret requireLogin is enforced inside
// the controller/service (some secrets may still demand a session).
router.get("/secrets/:token/meta", meta);
router.post("/secrets/:token/reveal", reveal);

export default router;

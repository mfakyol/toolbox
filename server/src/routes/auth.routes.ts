import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, changePasswordSchema } from "../schemas/auth.schema.js";
import {
  login,
  logout,
  me,
  changePassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/auth/login", authLimiter, validateBody(loginSchema), login);
router.post("/auth/logout", logout);
router.get("/auth/me", me);
router.post(
  "/auth/change-password",
  authLimiter,
  requireAuth,
  validateBody(changePasswordSchema),
  changePassword
);

export default router;

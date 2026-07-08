import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  login,
  logout,
  me,
  changePassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", me);
router.post("/auth/change-password", requireAuth, changePassword);

export default router;

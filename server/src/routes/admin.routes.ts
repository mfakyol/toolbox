import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createUserSchema } from "../schemas/admin.schema.js";
import {
  listUsers,
  createUser,
  deleteUser,
} from "../controllers/admin.controller.js";

const router = Router();

// Every admin route requires an authenticated admin.
router.use("/admin", requireAuth, requireAdmin);

router.get("/admin/users", listUsers);
router.post("/admin/users", validateBody(createUserSchema), createUser);
router.delete("/admin/users/:id", deleteUser);

export default router;

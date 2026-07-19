import { Router } from "express";
import { requireAuth, requirePasswordChanged } from "../middleware/auth.js";
import { uploadTransfer } from "../middleware/uploadTransfer.js";
import { validateBody } from "../middleware/validate.js";
import {
  createTransferSchema,
  verifyTransferSchema,
} from "../schemas/transfer.schema.js";
import {
  create,
  list,
  meta,
  verify,
  download,
  remove,
} from "../controllers/transfer.controller.js";

const router = Router();

// Creating, listing and deleting require a logged-in (password-changed) user.
// validateBody runs after multer so the multipart text fields are populated.
router.post(
  "/transfers",
  requireAuth,
  requirePasswordChanged,
  uploadTransfer,
  validateBody(createTransferSchema),
  create
);
router.get("/transfers", requireAuth, requirePasswordChanged, list);
router.delete("/transfers/:id", requireAuth, requirePasswordChanged, remove);

// Download page metadata + the download itself are public; per-transfer
// requireLogin / passphrase are enforced inside the controller/service.
router.get("/transfers/:token/meta", meta);
router.post(
  "/transfers/:token/verify",
  validateBody(verifyTransferSchema),
  verify
);
router.get("/transfers/:token/download", download);

export default router;

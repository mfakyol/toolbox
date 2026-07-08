import { Router } from "express";
import { requireAuth, requirePasswordChanged } from "../middleware/auth.js";
import healthRoutes from "./health.routes.js";
import configRoutes from "./config.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import secretRoutes from "./secret.routes.js";
import transferRoutes from "./transfer.routes.js";
import convertRoutes from "./convert.routes.js";
import fontRoutes from "./font.routes.js";
import faviconRoutes from "./favicon.routes.js";

const router = Router();

// Public: liveness/readiness and the auth endpoints (login must be reachable
// without a session).
router.use(healthRoutes);
router.use(configRoutes);
router.use(authRoutes);

// Admin routes guard themselves (requireAuth + requireAdmin).
router.use(adminRoutes);

// Secret routes guard themselves per-endpoint: create/list need auth, while
// meta/reveal are public (per-secret requireLogin is enforced internally).
router.use(secretRoutes);

// File transfers: create/list/delete need auth, meta/download are public
// (per-transfer requireLogin/passphrase enforced internally).
router.use(transferRoutes);

// Every tool requires a logged-in user who has completed the initial
// password change.
router.use(requireAuth, requirePasswordChanged);
router.use(convertRoutes);
router.use(fontRoutes);
router.use(faviconRoutes);

export default router;

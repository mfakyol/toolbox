import { Router } from "express";
import healthRoutes from "./health.routes.js";
import convertRoutes from "./convert.routes.js";
import fontRoutes from "./font.routes.js";
import faviconRoutes from "./favicon.routes.js";

const router = Router();

router.use(healthRoutes);
router.use(convertRoutes);
router.use(fontRoutes);
router.use(faviconRoutes);

export default router;

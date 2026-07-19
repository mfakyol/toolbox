import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { config } from "../config/index.js";

// Requires an authenticated session — unless auth is disabled globally
// (config.authRequired === false), in which case every request passes through
// and owner-scoped controllers fall back to the shared anonymous owner.
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!config.authRequired) return next();
  if (!req.isAuthenticated?.() || !req.user) {
    return next(new AppError("AUTH_REQUIRED", 401));
  }
  next();
};

// Requires the "admin" role. Assumes requireAuth ran first.
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("FORBIDDEN", 403));
  }
  next();
};

// Blocks access while the user still has to change their initial password.
// Applied to the tool routes so a fresh account is forced through the
// change-password flow before it can use anything.
export const requirePasswordChanged: RequestHandler = (req, _res, next) => {
  if (req.user?.mustChangePassword) {
    return next(new AppError("PASSWORD_CHANGE_REQUIRED", 403));
  }
  next();
};

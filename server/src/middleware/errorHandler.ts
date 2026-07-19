import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import { AppError } from "../errors/AppError.js";
import { ERROR_MESSAGES } from "../errors/messages.js";

// 404 for undefined routes.
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: ERROR_MESSAGES.NOT_FOUND, code: "NOT_FOUND" });
};

// Central error handler. Registered after all routes. Every response carries a
// stable `code` the client translates, plus an English `error` fallback.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof MulterError) {
    const tooBig = err.code === "LIMIT_FILE_SIZE";
    res.status(tooBig ? 413 : 400).json({
      error: err.message,
      code: tooBig ? "FILE_TOO_LARGE" : "UPLOAD_ERROR",
    });
    return;
  }

  // MongoDB duplicate-key (e.g. two accounts racing on the same email) →
  // 409 Conflict instead of a generic 500.
  if (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  ) {
    res.status(409).json({ error: ERROR_MESSAGES.DUPLICATE, code: "DUPLICATE" });
    return;
  }

  console.error("Beklenmeyen hata:", err);
  res.status(500).json({ error: ERROR_MESSAGES.INTERNAL, code: "INTERNAL" });
};

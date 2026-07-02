import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/AppError.js";

// 404 for undefined routes.
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Kaynak bulunamadı." });
};

// Central error handler. Registered after all routes.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ error: err.message });
    return;
  }

  console.error("Beklenmeyen hata:", err);
  res.status(500).json({ error: "Sunucu hatası." });
};

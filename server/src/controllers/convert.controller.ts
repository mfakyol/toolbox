import type { Request, Response, NextFunction } from "express";
import {
  optimizeImage,
  readMetadata,
} from "../services/optimizer.service.js";
import {
  SUPPORTED_FORMATS,
  isSupportedFormat,
} from "../constants/formats.js";
import { AppError } from "../utils/AppError.js";
import type { OptimizeOptions } from "../types/index.js";

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// POST /api/convert — single image conversion and optimization.
export async function convert(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError("No image file was provided.");
    }

    const format = String(req.body.format ?? "webp").toLowerCase();
    if (!isSupportedFormat(format)) {
      throw new AppError(`Unsupported format: ${format}`);
    }

    const opts: OptimizeOptions = {
      format,
      quality: parseNumber(req.body.quality),
      width: parseNumber(req.body.width),
      height: parseNumber(req.body.height),
      keepMetadata: req.body.keepMetadata === "true",
    };

    const originalMeta = await readMetadata(req.file.buffer);
    const result = await optimizeImage(req.file.buffer, opts);

    const { ext, mime } = SUPPORTED_FORMATS[format];
    const baseName = (req.file.originalname || "image").replace(/\.[^.]+$/, "");

    res.set({
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${baseName}.${ext}"`,
      "X-Original-Size": String(req.file.size),
      "X-Output-Size": String(result.size),
      "X-Original-Format": originalMeta.format ?? "unknown",
      "X-Output-Format": result.format,
      "X-Original-Width": String(originalMeta.width ?? ""),
      "X-Original-Height": String(originalMeta.height ?? ""),
      "X-Output-Width": String(result.width),
      "X-Output-Height": String(result.height),
      "Access-Control-Expose-Headers":
        "X-Original-Size,X-Output-Size,X-Original-Format,X-Output-Format,X-Original-Width,X-Original-Height,X-Output-Width,X-Output-Height,Content-Disposition",
    });

    res.send(result.buffer);
  } catch (err) {
    next(err);
  }
}

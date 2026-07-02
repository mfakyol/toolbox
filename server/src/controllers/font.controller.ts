import type { Request, Response, NextFunction } from "express";
import { convertFont } from "../services/font.service.js";
import { FONT_FORMATS, isFontFormat } from "../constants/fontFormats.js";
import { AppError } from "../utils/AppError.js";

// POST /api/font/convert — single font conversion.
export async function convertFontHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError("No font file was provided.");
    }

    const format = String(req.body.format ?? "woff2").toLowerCase();
    if (!isFontFormat(format)) {
      throw new AppError(`Unsupported font format: ${format}`);
    }

    const result = await convertFont(req.file.buffer, format);

    const { ext, mime } = FONT_FORMATS[format];
    const baseName = (req.file.originalname || "font").replace(/\.[^.]+$/, "");

    res.set({
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${baseName}.${ext}"`,
      "X-Original-Size": String(req.file.size),
      "X-Output-Size": String(result.size),
      "X-Original-Format": result.sourceFormat,
      "X-Output-Format": result.format,
      "Access-Control-Expose-Headers":
        "X-Original-Size,X-Output-Size,X-Original-Format,X-Output-Format,Content-Disposition",
    });

    res.send(result.buffer);
  } catch (err) {
    next(err);
  }
}

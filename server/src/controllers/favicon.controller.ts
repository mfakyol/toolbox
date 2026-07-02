import type { Request, Response, NextFunction } from "express";
import { generateFavicons } from "../services/favicon.service.js";
import { AppError } from "../utils/AppError.js";

// POST /api/favicon — generates a favicon pack (ZIP) from an image.
export async function faviconHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError("No image file was provided.");
    }

    const zip = await generateFavicons(req.file.buffer);

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="favicons.zip"',
      "X-Output-Size": String(zip.length),
      "Access-Control-Expose-Headers": "X-Output-Size,Content-Disposition",
    });
    res.send(zip);
  } catch (err) {
    next(err);
  }
}

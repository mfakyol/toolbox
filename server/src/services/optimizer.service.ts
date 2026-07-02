import sharp from "sharp";
import { isSupportedFormat } from "../constants/formats.js";
import { AppError } from "../utils/AppError.js";
import type { OptimizeOptions, OptimizeResult } from "../types/index.js";

function clampQuality(value: number | undefined): number {
  const q = Number(value) || 80;
  return Math.min(100, Math.max(1, q));
}

/**
 * Converts an image to the requested format and optimizes it.
 * Works entirely in memory, without touching disk.
 */
export async function optimizeImage(
  input: Buffer,
  opts: OptimizeOptions
): Promise<OptimizeResult> {
  const { format, width, height, keepMetadata = false } = opts;

  if (!isSupportedFormat(format)) {
    throw new AppError(`Unsupported format: ${format}`);
  }

  const animated = format === "gif" || format === "webp";
  let pipeline = sharp(input, { animated });

  if (keepMetadata) {
    pipeline = pipeline.withMetadata();
  }

  // Resize only when at least one dimension is provided.
  if (width || height) {
    pipeline = pipeline.resize({
      width: width || undefined,
      height: height || undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const quality = clampQuality(opts.quality);

  switch (format) {
    case "jpeg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ compressionLevel: 9, quality, effort: 7 });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality, effort: 4 });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality, effort: 4 });
      break;
    case "tiff":
      pipeline = pipeline.tiff({ quality });
      break;
    case "gif":
      pipeline = pipeline.gif();
      break;
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    size: data.length,
    format,
  };
}

/** Reads the source image's original metadata. */
export async function readMetadata(input: Buffer) {
  return sharp(input).metadata();
}

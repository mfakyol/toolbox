import { convert, detectFormat } from "fontverter";
import { FONT_FORMATS, isFontFormat } from "../constants/fontFormats.js";
import { AppError } from "../errors/AppError.js";
import type { FontFormat } from "../constants/fontFormats.js";

export interface FontConvertResult {
  buffer: Buffer;
  size: number;
  format: FontFormat;
  sourceFormat: string;
}

/**
 * Converts a font to the requested web format (ttf/woff/woff2).
 * Works entirely in memory.
 */
export async function convertFont(
  input: Buffer,
  format: FontFormat
): Promise<FontConvertResult> {
  if (!isFontFormat(format)) {
    throw new AppError("UNSUPPORTED_FORMAT", 400, `Unsupported font format: ${format}`);
  }

  let sourceFormat: string;
  try {
    sourceFormat = await detectFormat(input);
  } catch {
    throw new AppError("INVALID_FONT", 415);
  }

  const { target } = FONT_FORMATS[format];

  try {
    const out = await convert(input, target);
    const buffer = Buffer.from(out);
    return { buffer, size: buffer.length, format, sourceFormat };
  } catch (err) {
    throw new AppError(
      "FONT_CONVERSION_FAILED",
      422,
      `Font conversion failed: ${(err as Error).message}`
    );
  }
}

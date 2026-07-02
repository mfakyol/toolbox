import { convert, detectFormat } from "fontverter";
import { FONT_FORMATS, isFontFormat } from "../constants/fontFormats.js";
import { AppError } from "../utils/AppError.js";
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
    throw new AppError(`Unsupported font format: ${format}`);
  }

  let sourceFormat: string;
  try {
    sourceFormat = await detectFormat(input);
  } catch {
    throw new AppError("Invalid or unrecognized font file.", 415);
  }

  const { target } = FONT_FORMATS[format];

  try {
    const out = await convert(input, target);
    const buffer = Buffer.from(out);
    return { buffer, size: buffer.length, format, sourceFormat };
  } catch (err) {
    throw new AppError(
      `Font conversion failed: ${(err as Error).message}`,
      422
    );
  }
}

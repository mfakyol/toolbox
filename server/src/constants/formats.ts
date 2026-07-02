// Supported output formats and their metadata.

export const SUPPORTED_FORMATS = {
  jpeg: { ext: "jpg", mime: "image/jpeg" },
  png: { ext: "png", mime: "image/png" },
  webp: { ext: "webp", mime: "image/webp" },
  avif: { ext: "avif", mime: "image/avif" },
  tiff: { ext: "tiff", mime: "image/tiff" },
  gif: { ext: "gif", mime: "image/gif" },
} as const;

export type OutputFormat = keyof typeof SUPPORTED_FORMATS;

export const FORMAT_LIST = Object.keys(SUPPORTED_FORMATS) as OutputFormat[];

export function isSupportedFormat(value: string): value is OutputFormat {
  return value in SUPPORTED_FORMATS;
}

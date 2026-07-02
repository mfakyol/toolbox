// ---- Image ----
export const IMAGE_FORMATS = [
  "webp",
  "avif",
  "jpeg",
  "png",
  "tiff",
  "gif",
] as const;

export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export interface ImageConvertOptions {
  format: ImageFormat;
  quality: number;
  width?: number;
  height?: number;
  keepMetadata: boolean;
}

// ---- Font ----
export const FONT_FORMATS = ["woff2", "woff", "ttf"] as const;

export type FontFormat = (typeof FONT_FORMATS)[number];

// ---- Shared conversion result ----
export interface ConvertResult {
  blob: Blob; // raw output for ZIP packaging
  url: string;
  filename: string;
  originalSize: number;
  outputSize: number;
  savings: number;
  meta?: string; // e.g. "200 × 150 px" or "SFNT → WOFF2"
}

// ---- Batch (multi-file) job state ----
export type JobStatus = "queued" | "processing" | "done" | "error";

export interface Job {
  id: string;
  file: File;
  status: JobStatus;
  result?: ConvertResult;
  error?: string;
}

// Maximum number of concurrent conversions; the rest wait in the queue.
export const MAX_CONCURRENCY = 10;

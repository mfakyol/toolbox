import type { OutputFormat } from "../constants/formats.js";

// Optimization request options (input to the service layer).
export interface OptimizeOptions {
  format: OutputFormat;
  quality?: number;
  width?: number;
  height?: number;
  keepMetadata?: boolean;
}

// Optimization result.
export interface OptimizeResult {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  format: OutputFormat;
}

// On-disk storage location for file transfers. Lives in utils (a low layer) so
// both the multer middleware and the transfer service/controller can depend on
// it without a service importing from middleware (wrong dependency direction).
import fs from "node:fs";
import path from "node:path";
import { config } from "../config/index.js";

// Absolute path to the upload directory, created on startup if missing.
export const UPLOAD_PATH = path.resolve(config.uploadDir);
fs.mkdirSync(UPLOAD_PATH, { recursive: true });

export function storedFilePath(storedName: string): string {
  return path.join(UPLOAD_PATH, storedName);
}

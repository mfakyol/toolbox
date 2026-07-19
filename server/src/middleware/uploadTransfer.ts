import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { config } from "../config/index.js";
import { UPLOAD_PATH } from "../utils/storage.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_PATH),
  // Store under an unguessable uuid name; the original name lives in the DB.
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

// Files uploaded under the "files" field (multiple). Per-file size is capped at
// the total transfer cap; the total is verified afterwards in the service.
export const uploadTransfer = multer({
  storage,
  limits: {
    fileSize: config.maxTransferSize,
    files: config.maxTransferFiles,
  },
}).array("files", config.maxTransferFiles);

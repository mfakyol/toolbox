import multer from "multer";
import { extname } from "node:path";
import { config } from "../config/index.js";
import { AppError } from "../errors/AppError.js";
import { ACCEPTED_FONT_EXTENSIONS } from "../constants/fontFormats.js";

// Creates an in-memory (no disk) multer instance with size and type filtering.
function createUpload(filter: multer.Options["fileFilter"]) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxFileSize },
    fileFilter: filter,
  });
}

// Image uploads — by image/* mimetype.
export const upload = createUpload((_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("IMAGE_ONLY", 415));
  }
});

// Font uploads — by extension, since font mimetypes are unreliable.
export const fontUpload = createUpload((_req, file, cb) => {
  const ext = extname(file.originalname).toLowerCase();
  if ((ACCEPTED_FONT_EXTENSIONS as readonly string[]).includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "UNSUPPORTED_FORMAT",
        415,
        `Only these font formats are accepted: ${ACCEPTED_FONT_EXTENSIONS.join(", ")}`
      )
    );
  }
});

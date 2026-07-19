// Stable, machine-readable error codes. The API returns the code alongside a
// human-readable English fallback message; the client maps the code to its own
// i18n (EN/DE/TR) and only falls back to the message for unknown codes.
export const ERROR_MESSAGES = {
  // Auth / authorization
  AUTH_REQUIRED: "Authentication required.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  FORBIDDEN: "You don't have permission to do this.",
  PASSWORD_CHANGE_REQUIRED: "Change your password before continuing.",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect.",

  // Users / admin
  USER_NOT_FOUND: "User not found.",
  EMAIL_TAKEN: "This email is already registered.",
  CANNOT_DELETE_SELF: "You can't delete your own account.",

  // Uploads / conversion
  NO_IMAGE_FILE: "No image file was provided.",
  NO_FONT_FILE: "No font file was provided.",
  IMAGE_ONLY: "Only image files are accepted.",
  INVALID_IMAGE: "Invalid or unrecognized image file.",
  INVALID_FONT: "Invalid or unrecognized font file.",
  UNSUPPORTED_FORMAT: "Unsupported format.",
  FONT_CONVERSION_FAILED: "Font conversion failed.",

  // One-time secret
  SECRET_NOT_FOUND: "Secret not found.",
  SECRET_ALREADY_VIEWED: "This secret has already been viewed.",
  SECRET_EXPIRED: "This secret has expired.",
  SECRET_LOGIN_REQUIRED: "You must be logged in to view this secret.",
  SECRET_WRONG_PASSPHRASE: "Incorrect passphrase.",
  SECRET_DECRYPT_FAILED: "The secret could not be decrypted.",
  SECRET_CONTENT_EMPTY: "Content can't be empty.",
  SECRET_CONTENT_TOO_LARGE: "Content is too large (max 100 KB).",

  // File transfer
  TRANSFER_NO_FILES: "Upload at least one file.",
  TRANSFER_TOO_LARGE: "Total size limit exceeded.",
  TRANSFER_NOT_FOUND: "Transfer not found.",
  TRANSFER_EXPIRED: "This transfer has expired.",
  TRANSFER_LOGIN_REQUIRED: "You must be logged in to download these files.",
  TRANSFER_WRONG_PASSPHRASE: "Incorrect passphrase.",

  // Generic / infrastructure
  VALIDATION_ERROR: "Invalid request.",
  NOT_FOUND: "Resource not found.",
  DUPLICATE: "This record already exists.",
  FILE_TOO_LARGE: "File is too large.",
  UPLOAD_ERROR: "Upload failed.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INTERNAL: "Server error.",
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

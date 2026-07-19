// Application error carrying an HTTP status code and a stable, machine-readable
// error code. The error-handling middleware returns both; the client maps the
// code to its own i18n and uses `message` only as a fallback.
import { ERROR_MESSAGES, type ErrorCode } from "./messages.js";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;

  // `message` defaults to the English fallback for the code; pass it only to add
  // dynamic detail (e.g. which format was unsupported).
  constructor(code: ErrorCode, statusCode = 400, message?: string) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

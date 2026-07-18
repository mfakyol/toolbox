// Discriminated result returned by every service call. Callers branch on
// `success` and handle the error explicitly instead of catching thrown values.
// `code` is the server's stable error code (see server errors/messages.ts) —
// the UI maps it to i18n, falling back to `error` for unknown/network errors.
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export const ok = <T>(data: T): Result<T> => ({ success: true, data });
export const fail = (error: string, code?: string): Result<never> => ({
  success: false,
  error,
  code,
});

// Error thrown by store actions that turn a failed Result into an exception,
// carrying the code through so the calling form can translate it.
export class ApiError extends Error {
  readonly code?: string;
  constructor(error: string, code?: string) {
    super(error);
    this.name = "ApiError";
    this.code = code;
  }
}

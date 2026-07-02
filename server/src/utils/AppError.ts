// Application error carrying an HTTP status code. The error-handling middleware
// returns errors of this type with the proper status.
export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

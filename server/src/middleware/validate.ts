import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../errors/AppError.js";

// Single validation entry point: parse req.body against a schema, replace it
// with the parsed (typed, coerced) value, and reject with a 400 on failure.
// Business invariants (ownership, TTL whitelists) stay in the services.
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const message = result.error.issues[0]?.message;
      return next(new AppError("VALIDATION_ERROR", 400, message));
    }
    req.body = result.data;
    next();
  };
}

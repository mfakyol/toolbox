import { z } from "zod";

// Multipart / urlencoded bodies deliver everything as strings. These helpers
// coerce the handful of non-string fields the same way the controllers used to.

// "true" (or a real boolean true) → true; anything else (incl. "false",
// undefined) → false. NOT z.coerce.boolean(), which treats "false" as true.
export const boolish = z.preprocess(
  (v) => v === true || v === "true",
  z.boolean()
);

// Optional positive integer from a string/number; blank/invalid → undefined so
// the service falls back to its default (and enforces the TTL whitelist).
export const optionalPositiveInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}, z.number().int().positive().optional());

// Email, trimmed and lowercased, matching the app's existing validation.
export const emailString = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address.")
  .transform((s) => s.toLowerCase());

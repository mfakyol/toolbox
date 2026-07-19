// Rate limiters. In-memory (per-process) — fine for a single instance; move to
// a shared store (e.g. Redis) if the server is ever horizontally scaled.
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Auth endpoints (login / change-password): brute-force protection. Keyed per
// IP **and** account (email) and counting only failed attempts, so a valid
// user isn't punished for a burst of successful requests.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count
  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.toLowerCase().trim()
        : "";
    // ipKeyGenerator normalizes IPv6 addresses to a /64 subnet.
    return `${ipKeyGenerator(req.ip ?? "")}:${email}`;
  },
  message: { error: "Too many attempts. Please try again later.", code: "RATE_LIMITED" },
});

// CPU-expensive endpoints (image/font/favicon conversion) run heavy native work
// per request — cap them separately from the cheap JSON routes.
export const conversionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many conversion requests. Please wait a moment.", code: "RATE_LIMITED" },
});

# Node.js / Express — Security Standards

Reusable security checklist for Node + Express + TypeScript APIs. Apply these by
default on every backend; treat exceptions as decisions that need justification.

## Input & validation
- Validate **every** external input at the boundary (`body`, `params`, `query`,
  headers) with a schema library (e.g. Zod). Reject on failure with a 400.
- Derive types from the schema (`z.infer`) so validation and types share one
  source of truth.
- **Never spread raw `req.body` into a DB model** (mass-assignment). Persist only
  whitelisted, validated fields.
- Validate resource IDs (e.g. `ObjectId.isValid`) before hitting the database.
- Cap sizes: body parser limit (`express.json({ limit: '1mb' })`), max string
  lengths, max array counts, pagination `limit` caps.

## Authentication & sessions
- Hash passwords with bcrypt/argon2 (bcrypt cost ≥ 10). Never store or log plaintext.
- Session cookies: `httpOnly`, `sameSite: 'lax'` (or `strict`), `secure` in prod.
- Regenerate the session on login (session fixation) and destroy it on logout.
- Enforce a strong `SESSION_SECRET`; require it in production (fail fast if missing).
- Return generic auth errors ("invalid email or password") — don't reveal which field failed.

## Authorization
- Check ownership/role on every state-changing or private-read route, not just at the router level.
- Default deny: private resources return 403/404 unless the caller is owner/authorized.

## Rate limiting & abuse
- Rate-limit auth endpoints (login/register/change-password) against brute force,
  keyed per **IP + account**, counting **failed** attempts only so valid users aren't punished.
- Rate-limit CPU-expensive endpoints separately.
- Note: an in-memory limiter is **per-process** — use a shared store (Redis) once
  you run more than one instance.

## Untrusted code / heavy compute
- Run untrusted templates/code in an isolated `node:vm` context (or a worker/child
  process) with a **hard timeout**; deny access to `process`, `require`, globals.
- CPU-bound work (compilers, image processing) blocks the event loop — move it to
  `worker_threads` with a wall-clock timeout to prevent a single request from DoS-ing the server.
- Block filesystem/SSRF vectors in preprocessors: reject `@import`/`@require`,
  disable file loaders, and validate any user-supplied URL (http(s) only, host allowlist).

## Transport & headers
- Use `helmet` for security headers. Enable HSTS in production.
- Lock CORS to the known client origin(s) with `credentials: true`; don't use `*` with credentials.
- Serve over HTTPS in production; set `trust proxy` correctly when behind a proxy
  (and only then — a wrong value lets clients spoof `X-Forwarded-For`).

## Errors, logging & data hygiene
- One central error handler. **Never leak stack traces or internal messages** to
  clients in production; return a generic 500. Map known errors (e.g. Mongo dup key → 409).
- Don't put secrets, tokens, passwords, or PII in URLs, query strings, or logs.
- Prefer structured logging (pino) with request IDs over `console.*` in production.

## Data integrity
- Add unique indexes for natural keys; handle the duplicate-key error path.
- Clean up dependent documents on delete (cascade) so you don't orphan rows.
- Use atomic operations (`findOneAndUpdate`, upserts) where races matter, backed by unique indexes.

## Config, secrets & lifecycle
- Centralize config in one typed module; validate required vars, fail fast in prod.
- Keep `.env` out of version control; commit a `.env.example` with safe placeholders.
- Expose a health/readiness endpoint that reflects **dependency status** (e.g. DB
  connectivity), returning non-200 when unhealthy.
- Handle graceful shutdown (`SIGTERM`/`SIGINT`): stop accepting connections, drain
  in-flight requests, close DB connections, with a force-exit timeout fallback.

## Quick pre-ship checklist
- [ ] All inputs schema-validated; no raw-body persistence
- [ ] Passwords hashed; session cookies hardened; login regenerates session
- [ ] Auth rate-limited; expensive endpoints rate-limited
- [ ] Untrusted execution sandboxed + timed out
- [ ] helmet + locked CORS + body limits
- [ ] Central error handler hides internals in prod
- [ ] Secrets required in prod, not committed
- [ ] Health check reflects DB; graceful shutdown wired

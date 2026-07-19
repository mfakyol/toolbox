# Project-Specific — Media & Dev Toolbox

Notes unique to **this** repo. General standards live in the sibling docs
(`nodejs-backend-security.md`, `backend-file-structure.md`, `frontend-structure.md`)
— this project should conform to those; the notes below only cover what is
specific to this codebase.

## What it is
A CloudConvert-style, login-gated toolbox bundling several tools behind one SPA:
Image optimize (Sharp), Font convert (fontverter), Favicon pack (png-to-ico),
JSON→TypeScript, Dev Tools (Base64/URL/JWT/SHA/UUID), QR, One-Time Secret,
File Transfer, and a WebSocket/Socket.IO/SignalR test Playground.

## Topology
- Two independent apps, deployed separately:
  - `client/` — React 18 + Vite SPA, dev on `:6001`.
  - `server/` — Express API, dev on `:6000`. Serves **only** `/api/*` — it does
    **not** serve the app HTML.
- Vite dev server proxies `/api` → `:6000`.
- Docker: nginx serves the built SPA and proxies `/api` to the server container,
  published on `127.0.0.1:8080`; TLS is terminated by the **host** nginx.
  Request flow: **browser → host nginx (TLS) → `:8080` container nginx → `/api`
  to server, static SPA otherwise.** `X-Forwarded-Proto` is propagated through
  both nginx layers so `Secure` cookies work; `client_max_body_size` is raised on
  both layers for large transfers.

## Auth model (the spine of the app)
- Session-based (Passport local + `connect-mongo`), cookie `toolbox.sid`,
  `httpOnly` + `sameSite: lax`, `Secure` in prod. In prod `trust proxy` is set to a
  fixed hop count (`2` = host nginx → container nginx) — not `true` — so a client
  can't spoof `X-Forwarded-For` (which also keys the rate limiter).
- **No public registration.** An admin seeds the first admin on startup
  (`config/seedAdmin`) from env; admins create accounts; every new account has
  `mustChangePassword` and is forced through `/change-password` before any tool
  (`requirePasswordChanged` guards the tool routes).
- Roles: `admin`, `user`. Admin area is `/admin/users`.
- **`AUTH_REQUIRED` kill-switch:** when `false`, auth middleware is skipped, the
  login/admin UI disappears, and owner-scoped tools (secrets, transfers) fall back
  to a single shared anonymous owner (`ANON_OWNER_ID` / `ownerId(req)` in
  `config/index.ts`). The client mirrors this via `GET /api/config`.

## Route guarding (server)
`routes/index.ts` wires public routes first (health, config, auth), then
self-guarding admin/secret/transfer routes (create/list need auth; meta/reveal/
download are public with per-item `requireLogin`/passphrase enforced in the
service), then applies `requireAuth, requirePasswordChanged` globally before the
tool routes (convert/font/favicon).

## One-Time Secret
- Stored **encrypted** at rest, AES-256-GCM (`utils/secretCrypto.ts`). Key is
  `scrypt(serverKey + passphrase, per-secret salt)` — a passphrase-protected
  secret can't be decrypted without it (wrong passphrase → GCM auth failure).
- First successful reveal returns the content **once** then wipes it; only
  metadata (unopened / viewed / expired + timestamps) survives. Selectable TTL,
  optional passphrase, optional "login required to open". A background sweep wipes
  expired-but-unopened secrets.

## File Transfer
- WeTransfer-style. Files stored on disk under `UPLOAD_DIR` (multer). One share
  link, downloadable until TTL expiry (default 7d). Single file streams directly;
  multiple files stream as an on-the-fly zip (`archiver`). Optional passphrase
  (bcrypt-gated) + "login required". Owner can delete; a background sweep wipes
  expired transfers from disk. Caps: `MAX_TRANSFER_SIZE` (2 GB), `MAX_TRANSFER_FILES` (20).

## Preprocessing / heavy compute
- Image (Sharp), font (fontverter), favicon (png-to-ico) conversions run in the
  service layer, decoupled from Express and unit-tested without req/res.
- Upload size capped by multer (`MAX_FILE_SIZE`, 25 MB for tool uploads).
- Conversion endpoints have their own `express-rate-limit` (`conversionLimiter`),
  separate from the auth limiter, since each request does heavy native work.

## Security & validation (server)
- **helmet** on every response (CSP left to the nginx host — this API is JSON only;
  HSTS in prod). **CORS** is locked to explicit origin(s) with credentials — never
  `*` — parsed from `CORS_ORIGIN` (comma-separated allowed).
- **Rate limiting** (`middleware/rateLimit.ts`): `authLimiter` on login /
  change-password (keyed per IP+email, failed attempts only) and `conversionLimiter`
  on convert/font/favicon.
- **Request validation** (`middleware/validate.ts` + `schemas/`): one `validateBody(schema)`
  middleware, Zod DTOs per feature; controllers trust the parsed body. Business
  invariants (TTL whitelist, ownership) still live in the services.
- **Errors are typed codes** (`errors/messages.ts`, `errors/AppError.ts`): every
  `AppError` carries a stable `code`; the handler returns `{ error, code }` (English
  `error` is a fallback). The client maps `code` → its own EN/DE/TR i18n. Mongo
  dup-key → 409, invalid ObjectId → clean 404, Multer size → 413.
- **Graceful shutdown** (`index.ts`): SIGTERM/SIGINT drain the server + close Mongo,
  with a force-exit timeout. `/health` returns 503 when the DB isn't connected.

## Data / env
- MongoDB via Mongoose. Models: `User`, `Secret`, `Transfer`.
- All env is read only in `config/index.ts` (nothing else touches `process.env`).
  The **app itself fails fast** at startup in production if `SESSION_SECRET`,
  `SECRET_ENCRYPTION_KEY`, `ADMIN_PASSWORD` are still the insecure defaults or
  `CORS_ORIGIN` is `*` (not just the compose file). Defaults exist for local dev
  (`change-me-*`) — **set real values in production.**

## Client shape (specifics)
Conforms to `frontend-structure.md`. Layout: `pages/`, `layouts/` (`MainLayout` +
route `guards`), `components/ui/` (primitives, incl. `CodeEditor`) and
`components/<feature>/` (`batch`, `compare`, `playground`, `devtools`), `hooks/`,
`stores/`, `services/`, `schemas/`, `types/`, `utils/`, `i18n/`, `styles/`.
- **Path alias:** `@/*` → `src/*` (tsconfig `paths` + vite `resolve.alias`, so
  Vitest resolves it too). Cross-folder imports use `@/…`; only same-folder `./`
  imports remain relative.
- **services/** — one `*.service.ts` per resource. Every call returns a
  discriminated `Result<T>` (`{ success, data } | { success, error }`) from
  `services/result.ts`; the shared `services/http.ts` helpers (`requestJson`,
  `postForm`) never throw. Pages/hooks branch on `result.success`.
- **stores/** — `auth.store.ts` (zustand): session user + runtime `authRequired`,
  `init()` runs once in `main.tsx`. Store actions translate a failed `Result` into
  a throw so the calling form can catch it. i18n stays a Context provider (`i18n/`).
- **schemas/** — Zod input validation (`auth`/`secret`/`transfer`); messages are
  i18n keys resolved via `t()` at the call site.
- Styling is **SCSS Modules** (`*.module.scss`) per component, on top of
  `styles/` tokens/mixins/base. i18n is EN/DE/TR, browser-detected with
  `localStorage` persistence; **all** user-facing copy (incl. `aria-label`s and
  input placeholders) goes through `t()`.
- CodeMirror (JSON page) and the Playground (ws/socket.io/signalr) are
  **lazy-loaded** to keep them out of the main bundle.
- QR preview renders the generated SVG via an `<img>` blob URL — never
  `dangerouslySetInnerHTML`.

## Testing
- Server: `node:test` — `optimizer` & `font` services (real Sharp conversions,
  error paths) in `server/test/`.
- Client: Vitest — `pool`, `jsonToTs`, `devtools`, `format` (colocated `*.test.ts`).

## Conventions for this repo/owner
- **Do not add a `Co-Authored-By` trailer** to commits (owner preference).
- Prefer small, single-concern commits.
- User-facing errors are **error codes**, not prose: server throws
  `new AppError("CODE", status)` and the client translates the code. When adding an
  error, add the code to server `errors/messages.ts` and a matching `error.<CODE>`
  key in the client's EN/DE/TR `i18n/translations.ts`. Server `console.*` logs stay
  Turkish (operator-facing, never returned to clients).
- Server layering (`backend-file-structure.md`): entry is `src/index.ts`
  (composition root) + `src/app.ts` (builds the app); `AppError` lives in `errors/`;
  tests in `server/test/` mirror `src/`. Lower layers never import higher ones
  (e.g. the on-disk path helper is in `utils/storage.ts`, not middleware).

## Open follow-ups (not yet done)
Both apps now conform to the shared standards (helmet, locked CORS, rate limiting,
Zod validation, typed error codes, prod fail-fast, graceful shutdown, `test/`
layout are all done). Remaining:
- Move CPU-bound conversions to `worker_threads` with a wall-clock timeout (DoS
  hardening) so a single request can't block the event loop.
- Structured logging (pino) instead of `console.*` on the server.
- Route-level integration tests (supertest + `mongodb-memory-server`) — the layout
  is ready under `server/test/`; not wired yet.
- Per-field i18n for server validation errors: `validateBody` failures currently
  collapse to one `VALIDATION_ERROR` code (the client validates per-field before
  submit, so this is only the server-side backstop).

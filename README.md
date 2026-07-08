# 🛠️ Media & Dev Toolbox

**A CloudConvert-style, browser-based platform for image/font conversion and everyday developer tools.**

Optimize images, convert fonts to web formats, generate favicon packs, turn JSON into TypeScript types, and use common developer utilities — all in one place.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)
![Tests](https://img.shields.io/badge/tests-passing-22c55e)

---

## 📸 Screenshots

> _Add a screenshot / GIF here:_ `docs/demo.gif`
>
> ```markdown
> ![Demo](docs/demo.gif)
> ```

---

## ✨ Features

A single multilingual (EN / DE / TR) SPA bundling **5 tools**:

| Tool | Route | What it does |
|------|-------|--------------|
| 🖼️ **Image Optimize** | `/` | Convert to WebP · AVIF · JPEG · PNG · TIFF · GIF, quality control, resize, EXIF keep |
| 🔤 **Font Convert** | `/font` | TTF · OTF · WOFF · WOFF2 → WOFF2 · WOFF · TTF |
| ⭐ **Favicon Generator** | `/favicon` | From one image: `favicon.ico` + all PNG sizes + `site.webmanifest` + `<head>` snippet (ZIP) |
| 🧬 **JSON → TypeScript** | `/json` | Generate `interface`/`type` from JSON — syntax-highlighted editor |
| 🧰 **Dev Tools** | `/tools` | Base64 · URL encode/decode · JWT decoder · Hash (SHA) · UUID generator |
| 🔑 **One-Time Secret** | `/secret` | Share an encrypted secret via a link that self-destructs after a single view |
| 📦 **File Transfer** | `/transfer` | WeTransfer-style: upload files, share one link, download until it expires |

### Highlights
- ⚡ **Multi-file & parallel processing** — batch upload via drag & drop; up to **10** concurrent conversions (queue-managed pool), the rest wait in line
- 📦 **Bulk ZIP download** — all outputs in a single archive
- 🔍 **Before/After slider** — draggable comparison of original vs. optimized image
- 🌍 **i18n** — English / Deutsch / Türkçe, auto-detected from the browser with `localStorage` persistence
- 🎨 **Syntax-highlighted code editor** — CodeMirror (lazy-loaded so it doesn't bloat the main bundle)

---

## 🏗️ Architecture

A **fully TypeScript** monorepo with a clean, layered separation of concerns.

```
toolbox/
├── server/                       # Express + Sharp API  (TypeScript, strict)
│   └── src/
│       ├── config/               # Environment / configuration
│       ├── constants/            # Supported image & font formats
│       ├── types/                # Shared types + ambient .d.ts
│       ├── utils/                # AppError, etc.
│       ├── services/             # Business logic: optimizer · font · favicon
│       ├── controllers/          # HTTP request/response layer
│       ├── middleware/           # multer upload + centralized errorHandler
│       ├── routes/               # health · convert · font · favicon
│       ├── app.ts                # Express app setup
│       └── server.ts             # Entry point
│
├── client/                       # React + Vite UI (TypeScript, strict)
│   └── src/
│       ├── api/                  # Backend clients (convert · font · favicon)
│       ├── components/           # Dropzone, JobList, CompareSlider, CodeEditor …
│       ├── hooks/                # useBatchConverter (concurrency + state)
│       ├── pages/                # 5 tool pages
│       ├── i18n/                 # Translation dictionary + Provider/hook
│       └── utils/                # pool, zip, jsonToTs, devtools …
│
├── docker-compose.yml            # Whole stack with one command
└── README.md
```

**Design choice:** business logic (services) is fully decoupled from the HTTP layer — functions like `optimizeImage`, `convertFont`, and `jsonToTypescript` are tested and reused without any dependency on Express.

---

## 🚀 Getting started

**Requires:** Node.js 20+

### Backend
```bash
cd server
npm install
npm run dev        # tsx watch → http://localhost:6000
```

### Frontend
```bash
cd client
npm install
npm run dev        # http://localhost:6001
```

The frontend proxies `/api` requests to the backend (6000) via Vite.

### 🐳 Docker (local, one command)
```bash
docker compose up --build     # http://localhost:8080
```
nginx serves the frontend and proxies `/api` to the backend service; the backend is not exposed publicly. (This local compose runs its own MongoDB.)

### 🚀 Production deploy (Linux server + host nginx)

Everything runs in containers; TLS is terminated by the **host's nginx**. The app is published on `127.0.0.1:8080` only.

```bash
# 1. Configure — copy the template and fill in the values
cp .env.example .env
#    generate secrets:  openssl rand -hex 32
$EDITOR .env               # DOMAIN, SESSION_SECRET, SECRET_ENCRYPTION_KEY, ADMIN_PASSWORD …

# 2. Bring up the stack (client + server + mongo)
docker compose -f docker-compose.prod.yml up -d --build

# 3. Host nginx: point your server block at 127.0.0.1:8080 and get a cert
sudo cp deploy/nginx-host.conf.example /etc/nginx/sites-available/toolbox.fatihakyol.com
sudo ln -s /etc/nginx/sites-available/toolbox.fatihakyol.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d toolbox.fatihakyol.com
sudo nginx -t && sudo systemctl reload nginx
```

**Prerequisites:** DNS `A`/`AAAA` for the domain → this server; ports 80/443 open. The compose file **requires** `DOMAIN`, `SESSION_SECRET`, `SECRET_ENCRYPTION_KEY`, and `ADMIN_PASSWORD` in `.env` (it fails fast if any is missing). `.env` is git-ignored — never commit it. Cookies are `Secure` in this setup; the `X-Forwarded-Proto` header is propagated host nginx → container nginx → backend so logins work over HTTPS. Uploads and the transfer volume persist in named Docker volumes; `client_max_body_size` is raised on both nginx layers for large transfers.

Request flow: **browser → host nginx (TLS) → `127.0.0.1:8080` container nginx → `/api` to server / static SPA otherwise.**

---

## 🔌 API

### `POST /api/convert` — image conversion
`multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `image` | file | Source image (required) |
| `format` | string | webp · avif · jpeg · png · tiff · gif |
| `quality` | number | 1–100 (default 80) |
| `width` / `height` | number | optional resize |
| `keepMetadata` | boolean | keep EXIF |

Response: converted image (binary). Size/format info in `X-*` headers.

### `POST /api/font/convert` — font conversion
| Field | Type | Description |
|-------|------|-------------|
| `font` | file | ttf · otf · woff · woff2 (required) |
| `format` | string | woff2 · woff · ttf |

### `POST /api/favicon` — favicon pack
| Field | Type | Description |
|-------|------|-------------|
| `image` | file | Source image (required) |

Response: `favicons.zip` (favicon.ico + PNG sizes + manifest + head snippet).

### `GET /api/health`
`{ status, imageFormats, fontFormats }`

### Auth endpoints
| Method & path | Auth | Description |
|---------------|------|-------------|
| `POST /api/auth/login` | – | `{ email, password, rememberMe }`. `rememberMe` → persistent 1-year cookie; otherwise a browser-session cookie |
| `POST /api/auth/logout` | session | Destroys the session |
| `GET /api/auth/me` | – | `{ user }` (or `null`) |
| `POST /api/auth/change-password` | session | `{ currentPassword, newPassword }`; clears the first-login flag |
| `GET /api/admin/users` | admin | List accounts |
| `POST /api/admin/users` | admin | Create account `{ email, password, role }` |
| `DELETE /api/admin/users/:id` | admin | Remove account |

### One-time secret endpoints
| Method & path | Auth | Description |
|---------------|------|-------------|
| `POST /api/secrets` | session | Create `{ content, passphrase?, ttlSeconds, requireLogin }` → returns a share token |
| `GET /api/secrets` | session | Current user's secrets (metadata only, **never** content) |
| `GET /api/secrets/:token/meta` | – | View-page metadata (status, expiry, flags) — no content |
| `POST /api/secrets/:token/reveal` | –* | One-time reveal; returns content **once**, then wipes it. *`requireLogin` secrets need a session |

### File-transfer endpoints
| Method & path | Auth | Description |
|---------------|------|-------------|
| `POST /api/transfers` | session | Multipart upload `files[]` + `{ message?, passphrase?, ttlSeconds, requireLogin }` |
| `GET /api/transfers` | session | Current user's transfers (metadata only) |
| `DELETE /api/transfers/:id` | session | Owner deletes a transfer and its files |
| `GET /api/transfers/:token/meta` | – | Download-page info (file list, sizes, flags) |
| `POST /api/transfers/:token/verify` | –* | Checks login/passphrase without downloading |
| `GET /api/transfers/:token/download` | –* | Streams the file, or a zip of all files. *`requireLogin`/passphrase enforced |

---

## 📦 File Transfer

WeTransfer-style sharing. Upload one or more files (stored on disk under `UPLOAD_DIR`) and get a single shareable link. The link is **downloadable until it expires** (selectable TTL, default 7 days), download count is tracked, and a single file streams directly while multiple files stream as an on-the-fly **zip** (`archiver`). Options mirror the secret feature: optional **passphrase** (bcrypt-gated) and a **"login required to download"** checkbox. Expired transfers are swept and their files wiped from disk by a background job; owners can also delete transfers manually from their history. Behind nginx, `client_max_body_size` and streaming proxy buffers are configured for large files.

---

## 🔑 One-Time Secret

Paste text → it's stored **encrypted** (AES-256-GCM, server-side key + optional passphrase) and you get a shareable link. Opening the link once reveals the content and **permanently deletes it** from the database; only metadata survives so the creator's history shows *unopened / viewed / expired* plus timestamps — the content is never shown again. Options: selectable TTL (1h/1d/7d/30d, default 7d), optional passphrase, and a "login required to open" checkbox. Expired-but-unopened secrets are swept and wiped by a background job.

---

## 🔐 Authentication

Session-based auth (Passport local strategy) backed by MongoDB via `connect-mongo`. **There is no public registration** — an admin creates accounts, and each new account **must change its password on first login**. Roles: `admin` and `user` (more admin roles can be added later). All tool routes require a logged-in user.

The **first admin** is seeded on startup from env vars if no admin exists yet.

### Env vars (server)

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/toolbox` | MongoDB connection string |
| `SESSION_SECRET` | `change-me-in-production` | Session signing secret — **set this in production** |
| `SECRET_ENCRYPTION_KEY` | `change-me-secret-encryption-key` | AES key for one-time secrets — **set this in production** |
| `UPLOAD_DIR` | `uploads` | Directory where transfer files are stored |
| `MAX_TRANSFER_SIZE` | `2147483648` | Max total upload size per transfer in bytes (2 GB) |
| `MAX_TRANSFER_FILES` | `20` | Max number of files per transfer |
| `ADMIN_EMAIL` | `admin@toolbox.local` | Seeded first-admin email |
| `ADMIN_PASSWORD` | `admin1234` | Seeded first-admin password (change on first login) |
| `REMEMBER_ME_MAX_AGE` | `31536000000` | "Remember me" cookie lifetime in ms (1 year) |
| `COOKIE_SECURE` | `true` in production | Set `false` when serving over plain HTTP |

> **Local dev:** run MongoDB (e.g. `docker run -p 27017:27017 mongo:7`), then `npm run dev` in `server`. Docker Compose brings up Mongo automatically.

---

## 🧪 Testing

```bash
cd server && npm test    # node:test — optimizer & font services
cd client && npm test    # vitest — pool, jsonToTs, devtools, format
```

- **Server:** real `sharp` conversions (resize/fit, format), error paths
- **Client:** concurrency pool (max-10 cap), JSON→TS generation, Base64/JWT/SHA-256, byte formatting

---

## 🛠️ Tech stack

**Frontend:** React 18 · TypeScript · Vite · React Router · CodeMirror · JSZip
**Backend:** Node.js 20 · Express · Sharp · fontverter · png-to-ico · Multer · archiver · MongoDB · Mongoose · Passport · connect-mongo
**Infra:** Docker · nginx · Vitest · node:test

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development (watch mode) |
| `npm run build` | Production build |
| `npm run typecheck` | Type checking (no output) |
| `npm test` | Run tests |
| `npm start` | (server) Run compiled `dist/server.js` |

---

_Real optimization with Sharp · fully TypeScript · Docker-ready_

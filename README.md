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

### 🐳 Docker (one command)
```bash
docker compose up --build     # http://localhost:8080
```
nginx serves the frontend and proxies `/api` to the backend service; the backend is not exposed publicly.

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
**Backend:** Node.js 20 · Express · Sharp · fontverter · png-to-ico · Multer
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

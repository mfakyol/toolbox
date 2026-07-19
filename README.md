# Media & Dev Toolbox

A browser-based platform for image and font conversion plus everyday developer
utilities — image optimization, favicon generation, JSON-to-TypeScript, one-time
secrets, and file transfer, in a single multilingual (EN / DE / TR) SPA behind
session authentication.

**Live demo:** [toolbox.fatihakyol.com](https://toolbox.fatihakyol.com/)

## Features

- **Image optimize** — convert to WebP / AVIF / JPEG / PNG / TIFF / GIF with quality, resize, and EXIF control, plus a before/after slider
- **Font convert** — TTF / OTF / WOFF / WOFF2 to any web format
- **Favicon generator** — one image to `favicon.ico`, PNG sizes, `site.webmanifest`, and a `<head>` snippet, packaged as a ZIP
- **JSON → TypeScript** — generate interfaces from JSON in a syntax-highlighted editor
- **Dev tools** — Base64, URL encode/decode, JWT decoder, SHA hashes, UUID generator
- **One-time secret** — share an AES-256-GCM-encrypted secret via a link that self-destructs after a single view
- **File transfer** — upload files and share one link that stays live until it expires

Batch drag & drop processing (up to 10 concurrent, queue-managed), bulk ZIP
download, and browser-detected localization throughout.

## Tech Stack

- **Frontend** — React 18, Vite, TypeScript, React Router, CodeMirror
- **Backend** — Node.js 20, Express, Sharp, MongoDB + Mongoose, Passport
- **Infra** — Docker, nginx, Vitest

Business logic is decoupled from the HTTP layer — services like `optimizeImage`
and `jsonToTypescript` are tested and reused independently of Express.

## Getting Started

**Prerequisites:** Node.js 20+ and MongoDB (local, Docker, or Atlas).

```bash
# Backend
cd server && npm install && npm run dev   # http://localhost:6000

# Frontend
cd client && npm install && npm run dev   # http://localhost:6001
```

The Vite dev server proxies `/api` to the backend. To run the whole stack in
containers, use `docker compose up --build` (http://localhost:8080).

## Testing

```bash
cd server && npm test   # node:test — Sharp conversions, font services
cd client && npm test   # vitest — concurrency pool, JSON→TS, dev tools
```

## Project Structure

```
toolbox/
├── client/   # React + Vite — api, components, hooks, pages, i18n, utils
└── server/   # Express + Sharp — services, controllers, middleware, routes
```

## License

Built as a portfolio project.

# Media & Dev Toolbox

A browser-based platform for image and font conversion plus everyday developer
utilities — optimize images, generate favicon packs, convert JSON to TypeScript,
share one-time secrets, and send files — all in a single multilingual
(EN / DE / TR) SPA behind session authentication.

**Live demo:** [toolbox.fatihakyol.com](https://toolbox.fatihakyol.com/)

## Features

**Media tools**
- Image optimize — convert to WebP / AVIF / JPEG / PNG / TIFF / GIF with quality, resize, and EXIF control, plus a before/after slider
- Font convert — TTF / OTF / WOFF / WOFF2 into any web format
- Favicon generator — one image to `favicon.ico`, PNG sizes, `site.webmanifest`, and a `<head>` snippet, packaged as a ZIP

**Developer tools**
- JSON → TypeScript — generate interfaces from JSON in a syntax-highlighted editor
- Base64, URL encode/decode, JWT decoder, SHA hashes, and a UUID generator

**Sharing**
- One-time secret — AES-256-GCM-encrypted text behind a link that self-destructs after a single view
- File transfer — upload files and share one link that stays live until it expires

**Platform**
- Batch drag & drop processing, up to 10 concurrent conversions (queue-managed)
- Bulk ZIP download of all outputs at once
- Browser-detected localization (EN / DE / TR) persisted across visits
- Session-based auth (Passport, bcrypt); admins create accounts, no public sign-up

## Tech Stack

- **Frontend** — React 18, Vite, TypeScript, React Router, CodeMirror
- **Backend** — Node.js 20, Express, Sharp, MongoDB + Mongoose, Passport
- **Infra** — Docker, nginx, Vitest

## Getting Started

**Prerequisites:** Node.js 20+ and MongoDB (local, Docker, or Atlas).

**Backend**

```bash
cd server
npm install
npm run dev               # http://localhost:6000
```

**Frontend**

```bash
cd client
npm install
npm run dev               # http://localhost:6001
```

The Vite dev server proxies `/api` to the backend, so no extra configuration is
needed for local development. To run the whole stack in containers, use
`docker compose up --build` (http://localhost:8080).

## Testing

```bash
cd server && npm test     # node:test — Sharp conversions, font services
cd client && npm test     # vitest — concurrency pool, JSON→TS, dev tools
```

## Project Structure

```
toolbox/
├── client/   # React + Vite — api, components, hooks, pages, i18n, utils
└── server/   # Express + Sharp — services, controllers, middleware, routes
```

## License

Built as a portfolio project.

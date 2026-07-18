# Frontend — Structure & Component Standards

Reusable structure for React + Vite + TypeScript SPAs. Optimizes for separation of
concerns, discoverability, and a consistent component model.

## Layout

```
src/
  pages/         # route-level screens (compose components; little logic)
  layouts/       # shared shells / route wrappers (Main, Auth, Protected, …)
  components/
    ui/          # brand-neutral design-system primitives (Button, Input, Modal)
    <feature>/   # feature-scoped components grouped in one folder
  hooks/         # reusable logic (useX)
  stores/        # client state — one store per domain (zustand/redux)
  services/      # typed API calls — one module per resource
  schemas/       # client-side validation (Zod)
  types/         # shared types
  utils/         # pure, framework-free helpers
  i18n/          # translations / locale
  styles/        # global styles
  assets/        # images, icons
main.tsx         # app bootstrap (providers, router, root render)
```

## Layering & responsibilities

- **pages** compose layouts + components and own route-level data fetching/wiring.
- **components/ui** are presentational, app-agnostic primitives you could reuse in
  any project. **components/<feature>** are app-specific and may read stores.
- **stores** hold state, **one store per domain** (auth, workspace, preview…). Avoid
  a single god store. Select narrow slices to limit re-renders.
- **services** own all IO. Wrap the HTTP client to return a **discriminated result**
  (`{ success: true, data } | { success: false, error }`) instead of throwing, so
  callers handle errors explicitly and type-safely.
- **hooks** extract reusable stateful logic; **utils** stay pure (no React, easily unit-tested).

## Component-model rules

- Keep a feature's components in **one place**. Don't split the same feature across
  top-level `components/` and a `components/<feature>/` subfolder — pick one. (Two
  files named nearly the same in two folders is a classic smell.)
- Prefer small, focused components; colocate a component's private helpers, extract
  shared ones to `utils/`.
- Co-locate `state` with usage; lift to a store only when shared across routes.
- Guard route access in a layout wrapper (e.g. `ProtectedLayout`) rather than per page.

## Naming conventions

- Components `PascalCase.tsx`; hooks `useCamelCase.ts`; stores `x.store.ts`;
  services `x.service.ts`; utils `camelCase.ts`.

## Frontend security defaults

- **Never** `dangerouslySetInnerHTML` with user/remote data. Rely on React escaping.
- Render untrusted HTML/JS **only inside a sandboxed iframe** (`sandbox="allow-scripts"`
  **without** `allow-same-origin`) so it runs in an isolated origin.
- When building HTML strings (embed snippets, iframe `srcdoc`), **escape every
  interpolated value** for its context (attribute vs. text).
- `postMessage`: always check `event.source`/`event.origin`; on the receiving side
  (including inside a sandboxed iframe) reject messages that aren't from the expected window.
- Validate/normalize redirect targets (must start with `/`, not `//`) to prevent open redirects.
- External links: `target="_blank"` → add `rel="noreferrer"` (or `noopener`).
- Show raw error details only in development (`import.meta.env.DEV`); keep production messages generic.
- Keep all user-facing strings in i18n; don't hardcode copy in components.

## App-level CSP note

A strict Content-Security-Policy belongs on **whatever serves the app HTML** (the
static host / index.html), **not** on a separate JSON API server. If previews use
iframe `srcdoc`, they inherit the parent page's CSP — so a strict app CSP will break
arbitrary preview execution. Serve previews from a separate origin to get both.

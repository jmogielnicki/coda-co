# Agent guide for coda-co

Read this before editing. It's short on purpose.

## What this project is

CodaCo is a curated marketplace for death and dying (goods + services). The
codebase is a Next.js App Router rebuild of an original single-file HTML
prototype. The prototype lives at `index.html.reference` and is the source of
truth for visual design and copy. See `PLAN.md` for architecture and
`TASKS.md` for current implementation status.

## Stack

- Next.js 16.2.4 (App Router, Turbopack)
- React 19 with the React Compiler enabled (`reactCompiler: true` in
  `next.config.ts` — top-level, not under `experimental`)
- TypeScript, Tailwind CSS v4 (tokens declared via `@theme` in
  `app/globals.css`)
- `next/font` — Cormorant Garamond (serif) + DM Sans (sans)

If something about the Next.js / React APIs surprises you, check the docs
shipped in `node_modules/next/dist/docs/` rather than relying on memory.

## Conventions

- **RSC by default.** Only add `'use client'` when a component needs
  `useState`, `useEffect`, browser APIs, or event handlers.
- **Data access goes through `lib/api/*.ts`.** Don't import from
  `lib/data/*.ts` directly in components.
- **Cart**: `useCart()` from `components/providers/CartProvider.tsx`
  (client-only, localStorage-backed).
- **Filters**: URL `searchParams` are the source of truth for shop/service
  filtering. Client filter components update the URL; the page RSC re-renders.
- **Tokens**: brand colors live in `app/globals.css` under `@theme`. Use
  `bg-tr`, `text-sg-d`, `border-tr-l`, `font-serif`, etc. Don't hardcode hex.

## Prototype fidelity

`index.html.reference` is the visual + copy source of truth. When a page
drifts from the prototype, port the prototype's structure/classes/copy
faithfully — don't rewrite freehand. See `docs/prototype-fidelity-plan.md`
for the homepage port and the general approach.

The prototype is also served by the dev server at
`/__prototype__/index.html` so it can be diffed against the live app.

## Visual diff workflow

`scripts/visual-diff.mjs` pixel-diffs the running dev server against the
prototype and writes baseline/actual/diff PNGs to `./diff/`, with a
mismatched-pixel percentage per section.

```
npm run dev                           # in one terminal
npm run visual-diff                   # all sections
npm run visual-diff hero              # just one section
```

Requires a Chromium binary (auto-detected at
`~/.cache/cft/chrome-linux64/chrome`, override with `CHROMIUM_PATH`).
`BASE_URL` defaults to `http://localhost:3000`. Section list and
selectors are at the top of the script.

The expected loop when chasing prototype parity: run the diff, look at
`diff/<section>.diff.png`, fix the page/component, re-run the diff for that
section.

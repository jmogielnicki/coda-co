# coda-co

A curated marketplace for death and dying — goods (urns, jewelry, burial
shrouds, planning documents) and services (death doulas, estate attorneys,
celebrants, grief counselors). Next.js 16 App Router rebuild of the original
single-file HTML prototype.

See `AGENTS.md` for guidance when working in the codebase, and `TASKS.md`
for known open work.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server (Turbopack) on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

## The prototype

The original design lives in `index.html.reference` — a single self-contained
HTML file with all routes rendered as `.pg` panes (`#p0` homepage, `#p1`
services, `#p2` product detail, etc.). It's the source of truth for layout,
copy, colors, and spacing. When porting a page, treat the prototype as
canonical and keep the Next.js version faithful to it.

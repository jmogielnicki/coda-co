# coda-co

A curated marketplace for death and dying — goods (urns, jewelry, burial
shrouds, planning documents) and services (death doulas, estate attorneys,
celebrants, grief counselors). Next.js 16 App Router rebuild of the original
single-file HTML prototype.

See `PLAN.md` for architecture, `TASKS.md` for status, and `AGENTS.md` for
guidance when working in the codebase.

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
| `npm run visual-diff` | Pixel-diff the live app against the prototype |

## The prototype

The original design lives in `index.html.reference` — a single self-contained
HTML file with all routes rendered as `.pg` panes (`#p0` homepage, `#p1`
services, `#p2` product detail, etc.). It's the source of truth for layout,
copy, colors, and spacing. When porting a page, treat the prototype as
canonical and keep the Next.js version pixel-faithful.

The dev server also serves the prototype at
`http://localhost:3000/__prototype__/index.html` so it can be loaded by the
visual-diff script and inspected side-by-side with the running app.

## Visual diff

`scripts/visual-diff.mjs` compares the running dev server against the
prototype and writes baseline/actual/diff PNGs to `./diff/`, plus a
mismatched-pixel percentage per section.

```bash
npm run dev                       # in one terminal
npm run visual-diff               # diff all sections
npm run visual-diff hero          # diff a single section
```

Sections are defined at the top of `scripts/visual-diff.mjs`. Each entry
maps a prototype pane + selector to a webapp route + selector. Add or edit
entries when you need a different breakdown.

Requirements:

- Dev server running (override with `BASE_URL`)
- A Chromium binary. The script auto-detects
  `~/.cache/cft/chrome-linux64/chrome`; otherwise set `CHROMIUM_PATH`.
- Viewport is fixed at 1440×2400 with `deviceScaleFactor: 1` so diffs are
  reproducible.

Typical workflow when chasing parity: run the diff, open
`diff/<section>.diff.png` (red pixels = mismatch), fix the component, re-run
for just that section. See `docs/prototype-fidelity-plan.md` for an example
of using this loop to port the homepage.

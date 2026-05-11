# coda-co

A curated marketplace for death and dying — goods (urns, jewelry, burial
shrouds, planning documents) and services (death doulas, estate attorneys,
celebrants, grief counselors). Next.js 16 App Router rebuild of the original
single-file HTML prototype.

**Live demo:** https://coda-co-nine.vercel.app

## Documentation

| Doc | When to read |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Working in the codebase. Strict reuse conventions, primitive catalog, hard rules. **Read every word before touching markup.** |
| [`docs/data-model-evolution.md`](docs/data-model-evolution.md) | Understanding the schema and phase plan. Tracks status of phases A–F. |
| [`docs/admin-runbook.md`](docs/admin-runbook.md) | Operating the site — admin login, mock-data credentials, common runbook tasks. |
| [`TASKS.md`](TASKS.md) | What's open. The phased rebuild itself is tracked in the data-model doc. |
| [`docs/prototype-fidelity-plan.md`](docs/prototype-fidelity-plan.md) | Historical — the homepage prototype-fidelity restoration plan. |

## Getting started

```bash
npm install                                  # postinstall runs `prisma generate`
sudo service postgresql start                # local Postgres 16
cp .env.example .env                         # then fill in AUTH_SECRET
npx prisma migrate deploy                    # apply migrations
npm run db:seed                              # system data (product_types, service_types)
npm run db:mock                              # test data (fake users, vendors, products)
npm run dev                                  # http://localhost:3000
```

Mock-data credentials and the admin login live in
[`docs/admin-runbook.md`](docs/admin-runbook.md).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server (Turbopack) on :3000 |
| `npm run build` | Build via `scripts/build.mjs` — runs migrate + seed only when `DATABASE_URL` is set |
| `npm run start` | Serve the production build |
| `npm run check-drift` | Lint-style scan for banned UI patterns. **Part of CI; treat as a gate.** |
| `npm run db:seed` | System data only (idempotent, safe in prod) |
| `npm run db:mock` | Test data — wipes and reloads. Guarded against production. |
| `npm run db:reset` | `prisma migrate reset --force`. Local dev only; never run against prod. |
| `npm run visual-diff` | Playwright-based visual regression comparison against the prototype |

## Stack

- Next.js 16.2.4 (App Router, Turbopack), React 19, TypeScript, Tailwind v4
- Postgres 16 + Prisma 7 (driver-adapter mode via `@prisma/adapter-pg`)
- Auth.js v5 (Credentials provider, JWT sessions)
- Production: Vercel + Neon Postgres

## The prototype

The original design lives in `index.html.reference` — a single self-contained
HTML file with all routes rendered as `.pg` panes (`#p0` homepage, `#p1`
services, `#p2` product detail, etc.). It's the source of truth for layout,
copy, colors, and spacing. When porting a page, treat the prototype as
canonical and keep the Next.js version faithful to it.

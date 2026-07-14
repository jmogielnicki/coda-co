# Agent guide for coda-co

Read this before editing. It's short on purpose.

## What this project is

CodaCo is a curated marketplace for death and dying (goods + services). The
codebase is a Next.js App Router rebuild of an original single-file HTML
prototype. The prototype lives at `index.html.reference` and is the source of
truth for visual design and copy. See `TASKS.md` for known open work.

## Stack

- Next.js 16.2.4 (App Router, Turbopack)
- React 19 with the React Compiler enabled (`reactCompiler: true` in
  `next.config.ts` — top-level, not under `experimental`)
- TypeScript, Tailwind CSS v4 (tokens declared via `@theme` in
  `app/globals.css`)
- `next/font` — Crimson Pro (serif) + Nunito Sans (sans)
- **Postgres** via **Prisma 7** in driver-adapter mode
  (`@prisma/adapter-pg` + `pg`). Schema has no inline `url`; datasource
  config lives in `prisma.config.ts`.
- **Auth.js v5 beta** (`next-auth`) with the Prisma adapter and a
  Credentials provider. JWT session strategy (DB sessions aren't
  supported with Credentials in v5 — known limitation); the `session`
  callback in `auth.ts` re-hydrates `role` from `users` on every
  request, so role changes still apply immediately.

If something about the Next.js / React APIs surprises you, check the docs
shipped in `node_modules/next/dist/docs/` rather than relying on memory.

See `docs/data-model-evolution.md` for the master phase plan
(A–F). Phases A–D are merged; E (orders/checkout) and F (review
submission) haven't started.

## Conventions

- **RSC by default.** Only add `'use client'` when a component needs
  `useState`, `useEffect`, browser APIs, or event handlers.
- **All runtime DB access goes through `lib/api/*.ts`.** The
  `lib/data/*.ts` arrays exist only as a source for the mock script
  (`prisma/mock.ts`) — components must not import them. *One
  exception:* `lib/data/plans.ts` is intentionally still runtime
  (plans stay code-defined per the data model).
- **Slugs are the public id; cuids are private.** Every entity has a
  stable `slug` (e.g. `urn-sage-001`, `maria-rosales`) plus a `cuid()`
  PK. URLs, cart entries, API inputs all use slugs. Look up via
  `findUnique({ where: { slug } })`, never by `id`.
  (Variants are the exception — no slug column; the cuid is what's
  exposed.)
- **Cart**: `useCart()` from `components/providers/CartProvider.tsx`
  (client-only, localStorage-backed). Items are
  `{ productId, variantId, qty }` — no copied title/price/thumb.
- **Filters**: URL `searchParams` are the source of truth for shop/service
  filtering. Client filter components update the URL; the page RSC re-renders.
- **Tokens**: brand colors live in `app/globals.css` under `@theme`. Use
  `bg-tr`, `text-sg-d`, `border-tr-l`, `font-serif`, etc. Don't hardcode hex.
- **Reuse primitives.** Before adding markup, scan the **Reuse conventions**
  section below. There's a primitive for almost every page-level pattern
  (containers, section headers, cards, avatars, filters, stars). Hard rules
  are listed; violations cause drift.
- **Run `npm run check-drift`** before finishing a task. It scans for the
  patterns banned below and explains what to use instead. Treat it as
  required: a clean run is part of "done".

## Database, auth, deployment — load-bearing infrastructure

These are easy to get wrong by guessing. Read before touching.

### Schema & migrations
- Schema lives in `prisma/schema.prisma`. 13 models, 12 enums. Every
  enum has an `unknown` member as the default so missing values are
  visible state, not silent defaults.
- Migrations live in `prisma/migrations/`. Dev: `npx prisma migrate dev
  --name <slug>`. Production: `npx prisma migrate deploy` (run
  automatically in `scripts/build.mjs`).
- **Never run `npx prisma migrate reset`** without explicit user
  consent — Prisma 7 enforces this against AI agents via the
  `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var.

### Local DB for migration generation

`prisma migrate dev` and `prisma migrate diff` both need a live
Postgres + a shadow DB to mechanically generate migration SQL from
schema changes. Without one, you have to hand-write the SQL and hope
it matches what Prisma would emit — fine for trivial diffs, risky for
anything involving FKs, indexes, or enum changes.

**Recommended setup** (one-time, per dev machine):

```bash
# Starts an embedded Postgres + shadow DB in the background.
# Prints two URLs — paste them into .env as DATABASE_URL and
# SHADOW_DATABASE_URL.
npx prisma dev start --detach

# Apply existing migrations to the fresh DB:
npx prisma migrate deploy

# (optional) Load mock data so the app is usable:
npm run db:mock
```

**Workflow** when editing the schema:

1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <slug>` — generates the migration
   file under `prisma/migrations/`, applies it to your local DB, and
   regenerates the Prisma client.
3. Commit both `prisma/schema.prisma` and the new migration directory.

CI and Vercel **don't** need either URL — `scripts/build.mjs` only
runs `migrate deploy` (which uses `DATABASE_URL`) and never touches
the shadow DB. `SHADOW_DATABASE_URL` is local-only.

Use `npx prisma dev stop` / `ls` / `rm` to manage the embedded server.
Bring-your-own Postgres works too — `prisma dev` is just the
least-friction option.

### System seed vs mock data
Strictly separated so a prod deploy can never push fake vendors:
- `prisma/seed.ts` — *system data only* (product_types,
  service_types). Idempotent via upsert. Wired to `prisma db seed`,
  safe in any environment, runs as part of every Vercel deploy.
- `prisma/mock.ts` — *test data only* (fake users / vendors /
  products / reviews). Destructive: wipes everything before
  reloading. Hard-fails when `NODE_ENV === "production"` unless
  `ALLOW_MOCK_SEED=1` is also set. Never call it from a long-lived
  build script.

Mock accounts use `{slug}@codaco.local` emails (admin is
`admin@codaco.local`); all share password `codaco-dev`. The
`.local` domain reservation (RFC 6762) means real users can't
collide with it — that's the natural marker for identifying mock
rows when you eventually need to delete them.

### Auth & role gating
- Session shape is augmented in `types/next-auth.d.ts`:
  `session.user.{id, email, name, role}`.
- Server-side role gate pattern (see `app/admin/page.tsx`,
  `app/dashboard/lib.ts`):
  ```ts
  const session = await auth();
  if (!session?.user) redirect("/login?next=/foo");
  if (session.user.role !== "admin") redirect("/");
  ```
- Vendor-side gate: `requireVendor()` in `app/dashboard/lib.ts`
  redirects to `/list-with-us` when a signed-in user lacks a
  `vendor_profile`.

### Build wrapper (`scripts/build.mjs`)
Single Node script invoked by both `npm run build` and `npm run
vercel-build`. Decides what to run from env vars, not the script name:

| `DATABASE_URL` | What runs |
|---|---|
| unset | `next build` only (CI) |
| set | `migrate deploy` + `db seed` + `next build` |

Preview deploys hit the second row too: each preview gets its own
Neon branch (via the Vercel-Neon integration) with a per-deployment
`DATABASE_URL`, so migrations apply against the branch and never
touch production. `DATABASE_URL_UNPOOLED` (also injected by the
integration) is wired into `prisma.config.ts` as `directUrl` because
Neon's pooler can't proxy migration DDL.

This pattern is deliberate — earlier attempts using a `build` /
`vercel-build` script split broke when Vercel's Build Command
override pointed at the wrong one. Don't naively re-split.

### Lazy Prisma client (`lib/db.ts`)
Wrapped in a `Proxy` so `DATABASE_URL` is read on first use, not at
module load. Without this, `next build`'s "Collecting page data"
phase crashes on routes that never query (e.g. `/_not-found`)
because the Auth.js + Nav chain pulls `lib/db.ts` into every page.
Methods are bound to the underlying client so
`prisma.$transaction` callbacks (used by the application approval
flow) keep working. Don't naively rewrite as a direct `new
PrismaClient()` export.

### Workflow
- One PR per logical change, cut from latest `main`, squash-merged.
- Phase branches: `claude/phase-{a-f}-{short-kebab-slug}`. Other
  follow-ups: `claude/{short-kebab-slug}`.
- User reviews and merges by default. When the user explicitly asks the agent to merge a PR, the agent merges it (squash, via the GitHub MCP tools).

## Reuse conventions — read before adding markup

The project has a curated set of UI primitives and design tokens. Use
them. If the pattern you need isn't here, **extract** rather than
inline (see Decision rules below).

### Primitives (`components/ui/`)

| Component        | Props                                                         | When to use                                                   | File                                      |
|------------------|---------------------------------------------------------------|---------------------------------------------------------------|-------------------------------------------|
| `<Container>`    | `width: 'narrow'\|'mid'\|'wide'`, `as?`, `className?`         | Horizontal page wrapper. Replaces every `max-w-[680\|880\|900px] mx-auto`. Widths map to 680/880/900. | `components/ui/Container.tsx`             |
| `<SectionHeader>`| `eyebrow?`, `title`, `subtitle?`, `eyebrowTone='tr'\|'sg'`, `subtitleTone='cl'\|'ink'` (use `ink` on tinted backgrounds), `className?` | Centered eyebrow + serif H2 + subtitle block. Always use this — never re-create the markup. Page-`<h1>` headers stay inline (semantic). | `components/ui/SectionHeader.tsx`         |
| `<Card>`         | `href?` (renders as `<Link>`), `hoverTone='sage'\|'terracotta'\|'none'`, `padding='md'\|'none'` (use `none` for edge-to-edge media), `className?` | Bordered white surface. Composes `.card-surface`. | `components/ui/Card.tsx`                  |
| `<Avatar>`       | `initials`, `size='sm'\|'md'\|'lg'`, `tone='sage'\|'terracotta'`, `className?` | Circular initials badge. | `components/ui/Avatar.tsx`                |
| `<VendorPhoto>`  | `src?`, `alt?`, `initials`, `size='sm'\|'md'\|'lg'\|'xl'`, `tone='sage'\|'terracotta'`, `className?` | Vendor headshot — B&W photo (or initials fallback) inside a cream circle, framed by a sage or terracotta square. Used by `<VendorCard>` (sm/md/lg) and the vendor profile hero (xl). | `components/ui/VendorPhoto.tsx`           |
| `<Stars>`        | `rating`, `reviewCount?`, `className?`                        | Rating display. Pass `reviewCount` to append " · N reviews" inline. Wrap in a `text-tr` parent if you want the suffix terracotta-colored. | `components/ui/Stars.tsx`                 |
| `<VendorCard>`   | `vendor`, `layout='compact'\|'search'`                        | Vendor list item. `compact` for grid tiles, `search` for service-search rows. | `components/ui/VendorCard.tsx`            |
| `<ProductCard>`  | `product`                                                     | Product grid tile.                                            | `components/ui/ProductCard.tsx`           |
| `<ReviewCard>`   | `review`                                                      | One review row with stars + body. Accepts a `Review` or `VendorReview`. | `components/ui/ReviewCard.tsx`            |
| `<Breadcrumb>`   | `crumbs`                                                      | Page top breadcrumb trail.                                    | `components/layout/Breadcrumb.tsx`        |
| `<WaveDivider>`  | `topColor`, `bottomColor`                                     | Section transition with arc-top.                              | `components/ui/WaveDivider.tsx`           |
| `<StepsBar>`     | `steps`, `current`                                            | Multi-step form indicator.                                    | `components/ui/StepsBar.tsx`              |

### Filter primitives (`components/ui/filters/`)

| Component          | Purpose                                          |
|--------------------|--------------------------------------------------|
| `<FilterPill>`     | Single toggleable pill (`active` + `onClick`).   |
| `<FilterPillGroup>`| Flex-wrap container for a group of pills.        |
| `<FilterCheck>`    | Checkbox with label.                             |
| `<FilterSection>`  | Section heading + body wrapper.                  |
| `<FilterDivider>`  | Hairline divider between sections.               |
| `<LifeStageChips>` | Pre-wired chip strip filtering by `lifeStage` URL param. Use at the top of any list page so users can narrow by `planning-ahead` / `active-dying` / `post-death` / `throughout`. Multi-select — clicking a chip toggles its value in/out of a comma-separated `lifeStage` param. Wrap in `<Suspense>` since it reads `searchParams`. |

URL-param state for filters goes through **`useFilterParams()`** in
`lib/hooks/useFilterParams.ts` — `get`, `setParam`, `toggleBool`,
`clearAll`. **Never** hand-roll `new URLSearchParams(...)` flows in a
filter component.

### Format helpers

- `lib/format/vendor.ts` — `serviceTypeLabel(type)` (maps `ServiceType` enum value to display label), `vendorLocationSuffix(vendor, locationTypes)` (builds "City · In-home & virtual"-style suffix from the vendor's matched services' `locationType`s).
- `lib/format/product.ts` — `productThumbBg(slug)` (deterministic palette pick — replaces the dropped `Product.thumbBg` column), `formatPriceRange(min, max)` (returns `"$89"` or `"$89 – $129"` based on variant spread).
- `lib/format/date.ts` — `formatMonthYear(iso)` (renders `"2025-03-12"` as `"March 2025"`; pass-through for non-ISO inputs).
- `lib/format/lifeStage.ts` — `LIFE_STAGES` (label/value pairs), `lifeStageLabel(stage)`, `parseLifeStageParam(raw)` (parses a comma-separated URL param into a typed array), `matchesLifeStage(entryStages, filter)` accepts a single stage or a list (OR semantics), with `throughout`-tagged entries matching any specific-stage filter.

### Geographic search filter (`lib/geo/`)

The `/services` location filter uses **vendor-service-area** semantics: a
vendor surfaces for a searcher whose zip falls within the vendor's
`zip` + `serviceRadiusMi` circle. Driven by `getVendors({ near })` — the
`near` URL param carries the searcher's zip (set by the `LocationSearch`
client component). Vendors with no zip *or* no `serviceRadiusMi`
(virtual / nationwide / incomplete) are **not** geo-bound and always
surface; `distanceMi` is computed per-query and attached for display
(never persisted — the mock data no longer seeds it). Distances come
from the bundled `zipcodes` US zip-centroid dataset.

- `lib/geo/zip.ts` — **pure, client-safe.** `normalizeZip(raw)` (pulls a
  5-digit zip out of bare / zip+4 / free-text input), `parseRadiusLabel(label)`
  ("15 mi" → `15`, "Virtual only" → `null`). Import this from client
  components — **never** `lib/geo` (it bundles the ~2MB dataset).
- `lib/geo/index.ts` — **server-only.** Re-exports the pure helpers plus
  `isKnownZip(zip)` and `milesBetweenZips(a, b)` (zip-centroid distance in
  miles, `null` if either zip is unknown).

### `@layer components` classes (`app/globals.css`)

Use these directly in JSX when a primitive isn't a fit (e.g., one-off
non-component markup). Don't reinvent them.

| Class                          | When to use                                                   |
|--------------------------------|---------------------------------------------------------------|
| `.btn-{primary,secondary,ghost}` + `.btn-{sm,md,lg}` | All buttons. Compose variant + size. |
| `.filter-pill` + `.filter-pill-{on,off}` | Pill toggle (use `<FilterPill>` from JSX). |
| `.card-surface` + `.card-surface-hover-{sg,tr}` | White card surface (use `<Card>` from JSX). |
| `.section-header` + `.section-{eyebrow,title,subtitle}` | Centered section header (use `<SectionHeader>`). |
| `.container-{narrow,mid,wide}` | Page-content max-width (use `<Container>`). |
| `.avatar` + `.avatar-{sm,md,lg}` + `.avatar-tr` | Initials circle (use `<Avatar>`). |
| `.divider-soft`                | 1px hairline divider on the line-soft token.   |
| `.grid-auto-{130,178,200}`     | Repeated `grid-cols-[repeat(auto-fit/fill,minmax(…))]` patterns. |
| `.text-overline`               | Caps + tracking labels.                        |
| `.arc-top`                     | Elliptical top radius (footer / wave dividers). |

### Design tokens (`@theme`)

| Token family       | Use as Tailwind utility                       |
|--------------------|-----------------------------------------------|
| Brand              | `text-tr`, `bg-sg-p`, `border-tr-l`, etc.     |
| Charcoal text      | `text-ch`, `text-cm`, `text-cl`, `text-ink`   |
| Hairline borders   | `border-line`, `border-line-strong`, `border-line-bold`, `border-line-soft` — **use these instead of `rgba(44,40,37,…)`** |
| Radius             | `--radius-{sm,md,lg,pill}` (referenced from `@layer components`) |
| Container widths   | `--w-{narrow,mid,wide}` (use `<Container>`)   |

### Hard rules (no exceptions without extending the system)

1. **No raw `rgba(44, 40, 37, …)` colors** in `className` strings. Use `border-line` / `border-line-strong` / `border-line-bold` / `border-line-soft`.
2. **No raw hex values in `className` strings or CSS.** Use brand/charcoal tokens (e.g. `text-tr`, `border-sg-l`). *Exception:* SVG attributes like `stroke="#C1634F"` are fine — SVG can't reference CSS variables cleanly, and the prototype uses literal hex there.
3. **No `max-w-[680px]` / `max-w-[880px]` / `max-w-[900px]`.** Use `<Container width="…">`.
4. **No new section-header markup.** Use `<SectionHeader>`. Extend its props if a new variant is genuinely needed.
5. **No inline avatar circles.** Use `<Avatar>`.
6. **No re-creating filter pills, checks, or sections.** Use the primitives in `components/ui/filters/`.
7. **No re-rolling `setParam` / `toggleBool` URL helpers.** Use `useFilterParams()`.
8. **No inline `★/☆` strings or hand-rolled rating logic.** Use `<Stars>`.

### Decision rules for extending the system

1. If a markup pattern appears in **3+ places**, extract it — into a new primitive, a new `@layer components` class, or both.
2. If a component takes **>5** boolean/variant props, split it. Don't keep stacking flags.
3. When extracting, also update this section of `AGENTS.md` so the next agent finds the new primitive.

### Anti-patterns

```tsx
// BAD
<div className="max-w-[680px] mx-auto">
  <div className="text-center mb-7">
    <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Our work</p>
    <h2 className="font-serif text-[32px] font-light text-ch mb-1">Title</h2>
    <p className="text-[13px] text-cl">Subtitle</p>
  </div>
</div>

// GOOD
<Container width="narrow">
  <SectionHeader eyebrow="Our work" title="Title" subtitle="Subtitle" />
</Container>
```

```tsx
// BAD
<div className="w-12 h-12 rounded-full bg-sg-p border-[1.5px] border-sg-l flex items-center justify-center font-serif text-[18px] text-sg-d">
  {initials}
</div>

// GOOD
<Avatar initials={initials} size="lg" />
```

```tsx
// BAD
<button onClick={() => {
  const p = new URLSearchParams(params.toString());
  if (p.get("verified") === "1") p.delete("verified"); else p.set("verified", "1");
  router.push(`${pathname}?${p}`);
}}>…</button>

// GOOD
const { toggleBool } = useFilterParams();
<button onClick={() => toggleBool("verified")}>…</button> 
```

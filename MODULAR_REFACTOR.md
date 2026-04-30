# Modular refactor — components and styles

> **For agents picking this up mid-stream:** read this whole file before
> editing. Stages are sequential. Update the **Status** section at the top
> as you complete work so the next agent knows where to start. Each stage
> is designed to be independently shippable with no visual change.

## Status (live — update as you go)

| Stage | Description                                                  | Status        |
|-------|--------------------------------------------------------------|---------------|
| 1     | Expand tokens + `@layer components` in `app/globals.css`     | ✅ Done        |
| 2     | Extract shared primitives in `components/ui/`                | 🟡 In progress |
| 3     | Generalize the filter system (primitives + hook)             | ⬜ Not started |
| 4     | Consolidate card logic (vendor format helpers, `VendorCard`) | ⬜ Not started |
| 5     | Document reuse conventions in `AGENTS.md`                    | ⬜ Not started |
| 6     | Page-level mechanical sweep across `app/**/page.tsx`         | ⬜ Not started |
| ✓     | Verify (build, visual diff, drift greps)                     | ⬜ Not started |

When you complete a stage, flip its status to ✅ in your commit. If you can
only finish part of a stage, set it to 🟡 and add a sub-progress list under
the table noting which sub-items are done so the next agent can continue.

### Stage 2 sub-progress

- ✅ `components/ui/Container.tsx`
- ⬜ `components/ui/SectionHeader.tsx` — **next**
- ⬜ `components/ui/Avatar.tsx`
- ⬜ `components/ui/Card.tsx`
- ⬜ `components/ui/Stars.tsx` (consolidates today's `StarRating` + the inline `★/☆` strings in `ServiceCard.tsx`)

---

## Context

The Next.js rebuild has grown to ~39 TSX files. The foundation is solid
(design tokens in `app/globals.css` `@theme`, `@layer components` for buttons
and pills, an `lib/api/*` data layer, and good feature-folder organization),
but DRY violations have accumulated as pages were ported from the
`index.html.reference` prototype:

- Section-header markup (eyebrow + serif h2 + subtitle) appears in ~12 places.
- Two `ServiceCard` variants duplicate `typeLabels` / `locationSuffix` / `ratingLine`.
- The avatar circle is reimplemented inline 8+ times.
- Two filter components both reinvent `Pills` / `FilterPill` / `Divider` and both duplicate `setParam` / `toggleBool` URL handlers.
- Container widths (`max-w-[680|880|900px]`) and arbitrary `[10px]/[14px]` sizes are scattered.
- Inline `rgba(44,40,37,.08)`-style colors recur 20+ times.

**Goal:** a small, principled set of primitives and tokens so a designer
or engineer can change a heading, card, pill, avatar, filter, or container
width *in one place* and have it propagate everywhere — without rewriting
the visuals already shipped.

## Approach

Refactor incrementally in 6 stages. Each stage is independently shippable
(no page-level visual change) and the refactor is mechanical — replace the
old inline markup with the new primitive, page by page.

### Stage 1 — Expand design tokens in `app/globals.css` ✅

Done. Added to `@theme`:
- `--color-line` / `--color-line-soft` / `--color-line-strong` / `--color-line-bold` for the recurring `rgba(44,40,37,.0X)` borders.
- `--radius-sm/-md/-lg/-pill` radius scale.
- `--w-narrow/-mid/-wide` container widths.

Added to `@layer components`:
- `.container-narrow/-mid/-wide`
- `.section-header`, `.section-eyebrow`, `.section-eyebrow-sg`, `.section-title`, `.section-subtitle`
- `.card-surface`, `.card-surface-hover-sg`, `.card-surface-hover-tr`
- `.avatar`, `.avatar-tr`, `.avatar-sm/-md/-lg`
- `.divider-soft`
- `.grid-auto-130/-178/-200`

### Stage 2 — Extract shared primitives in `components/ui/`

Each primitive is a thin wrapper over the Stage 1 CSS classes plus prop-driven flexibility.

- **`Container.tsx`** ✅ — `width: 'narrow'|'mid'|'wide'`, `as?`.
- **`SectionHeader.tsx`** — `eyebrow?`, `title`, `subtitle?`, `eyebrowTone?` (`'tr'|'sg'`, default `'tr'`). Wraps `.section-header` + `.section-eyebrow` + `.section-title` + `.section-subtitle`.
- **`Avatar.tsx`** — `initials`, `size?` (`'sm'|'md'|'lg'`, default `'md'`), `tone?` (`'sage'|'terracotta'`, default `'sage'`). Wraps `.avatar` + variants.
- **`Card.tsx`** — `as?` (default `'div'`), `href?` (renders as `<Link>` when present), `hoverTone?` (`'sage'|'terracotta'|'none'`, default `'none'`), `padding?` (default `'md'`, allow `'none'` for ProductCard which has its own thumb section), `className?`, `children`. Wraps `.card-surface` + `.card-surface-hover-*`.
- **`Stars.tsx`** — consolidates `StarRating.tsx` and the inline `★/☆` string logic in `ServiceCard.tsx:51-54` and `ServiceCard.tsx:21-26`. Props: `rating`, `reviewCount?` (renders ` · N reviews` suffix when provided), `className?`. Replace usages of `<StarRating>` with `<Stars>` and delete `StarRating.tsx` once references are gone.

### Stage 3 — Generalize the filter system

Today `components/shop/FilterStrip.tsx` and `components/services/ServiceFilters.tsx` both reinvent the same primitives.

Create `components/ui/filters/`:
- `FilterPill.tsx` — `label`, `active`, `onClick`. Wraps `.filter-pill` + `.filter-pill-on/-off`.
- `FilterPillGroup.tsx` — flex-wrap container.
- `FilterCheck.tsx` — `label`, `checked`, `onChange`.
- `FilterSection.tsx` — `heading`, `children`.
- `FilterDivider.tsx` — wraps `.divider-soft`.

Lift the local sub-components from `ServiceFilters.tsx:159-223` into these files. The local versions in `ServiceFilters.tsx` should then be deleted and replaced with imports.

Create `lib/hooks/useFilterParams.ts` — exposes `setParam(key, value)`, `toggleBool(key)`, `clearAll()`, `get(key)`. Replaces the duplicated URL-param helpers in both filter components (`FilterStrip.tsx:22-30`-ish and `ServiceFilters.tsx:41-53`).

Refactor `FilterStrip` and `ServiceFilters` to be thin compositions of the primitives + the hook. Their *only* unique content becomes the filter definitions (`SERVICE_TYPES`, `CATEGORIES`, `DISTANCES`, etc.).

### Stage 4 — Consolidate card logic

- Move `typeLabels`, `locationSuffix`, `ratingLine` out of `components/ui/ServiceCard.tsx:3-26` into `lib/format/vendor.ts`. Both `ServiceCard` and `ServiceSearchCard` import from there.
- Refactor `ServiceCard` and `ServiceSearchCard` to share a single internal layout primitive: a `<VendorCard>` with `layout: 'compact' | 'search'` prop. Eliminates the ~50 lines of overlapping JSX.
- Refactor `ProductCard` (`components/ui/ProductCard.tsx:5-33`) to use the new `<Card>`. The inline thumbnail SVG block stays in `ProductCard` (`<ProductThumbnail>` is product-specific and not reused).
- Refactor `ReviewCard` to use the new `<Card>` and `<Stars>` primitives.

### Stage 5 — Document the conventions in `AGENTS.md`

Limiting drift requires that the next agent (or human) editing this repo
*sees* the primitives before writing inline markup. `AGENTS.md` already
exists as the agent-facing guide and is auto-loaded into Claude sessions
via `CLAUDE.md`'s `@AGENTS.md` import — so that's where the conventions
belong.

Add a new section **"Reuse conventions — read before adding markup"** with:

- **Primitives index** — table of `Component` → `When to use` → `File` covering `<SectionHeader>`, `<Container>`, `<Card>`, `<Avatar>`, `<Stars>`, the filter primitives, and the existing `<Badge>`, `<WaveDivider>`, `<StepsBar>`, `<Breadcrumb>`.
- **CSS-class index** — table of `@layer components` classes from `app/globals.css`: `.btn-*`, `.filter-pill*`, `.card-surface*`, `.section-header*`, `.container-*`, `.avatar*`, `.divider-soft`, `.grid-auto-*`, `.text-overline`, `.arc-top`. For each: when to use, when *not* to.
- **Token index** — colors, radius scale, container widths from `@theme`, with the rules:
  - never hardcode hex
  - never write `rgba(44,40,37,…)` — use the `--color-line*` tokens
  - never write `max-w-[680px]` — use `<Container width="narrow">` or `.container-narrow`
- **Decision rules** for adding new primitives:
  1. If a markup pattern appears in 3+ places, extract it.
  2. If a component takes >5 boolean/variant props, split it.
  3. Never duplicate `setParam` / `toggleBool` URL logic — use `useFilterParams()`.
  4. Card hover, border, and radius come from `<Card>` props or `.card-surface`, never inline.
  5. Section header markup *always* uses `<SectionHeader>`. No exceptions — extend its props if the design needs a new variant.
- **Anti-patterns** with concrete before/after snippets, e.g.:

  ```tsx
  // BAD
  <div className="max-w-[680px] mx-auto">
    <div className="text-center mb-7">
      <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">…</p>
      <h2 className="font-serif text-[32px] font-light text-ch mb-1">…</h2>
    </div>
  </div>

  // GOOD
  <Container width="narrow">
    <SectionHeader eyebrow="…" title="…" subtitle="…" />
  </Container>
  ```

### Stage 6 — Page-level cleanup

Mechanical sweep — for each page in `app/`, applying the conventions just documented in Stage 5:

- Replace the centered eyebrow/h2/subtext block with `<SectionHeader />`.
- Replace `<div className="max-w-[…] mx-auto">` with `<Container width="…">`.
- Replace inline avatar circles (vendor testimonials in `app/list-with-us/page.tsx`, seller block in `app/shop/[productId]/page.tsx`) with `<Avatar />`.
- Replace `grid-cols-[repeat(auto-fit/fill,minmax(…))]` literals with the `.grid-auto-*` classes.

Pages touched: `app/page.tsx`, `app/shop/page.tsx`, `app/shop/[productId]/page.tsx`, `app/services/page.tsx`, `app/where-to-start/page.tsx`, `app/list-with-us/page.tsx`, `app/list-with-us/{goods,services,plan,confirm}/page.tsx`.

### Out of scope (intentionally)

- The vendor multi-step forms (`GoodsForm` / `ServicesForm`). They share state shape but the diff between them is high; abstracting prematurely would violate the project's "don't design for hypothetical requirements" rule. Revisit only if a third form appears.
- `AddToCart`'s glaze/variant selectors. Used only on the PDP today; abstract when a second usage shows up.
- The data layer in `lib/api/*` and `lib/data/*` — already well-modularized.

## Critical files

- `app/globals.css` — token + `@layer components` additions (Stage 1).
- `components/ui/` — new `SectionHeader.tsx`, `Avatar.tsx`, `Card.tsx`, `Container.tsx`, `Stars.tsx` (Stage 2).
- `components/ui/filters/` — new shared filter primitives (Stage 3).
- `lib/hooks/useFilterParams.ts` — new (Stage 3).
- `lib/format/vendor.ts` — new (Stage 4).
- `components/ui/ServiceCard.tsx`, `components/ui/ProductCard.tsx`, `components/ui/ReviewCard.tsx` — refactor onto primitives (Stage 4).
- `components/shop/FilterStrip.tsx`, `components/services/ServiceFilters.tsx` — refactor onto shared primitives + hook (Stage 3).
- `AGENTS.md` — add the "Reuse conventions" section (Stage 5). Auto-imported via `CLAUDE.md`'s `@AGENTS.md` so every future agent reads it.
- All `app/**/page.tsx` — mechanical sweep (Stage 6).

## Reused existing utilities

- Existing `.btn-*`, `.filter-pill*`, `.text-overline`, `.arc-top` classes — keep as-is.
- Existing `Badge`, `WaveDivider`, `StepsBar`, `Breadcrumb` — keep as-is.
- Existing `StarRating` — fold into `<Stars>` in Stage 2 and delete the file.
- Existing `lib/api/*` modules — primitives consume from these unchanged.

## Verification

- After each stage, run `npm run build` to confirm no TS/Tailwind errors.
- Run `npm run dev` and visually diff each page against `index.html.reference` — the prototype is the visual source of truth (per `AGENTS.md`). No page should change appearance.
- Spot-check responsive behavior on landing, shop, services, list-with-us — densest section-header / grid usage.
- Click through filter pills on `/shop` and `/services`; URL params must update identically to today.
- After Stage 6, search the repo for `max-w-[680px]`, `max-w-[880px]`, `max-w-[900px]`, `rgba(44,40,37`, and `repeat(auto-f` — all should be ~0 hits outside `globals.css`.

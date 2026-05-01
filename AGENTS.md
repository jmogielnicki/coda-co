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
- **Reuse primitives.** Before adding markup, scan the **Reuse conventions**
  section below. There's a primitive for almost every page-level pattern
  (containers, section headers, cards, avatars, filters, stars). Hard rules
  are listed; violations cause drift.
- **Run `npm run check-drift`** before finishing a task. It scans for the
  patterns banned below and explains what to use instead. Treat it as
  required: a clean run is part of "done".

## Prototype fidelity

`index.html.reference` is the visual + copy source of truth. When a page
drifts from the prototype, port the prototype's structure/classes/copy
faithfully — don't rewrite freehand.

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
| `<Stars>`        | `rating`, `reviewCount?`, `className?`                        | Rating display. Pass `reviewCount` to append " · N reviews" inline. Wrap in a `text-tr` parent if you want the suffix terracotta-colored. | `components/ui/Stars.tsx`                 |
| `<VendorCard>`   | `vendor`, `layout='compact'\|'search'`                        | Vendor list item. `compact` for grid tiles, `search` for service-search rows. | `components/ui/VendorCard.tsx`            |
| `<ProductCard>`  | `product`                                                     | Product grid tile.                                            | `components/ui/ProductCard.tsx`           |
| `<ReviewCard>`   | `review`                                                      | One review row with stars + body.                             | `components/ui/ReviewCard.tsx`            |
| `<Badge>`        | `badge`                                                       | "Bestseller" / "New" / etc. pills with variant colors.        | `components/ui/Badge.tsx`                 |
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

URL-param state for filters goes through **`useFilterParams()`** in
`lib/hooks/useFilterParams.ts` — `get`, `setParam`, `toggleBool`,
`clearAll`. **Never** hand-roll `new URLSearchParams(...)` flows in a
filter component.

### Format helpers

- `lib/format/vendor.ts` — `vendorTypeLabel(type)`, `vendorLocationSuffix(vendor)`.

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

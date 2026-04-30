# CodaCo: Task Tracker

This file tracks implementation progress for the Next.js rebuild. See `PLAN.md` for the full architecture.

---

## Phases

### Phase 1 — Project Setup ✅
- [x] Bootstrap Next.js 15 with TypeScript, Tailwind v4, App Router, Turbopack
- [x] Enable React Compiler (`reactCompiler: true` in next.config.ts)
- [x] Configure Tailwind `@theme` tokens in `app/globals.css`
- [x] Set up `next/font` with Cormorant Garamond + DM Sans
- [x] Create full directory structure (`lib/`, `components/`, all `app/` routes)
- [x] Write `PLAN.md` and `TASKS.md`

---

### Phase 2 — Types + Data Layer ✅
- [x] Write all TypeScript interfaces in `lib/types.ts`
- [x] Extract mock products into `lib/data/products.ts`
- [x] Extract mock vendors into `lib/data/vendors.ts`
- [x] Extract mock reviews into `lib/data/reviews.ts`
- [x] Extract mock plans into `lib/data/plans.ts`
- [x] Write `lib/api/products.ts` — `getProducts()`, `getProduct()`, `getRelatedProducts()`
- [x] Write `lib/api/vendors.ts` — `getVendors()`, `getVendor()`, `getFeaturedVendors()`
- [x] Write `lib/api/reviews.ts` — `getReviews()`, `getReviewSummary()`
- [x] Write `lib/api/plans.ts` — `getPlans(type)`

---

### Phase 3 — Shared Components ✅
- [x] `components/ui/Logo.tsx` (RSC — extracted SVG)
- [x] `components/layout/Nav.tsx` (RSC — sticky nav, active link state)
- [x] `components/layout/Footer.tsx` (RSC — multi-column footer)
- [x] `components/layout/Breadcrumb.tsx` (RSC)
- [x] `components/ui/ProductCard.tsx` (RSC)
- [x] `components/ui/ServiceCard.tsx` + `ServiceSearchCard` (RSC)
- [x] `components/ui/ReviewCard.tsx` (RSC)
- [x] `components/ui/StarRating.tsx` (RSC)
- [x] `components/ui/Badge.tsx` (RSC)
- [x] `components/ui/WaveDivider.tsx` (RSC)
- [x] `components/ui/StepsBar.tsx` (RSC)
- [x] `components/providers/CartProvider.tsx` (client — Context + localStorage)

---

### Phase 4 — Pages ✅

#### 4a — Static / simple pages
- [x] `app/where-to-start/page.tsx` — guide for recently bereaved
- [x] `app/list-with-us/page.tsx` — vendor landing with why/testimonials/FAQ
- [x] `app/list-with-us/confirm/page.tsx` — post-submission confirmation

#### 4b — Shop + Services
- [x] `app/shop/page.tsx` — RSC with server-side sort
- [x] `components/shop/ProductGrid.tsx` (RSC)
- [x] `components/shop/FilterStrip.tsx` (client — reads/writes URL searchParams)
- [x] `app/services/page.tsx` — RSC with server-side filter
- [x] `components/services/ServiceGrid.tsx` (RSC)
- [x] `components/services/ServiceFilters.tsx` (client — sidebar with URL searchParams)

#### 4c — Product Detail Page (PDP)
- [x] `app/shop/[productId]/page.tsx` — RSC with parallel data fetching
- [x] `components/pdp/AddToCart.tsx` (client — variant/qty selection + cart)
- [x] `components/pdp/ProductTabs.tsx` (client — tabs: description/details/reviews/seller)

#### 4d — Landing Page
- [x] `app/page.tsx` — RSC with parallel featured product/vendor fetch
- [x] `components/landing/GuidedSearch.tsx` (client — collapsible panel + sub-panels)

#### 4e — Vendor Onboarding Forms
- [x] `app/list-with-us/goods/page.tsx` + `components/vendor/GoodsForm.tsx` (4-step client form)
- [x] `app/list-with-us/services/page.tsx` + `components/vendor/ServicesForm.tsx` (4-step client form)
- [x] `app/list-with-us/plan/page.tsx` — RSC plan selection by type (goods/services)

---

### Phase 5 — State Wiring
- [x] Cart state: `CartProvider` wired to `AddToCart` in PDP — works end-to-end
- [x] Filter state: URL searchParams flow from `FilterStrip`/`ServiceFilters` → page RSC
- [x] Multi-step form state: component state in `GoodsForm`/`ServicesForm`
- [ ] Add cart count display to Nav (requires Nav to become client or use server-side cookie)
- [ ] Server Actions for `GoodsForm`/`ServicesForm` submission (currently `router.push` stub)
- [ ] `generateStaticParams` for `/shop/[productId]` to enable full static generation
- [ ] Suspense boundaries for filter components to enable streaming

---

## Notes for Future Agents

- **Design reference**: `index.html.reference` is the source of truth for
  layout, copy, and colors.
- **Tailwind tokens**: brand colors live in `app/globals.css` under
  `@theme`. Use `bg-tr`, `text-sg-d`, `border-tr-l`, `font-serif`, etc.
  Don't hardcode hex values that already have a token.
- **RSC first**: components are RSC by default. Only add `'use client'`
  when you need `useState`, `useEffect`, browser APIs, or event handlers.
- **Data API**: fetch via `lib/api/*.ts` (async, call with `await` from
  Server Components). Don't import `lib/data/*.ts` from components.
- **Cart**: `useCart()` from `components/providers/CartProvider.tsx`,
  client-only.
- **Filters**: URL searchParams are the source of truth. `FilterStrip` /
  `ServiceFilters` update the URL; the page RSC re-renders.
- **Forms**: `GoodsForm` / `ServicesForm` own step state and currently
  finish with `router.push('/list-with-us/confirm')`. Replace with a
  Server Action for real persistence.
- **Next.js version**: 16.2.4. `reactCompiler` is a top-level config key,
  not under `experimental`.

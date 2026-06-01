# Open work

Tracks known gaps in the Next.js app. For the phased rebuild plan + status,
see `docs/data-model-evolution.md`. For day-to-day admin operations, see
`docs/admin-runbook.md`.

## Phase E (next major chunk)

Orders + checkout + vendor notifications. Not on the demo path, so not
blocking, but the natural next phase. Full scope lives in
`docs/data-model-evolution.md` under "Phase E". High-level pieces:

- Cart drawer / cart icon in nav + working "Checkout" CTA (today the cart
  writes to localStorage but has no UI to view it).
- `orders` + `order_items` tables; server action that revalidates price,
  decrements stock, creates rows in a transaction.
- Stub "Mark as paid" button in dev; real Stripe Checkout is a Phase E
  follow-up.
- `/dashboard/orders` for vendors, scoped by `order_items.vendor_id`.
- Transactional email on new order (Resend or Postmark).
- "Mark shipped" action with tracking number; buyer email.

## Phase F

Verified-purchase-gated review submission. Adds `verified_purchase` +
`order_item_id` columns to `product_reviews`. Depends on Phase E.

## Image storage (parallel workstream)

User-uploaded images for vendor headshots and product photos. Three-phase
plan using Vercel Blob; full scope in `docs/images-plan.md`. Phase 1
(vendor headshot) is the suggested starting point and not blocked by
Phase E.

## Geographic vendor search (not started)

Today there is **no real proximity search**. Several UI affordances imply
it but are inert, and the schema lacks the data to support it. A Fort
Collins visitor sees every vendor (Boulder, Denver, anywhere) ordered by
signup date, with a hardcoded, viewer-independent "X mi away" label. None
of distance ranking, neighboring-city inclusion, or radius-based
eligibility works.

What's fake / disconnected today:

- **Distance filter pills** (`5/15/30/50 mi`, `Virtual only`) in
  `components/services/ServiceFilters.tsx` set a `distance` URL param,
  but `app/services/page.tsx` never reads it (only `type`, `minRating`,
  `locationType`, `verified`, `lifeStage`).
- **"Nearest first" sort** in `app/services/page.tsx` is a `<select>`
  option with no `value`/`onChange` — purely decorative. Real sort is
  `orderBy: { createdAt: "asc" }` in `getVendors()` (`lib/api/vendors.ts`).
- **Vendor "service radius"** picked during onboarding in
  `components/vendor/ServicesForm.tsx` is never persisted — there's no
  radius column on `VendorProfile`.
- **`distanceMi`** (`prisma/schema.prisma`) is a seeded mock value, not
  computed relative to the viewer.

What works: service `locationType` (virtual / in_person / both) is a real,
functional filter via `getServices({ locationType })`.

**Full design + phased build plan: `docs/geo-search-plan.md`.** The two
up-front product decisions are locked there:

- **Matching model: vendor-radius.** A vendor shows up only if the buyer
  falls within the vendor's declared service radius (virtual-only vendors
  always match). So "Fort Collins → Boulder" inclusion keys off the
  *vendor's* radius, optionally narrowed by the buyer's distance pills.
- **Scope: US-only**, geocoded offline via the Census ZCTA centroid table —
  vendors enter a **service ZIP** (no street address), no paid geocoding
  API. ±1–3 mi centroid precision is negligible at 5–50 mi radii.

Three phases (see the doc for code-level detail): (1) schema
(`serviceZip` / `serviceRadiusMi` / derived `lat`/`lng`) + offline ZIP
geocoding helper; (2) wire onboarding to persist ZIP + radius; (3)
buyer-side location input, radius matching, distance sort, and making
`distanceMi` a derived per-request value. App-side Haversine for v1;
PostGIS is the documented upgrade path.

## Smaller gaps

- **No password reset / change UI.** Every user is stuck with the password
  on their account; a forgotten password has no recovery path. The
  `verification_tokens` table exists but is unused. Phase C didn't ship
  this.
- **Email is unverified.** `email_verified_at` is in the schema but no
  flow sets it. If signup verification ships, this is the column to use.
- **Cart count in nav.** Requires `Nav` to read cart state on the client
  (or a cookie). Currently the cart total is invisible outside the PDP.
  Best landed alongside the Phase E cart drawer.
- **`generateStaticParams` for `/shop/[productId]`** to enable full
  static generation of product pages. Low priority — pages are fast
  already.
- **`scripts/remove-mock-data.mjs`** — a dry-run-default script to
  cascade-delete `@codaco.local` users when real vendors onboard. Pattern
  is in `docs/admin-runbook.md`; write the script when needed.
- **`DEMO_AUTO_APPROVE_VENDORS=1` is on in production.** Fine for the
  demo; flip off the moment there's a real applicant. The admin queue
  works either way.

## Resolved (kept for posterity, can be deleted once stable)

- ~~Server Actions for vendor forms~~ — landed in Phase D. Both
  `GoodsForm` and `ServicesForm` POST to `app/list-with-us/actions.ts`.
- ~~Suspense boundaries around filter components~~ — landed.
  `app/shop/page.tsx` and `app/services/page.tsx` both wrap their filter
  components in `<Suspense>`.

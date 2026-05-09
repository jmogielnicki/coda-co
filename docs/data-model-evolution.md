# CodaCo data model evolution

## Context

CodaCo's data layer is fully in-memory (`/lib/data/*.ts` arrays read via thin
functions in `/lib/api/*.ts`). Two shapes of trouble are baked in:

1. **Stale denormalized aggregates.** `Product.rating` and `Product.reviewCount`
   are hardcoded scalars sitting next to a separate `Review` table. They drift
   from the underlying reviews — `urn-sage-001` claims 47 reviews in
   `reviewSummaries` but only 3 exist in the `reviews` array. Vendor ratings
   have the same issue, plus there's no `VendorReview` entity at all.
2. **No room for the next year of work.** There's no `User`, no `Order`, no
   per-variant id (so an order line item can't reference what was actually
   bought), no vendor-managed product CRUD, and `/list-with-us` forms throw
   submissions away. Cart items duplicate product fields (title, seller,
   price, thumbBg) instead of referencing a product.

This plan takes the codebase from in-memory arrays → a Postgres-backed
marketplace with users, vendor self-service, orders, and reviews, in phases
that don't break the live UI. Phase A is a non-DB cleanup that aligns the
current shape with the future schema; everything after that is additive.

User-confirmed decisions:
- Shared `users` table for identity. `vendor_profile` is its own entity
  linked via `user_id`. **`buyer_profile` is deferred** until there's a
  field that has to live on it; in the meantime "being a buyer" is implicit
  (a user with a `shipping_address` or `order`).
- Vendor signup is manually reviewed.
- Cart stays client-only (localStorage); the order is written at checkout.

**Modeling principles applied throughout:**
- *Every table has its own surrogate `id` primary key.* Even 1:1 tables
  (e.g. `vendor_profile`) — the FK is a separate `user_id` column with a
  unique index. Surrogate keys keep migrations and refactors clean.
- *Start with the minimum field set.* Fields are only included when there's
  a current consumer; speculative columns are listed as deferred.
- *Enums over strings, with an `unknown` member as default.* See the
  [Enums](#enums) section for the central list. `unknown` is the column
  default unless the workflow forces an explicit value at insert.
- *Money columns ship with `currency`* (ISO 4217, default `'USD'`) so we
  never have to hunt down "what currency is this `price_cents` in?" later.

## Target logical data model

All ids are string `cuid()`. Money is integer `cents` paired with a
`currency` ISO code. Every mutable entity has `created_at` / `updated_at`.
FK columns are `<entity>_id`.

### Identity

**`users`** — one row per human (buyer/vendor/admin)
- `id` (PK), `email` (unique, citext), `name`, `password_hash?`,
  `role` enum (default `unknown`), `created_at`, `updated_at`
- Identity only. No buyer or vendor specifics.
- Deferred: `email_verified_at` (email verification feature),
  `is_active` (suspension/soft-delete), `phone`.

**`shipping_addresses`** — many per user
- `id` (PK), `user_id` (FK → `users.id`), `recipient_name`, `line1`,
  `line2?`, `city`, `state`, `postal_code`, `country`, `created_at`,
  `updated_at`
- `orders.shipping_address` is a JSONB **snapshot** taken at checkout, so
  historical orders survive later edits or deletions to this table.
- Deferred: `label` (named addresses like "Home"), `phone`, `is_default`
  (only matters once a user has multiple — add with the dashboard).

**`vendor_profile`** — one row per approved vendor
- `id` (PK), `user_id` (FK to `users.id`, unique), `slug` (unique;
  replaces ad-hoc string ids like `earthen-studio`), `display_name`,
  `bio`, `location`, `kind` enum (default `unknown`), `verified` bool
  (default false), `created_at`, `updated_at`
- Deferred: `initials` (compute from `display_name`), `credentials` (fold
  into `bio`), `member_since` (use `created_at`), `is_accepting_orders`
  (defer until a pause/scheduling feature exists), `virtual` / `in_home`
  (these are *service-listing* attributes, not vendor attributes — they
  live on `services.location_type`), `specializations` (drop until a
  curated tag list / enum is defined; the union of a vendor's service
  types is derivable from the `services` table), `verified_at`, `tax_id`,
  `payout_account_id` (Stripe Connect).
- **Derived (not columns):** `rating`, `review_count`, `distance_mi`,
  vendor stats (orders, avg rating, on-time %).

### Catalog (goods)

**`product_types`** — `id` (PK), `slug` (unique), `name`. Renamed from
`categories` to mirror `service_types`. Replaces the `ProductCategory`
enum so types can grow with copy/SEO. *System-seeded* (see Phase B).

**`products`** — `id` (PK), `vendor_id` (FK → `vendor_profile.id`),
`slug` (unique), `title`, `description`, `product_type_id` (FK),
`base_price_cents`, `currency` (ISO 4217, default `'USD'`), `details`
JSONB (the existing free-form `ProductDetail` map; product-type-specific
attributes like glaze options live here), `status` enum (default
`unknown`), `created_at`, `updated_at`.
- `thumb_bg`, `badge_label`, `badge_variant` are **not** columns. They
  were presentation crutches; the front-end synthesizes them temporarily
  (a hashed thumb-bg from the product slug; badges removed or driven by a
  tiny client-side rule) until real images and order data exist.
- `relatedIds` is dropped — compute related products from
  same-product-type-and-vendor until curation needs it.
- Deferred: `verified` (lives on the vendor for now).

**`product_variants`** — `id` (PK), `product_id` (FK), `label`,
`price_cents`, `currency` (default `'USD'`), `stock` int (≥ 0),
`created_at`, `updated_at`. Cart and order line items reference this,
not the product.
- Deferred: `sku`, `position` (use insertion order until display-order
  editing is built).

**`product_images`** — *not built day 1.* When real imagery lands the
shape will be `id, product_id, url, alt, position`. Until then the
front-end renders a generated placeholder.

### Catalog (services)

**`service_types`** — `id` (PK), `slug` (unique), `name`. Replaces the
`VendorType` enum. *System-seeded.*

**`services`** — `id` (PK), `vendor_id` (FK → `vendor_profile.id`),
`slug` (unique within vendor), `service_type_id` (FK), `title`,
`description`, `location_type` enum (default `unknown`), `pricing_model`
enum (default `unknown`), `price_cents?`, `currency` (default `'USD'`),
`status` enum (default `unknown`), `created_at`, `updated_at`. One vendor
can offer multiple services (a doula's in-home consultation, birth
attendance, and postpartum support are three rows).
- A vendor's offered service types are derived:
  `SELECT DISTINCT service_type_id FROM services WHERE vendor_id = ?`.
  This naturally handles a doula who's also a grief counselor.
- Deferred: `duration_min` (only matters once booking exists).

### Reviews

**`product_reviews`** — `id` (PK), `product_id` (FK), `author_user_id`
(FK), `rating` int 1–5 (CHECK), `body`, `created_at`. Unique on
`(product_id, author_user_id)`.
- Deferred to Phase F: `verified_purchase` bool, `order_item_id` FK (the
  specific purchase being reviewed). Both depend on orders existing.

**`vendor_reviews`** — `id` (PK), `vendor_id` (FK), `author_user_id` (FK),
`rating`, `body`, `created_at`. Unique on `(vendor_id, author_user_id)`.
Per-service reviews (`service_reviews` keyed by `service_id`) are
additive in a later phase when services have their own bookings.

### Commerce

**`orders`** — `id` (PK), `buyer_user_id` (FK → `users.id`), `status`
enum (default `unknown`), `total_cents`, `currency` (ISO 4217 snapshot),
`shipping_address` JSONB (snapshot), `placed_at`, `created_at`,
`updated_at`. One order can span multiple vendors; per-vendor fulfillment
lives on items.
- Deferred: `subtotal_cents` / `shipping_cents` / `tax_cents` (sum from
  items + settings until tax + shipping rules exist),
  `payment_intent_id` (Phase E with Stripe).

**`order_items`** — `id` (PK), `order_id` (FK), `product_variant_id` (FK
to variant, not product), `vendor_id` (snapshot — survives if the product
is later reassigned), `quantity`, `unit_price_cents` (snapshot),
`currency` (snapshot), `product_title_snapshot`, `variant_label_snapshot`
(so historical orders survive product edits/deletes), `fulfillment_status`
enum (default `unknown`), `tracking_carrier?`, `tracking_number?`,
`shipped_at?`, `delivered_at?`, `created_at`, `updated_at`.
- The tracking + timestamp fields are how CodaCo learns the lifecycle
  state — see [Vendor notifications and order lifecycle](#vendor-notifications-and-order-lifecycle).

**Cart — no table.** Existing `CartProvider` + localStorage stays. At
checkout, the client posts cart contents to a server action that creates
the `orders` + `order_items` rows in a transaction (revalidates price
against current variant, decrements stock, rejects oversells). Cart shape
slims to `{ productId, variantId, qty }` — no copied product fields.

### Vendor lifecycle

**`vendor_applications`** — the signup-to-be-a-vendor flow before approval
- `id` (PK), `applicant_user_id` (FK to `users.id`; the form becomes
  "sign up or log in, then apply"), `kind` enum (default `unknown`),
  `proposed_display_name`, `proposed_slug`, `proposed_bio`, `location`,
  `plan_id` enum (default `unknown`), `status` enum (default `unknown`),
  `reviewed_by_user_id?`, `reviewed_at?`, `review_notes?`, `created_at`,
  `updated_at`
- Deferred: `credentials`, `service_type`, `specializations`. The
  application captures `kind` + bio; type-specific fields are added when
  the admin approval UI is fleshed out.
- On approval, a `vendor_profile` row is created and a `subscription` row
  is created for the chosen plan.

**`subscriptions`** — `id` (PK), `vendor_id` (FK → `vendor_profile.id`),
`plan_id` enum (default `unknown`), `kind` enum (default `unknown`; a
vendor with `kind=both` can have two subscriptions), `status` enum
(default `unknown`), `current_period_end?`, `created_at`, `updated_at`.
- Deferred: `stripe_subscription_id` (Phase E with Stripe).

**`Plan`** stays code-defined (a TS object/enum seeded from
`lib/data/plans.ts`). Three rows × two contexts is configuration, not
data.

## Enums

All enums include an `unknown` member that is the column default unless
the workflow forces an explicit value at insert. This makes "we forgot to
set this" a visible state instead of a silent default.

| Enum | Members |
|------|---------|
| `users.role` | `unknown`, `user`, `admin` |
| `vendor_profile.kind` | `unknown`, `goods`, `services`, `both` |
| `products.status` | `unknown`, `draft`, `published`, `archived` |
| `services.status` | `unknown`, `draft`, `published`, `archived` |
| `services.location_type` | `unknown`, `virtual`, `in_person`, `both` |
| `services.pricing_model` | `unknown`, `fixed`, `hourly`, `quote` |
| `orders.status` | `unknown`, `pending`, `paid`, `fulfilled`, `cancelled`, `refunded` |
| `order_items.fulfillment_status` | `unknown`, `pending`, `shipped`, `delivered`, `cancelled`, `returned` |
| `vendor_applications.kind` | `unknown`, `goods`, `services`, `both` |
| `vendor_applications.status` | `unknown`, `submitted`, `approved`, `rejected` |
| `subscriptions.plan_id` | `unknown`, `starter`, `standard`, `pro` |
| `subscriptions.kind` | `unknown`, `goods`, `services` |
| `subscriptions.status` | `unknown`, `active`, `past_due`, `cancelled` |

## Vendor notifications and order lifecycle

How vendors learn about orders, and how CodaCo learns about fulfillment
state.

**Notifying the vendor when an order arrives.**
- On order creation (Phase E), a server action enqueues a transactional
  email via Resend or Postmark to each vendor that owns at least one item
  on the order ("New order: 2 items, $X — view in dashboard"). Email is
  the durable channel; we do **not** rely on the dashboard alone.
- Vendor dashboard route `/dashboard/orders` lists the vendor's
  `order_items` filtered by `fulfillment_status`. New items appear in a
  "Pending" tab and persist there until marked shipped.

**How CodaCo learns the state of fulfillment.**
- *Vendor self-reports* via the dashboard. "Mark shipped" prompts for
  carrier + tracking number; the action sets `shipped_at`,
  `tracking_carrier`, `tracking_number`, and `fulfillment_status =
  shipped`. The buyer is emailed.
- *Carrier-derived `delivered_at`* (deferred to a Phase E follow-up):
  poll a tracking-aggregator API (EasyPost, Shippo, or AfterShip — pick
  at build time) for any item with `shipped_at IS NOT NULL` and
  `delivered_at IS NULL`. When the carrier reports delivered, set
  `delivered_at` and `fulfillment_status = delivered`. Until that lands,
  buyers can mark "received" themselves; otherwise the item sits at
  `shipped` indefinitely (which doesn't block anything).
- *Returns / disputes:* a separate `order_item_disputes` table can be
  added when the support flow is real. Day 1 the admin sets
  `fulfillment_status = returned` manually.
- An `order_item_events` audit log (`id, order_item_id, status,
  actor_user_id, note?, created_at`) lands in Phase E so we can answer
  "who marked this and when" without reconstructing from columns.

The order-level `orders.status` is derived from its items (`paid` once
the order is created post-payment, `fulfilled` once every item is
`delivered`, `cancelled` if every item is `cancelled`). It can be backed
by a trigger or recomputed on read — the trigger is cleaner once we have
one.

## Aggregate ratings — derived, not stored

Drop `Product.rating`, `Product.reviewCount`, `Vendor.rating`,
`Vendor.reviewCount`, and the entire `reviewSummaries` array. Compute on
read.

The bug we have today is exactly the cost of denormalizing without
invalidation discipline. At CodaCo's review volume (tens-to-low-thousands
per product for a long time), an aggregate over an indexed `(product_id,
rating)` is sub-millisecond. A denormalized cache buys nothing and is
what produced the 47-vs-3 inconsistency.

```ts
// lib/api/reviews.ts (Phase B form)
export async function getReviewSummary(productId: string) {
  const rows = await db.productReview.groupBy({
    by: ['rating'], where: { productId }, _count: { _all: true },
  });
  if (rows.length === 0) return null;
  const total = rows.reduce((n, r) => n + r._count._all, 0);
  const sum   = rows.reduce((n, r) => n + r.rating * r._count._all, 0);
  const distribution = [5,4,3,2,1].map((stars) => ({
    stars, count: rows.find((r) => r.rating === stars)?._count._all ?? 0,
  }));
  return { productId, average: sum / total, total, distribution };
}
```

For grids (`/shop`, `/services`) where every card needs a rating, expose
`getProductsWithRatings()` / `getVendorsWithRatings()` that join + group
by in one query and return `Product & { rating, reviewCount }` view
objects. The persisted row stays clean; the API-layer response carries
the derived numbers. If sort-by-rating becomes slow under real load, add
a materialized view — but only after measuring.

## Phased migration

### Phase A — clean the in-memory model (no DB, no UI changes)

The whole point of A is to land the *shape* the DB will eventually use,
while the data is still TS arrays. Nothing the user sees changes.

- Add `id` to `Variant` (e.g. `urn-sage-001-std`) in `lib/types.ts` and
  `lib/data/products.ts`.
- Delete `Product.rating`, `Product.reviewCount`, `Vendor.rating`,
  `Vendor.reviewCount`, and the `reviewSummaries` array.
- Add `getReviewSummary(productId)` and `getProductRating(productId)`
  that derive from the `reviews` array. Add parallel
  `lib/api/vendor-reviews.ts` with `getVendorReviews(vendorId)` /
  `getVendorRating(vendorId)`. Hand-write 8–12 vendor reviews into a new
  `lib/data/vendor-reviews.ts` so service cards aren't all zeros.
- `getProducts` / `getVendors` return `T & { rating, reviewCount }` view
  shapes. Components read ratings off the API response, not off the
  persisted entity.
- Replace `Vendor.isServiceProvider` with `kind: 'unknown' | 'goods' |
  'services' | 'both'` in types and seed data; default `unknown`.
- Drop `Vendor.type` (`VendorType`), `Vendor.specializations`,
  `Vendor.accepting`, `Vendor.virtual`, `Vendor.inHome` from the type
  and seed data. Add `lib/data/services.ts` (each service = a row
  referencing a vendor, with `serviceType`, `title`, `description`,
  `locationType`, `pricingModel`, `price?`, `currency`) and
  `lib/api/services.ts` with `getServices({ vendorId?, serviceType?,
  locationType? })`. Backfill from the existing vendor seeds — each
  service-provider vendor becomes a vendor row + 1–3 service rows.
- Drop `Product.glazeOptions` as a typed field; fold any glaze data into
  `Product.details` (`details.glazes`). Drop `Product.thumbBg`,
  `Product.badgeLabel`, `Product.badgeVariant` from the type and seed
  data. Add a small front-end helper that synthesizes a placeholder
  thumb background from the product slug. Remove badge UI for now (or
  hardcode a temporary client-side rule like "first 6 by id are
  bestsellers" if the prototype visibly needs them).
- Rename `ProductCategory` → `ProductType` and any
  `lib/data/categories.ts` references → product-types throughout, to
  mirror `service_types`.
- Drop `SellerProfile.stats`. Replace with `getVendorStats(vendorId)`
  returning a derived object (placeholder zeros until orders exist).
- Slim `CartItem` to `{ productId, variantId, qty }`. `CartProvider`,
  `AddToCart`, and the cart drawer fetch live product data via
  `getProducts({ ids })` for display.
- Convert seed dates (`memberSince`, review `date`) to ISO. Add a
  `formatMonthYear(iso)` helper for display.
- Add a `currency: 'USD'` field to product / variant / service seed
  shapes so the eventual DB migration is a no-op.

Run `npm run check-drift` and `npm run build` to confirm nothing
regressed.

### Phase B — Postgres + Prisma; split system seed vs mock; swap `lib/api`

Visible change: none. Files: new `prisma/schema.prisma`, **two** seed
scripts (see below), new `lib/db.ts` (singleton client), every file in
`lib/api/*.ts` rewritten to use Prisma. Function signatures stay
identical so RSCs don't change.

**Seed strategy — system data vs. mock data.** Strict separation so a
prod deploy can never push fake vendors:

- `prisma/seed.ts` — *system data only*. Required structural rows the
  app cannot run without: `product_types`, `service_types`, plan rows.
  Wired to `prisma.seed` so `prisma migrate deploy` / `prisma db seed`
  runs it in every environment, including production.
- `prisma/mock.ts` — *test data only*. Fake users, vendor profiles,
  products, variants, services, reviews — sourced from the existing
  `lib/data/*.ts` arrays. Run via a separate `npm run db:mock` script
  guarded by `NODE_ENV !== 'production'`. Never wired into Prisma's
  `seed` config so it can't run unintentionally.

`lib/data/*.ts` becomes the mock-script source only — no longer imported
at runtime. `app/admin/page.tsx` shifts to query the DB (or gets removed
once Phase D's real admin lands).

### Phase C — auth and `users`

Add Auth.js (NextAuth v5) with the Prisma adapter and a Credentials
provider. Sessions in the DB. Backfill seed vendors as `users` rows with
matching `vendor_profile` rows. Replace `lib/admin-auth.ts` with
role-gated Auth.js (`role === 'admin'`); delete the HMAC scaffold.

New: `/login`, `/signup`, session-aware top nav. Existing pages don't
require auth yet.

### Phase D — vendor self-service

**This is the demo-ready milestone.** Through Phase D the product can
walk a prospective vendor through: sign up → apply → land in dashboard →
add a product → see it live on `/shop`. Phases E and F (orders, reviews)
are not required for that demo and stay deferred.

`/list-with-us/goods` and `/list-with-us/services` POST to a server
action that persists a `vendor_application`. Anonymous visitors get
redirected to `/signup?next=/list-with-us/...`. Admin route
`/admin/applications` approves/rejects; on approval the action creates
`vendor_profile` + `subscription` and the user can edit products at
`/dashboard/products/...`. Stock per variant is the editable field that
matters most.

**Publish flow.** New products default to `status = 'draft'` and are
invisible on `/shop` and `/services`. The dashboard product editor has
a "Publish" toggle that flips `status` to `'published'`. All public
catalog queries (`getProducts`, `getServices`, vendor profile pages)
filter to `status = 'published'`. The vendor's own dashboard shows
their drafts alongside their published rows so they can preview before
publishing.

**Dev/demo auto-approve.** A `DEMO_AUTO_APPROVE_VENDORS` env flag, when
set, makes the application server action skip the admin queue: it
immediately writes `vendor_applications.status = 'approved'`, creates
the `vendor_profile` + `subscription`, and signs the user into their
dashboard. Off in production, on for live demos so a prospect can sign
up and have a published product in front of them in under a minute.
The admin approval UI still exists and works — the flag just bypasses
it.

**Cart status pre-Phase-E.** Until orders ship, the cart drawer's
"Checkout" button is visibly disabled with a "Coming soon" label. The
add-to-cart and cart-drawer UX still work end-to-end (so vendors can
preview the buyer-side flow), but no order is written.

### Phase E — orders + checkout + vendor notifications

Cart drawer's "Checkout" button works. Server action wraps order
creation in a Prisma transaction: revalidate price against current
variant, decrement stock, create `orders` + `order_items`. First pass
uses a stub "Mark as paid" button in dev; real Stripe Checkout is a
follow-up.

Vendor dashboard gets an "Orders" tab (`/dashboard/orders`) scoped by
`order_items.vendor_id`. New-order email goes out via Resend/Postmark
when order rows are created. Vendor "Mark shipped" action sets
`shipped_at` + tracking + `fulfillment_status = shipped` and emails the
buyer. `order_item_events` audit log table is added here.

Carrier polling for `delivered_at` is a Phase E follow-up — until then
`delivered` is set by buyer or admin.

### Phase F — review submission

PDP gets a "Write a review" button gated to users with a paid
`order_item` for that product (sets `verified_purchase = true` and links
`order_item_id` — added to the schema in this phase). Service pages get
a "Write a review" button for vendors (ungated initially; tighten when
bookings exist). `ReviewCard` shows a "Verified purchase" badge when
`verified_purchase = true`.

## Tech stack

- **Postgres** — same engine in dev (Docker) and prod (Neon or Supabase).
  No SQLite-in-dev split; we need JSONB and citext to behave the same.
- **Prisma** — type-safe queries match the existing `lib/api` convention;
  migrations are first-class.
- **Auth.js v5 + Prisma adapter** — RSC-friendly `auth()` helper,
  swappable providers. Credentials + Email first; Google OAuth later.
  Replaces the HMAC admin-auth cleanly.
- **Resend or Postmark** for transactional email (vendor new-order
  notifications, buyer shipping updates) in Phase E.
- **Stripe** in Phase E — Stripe Checkout (hosted) first to dodge PCI
  scope; Stripe Billing for vendor subscriptions; Stripe Connect for
  payouts later.
- **EasyPost / Shippo / AfterShip** (one of) for `delivered_at` carrier
  polling in a Phase E follow-up.

## Critical files to modify in Phase A

- `/home/user/coda-co/lib/types.ts` — add `id` to `Variant`; remove
  `rating` and `reviewCount` from `Product` and `Vendor`; remove
  `ReviewSummary` from the persisted shape (keep as a derived response
  type); split `Vendor` into a profile shape with `kind: 'unknown' |
  'goods' | 'services' | 'both'`; drop `Vendor.type`,
  `Vendor.specializations`, `Vendor.accepting`, `Vendor.virtual`,
  `Vendor.inHome`; drop `Product.glazeOptions`, `Product.thumbBg`,
  `Product.badgeLabel`, `Product.badgeVariant`; drop
  `SellerProfile.stats`; rename `ProductCategory` → `ProductType`; add
  `VendorReview` and `Service` types; add `currency: string` to product /
  variant / service shapes; slim `CartItem` to `{ productId, variantId,
  qty }`.
- `/home/user/coda-co/lib/data/products.ts` — add variant `id`s; remove
  `rating`, `reviewCount`, `thumbBg`, `badgeLabel`, `badgeVariant`,
  `glazeOptions` (move into `details.glazes`); add `currency: 'USD'` on
  product and each variant.
- `/home/user/coda-co/lib/data/vendors.ts` — remove `rating`,
  `reviewCount`, `type`, `specializations`, `accepting`, `virtual`,
  `inHome`; replace `isServiceProvider` with `kind`; ISO `memberSince`.
- `/home/user/coda-co/lib/data/reviews.ts` — delete `reviewSummaries`;
  ISO `date`s; add sibling `lib/data/vendor-reviews.ts`.
- `/home/user/coda-co/lib/data/services.ts` *(new)* — one row per
  vendor-offered service, populated from the current vendor seed data;
  includes `currency: 'USD'`.
- `/home/user/coda-co/lib/api/services.ts` *(new)* — `getServices({
  vendorId?, serviceType?, locationType? })` and `getService(id)`.
  `/services` page is rebuilt to query services (not vendors); the
  "virtual/in-home" filters move to `services.location_type`.
- `/home/user/coda-co/lib/api/reviews.ts` — implement
  `getReviewSummary` and `getProductRating` as aggregations over the
  `reviews` array; add `lib/api/vendor-reviews.ts` with
  `getVendorReviews` / `getVendorRating`.
- `/home/user/coda-co/lib/api/products.ts` and
  `/home/user/coda-co/lib/api/vendors.ts` — return `Product & { rating,
  reviewCount }` / `Vendor & { rating, reviewCount }` shapes.
- `/home/user/coda-co/components/providers/CartProvider.tsx` —
  `CartItem` becomes `{ productId, variantId, qty }`; key by
  `(productId, variantId)`; consumers fetch live product data for
  display.
- `/home/user/coda-co/components/pdp/AddToCart.tsx`,
  `components/ui/ProductCard.tsx`, `components/ui/VendorCard.tsx`,
  `app/shop/[productId]/page.tsx`, `app/shop/page.tsx`,
  `app/services/page.tsx` — read rating / reviewCount from the API-
  augmented shape; `/services` reads from the new services API; product
  card synthesizes thumb-bg from slug; badge UI removed (or driven by a
  small client-side helper) until real data exists.

## Verification

After Phase A:

- `npm run check-drift` (the project's required drift check) passes
  clean.
- `npm run build` succeeds with no type errors.
- Visit `/`, `/shop`, `/shop/urn-sage-001`, `/services` and confirm:
  - Product / vendor cards still show ratings, now derived (the urn
    shows a rating computed from its 3 actual reviews, not the stale
    "47").
  - PDP review summary distribution matches the actual review rows.
  - Add-to-cart still works end-to-end; cart drawer shows correct
    title/price/thumb fetched live from the product.
  - `/services` filters (verified, location, type) all behave (the
    "accepting" filter is gone with that field; "virtual / in-home"
    now map to `services.location_type`).
- Grep for `product.rating` / `product.reviewCount` / `vendor.rating` /
  `vendor.reviewCount` / `isServiceProvider` / `reviewSummaries` /
  `glazeOptions` / `thumbBg` / `badgeLabel` and confirm references are
  gone.

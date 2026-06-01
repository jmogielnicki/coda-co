# Geographic vendor search plan

## Context

CodaCo has **no functioning proximity search** today. Several UI
affordances imply it, but nothing behind them is wired up, and the schema
lacks the data to support it. A Fort Collins visitor sees every vendor
(Boulder, Denver, anywhere) ordered by signup date, with a hardcoded,
viewer-independent "X mi away" label.

What's fake / disconnected today:

- **Distance filter pills** (`5/15/30/50 mi`, `Virtual only`) in
  `components/services/ServiceFilters.tsx:12` set a `distance` URL param,
  but `app/services/page.tsx` never reads it (only `type`, `minRating`,
  `locationType`, `verified`, `lifeStage`).
- **"Nearest first" sort** (`app/services/page.tsx:157`) is a `<select>`
  option with no `value`/`onChange` — purely decorative. Real ordering is
  `orderBy: { createdAt: "asc" }` in `getVendors()` (`lib/api/vendors.ts:89`).
- **Vendor "service radius"** picked during onboarding
  (`components/vendor/ServicesForm.tsx`) is never persisted — there's no
  radius column on `VendorProfile`.
- **`distanceMi`** (`prisma/schema.prisma:141`) is a seeded mock value, not
  computed relative to the viewer.

What already works and should be reused: service `locationType` (virtual /
in_person / both) is a real, functional filter via
`getServices({ locationType })` (`lib/api/services.ts`).

## Decisions

Two product decisions were made up front; they drive the schema and the
geocoding approach.

### Matching model: **vendor-radius**

A vendor appears for a buyer **only if the buyer falls within the vendor's
declared service radius**. This is the honest model for a death/dying
*services* marketplace — a doula who serves a 30 mi area genuinely can't
attend a home 60 mi away, so surfacing them as "nearby" would mislead the
buyer.

Rules:

- Each vendor declares a **service ZIP** (their base) and a **service
  radius** in miles.
- A buyer enters their ZIP. A vendor matches when
  `haversine(buyerCentroid, vendorCentroid) <= vendor.serviceRadiusMi`.
- **Virtual-only vendors always match** regardless of distance — radius
  doesn't apply to them. (Combine with the existing `locationType`:
  `virtual` ⇒ always in-range; `in_person`/`both` ⇒ radius-gated.)
- The buyer's distance-filter pills, if kept, *narrow* results further on
  top of the vendor-radius gate (a buyer can ask for "within 15 mi" even
  when a vendor would travel 50). This is an additive refinement, not the
  primary gate — see Phase 3.

### Geographic scope: **US-only**

ZIPs are geocoded **entirely offline** using the free U.S. Census **ZCTA
centroid** table (~33k rows, `zip → lat/lng`). No paid geocoding provider,
no API keys, no rate limits, no free-text address parsing. This matches the
current Colorado-centric data and removes a whole class of failure modes.

A physical street address is **not** collected. ZIP-centroid precision is
±1–3 mi in populated areas — negligible against 5–50 mi radii — and a
service ZIP is a privacy-safe value vendors are comfortable making public.

**Caveat to revisit later, not now:** ZIPs are USPS delivery groupings, not
true polygons; ZCTA centroids are a well-established proxy. True
"point-in-service-area" precision (map-drawn polygons, PostGIS) is a
post-launch concern. ZIP-centroid + radius is the standard v1 approach.

## Phase status

| Phase | Description                                                  | Status      |
|-------|--------------------------------------------------------------|-------------|
| 1     | Schema + offline ZIP geocoding (vendor base coordinates)     | 🔨 Geocoding helper landed; **schema/migration deferred** until concurrent vendor-DB work merges to `main` (avoids a divergent Prisma migration chain) |
| 2     | Vendor onboarding: capture service ZIP + radius              | ⏳ Not started |
| 3     | Buyer-side: location input, radius matching, distance sort   | ⏳ Not started |

---

## Phase 1 — schema + offline ZIP geocoding

The data foundation. No user-visible change; proves the geocoding pipeline.

### Schema changes (`prisma/schema.prisma`, `VendorProfile`)

- `serviceZip String?` — vendor's base ZIP, the input + public display value.
- `serviceRadiusMi Int?` — declared service radius (null ⇒ not yet set).
- `lat Float?` / `lng Float?` — **derived** from `serviceZip` via the ZCTA
  table at write time. Stored so proximity queries don't geocode per
  request. Re-derived whenever `serviceZip` changes.
- Keep `location String` as the human-readable display label ("Boulder, CO").
- Drop or repurpose `distanceMi` — it must become a *derived, per-request*
  value (viewer ↔ vendor), never a stored column. Cleanest is to remove the
  column and compute distance in the API/serializer once Phase 3 lands.

Run `npx prisma migrate dev --name geo-search-fields` (needs a local
Postgres + shadow DB — see AGENTS.md "Local DB for migration generation").

### ZIP geocoding helper — ✅ landed

- `lib/geo/zip.ts` — pure, dependency-free helpers usable from server
  actions and API code: `isValidUsZip`, `normalizeZip`, `zipToCentroid`,
  `haversineMi`, `zipDistanceMi`. All return `null` on a miss rather than
  guessing a point.
- `lib/geo/zcta-data.ts` — the `zip → [lat, lng]` table. Currently a
  **verified seed subset** (the mock-vendor cities). Replaced by the full
  ~33k-row national table via the generator below before launch.
- `scripts/build-zcta.mjs` — generates `zcta-data.ts` from the Census ZCTA
  gazetteer. Must run in a **network-enabled environment** (the CI/build
  sandbox blocks outbound fetches), then commit the result.
- `scripts/verify-geo.ts` — `npx tsx scripts/verify-geo.ts` smoke test
  (no test-framework dependency added — none exists in the repo yet).

### Backfill

- One-off script (or fold into `prisma/mock.ts`) to populate `serviceZip`
  for mock vendors from their existing `location` string and derive
  `lat`/`lng`. Mock data is the only data, so this is low-risk.

---

## Phase 2 — vendor onboarding captures ZIP + radius

Wire the existing-but-inert onboarding controls to real persistence.

- `components/vendor/ServicesForm.tsx`: replace the throwaway `radius`
  string state with two persisted fields — a **service ZIP** input and the
  radius selector (`5/15/30/50 mi`, plus the existing `Virtual only` which
  maps to `locationType`, *not* a radius).
- Validate the ZIP client-side (`isValidUsZip`) and server-side in
  `app/list-with-us/actions.ts`; reject ZIPs not found in the ZCTA table
  with a clear message.
- On save, geocode `serviceZip → lat/lng` and persist all three. Re-geocode
  on edit.
- Surface the service area on the vendor profile
  (`app/services/[vendorId]/page.tsx`) from real data, replacing the
  hardcoded `VENDOR_EXTRAS` radius string.

---

## Phase 3 — buyer-side matching, filtering, and sort

The visible payoff. Buyer enters a location; results are gated and ranked
by real distance.

### Viewer location capture

- Add a ZIP (and/or "use my location" via the browser Geolocation API)
  input on `app/services/page.tsx`, feeding a `near` URL param (the ZIP).
  Geolocation resolves to the nearest ZIP centroid client-side, or we add a
  reverse step — start with manual ZIP entry, add geolocation as polish.
- `near` joins the existing `searchParams` set; the page RSC re-renders on
  change (same pattern as the other filters).

### Matching + ranking (`lib/api/vendors.ts`)

- Extend `VendorFilters` with `near?: string` (buyer ZIP) and
  `maxDistanceMi?: number` (the buyer's distance-pill choice).
- After loading candidate vendors, for each:
  - compute `distanceMi = haversineMi(buyerCentroid, vendorCentroid)`,
  - **include** when the vendor is virtual-only (`locationType` virtual) OR
    `distanceMi <= vendor.serviceRadiusMi` (vendor-radius gate),
  - then optionally drop those beyond `maxDistanceMi` (buyer's pill).
- This is post-query filtering in app code (Haversine over the candidate
  set) — simple and adequate at current volumes. **PostGIS / `earthdistance`
  is the documented upgrade path** if vendor counts or map-bounds queries
  demand in-DB radius math; don't reach for it in v1.
- Replace the `createdAt` default ordering with distance-aware sort when
  `near` is present; otherwise keep current ordering.

### Wire the inert UI

- `app/services/page.tsx`: read the `distance` param (map pill labels →
  `maxDistanceMi`) and pass it through. Give the **"Nearest first"** sort a
  real `value`/`onChange` that sets a `sort` param, and honor it.
- `components/ui/VendorCard.tsx`: render the **derived** `distanceMi` ("3.2
  mi away") only when `near` is set; hide it otherwise (no more fake
  static value).
- Empty state: when a buyer's ZIP yields no in-radius vendors, surface
  virtual-only options and a "no local vendors yet" message rather than an
  empty grid.

---

## Coordination with the vendor-launch branch

The concurrent vendor-launch work (`claude/practical-euler-OrFOD`,
migration `20260601100000_add_vendor_profile_extras`) already touches
`VendorProfile`. Reconcile at merge time:

- **No collision on the core geo columns.** That branch adds no ZIP /
  lat / lng, so `serviceZip` / `lat` / `lng` remain net-new. The migration
  chain is clean (generate the geo migration with a later timestamp on the
  post-merge `main`).
- **`service_radius` (theirs) vs `serviceRadiusMi` (this plan).** Theirs is
  free-form `TEXT` ("25 mile radius") for *display* on the profile card;
  this plan needs a numeric radius for *matching*. Don't ship both as
  independent sources of truth. Decision pending — see below.
- **`distanceMi`.** Their branch keeps and extends it. The earlier "remove
  the column" step is therefore deferred: in Phase 3 compute distance per
  request from coordinates, and only retire the stored column once nothing
  reads it.

### Open decision — radius representation

Once both branches are on `main`, pick one:

1. **Structured source of truth + derived label (recommended).** Add
   `serviceRadiusMi Int?` as the matching input; render the
   profile-card string from it (a small formatter), and retire the
   free-form `service_radius` TEXT. One source of truth, display stays
   identical.
2. **Keep both, populate in parallel.** Less refactor now, but two columns
   for one concept — they will drift.

## Out of scope for v1

- True service-area polygons / PostGIS point-in-polygon.
- Non-US postal codes (requires a live geocoding provider).
- Map view / draggable map-bounds search.
- Drive-time vs. straight-line distance.

# Image storage plan

## Context

CodaCo currently has no user-uploaded image plumbing. Images are placeholder:

- Vendor headshots are 7 static files committed at `/public/vendors/mui-*.jpg`,
  hardcoded into mock data (`lib/data/vendors.ts`).
- Products have **zero** image fields on the schema — `ProductCard` renders an
  SVG icon per product type plus a deterministic pastel background
  (`lib/format/product.ts`).
- `users.image` and `vendor_profiles.{photo_src, photo_tone}` exist as nullable
  string columns but are unused outside mock data
  (`prisma/schema.prisma:51-70`, `:126-157`). The schema comment marks them as
  "deferred-but-rendered".
- No upload handler, no API route accepting files, no `images.remotePatterns`
  in `next.config.ts`, no upload-related dependencies installed.
- `<VendorPhoto>` already conditionally renders an `<img>` when `src` is set
  (`components/ui/VendorPhoto.tsx:35-43`), but uses raw `<img>` not
  `next/image`.

## Storage decision

**Vercel Blob.** Rationale captured in the evaluation conversation; short
version: lowest-friction path on our current Vercel + Neon stack, free tier
covers pre-launch test traffic, server-action upload pattern fits the existing
`app/dashboard/.../actions.ts` style. Migration to R2 or S3 later is a
copy-objects-and-rewrite-URLs job, not a re-architecture.

## Phase status

| Phase | Description                                                | Status                                                |
|-------|------------------------------------------------------------|-------------------------------------------------------|
| 1     | Vendor headshot upload (vertical slice through full stack) | ✅ Merged — PR #72 (uploader) + PR #73 (cropper)        |
| 2     | Product images — square cover + free-form gallery          | ⏳ In progress                                         |
| 3     | Polish — user avatars, admin moderation, optimization      | ⏳ Not started                                         |

---

## Phase 1 — vendor headshot

The smallest end-to-end slice. Single image, single replacement case, schema
fields already present. Goal: prove the Blob + uploader + `next/image`
pipeline before tackling the harder multi-image UX in Phase 2.

### Pre-work (manual)

1. Create a Blob store in the Vercel project, copy the read/write token.
2. Add `BLOB_READ_WRITE_TOKEN` to `.env.local` and Vercel project envs
   (production + preview).
3. Confirm limits: **5 MB** max, MIME `image/jpeg | image/png | image/webp`.

### Code changes

1. **Install + config**
   - `npm i @vercel/blob`
   - `next.config.ts`: add
     `images.remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }]`

2. **Shared validation** — new `lib/images.ts`
   - Exports: `MAX_BYTES`, `ALLOWED_MIME`, `validateImageFile(file)`,
     `extensionFromMime(mime)`. Used by both client and server so rules
     don't drift.

3. **Server action** — new `app/dashboard/profile/actions.ts`
   - `updateVendorProfile(formData)`:
     - `requireVendor()` (existing helper at `app/dashboard/lib.ts:7`).
     - Read `photo: File` and `photoTone: string` from FormData.
     - If `photo.size > 0`: validate → `put()` to
       `vendors/{slug}/photo-{Date.now()}.{ext}` with `access: 'public'`.
     - If old `vendor.photoSrc` is a `*.blob.vercel-storage.com` URL,
       `del()` it (best-effort; don't fail the action if cleanup errors).
     - Update `vendor_profile.{photo_src, photo_tone}` in one Prisma call.
     - `revalidatePath('/dashboard/profile')` and `/services/{vendor.slug}`.

4. **Client primitive** — new `components/ui/ImageUploader.tsx` (`'use client'`)
   - Props: `name`, `currentSrc?`, `accept`, `maxBytes`, `shape?: 'circle' | 'square'`.
   - Hidden file input + styled trigger, `URL.createObjectURL` preview,
     inline client-side validation error.
   - Doesn't own submission — caller wraps it in `<form action={...}>`.
     Designed so Phase 2 multi-upload can reuse it.

5. **Vendor profile page** — new `app/dashboard/profile/page.tsx`
   - Server component, `requireVendor()`.
   - `<form action={updateVendorProfile}>` containing `<ImageUploader>` +
     tone radio (sage / terracotta) + submit.
   - Uses `<Container width="narrow">` + `<SectionHeader>` per the
     reuse conventions in `AGENTS.md`.

6. **`<VendorPhoto>` migration** — `components/ui/VendorPhoto.tsx`
   - Swap `<img>` → `next/image`. Drop the eslint-disable. Add `sizes` per
     variant. Existing `/vendors/mui-*.jpg` paths keep working — they're
     served from `/public` and don't need `remotePatterns`.

7. **Nav** — add "Profile" link to the dashboard nav.

### Out of scope (intentionally)

- Image cropper / editor UI — vendors upload pre-cropped, we just store + serve.
- Pre-generating multiple sizes — `next/image` handles responsive serving.
- Product images (Phase 2), user avatars / admin moderation (Phase 3).
- Schema migration — `photo_src` / `photo_tone` already exist.

### Test plan

- Upload jpeg / png / webp → renders on `/dashboard/profile` and
  `/services/{slug}`.
- 10 MB file → rejected client-side, also rejected server-side if bypassed.
- PDF / non-image → rejected.
- Replace existing photo → old blob deleted from store (verify in Vercel UI).
- Unauthed `/dashboard/profile` → redirects to login.
- Non-vendor user → redirects to `/list-with-us`.
- `npm run check-drift` clean.
- `npm run build` succeeds.

**Branch**: `claude/images-phase-1-vendor-photo`. One PR.

---

## Phase 2 — product images

Two distinct concepts with different constraints, hence two distinct
shapes in the schema:

- **Cover photo** — required to publish. Square-cropped (reuses the
  existing `<ImageUploader>` cropper). Drives the `/shop` tile preview,
  where consistent aspect ratio matters for the grid.
- **Gallery photos** — 0–5 additional, any aspect ratio. Shown in a
  carousel on the product detail page after the cover. No cropper —
  product photos vary in shape (tall urns, wide trays) and forcing a
  square truncates information.

Total cap: **6 images per product** (1 cover + up to 5 gallery).

### Schema

```prisma
model Product {
  // ... existing fields ...
  coverImageUrl  String?  @map("cover_image_url")
  images         ProductImage[]
}

model ProductImage {
  id          String   @id @default(cuid())
  productId   String   @map("product_id")
  url         String
  alt         String?
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, sortOrder])
  @@map("product_images")
}
```

Migration name: `add_product_cover_and_gallery_images`.

### Server actions

- `updateProductCover(productId, formData)` — same shape as Phase 1's
  `updateVendorProfile`. Receives the cropped 1024×1024 webp, stores
  the blob at `products/{slug}/cover-{timestamp}.webp`, updates
  `Product.coverImageUrl`, best-effort deletes the previous blob.
- `addProductGalleryImage(productId, formData)` — receives a single
  file (no cropper), normalizes via canvas to max 2048px long-edge
  webp 0.85, stores at `products/{slug}/gallery-{timestamp}.webp`,
  creates a `product_image` row with `sort_order = max(existing) + 1`.
- `deleteProductGalleryImage(imageId)` — removes the row and
  best-effort deletes the blob.
- `reorderProductGalleryImages(productId, orderedImageIds)` — bulk
  update of `sort_order` from a drag-reorder.
- `setProductStatus` — extend the existing action so publishing
  requires `coverImageUrl !== null`; return a typed error rather than
  throwing.

### UI

- `<ImageGalleryUploader>` — new client primitive in `components/ui/`.
  File picker (multi-select), thumbnail list with drag-to-reorder
  (`@dnd-kit/core` + `@dnd-kit/sortable`), delete-per-tile, "X / 5
  used" counter. Each pick fires an upload immediately.
- Product editor (`app/dashboard/products/[id]/Editor.tsx`) gets two
  sections: "Cover photo" (existing `<ImageUploader>` with
  `shape="square"`) and "Gallery photos" (`<ImageGalleryUploader>`).
- `<ProductCard>` swaps the SVG-icon + pastel background for
  `next/image` when `coverImageUrl` is set; fallback stays for drafts.
- `/shop/[productId]` renders a simple carousel: cover first, then
  gallery in `sortOrder`. Same icon fallback for products with none.

### Mock data

Mock products stay icon-only — `prisma/mock.ts` doesn't upload anything.
Keeps `db:mock` fast. Real products that vendors publish will all have
a cover image (enforced at publish).

### Out of scope (intentionally)

- Alt-text editing per image (defer to Phase 3; default is `null` and
  `next/image` falls back to `""`).
- Image moderation surface (Phase 3).
- Blurhash / `blurDataURL` placeholders (Phase 3; requires `sharp`).
- Multi-PR split: single PR for the full Phase 2 vertical slice — the
  schema migration, both upload UIs, display, and publish gate go
  together.

---

## Phase 3 — polish (deferred until needed)

- **User profile avatars** — `users.image`. Wire up only once a user
  settings page exists (no `/account` route today).
- **Admin moderation** — `/admin/images` surface that lists recently
  uploaded blobs with a takedown action. Useful once real vendors are live;
  not needed for pre-launch.
- **Optimization tuning** — `sizes` audit across all `next/image` usages,
  generated `blurDataURL`, possible AVIF preference.
- **Mock-data cleanup** — if production vendors start uploading real
  photos, the static `/public/vendors/mui-*.jpg` files can be deleted
  once no live record references them.

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

| Phase | Description                                                | Status        |
|-------|------------------------------------------------------------|---------------|
| 1     | Vendor headshot upload (vertical slice through full stack) | ⏳ Not started |
| 2     | Product images (new schema model, multi-upload UX)         | ⏳ Not started |
| 3     | Polish — user avatars, admin moderation, optimization      | ⏳ Not started |

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

The complex one. Real multi-image UX, schema migration, integration with
the product editor.

### Schema

New model `product_images`:

```
model product_images {
  id          String   @id @default(cuid())
  product_id  String
  url         String
  alt         String?
  sort_order  Int      @default(0)
  created_at  DateTime @default(now())
  product     Product  @relation(fields: [product_id], references: [id], onDelete: Cascade)

  @@index([product_id, sort_order])
}
```

Open question for when we start: does a product also need a `primary_image_id`
pointer, or is "lowest `sort_order`" sufficient? Probably the latter — keeps
the model simpler.

### UI

- Multi-upload field on the product editor (`app/dashboard/products/[id]/`):
  add, reorder via drag, set primary (= move to position 0), delete.
- `<ProductCard>` and `/shop/[productId]` use the primary image when present,
  fall back to the existing SVG-icon + pastel-background composition.
- `prisma/mock.ts`: decide whether mock products get uploaded blobs (slower
  reseed, more realistic) or stay icon-only (faster, current behavior). Lean
  icon-only — keep `db:mock` fast.

### Open questions

- Cap on images per product (4? 6?).
- Do we want blurhash / `blurDataURL` placeholders generated on upload? Adds
  a sharp dependency — defer to Phase 3 if not needed for v1.

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

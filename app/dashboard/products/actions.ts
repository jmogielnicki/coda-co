"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del, put } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/api/applications";
import { isOwnedBlobUrl } from "@/lib/images";
import { processUploadedImage } from "@/lib/images.server";
import { log } from "@/lib/log";
import { rateLimit } from "@/lib/rate-limit";
import {
  MAX_GALLERY_IMAGES,
  type ActionError,
  type ImageActionResult,
} from "./constants";

async function requireVendorId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!vendor) throw new Error("Not a vendor");
  return vendor.id;
}

export async function createProduct(formData: FormData) {
  const vendorId = await requireVendorId();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const productTypeSlug = String(formData.get("productType") ?? "");
  // Asked for as "starting price" — it seeds the default variant. The
  // vendor can edit it (and add more variants) from the product editor.
  const startingPrice = Number(formData.get("startingPrice") ?? 0);
  if (!title || !productTypeSlug || !(startingPrice >= 0)) {
    throw new Error("Invalid product");
  }

  const productType = await prisma.productType.findUnique({
    where: { slug: productTypeSlug },
  });
  if (!productType) throw new Error(`Unknown product type: ${productTypeSlug}`);

  const baseSlug = normalizeSlug(title) || `product-${Date.now()}`;
  let slug = baseSlug;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const product = await prisma.product.create({
    data: {
      vendorId,
      productTypeId: productType.id,
      slug,
      title,
      description,
      status: "draft",
      // Every product gets at least one variant — that's where price and
      // stock live. The editor lets the vendor rename/repirce it later.
      variants: {
        create: [{
          label: "Default",
          priceCents: Math.round(startingPrice * 100),
          currency: "USD",
          stock: 0,
        }],
      },
    },
  });

  revalidatePath("/dashboard/products");
  redirect(`/dashboard/products/${product.id}`);
}

export interface UpdateProductFields {
  title: string;
  description: string;
  // Scalar-string entries to overwrite in the `details` JSONB blob.
  // Non-scalar entries (e.g. `glazes` array) are preserved untouched —
  // the editor only manages scalar rows; arrays are owned by other UI.
  details: Record<string, string>;
}

export async function updateProduct(productId: string, fields: UpdateProductFields) {
  const vendorId = await requireVendorId();

  // Preserve non-scalar entries (arrays like `glazes`) so the key-value
  // editor never accidentally clobbers them.
  const existing = await prisma.product.findUnique({
    where: { id: productId, vendorId },
    select: { details: true },
  });
  if (!existing) throw new Error("Not your product");
  const preserved: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(existing.details as Record<string, unknown>)) {
    if (typeof v !== "string") preserved[k] = v;
  }
  const mergedDetails = { ...preserved, ...fields.details };

  await prisma.product.update({
    where: { id: productId, vendorId },
    data: {
      title: fields.title.trim(),
      description: fields.description.trim(),
      details: mergedDetails as object,
    },
  });
  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  revalidatePath("/shop/[productId]", "page");
}

// Stock + price both live on variants now, so they get sibling actions —
// saving the whole product on every quantity or price change would be
// unnecessarily disruptive UX.
export async function updateVariantStock(variantId: string, stock: number) {
  const vendorId = await requireVendorId();
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { product: { select: { id: true, vendorId: true } } },
  });
  if (!variant || variant.product.vendorId !== vendorId) throw new Error("Not your product");

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: Math.max(0, Math.floor(stock)) },
  });
  revalidatePath(`/dashboard/products/${variant.product.id}`);
  revalidatePath("/shop/[productId]", "page");
}

export async function updateVariantPrice(variantId: string, price: number) {
  const vendorId = await requireVendorId();
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { product: { select: { id: true, vendorId: true } } },
  });
  if (!variant || variant.product.vendorId !== vendorId) throw new Error("Not your product");

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { priceCents: Math.max(0, Math.round(price * 100)) },
  });
  revalidatePath(`/dashboard/products/${variant.product.id}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  revalidatePath("/shop/[productId]", "page");
}

export async function setProductStatus(
  productId: string,
  status: "draft" | "published" | "archived",
): Promise<ImageActionResult & { pendingReview?: boolean }> {
  const vendorId = await requireVendorId();
  const product = await prisma.product.findFirst({
    where: { id: productId, vendorId },
    select: { coverImageUrl: true },
  });
  if (!product) return { ok: false, error: "Not your product" };

  // Publishing without a cover would leave /shop with a blank tile and
  // /shop/{slug} with the SVG icon fallback. Force the vendor to upload
  // a cover first.
  if (status === "published" && !product.coverImageUrl) {
    return { ok: false, error: "Add a cover photo before publishing." };
  }

  // First-listing review gate: until a vendor's first listing has been
  // approved by CodaCo (listingsAutoApprove flips true at that point),
  // a "publish" request parks the product in `pending_review` instead of
  // going live. Trusted vendors publish straight through. See
  // app/admin/listings for the approval side.
  if (status === "published") {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { listingsAutoApprove: true },
    });
    if (!vendor?.listingsAutoApprove) {
      await prisma.product.update({
        where: { id: productId },
        data: { status: "pending_review" },
      });
      revalidatePath(`/dashboard/products/${productId}`);
      revalidatePath("/dashboard/products");
      return { ok: true, pendingReview: true };
    }
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status },
  });
  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  return { ok: true };
}

// ── Product images ──────────────────────────────────────────────────────────

async function requireOwnedProduct(productId: string) {
  const vendorId = await requireVendorId();
  const product = await prisma.product.findFirst({
    where: { id: productId, vendorId },
    select: { id: true, slug: true, coverImageUrl: true },
  });
  if (!product) throw new Error("Not your product");
  return { ...product, vendorId };
}

function checkUploadRateLimit(vendorId: string, kind: string): ActionError | null {
  const limited = rateLimit(`upload:${vendorId}`, {
    limit: 100,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    log.warn("upload.rate_limited", { kind, vendorId });
    return { ok: false, error: "Too many uploads. Try again later." };
  }
  return null;
}

export async function updateProductCover(
  productId: string,
  formData: FormData,
): Promise<{ ok: true; url: string } | ActionError> {
  const product = await requireOwnedProduct(productId);

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { ok: false, error: "Pick a photo first." };
  }
  const blocked = checkUploadRateLimit(product.vendorId, "product_cover");
  if (blocked) return blocked;
  const processed = await processUploadedImage(photo);
  if (!processed.ok) return { ok: false, error: processed.error };

  const { buffer, contentType, ext } = processed.image;
  const key = `products/${product.slug}/cover-${Date.now()}.${ext}`;
  const blob = await put(key, buffer, { access: "public", contentType });

  await prisma.product.update({
    where: { id: product.id },
    data: { coverImageUrl: blob.url },
  });

  // Old blob cleanup is best-effort. Same pattern as the vendor headshot
  // action: if it fails, we leak one object but the row is correct.
  if (isOwnedBlobUrl(product.coverImageUrl)) {
    try {
      await del(product.coverImageUrl);
    } catch (err) {
      log.warn("blob.delete_failed", {
        kind: "product_cover",
        productId: product.id,
        url: product.coverImageUrl,
        err,
      });
    }
  }

  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath(`/shop/${product.slug}`);
  revalidatePath("/shop");
  return { ok: true, url: blob.url };
}

export async function addProductGalleryImage(
  productId: string,
  formData: FormData,
): Promise<
  | { ok: true; image: { id: string; url: string; sortOrder: number; alt: string | null } }
  | ActionError
> {
  const product = await requireOwnedProduct(productId);

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { ok: false, error: "Pick a photo first." };
  }

  const count = await prisma.productImage.count({
    where: { productId: product.id },
  });
  if (count >= MAX_GALLERY_IMAGES) {
    return {
      ok: false,
      error: `At most ${MAX_GALLERY_IMAGES} gallery images per product.`,
    };
  }

  const blocked = checkUploadRateLimit(product.vendorId, "product_gallery");
  if (blocked) return blocked;
  const processed = await processUploadedImage(photo);
  if (!processed.ok) return { ok: false, error: processed.error };

  const { buffer, contentType, ext } = processed.image;
  const key = `products/${product.slug}/gallery-${Date.now()}.${ext}`;
  const blob = await put(key, buffer, { access: "public", contentType });

  const max = await prisma.productImage.aggregate({
    where: { productId: product.id },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;

  const created = await prisma.productImage.create({
    data: { productId: product.id, url: blob.url, sortOrder },
  });

  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath(`/shop/${product.slug}`);
  return {
    ok: true,
    image: {
      id: created.id,
      url: created.url,
      sortOrder: created.sortOrder,
      alt: created.alt,
    },
  };
}

export async function deleteProductGalleryImage(
  imageId: string,
): Promise<ImageActionResult> {
  const vendorId = await requireVendorId();
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: {
      product: { select: { id: true, slug: true, vendorId: true } },
    },
  });
  if (!image || image.product.vendorId !== vendorId) {
    return { ok: false, error: "Not your image" };
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  if (isOwnedBlobUrl(image.url)) {
    try {
      await del(image.url);
    } catch (err) {
      log.warn("blob.delete_failed", {
        kind: "product_gallery",
        productId: image.product.id,
        imageId,
        url: image.url,
        err,
      });
    }
  }

  revalidatePath(`/dashboard/products/${image.product.id}`);
  revalidatePath(`/shop/${image.product.slug}`);
  return { ok: true };
}

export async function reorderProductGalleryImages(
  productId: string,
  orderedIds: string[],
): Promise<ImageActionResult> {
  const product = await requireOwnedProduct(productId);

  const dbImages = await prisma.productImage.findMany({
    where: { productId: product.id },
    select: { id: true },
  });
  const validIds = new Set(dbImages.map((i) => i.id));
  if (
    orderedIds.length !== validIds.size ||
    !orderedIds.every((id) => validIds.has(id))
  ) {
    return { ok: false, error: "Reorder list doesn't match this product." };
  }

  await prisma.$transaction(
    orderedIds.map((id, sortOrder) =>
      prisma.productImage.update({ where: { id }, data: { sortOrder } }),
    ),
  );

  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath(`/shop/${product.slug}`);
  return { ok: true };
}

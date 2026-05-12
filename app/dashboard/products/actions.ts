"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/api/applications";

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

export async function setProductStatus(productId: string, status: "draft" | "published" | "archived") {
  const vendorId = await requireVendorId();
  await prisma.product.update({
    where: { id: productId, vendorId },
    data: { status },
  });
  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
}

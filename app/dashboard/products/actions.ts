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
  const basePrice = Number(formData.get("basePrice") ?? 0);
  if (!title || !productTypeSlug || !(basePrice >= 0)) {
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
      basePriceCents: Math.round(basePrice * 100),
      currency: "USD",
      status: "draft",
      // Sensible default so the editor has at least one variant row to edit.
      variants: {
        create: [{ label: "Default", priceCents: Math.round(basePrice * 100), currency: "USD", stock: 0 }],
      },
    },
  });

  revalidatePath("/dashboard/products");
  redirect(`/dashboard/products/${product.id}`);
}

export interface UpdateProductFields {
  title: string;
  description: string;
  basePrice: number;
}

export async function updateProduct(productId: string, fields: UpdateProductFields) {
  const vendorId = await requireVendorId();
  await prisma.product.update({
    where: { id: productId, vendorId },
    data: {
      title: fields.title.trim(),
      description: fields.description.trim(),
      basePriceCents: Math.round(fields.basePrice * 100),
    },
  });
  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
}

// Stock is the most-edited field per the data-model plan, so it gets its
// own action — saving the whole product on every quantity change would
// be unnecessarily disruptive UX.
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

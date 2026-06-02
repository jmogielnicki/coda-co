"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { ServiceLocationType, ServicePricingModel } from "@/lib/types";

async function requireVendorId(): Promise<{ id: string; slug: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true },
  });
  if (!vendor) throw new Error("Not a vendor");
  return vendor;
}

const LOCATION_TYPES: ServiceLocationType[] = ["virtual", "in_person", "both"];
const PRICING_MODELS: ServicePricingModel[] = ["fixed", "hourly", "quote"];

export type ServiceActionResult = { ok: true } | { ok: false; error: string };

// "+ Add service" creates a blank draft and drops the vendor in the
// editor — no intermediate form. We need *some* serviceType to satisfy
// the FK, so we pick the first one alphabetically as a default; the
// editor lets the vendor change it before publishing.
export async function createBlankService() {
  const vendor = await requireVendorId();

  const defaultType = await prisma.serviceType.findFirst({
    orderBy: { name: "asc" },
    select: { id: true, slug: true },
  });
  if (!defaultType) {
    throw new Error("No service types seeded — run prisma db seed");
  }

  const baseSlug = `${vendor.slug}-service`;
  let slug = baseSlug;
  let n = 2;
  while (
    await prisma.service.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${baseSlug}-${n++}`;
  }

  const service = await prisma.service.create({
    data: {
      vendorId: vendor.id,
      serviceTypeId: defaultType.id,
      slug,
      title: "",
      description: "",
      status: "draft",
    },
  });

  revalidatePath("/dashboard/services");
  redirect(`/dashboard/services/${service.id}`);
}

export interface UpdateServiceFields {
  title: string;
  description: string;
  serviceTypeSlug: string;
  locationType: ServiceLocationType;
  pricingModel: ServicePricingModel;
  // Dollars; converted to cents on write. Ignored when pricingModel is "quote".
  price: number | null;
}

export async function updateService(
  serviceId: string,
  fields: UpdateServiceFields,
): Promise<ServiceActionResult> {
  const vendor = await requireVendorId();

  const owned = await prisma.service.findFirst({
    where: { id: serviceId, vendorId: vendor.id },
    select: { id: true, slug: true },
  });
  if (!owned) return { ok: false, error: "Not your service" };

  if (!fields.title.trim()) return { ok: false, error: "Title is required" };
  if (!LOCATION_TYPES.includes(fields.locationType) && fields.locationType !== "unknown") {
    return { ok: false, error: "Invalid location type" };
  }
  if (!PRICING_MODELS.includes(fields.pricingModel) && fields.pricingModel !== "unknown") {
    return { ok: false, error: "Invalid pricing model" };
  }

  const serviceType = await prisma.serviceType.findUnique({
    where: { slug: fields.serviceTypeSlug },
    select: { id: true },
  });
  if (!serviceType) {
    return { ok: false, error: `Unknown service type: ${fields.serviceTypeSlug}` };
  }

  // "quote" has no fixed price; "fixed" and "hourly" both want a number.
  const priceCents =
    fields.pricingModel === "quote" || fields.price == null
      ? null
      : Math.max(0, Math.round(fields.price * 100));

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      title: fields.title.trim(),
      description: fields.description.trim(),
      serviceTypeId: serviceType.id,
      locationType: fields.locationType,
      pricingModel: fields.pricingModel,
      priceCents,
    },
  });

  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
  revalidatePath("/services");
  revalidatePath(`/services/${vendor.slug}`);
  return { ok: true };
}

export async function setServiceStatus(
  serviceId: string,
  status: "draft" | "published" | "archived",
): Promise<ServiceActionResult> {
  const vendor = await requireVendorId();

  const service = await prisma.service.findFirst({
    where: { id: serviceId, vendorId: vendor.id },
    select: {
      title: true,
      description: true,
      locationType: true,
      pricingModel: true,
      priceCents: true,
    },
  });
  if (!service) return { ok: false, error: "Not your service" };

  // Publish validation — same spirit as products requiring a cover before
  // going live. A half-filled service is worse than no service.
  if (status === "published") {
    if (!service.title.trim()) {
      return { ok: false, error: "Add a title before publishing." };
    }
    if (!service.description.trim()) {
      return { ok: false, error: "Add a description before publishing." };
    }
    if (service.locationType === "unknown") {
      return { ok: false, error: "Pick a location type (virtual / in-person / both)." };
    }
    if (service.pricingModel === "unknown") {
      return { ok: false, error: "Pick a pricing model (fixed / hourly / quote)." };
    }
    if (
      (service.pricingModel === "fixed" || service.pricingModel === "hourly") &&
      (service.priceCents == null || service.priceCents <= 0)
    ) {
      return { ok: false, error: "Set a price for fixed or hourly pricing." };
    }
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: { status },
  });

  revalidatePath(`/dashboard/services/${serviceId}`);
  revalidatePath("/dashboard/services");
  revalidatePath("/services");
  revalidatePath(`/services/${vendor.slug}`);
  return { ok: true };
}

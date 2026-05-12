import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  Service,
  ServiceLocationType,
  ServicePricingModel,
  ServiceStatus,
  ServiceType,
} from "@/lib/types";

export interface ServiceFilters {
  vendorId?: string;
  serviceType?: ServiceType;
  locationType?: ServiceLocationType;
}

type DbService = Prisma.ServiceGetPayload<{
  include: { vendor: true; serviceType: true };
}>;

function toService(s: DbService): Service {
  return {
    id: s.slug,
    vendorId: s.vendor.slug,
    serviceType: s.serviceType.slug as ServiceType,
    title: s.title,
    description: s.description,
    locationType: s.locationType as ServiceLocationType,
    pricingModel: s.pricingModel as ServicePricingModel,
    price: s.priceCents != null ? s.priceCents / 100 : undefined,
    currency: s.currency,
    status: s.status as ServiceStatus,
  };
}

export async function getServices(filters: ServiceFilters = {}): Promise<Service[]> {
  const where: Prisma.ServiceWhereInput = { status: "published" };
  if (filters.vendorId) where.vendor = { slug: filters.vendorId };
  if (filters.serviceType) where.serviceType = { slug: filters.serviceType };
  if (filters.locationType && filters.locationType !== "unknown") {
    // 'both' covers either intent; an exact 'virtual' or 'in_person'
    // filter should still surface services flagged as 'both'.
    where.locationType = filters.locationType === "both"
      ? "both"
      : { in: [filters.locationType, "both"] };
  }
  const rows = await prisma.service.findMany({
    where,
    include: { vendor: true, serviceType: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toService);
}

export async function getService(id: string): Promise<Service | null> {
  const s = await prisma.service.findUnique({
    where: { slug: id },
    include: { vendor: true, serviceType: true },
  });
  return s ? toService(s) : null;
}

import { prisma } from "@/lib/db";

export interface ServiceTypeOption {
  slug: string;
  name: string;
}

// Source of truth for the catalog's service taxonomy. Filter UIs and the
// vendor application form both read from here so the dropdown options
// can't drift from what's seeded in `service_types`.
export async function getServiceTypes(): Promise<ServiceTypeOption[]> {
  return prisma.serviceType.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
}

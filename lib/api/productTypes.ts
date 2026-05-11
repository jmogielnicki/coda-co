import { prisma } from "@/lib/db";

export interface ProductTypeOption {
  slug: string;
  name: string;
}

// Source of truth for the catalog's product taxonomy. Filter UIs, the
// vendor application form, and the new-product dashboard form all read
// from here so the dropdown options can't drift from what's seeded in
// `product_types`.
export async function getProductTypes(): Promise<ProductTypeOption[]> {
  return prisma.productType.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
}

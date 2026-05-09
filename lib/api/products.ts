import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  LifeStage,
  Product,
  ProductDetail,
  ProductStatus,
  ProductType,
  ProductWithRating,
  Variant,
} from "@/lib/types";

// `relatedIds` was dropped in the data-model migration; the prototype's
// related-product slot is filled with same-product-type-and-vendor matches
// until curation is real. The shape stays so RSCs don't change.
export interface ProductFilters {
  productType?: ProductType;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  ids?: string[];
  lifeStage?: LifeStage | LifeStage[];
}

type DbProduct = Prisma.ProductGetPayload<{
  include: { vendor: true; productType: true; variants: true };
}>;

function toVariant(v: DbProduct["variants"][number]): Variant {
  return {
    id: v.id,
    label: v.label,
    price: v.priceCents / 100,
    currency: v.currency,
    stock: v.stock,
  };
}

function toProduct(p: DbProduct): Product {
  return {
    id: p.slug,
    title: p.title,
    seller: p.vendor.displayName,
    sellerId: p.vendor.slug,
    location: p.vendor.location,
    price: p.basePriceCents / 100,
    currency: p.currency,
    productType: p.productType.slug as ProductType,
    variants: p.variants.map(toVariant),
    status: p.status as ProductStatus,
    verified: p.verified,
    description: p.description,
    details: (p.details ?? {}) as ProductDetail,
    lifeStages: p.lifeStages as LifeStage[],
  };
}

// "throughout" tagged entries match any specific-stage filter, so a row
// tagged with ['throughout'] should appear when the user narrows by
// 'planning-ahead'. We expand the filter list to include 'throughout' so
// `hasSome` covers both cases in one query.
function expandLifeStageFilter(filter: LifeStage | LifeStage[]): LifeStage[] {
  const list = Array.isArray(filter) ? filter : [filter];
  if (list.includes("throughout")) return list;
  return [...list, "throughout"];
}

async function attachRatings<T extends { id: string }>(
  rows: (T & { dbId: string })[],
): Promise<(T & { rating: number; reviewCount: number })[]> {
  if (rows.length === 0) return [];
  const grouped = await prisma.productReview.groupBy({
    by: ["productId"],
    where: { productId: { in: rows.map((r) => r.dbId) } },
    _count: { _all: true },
    _avg: { rating: true },
  });
  const byId = new Map(grouped.map((g) => [g.productId, g]));
  return rows.map(({ dbId: _dbId, ...rest }) => {
    const g = byId.get(_dbId);
    return {
      ...(rest as unknown as T),
      rating: g?._avg.rating ?? 0,
      reviewCount: g?._count._all ?? 0,
    };
  });
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithRating[]> {
  // Public catalog only ever surfaces `published` rows. Drafts and
  // archived products live in the vendor dashboard via getVendorProducts.
  const where: Prisma.ProductWhereInput = { status: "published" };
  if (filters.productType) where.productType = { slug: filters.productType };
  if (filters.sellerId) where.vendor = { slug: filters.sellerId };
  if (filters.verified != null) where.verified = filters.verified;
  if (filters.ids) where.slug = { in: filters.ids };
  if (filters.lifeStage) {
    where.lifeStages = { hasSome: expandLifeStageFilter(filters.lifeStage) };
  }

  const rows = await prisma.product.findMany({
    where,
    include: { vendor: true, productType: true, variants: true },
    orderBy: { createdAt: "asc" },
  });

  // The min/max price filters target base price as the user-perceived
  // price; doing it in Prisma would require dropping into integer-cents
  // throughout. Filtering after `toProduct()` keeps the API readable.
  let mapped = rows.map((p) => ({ dbId: p.id, ...toProduct(p) }));
  if (filters.minPrice != null) mapped = mapped.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) mapped = mapped.filter((p) => p.price <= filters.maxPrice!);

  return attachRatings(mapped);
}

export async function getProduct(id: string): Promise<ProductWithRating | null> {
  // The PDP is public, so we only return published rows here. The
  // dashboard editor uses getDashboardProduct (below) to fetch drafts.
  const p = await prisma.product.findFirst({
    where: { slug: id, status: "published" },
    include: { vendor: true, productType: true, variants: true },
  });
  if (!p) return null;

  const summary = await prisma.productReview.aggregate({
    where: { productId: p.id },
    _count: { _all: true },
    _avg: { rating: true },
  });
  return {
    ...toProduct(p),
    rating: summary._avg.rating ?? 0,
    reviewCount: summary._count._all,
  };
}

// "Related" used to be a curated `relatedIds` array. Per the data-model
// migration, it's now derived: same-product-type-and-vendor first, then
// other products from the same vendor, capped to a small list.
export async function getRelatedProducts(product: Product): Promise<ProductWithRating[]> {
  const sameTypeAndVendor = await prisma.product.findMany({
    where: {
      slug: { not: product.id },
      status: "published",
      productType: { slug: product.productType },
      vendor: { slug: product.sellerId },
    },
    include: { vendor: true, productType: true, variants: true },
    take: 4,
  });

  const need = 4 - sameTypeAndVendor.length;
  const filler = need > 0
    ? await prisma.product.findMany({
        where: {
          slug: { not: product.id },
          status: "published",
          productType: { slug: product.productType },
          NOT: { id: { in: sameTypeAndVendor.map((p) => p.id) } },
        },
        include: { vendor: true, productType: true, variants: true },
        take: need,
      })
    : [];

  const combined = [...sameTypeAndVendor, ...filler];
  return attachRatings(combined.map((p) => ({ dbId: p.id, ...toProduct(p) })));
}

export async function getFeaturedProducts(limit = 6): Promise<ProductWithRating[]> {
  const rows = await prisma.product.findMany({
    where: { verified: true, status: "published" },
    include: { vendor: true, productType: true, variants: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return attachRatings(rows.map((p) => ({ dbId: p.id, ...toProduct(p) })));
}

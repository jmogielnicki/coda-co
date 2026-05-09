import { products } from "@/lib/data/products";
import { reviews } from "@/lib/data/reviews";
import { matchesLifeStage } from "@/lib/format/lifeStage";
import type { LifeStage, Product, ProductType, ProductWithRating } from "@/lib/types";

export interface ProductFilters {
  productType?: ProductType;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  ids?: string[];
  lifeStage?: LifeStage | LifeStage[];
}

function withRating(product: Product): ProductWithRating {
  const rs = reviews.filter((r) => r.productId === product.id);
  if (rs.length === 0) return { ...product, rating: 0, reviewCount: 0 };
  const sum = rs.reduce((n, r) => n + r.rating, 0);
  return { ...product, rating: sum / rs.length, reviewCount: rs.length };
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithRating[]> {
  let results = products;
  if (filters.productType) results = results.filter((p) => p.productType === filters.productType);
  if (filters.sellerId) results = results.filter((p) => p.sellerId === filters.sellerId);
  if (filters.minPrice != null) results = results.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) results = results.filter((p) => p.price <= filters.maxPrice!);
  if (filters.verified != null) results = results.filter((p) => p.verified === filters.verified);
  if (filters.ids) results = results.filter((p) => filters.ids!.includes(p.id));
  if (filters.lifeStage) {
    results = results.filter((p) => matchesLifeStage(p.lifeStages, filters.lifeStage));
  }
  return results.map(withRating);
}

export async function getProduct(id: string): Promise<ProductWithRating | null> {
  const found = products.find((p) => p.id === id);
  return found ? withRating(found) : null;
}

export async function getRelatedProducts(product: Product): Promise<ProductWithRating[]> {
  if (!product.relatedIds?.length) return [];
  return products
    .filter((p) => product.relatedIds!.includes(p.id))
    .map(withRating);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductWithRating[]> {
  return products
    .filter((p) => p.verified)
    .slice(0, limit)
    .map(withRating);
}

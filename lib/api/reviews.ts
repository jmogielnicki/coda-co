import { prisma } from "@/lib/db";
import type { Review, ReviewSummary } from "@/lib/types";

async function lookupProductDbId(productSlug: string): Promise<string | null> {
  const p = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  return p?.id ?? null;
}

export async function getReviews(productId: string): Promise<Review[]> {
  const dbId = await lookupProductDbId(productId);
  if (!dbId) return [];
  const rows = await prisma.productReview.findMany({
    where: { productId: dbId },
    orderBy: { reviewedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    productId,
    reviewer: r.reviewerName,
    location: r.reviewerLocation,
    date: r.reviewedAt.toISOString().slice(0, 10),
    rating: r.rating,
    body: r.body,
  }));
}

export async function getReviewSummary(
  productId: string,
): Promise<ReviewSummary | null> {
  const dbId = await lookupProductDbId(productId);
  if (!dbId) return null;
  const grouped = await prisma.productReview.groupBy({
    by: ["rating"],
    where: { productId: dbId },
    _count: { _all: true },
  });
  if (grouped.length === 0) return null;
  const total = grouped.reduce((n, r) => n + r._count._all, 0);
  const sum = grouped.reduce((n, r) => n + r.rating * r._count._all, 0);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: grouped.find((r) => r.rating === stars)?._count._all ?? 0,
  }));
  return { productId, average: sum / total, total, distribution };
}

export async function getProductRating(
  productId: string,
): Promise<{ rating: number; reviewCount: number }> {
  const dbId = await lookupProductDbId(productId);
  if (!dbId) return { rating: 0, reviewCount: 0 };
  const summary = await prisma.productReview.aggregate({
    where: { productId: dbId },
    _count: { _all: true },
    _avg: { rating: true },
  });
  return {
    rating: summary._avg.rating ?? 0,
    reviewCount: summary._count._all,
  };
}

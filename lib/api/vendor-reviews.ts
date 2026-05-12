import { prisma } from "@/lib/db";
import type { VendorReview, VendorReviewSummary } from "@/lib/types";

async function lookupVendorDbId(vendorSlug: string): Promise<string | null> {
  const v = await prisma.vendorProfile.findUnique({
    where: { slug: vendorSlug },
    select: { id: true },
  });
  return v?.id ?? null;
}

export async function getVendorReviews(vendorId: string): Promise<VendorReview[]> {
  const dbId = await lookupVendorDbId(vendorId);
  if (!dbId) return [];
  const rows = await prisma.vendorReview.findMany({
    where: { vendorId: dbId },
    orderBy: { reviewedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    vendorId,
    reviewer: r.reviewerName,
    location: r.reviewerLocation,
    date: r.reviewedAt.toISOString().slice(0, 10),
    rating: r.rating,
    body: r.body,
  }));
}

export async function getVendorReviewSummary(
  vendorId: string,
): Promise<VendorReviewSummary | null> {
  const dbId = await lookupVendorDbId(vendorId);
  if (!dbId) return null;
  const grouped = await prisma.vendorReview.groupBy({
    by: ["rating"],
    where: { vendorId: dbId },
    _count: { _all: true },
  });
  if (grouped.length === 0) return null;
  const total = grouped.reduce((n, r) => n + r._count._all, 0);
  const sum = grouped.reduce((n, r) => n + r.rating * r._count._all, 0);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: grouped.find((r) => r.rating === stars)?._count._all ?? 0,
  }));
  return { vendorId, average: sum / total, total, distribution };
}

export async function getVendorRating(
  vendorId: string,
): Promise<{ rating: number; reviewCount: number }> {
  const dbId = await lookupVendorDbId(vendorId);
  if (!dbId) return { rating: 0, reviewCount: 0 };
  const summary = await prisma.vendorReview.aggregate({
    where: { vendorId: dbId },
    _count: { _all: true },
    _avg: { rating: true },
  });
  return {
    rating: summary._avg.rating ?? 0,
    reviewCount: summary._count._all,
  };
}

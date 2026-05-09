import { vendorReviews } from "@/lib/data/vendor-reviews";
import type { VendorReview, VendorReviewSummary } from "@/lib/types";

export async function getVendorReviews(vendorId: string): Promise<VendorReview[]> {
  return vendorReviews.filter((r) => r.vendorId === vendorId);
}

export async function getVendorReviewSummary(
  vendorId: string,
): Promise<VendorReviewSummary | null> {
  const matching = vendorReviews.filter((r) => r.vendorId === vendorId);
  if (matching.length === 0) return null;
  const total = matching.length;
  const sum = matching.reduce((n, r) => n + r.rating, 0);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: matching.filter((r) => r.rating === stars).length,
  }));
  return { vendorId, average: sum / total, total, distribution };
}

export async function getVendorRating(
  vendorId: string,
): Promise<{ rating: number; reviewCount: number }> {
  const matching = vendorReviews.filter((r) => r.vendorId === vendorId);
  if (matching.length === 0) return { rating: 0, reviewCount: 0 };
  const sum = matching.reduce((n, r) => n + r.rating, 0);
  return { rating: sum / matching.length, reviewCount: matching.length };
}

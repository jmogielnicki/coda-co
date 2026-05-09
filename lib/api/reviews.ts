import { reviews } from "@/lib/data/reviews";
import type { Review, ReviewSummary } from "@/lib/types";

export async function getReviews(productId: string): Promise<Review[]> {
  return reviews.filter((r) => r.productId === productId);
}

export async function getReviewSummary(
  productId: string,
): Promise<ReviewSummary | null> {
  const matching = reviews.filter((r) => r.productId === productId);
  if (matching.length === 0) return null;
  const total = matching.length;
  const sum = matching.reduce((n, r) => n + r.rating, 0);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: matching.filter((r) => r.rating === stars).length,
  }));
  return { productId, average: sum / total, total, distribution };
}

export async function getProductRating(
  productId: string,
): Promise<{ rating: number; reviewCount: number }> {
  const matching = reviews.filter((r) => r.productId === productId);
  if (matching.length === 0) return { rating: 0, reviewCount: 0 };
  const sum = matching.reduce((n, r) => n + r.rating, 0);
  return { rating: sum / matching.length, reviewCount: matching.length };
}

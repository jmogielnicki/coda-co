import type { Review, VendorReview } from "@/lib/types";
import { Stars } from "@/components/ui/Stars";
import { formatMonthYear } from "@/lib/format/date";

export function ReviewCard({ review }: { review: Review | VendorReview }) {
  return (
    <div className="py-5 border-b border-line last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-medium text-ch">{review.reviewer}</span>
        <span className="text-[12px] text-ink">{formatMonthYear(review.date)}</span>
      </div>
      <div className="text-[11px] text-ink mb-2">{review.location}</div>
      <Stars rating={review.rating} className="text-[13px] mb-2 block" />
      <p className="text-[13px] text-ink leading-relaxed">{review.body}</p>
    </div>
  );
}

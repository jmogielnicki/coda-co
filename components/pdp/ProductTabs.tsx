"use client";

import { useState } from "react";
import type { ProductWithRating, Review, ReviewSummary } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Stars } from "@/components/ui/Stars";

interface ProductTabsProps {
  product: ProductWithRating;
  reviews: Review[];
  summary: ReviewSummary | null;
  sellerBio?: string;
}

const TABS = [
  { id: "desc", label: "Description" },
  { id: "details", label: "Details & dimensions" },
  { id: "reviews", label: (count: number) => `Reviews (${count})` },
  { id: "seller", label: "About the seller" },
];

export function ProductTabs({ product, reviews, summary, sellerBio }: ProductTabsProps) {
  const [active, setActive] = useState("desc");

  // The free-form `details` JSONB can hold scalar strings (rendered as rows
  // here) or array values like `glazes` (rendered elsewhere — skip them).
  const detailRows = Object.entries(product.details).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-line px-10">
        {TABS.map((tab) => {
          const label =
            tab.id === "reviews" && typeof tab.label === "function"
              ? tab.label(product.reviewCount)
              : (tab.label as string);
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={[
                "px-5 py-4 text-[13px] cursor-pointer border-b-2 -mb-px transition-colors",
                active === tab.id
                  ? "border-tr text-tr font-medium"
                  : "border-transparent text-ink hover:text-ch",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="px-10 py-8 max-w-[680px]">
        {active === "desc" && (
          <div className="text-[14px] text-ink leading-[1.8] whitespace-pre-line">
            {product.description}
          </div>
        )}

        {active === "details" && (
          <div>
            {detailRows.map(([key, val]) => (
              <div
                key={key}
                className="flex py-2.5 border-b border-line last:border-b-0"
              >
                <span className="text-[13px] text-ink capitalize w-[160px] flex-shrink-0">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="text-[13px] text-ch">{val}</span>
              </div>
            ))}
          </div>
        )}

        {active === "reviews" && (
          <div>
            {summary && (
              <div className="flex items-center gap-6 mb-6 pb-5 border-b border-line">
                <div className="text-center">
                  <div className="font-serif text-[40px] font-light text-ch leading-none">
                    {summary.average.toFixed(1)}
                  </div>
                  <Stars rating={summary.average} className="text-[13px] block" />
                  <div className="text-[11px] text-ink">{summary.total} reviews</div>
                </div>
                <div className="flex-1">
                  {summary.distribution.map((row) => (
                    <div key={row.stars} className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] text-ink w-5">{row.stars}★</span>
                      <div className="flex-1 bg-line h-1.5 rounded-full">
                        <div
                          className="bg-tr h-full rounded-full"
                          style={{
                            width: `${summary.total > 0 ? (row.count / summary.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-ink w-5">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reviews.length > 0 ? (
              reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <p className="text-[13px] text-ink">No reviews yet.</p>
            )}
          </div>
        )}

        {active === "seller" && (
          <div className="flex gap-4">
            <Avatar
              initials={product.seller.slice(0, 2).toUpperCase()}
              size="lg"
            />
            <div>
              <div className="text-[16px] font-medium text-ch mb-1">{product.seller}</div>
              <div className="text-[13px] text-ink mb-3">{product.location}</div>
              <p className="text-[13px] text-ink leading-relaxed">
                {sellerBio ?? "A trusted CodaCo seller."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

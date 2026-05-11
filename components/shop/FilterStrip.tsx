"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterPill } from "@/components/ui/filters/FilterPill";
import { LifeStageChips } from "@/components/ui/filters/LifeStageChips";
import type { ProductTypeOption } from "@/lib/api/productTypes";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "most-reviewed", label: "Most reviewed" },
];

export function FilterStrip({ productTypes }: { productTypes: ProductTypeOption[] }) {
  const { get, setParam } = useFilterParams();
  const activeCategory = get("category");
  const activeSort = get("sort") || "featured";

  return (
    <div className="mb-6 space-y-2">
      <LifeStageChips />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[13px] text-cl mr-1">Filter:</span>
        <FilterPill
          label="All"
          active={!activeCategory}
          onClick={() => setParam("category", "")}
        />
        {productTypes.map((t) => (
          <FilterPill
            key={t.slug}
            label={t.name}
            active={activeCategory === t.slug}
            onClick={() => setParam("category", t.slug)}
          />
        ))}

        <div className="ml-auto flex items-center gap-2 text-[13px] text-cm">
          <span>Sort:</span>
          <select
            value={activeSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="border border-line-bold rounded-[6px] px-2 py-1 text-[13px] text-cm bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

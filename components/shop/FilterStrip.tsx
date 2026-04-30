"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "urns", label: "Urns & vessels" },
  { value: "jewelry", label: "Ash jewelry" },
  { value: "shrouds", label: "Burial shrouds" },
  { value: "planning", label: "Planning docs" },
  { value: "memorial", label: "Memorial items" },
  { value: "humor", label: "Gifts & humor" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "most-reviewed", label: "Most reviewed" },
];

export function FilterStrip() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "featured";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      <span className="text-[13px] text-cl mr-1">Filter:</span>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setParam("category", cat.value)}
          className={`filter-pill ${activeCategory === cat.value ? "filter-pill-on" : "filter-pill-off"}`}
        >
          {cat.label}
        </button>
      ))}

      <div className="ml-auto flex items-center gap-2 text-[13px] text-cm">
        <span>Sort:</span>
        <select
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="border border-[rgba(44,40,37,.2)] rounded-[6px] px-2 py-1 text-[13px] text-cm bg-white cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

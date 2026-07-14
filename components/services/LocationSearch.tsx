"use client";

import { useState } from "react";
import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { normalizeZip } from "@/lib/geo/zip";

// Live location filter for the services search. Writes the searcher's
// zip into the `near` URL param; the page RSC re-renders and getVendors
// applies the vendor service-area filter. Accepts a bare zip or free
// text containing one ("Boulder, CO 80301"); a 5-digit zip is pulled
// out on submit. Clearing the field removes the filter.
//
// Imports only the pure helper from lib/geo/zip — never lib/geo — so the
// zipcodes dataset stays out of the client bundle.
export function LocationSearch() {
  const { get, setParam } = useFilterParams();
  const [value, setValue] = useState(get("near"));

  // Apply whatever's in the box as the `near` filter. Empties / inputs
  // with no resolvable zip clear the filter. Guarded so blurring without
  // an actual change doesn't fire a redundant navigation.
  function apply() {
    const next = normalizeZip(value) ?? "";
    if (next !== get("near")) setParam("near", next);
  }

  return (
    <>
      <div className="flex flex-1 min-w-[180px] border-[1.5px] border-line-bold rounded-[8px] overflow-hidden bg-white">
        <div className="px-3 py-2.5 border-r border-line flex items-center">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="7" r="3.5" stroke="#9A9189" strokeWidth="1.3" />
            <path d="M8 10.5 L8 14" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <input
          className="flex-1 border-0 px-3.5 py-2.5 font-sans text-[13px] text-ch outline-none bg-transparent"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={apply}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply();
          }}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Zip code…"
          aria-label="Search by zip code"
        />
      </div>
      <button
        onClick={apply}
        className="bg-tr text-white border-0 px-[22px] py-[11px] rounded-[8px] text-[13px] font-sans cursor-pointer hover:bg-tr-d transition-colors whitespace-nowrap"
      >
        Search
      </button>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { approveListing, rejectListing } from "./actions";

interface Listing {
  id: string;
  title: string;
  slug: string;
  productType: string;
  priceLabel: string;
  vendorName: string;
  vendorEmail: string;
  hasCover: boolean;
  submittedAt: string;
}

export function ListingRow({ listing }: { listing: Listing }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: (id: string) => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn(listing.id);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <tr className="border-b border-pl2">
      <td className="px-4 py-3 align-top">
        <div className="text-[13px] font-medium text-ch">{listing.title}</div>
        <div className="text-[11px] text-cl">slug: {listing.slug}</div>
        {!listing.hasCover && (
          <div className="text-[11px] text-tr-d mt-0.5">No cover photo</div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="text-[13px] text-ch">{listing.vendorName}</div>
        <div className="text-[11px] text-cl">{listing.vendorEmail}</div>
      </td>
      <td className="px-4 py-3 align-top text-[12px] text-cm">{listing.productType}</td>
      <td className="px-4 py-3 align-top text-[12px] text-cm tabular-nums">{listing.priceLabel}</td>
      <td className="px-4 py-3 align-top text-[12px] text-cm">{listing.submittedAt}</td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-2 min-w-[140px]">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(approveListing)}
            className="btn-primary btn-sm disabled:opacity-60"
          >
            {pending ? "…" : "Approve & publish"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(rejectListing)}
            className="btn-ghost btn-sm disabled:opacity-60"
          >
            Send back to draft
          </button>
          {error && <span className="text-[11px] text-tr-d">{error}</span>}
        </div>
      </td>
    </tr>
  );
}

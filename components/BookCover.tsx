"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

type BookCoverProps = {
  isbn: string;
  /** ISBN to source the cover image from, when it differs from the buy-link
   * ISBN (e.g. a cleaner cover lives on another edition). Defaults to `isbn`. */
  coverIsbn?: string;
  title: string;
  author: string;
  /** Fallback spine color, used when no cover image is available. */
  bg: string;
  /** Fallback geometric overlay, used when no cover image is available. */
  overlay: ReactNode;
  /** Prefer a self-hosted `/public/books/<isbn>.jpg` over Open Library. Set
   * for titles whose Open Library cover is missing or poor. */
  localCover?: boolean;
  /** Called once when no cover is available and the spine fallback is shown. */
  onMissing?: () => void;
};

/**
 * Book cover for a /books tile, sourced in priority order:
 *   1. self-hosted `/public/books/<isbn>.jpg` (most reliable, if present)
 *   2. Open Library by ISBN (`?default=false` makes a missing cover 404
 *      rather than return a blank pixel, so `onError` fires)
 *   3. the original colored spine + geometric overlay
 * Each tier falls through to the next on load failure, so the tile is never a
 * broken image. `onMissing` fires only when every image tier fails and the
 * spine shows (used by the grid to sink cover-less tiles).
 */
export function BookCover({
  isbn,
  coverIsbn,
  title,
  author,
  bg,
  overlay,
  localCover,
  onMissing,
}: BookCoverProps) {
  const sources = [
    ...(localCover ? [`/books/${isbn}.jpg`] : []),
    `https://covers.openlibrary.org/b/isbn/${coverIsbn ?? isbn}-L.jpg?default=false`,
  ];
  const [tier, setTier] = useState(0);

  if (tier >= sources.length) {
    return (
      <div
        className="h-[168px] flex items-end p-3.5 relative overflow-hidden"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 opacity-[.13]">{overlay}</div>
        <div className="relative z-10">
          <div className="font-serif text-[17px] font-normal text-white/95 leading-[1.2]">
            {title}
          </div>
          <div className="text-[11px] text-white/70 mt-1 italic">{author}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[168px] relative overflow-hidden bg-white">
      <Image
        src={sources[tier]}
        alt={`${title} by ${author}`}
        fill
        sizes="(max-width: 768px) 50vw, 220px"
        className="object-contain p-2"
        onError={() => {
          if (tier + 1 >= sources.length) onMissing?.();
          setTier((t) => t + 1);
        }}
        unoptimized
      />
    </div>
  );
}

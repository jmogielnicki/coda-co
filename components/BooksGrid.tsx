"use client";

import { useState, type ReactNode } from "react";
import { BookCover } from "@/components/BookCover";
import { bookshopAffiliateUrl } from "@/lib/bookshop";

export type Book = {
  title: string;
  author: string;
  isbn: string;
  /** Override the cover-image ISBN when a cleaner cover lives on another
   * edition; the buy link still uses `isbn`. */
  coverIsbn?: string;
  /** Prefer a self-hosted `/public/books/<isbn>.jpg` cover. */
  localCover?: boolean;
  bg: string;
  desc: string;
  overlay: ReactNode;
};

/**
 * The /books tile grid. Tiles whose Open Library cover is missing (404) sink
 * below the ones that have a real cover. Cover availability is only known once
 * the image resolves in the browser, so ordering happens client-side: tiles
 * start in curated order and any miss moves to the bottom as it resolves.
 * `sort` is stable and keys are stable, so covers keep their relative order
 * and images don't re-download when tiles reorder.
 */
export function BooksGrid({ books }: { books: Book[] }) {
  const [missing, setMissing] = useState<ReadonlySet<string>>(new Set());

  const markMissing = (isbn: string) =>
    setMissing((prev) =>
      prev.has(isbn) ? prev : new Set(prev).add(isbn),
    );

  const ordered = [...books].sort(
    (a, b) => Number(missing.has(a.isbn)) - Number(missing.has(b.isbn)),
  );

  const renderTile = (b: Book) => (
    <a
      key={b.title}
      href={bookshopAffiliateUrl(b.isbn)}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="block bg-white border border-line rounded-[10px] overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
    >
      <BookCover
        isbn={b.isbn}
        coverIsbn={b.coverIsbn}
        title={b.title}
        author={b.author}
        bg={b.bg}
        overlay={b.overlay}
        localCover={b.localCover}
        onMissing={() => markMissing(b.isbn)}
      />
      <div className="px-4 py-3">
        <div className="text-[12px] text-cm leading-[1.5] mb-1.5">{b.desc}</div>
        <span className="text-[12px] text-tr border-b border-dotted border-tr-l">
          Find this book →
        </span>
      </div>
    </a>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {ordered.slice(0, 4).map(renderTile)}
      <p className="col-span-2 md:col-span-4 text-center text-[11px] text-cl leading-[1.5] py-1">
        This page contains affiliate links. If you make a purchase through these
        links at Bookshop.org, CodaCo may earn a commission at no extra cost to
        you.
      </p>
      {ordered.slice(4).map(renderTile)}
    </div>
  );
}

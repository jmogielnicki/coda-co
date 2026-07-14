"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { FaqList } from "@/components/list-with-us/FaqList";

interface FaqItem {
  q: string;
  a: ReactNode;
  // Plain-text fallback for search when the answer is rendered as JSX.
  searchText?: string;
  // Optional anchor id for deep-linking to this question (e.g. /faq#some-id).
  id?: string;
}

export interface FaqCategory {
  heading: string;
  faqs: FaqItem[];
}

function answerText(faq: FaqItem): string {
  return faq.searchText ?? (typeof faq.a === "string" ? faq.a : "");
}

export function FaqBrowser({
  categories,
  accent = "tr",
  searchPlaceholder = "Search questions…",
}: {
  categories: FaqCategory[];
  accent?: "tr" | "sg";
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const isSage = accent === "sg";
  const headingColor = isSage ? "text-sg-d" : "text-tr";
  const linkColor = isSage ? "text-sg-d" : "text-tr";
  const iconStroke = isSage ? "#4D7255" : "#C1634F";
  const inputBorder = isSage
    ? "border-sg-l focus:border-sg"
    : "border-[rgba(193,99,79,.25)] focus:border-tr";

  // Land at the top on load. Next's scroll-to-top on navigation is otherwise
  // disrupted by the global `scroll-behavior: smooth`, leaving this long page
  // mid-scroll. Skip when a hash is present so deep-linked questions still
  // scroll to their own anchor (handled in FaqList).
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  const filtered = q
    ? categories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter(
            (faq) =>
              faq.q.toLowerCase().includes(q) ||
              answerText(faq).toLowerCase().includes(q),
          ),
        }))
        .filter((cat) => cat.faqs.length > 0)
    : categories;

  const totalMatches = filtered.reduce((n, cat) => n + cat.faqs.length, 0);

  return (
    <div>
      {/* Search — mirrors the landing HeroSearch input, wired to live filter */}
      <div className="relative max-w-[500px] mx-auto mb-10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="absolute left-5 top-1/2 -translate-y-1/2"
        >
          <circle cx="7" cy="7" r="5" stroke={iconStroke} strokeWidth="1.5" />
          <line
            x1="11"
            y1="11"
            x2="15"
            y2="15"
            stroke={iconStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search frequently asked questions"
          className={`w-full pl-12 pr-5 py-3.5 border-[1.5px] ${inputBorder} rounded-[28px] bg-white text-[14px] text-ch outline-none placeholder:text-cl`}
        />
      </div>

      {totalMatches === 0 ? (
        <p className="text-center text-[14px] text-cm leading-[1.7]">
          We couldn&apos;t find anything matching{" "}
          <span className="text-ch font-medium">
            &ldquo;{query.trim()}&rdquo;
          </span>
          . Try a different word, or{" "}
          <Link href="/where-to-start" className={`${linkColor} hover:underline`}>
            start here
          </Link>{" "}
          for a gentle guide.
        </p>
      ) : (
        <div className="space-y-9">
          {filtered.map((cat) => (
            <div key={cat.heading}>
              <h3 className={`text-overline ${headingColor} mb-1`}>
                {cat.heading}
              </h3>
              {/* Remount on query change so accordion state resets per search */}
              <FaqList key={q} faqs={cat.faqs} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

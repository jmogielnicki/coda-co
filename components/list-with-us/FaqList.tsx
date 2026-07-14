"use client";

import { useEffect, useState, type ReactNode } from "react";

interface Faq {
  q: string;
  a: ReactNode;
  // Optional anchor id so a question can be deep-linked (e.g. /faq#some-id),
  // which opens it and scrolls it into view on load.
  id?: string;
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // On load, open + scroll to the question whose id matches the URL hash.
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const hash = decodeURIComponent(raw);
    const idx = faqs.findIndex((faq) => faq.id === hash);
    if (idx === -1) return;
    setOpenIdx(idx);
    // Consume the hash so later remounts (e.g. clearing a search) don't re-jump.
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    requestAnimationFrame(() => {
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [faqs]);

  return (
    <div>
      {faqs.map((faq, i) => {
        const isOpen = openIdx === i;
        const isLast = i === faqs.length - 1;
        return (
          <div
            key={i}
            id={faq.id}
            onClick={() => setOpenIdx(isOpen ? null : i)}
            className={[
              "py-[.9rem] cursor-pointer scroll-mt-24",
              isLast ? "" : "border-b border-[rgba(44,40,37,.1)]",
            ].join(" ")}
          >
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-medium text-ch">{faq.q}</span>
              <span className="text-[18px] text-tr leading-none">
                {isOpen ? "−" : "+"}
              </span>
            </div>
            {isOpen && (
              <div className="text-[13px] text-cm leading-[1.7] mt-2.5 pr-8">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

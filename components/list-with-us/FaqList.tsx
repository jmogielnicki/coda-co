"use client";

import { useState } from "react";

interface Faq {
  q: string;
  a: string;
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div>
      {faqs.map((faq, i) => {
        const isOpen = openIdx === i;
        const isLast = i === faqs.length - 1;
        return (
          <div
            key={i}
            onClick={() => setOpenIdx(isOpen ? null : i)}
            className={[
              "py-[.9rem] cursor-pointer",
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

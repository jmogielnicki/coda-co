import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqBrowser } from "@/components/faq/FaqBrowser";
import { helpCenterCategories } from "@/components/faq/content";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Help Center — CodaCo",
  description:
    "Answers about browsing, buying, booking, and selling on CodaCo. Search or browse common questions.",
};

export default function FaqPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Help Center" }]}
      />

      {/* Hero — functional framing */}
      <section className="bg-white px-10 pt-16 pb-10 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-3">
          Help Center
        </p>
        <h1 className="font-serif text-[46px] font-light leading-[1.13] text-ch mb-4">
          How can we <em className="italic text-tr">help?</em>
        </h1>
        <p className="text-[15px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          Answers about browsing, buying, booking, and selling on CodaCo. Search
          or browse the questions below.
        </p>
      </section>

      {/* Search + browse */}
      <section className="bg-pl px-10 pt-10 pb-16">
        <Container width="narrow">
          {/* Bridge to the guidance library for grieving / planning visitors */}
          <div className="bg-sg-p border border-sg-l rounded-[12px] px-6 py-4 max-w-[560px] mx-auto mb-10 text-center">
            <p className="text-[13px] text-cm leading-[1.7]">
              Navigating a death or planning ahead? Our{" "}
              <Link
                href="/guidance"
                className="text-sg-d font-medium hover:underline"
              >
                guidance on death &amp; dying
              </Link>{" "}
              offers gentle, in-depth support.
            </p>
          </div>

          <FaqBrowser categories={helpCenterCategories} />

          <p className="text-center text-[13px] text-cl leading-[1.7] mt-12">
            Still have a question? Reach out to a provider directly from their
            profile, or{" "}
            <Link href="/guidance" className="text-tr hover:underline">
              explore our guidance
            </Link>{" "}
            on death and dying.
          </p>
        </Container>
      </section>
    </>
  );
}

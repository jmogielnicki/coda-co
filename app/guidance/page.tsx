import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqBrowser } from "@/components/faq/FaqBrowser";
import { guidanceCategories } from "@/components/faq/content";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Guidance & support — CodaCo",
  description:
    "Gentle, in-depth guidance on death and dying — what to do when someone dies, funerals and body disposition, and working with a death doula.",
};

export default function GuidancePage() {
  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Guidance" }]}
      />

      {/* Hero — warm, unhurried framing */}
      <section className="bg-white px-10 pt-16 pb-10 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-sg-d mb-3">
          Guidance &amp; support
        </p>
        <h1 className="font-serif text-[46px] font-light leading-[1.13] text-ch mb-4">
          Support around{" "}
          <em className="italic text-sg-d">death &amp; dying</em>
        </h1>
        <p className="text-[15px] text-cm max-w-[560px] mx-auto leading-[1.75]">
          Whether you are feeling completely overwhelmed or have a specific
          question, this section is designed to help. Use our search bar or
          browse common questions below.
        </p>
      </section>

      {/* Search + browse */}
      <section className="bg-pl px-10 pt-10 pb-16">
        <Container width="narrow">
          <FaqBrowser
            categories={guidanceCategories}
            accent="sg"
            searchPlaceholder="Search guidance…"
          />

          <p className="text-center text-[13px] text-cl leading-[1.7] mt-12">
            For help with an order or your account, visit the{" "}
            <Link href="/faq" className="text-sg-d hover:underline">
              Help Center
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "Submission received — CodaCo",
};

const nextSteps = [
  {
    num: "01",
    heading: "Review (1–2 business days)",
    body: "Our team reviews every listing to ensure it meets CodaCo standards. We check for quality, accuracy, and alignment with our marketplace values.",
  },
  {
    num: "02",
    heading: "Verification",
    body: "For service providers, we may reach out to request credentials or verification documents. Goods sellers may be asked to provide additional photos.",
  },
  {
    num: "03",
    heading: "Go live",
    body: "Once approved, your listing goes live and begins appearing in search results. You'll receive an email with your listing link.",
  },
];

export default function ConfirmPage() {
  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List with us", href: "/list-with-us" },
          { label: "Submission received" },
        ]}
      />

      <section className="bg-tr-vp px-10 py-16 text-center">
        {/* Checkmark icon */}
        <div className="w-16 h-16 rounded-full bg-sg-p border-2 border-sg flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
              d="M7 16 L13 22 L25 10"
              stroke="#4D7255"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-2">Submitted</p>
        <h1 className="font-serif text-[42px] font-light text-ch mb-4">You&apos;re in the queue.</h1>
        <p className="text-[15px] text-ink max-w-[460px] mx-auto leading-relaxed">
          Your listing has been received. Our team will review it within 1–2 business days and
          send you a confirmation email at the address you provided.
        </p>
      </section>

      <section className="bg-white px-10 py-14">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-serif text-[28px] font-light text-ch mb-8 text-center">
            What happens next
          </h2>
          <div className="flex flex-col gap-6">
            {nextSteps.map((step) => (
              <div key={step.num} className="flex gap-5 items-start">
                <div className="font-serif text-[28px] font-light text-tr-l leading-none pt-1 w-10 flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <div className="text-[15px] font-medium text-ch mb-1">{step.heading}</div>
                  <p className="text-[13px] text-cm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sg-vp px-10 py-12 text-center">
        <h2 className="font-serif text-[24px] font-light text-ch mb-3">While you wait</h2>
        <p className="text-[13px] text-cm max-w-[420px] mx-auto mb-6 leading-relaxed">
          Explore the marketplace, see how other sellers present their work, and get inspired for
          your next listing.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/shop"
            className="bg-sg text-white px-6 py-3 rounded-full text-[13px] no-underline hover:bg-sg-d transition-colors"
          >
            Browse the marketplace
          </Link>
          <Link
            href="/"
            className="border border-[rgba(44,40,37,.25)] text-ch px-6 py-3 rounded-full text-[13px] no-underline hover:border-tr hover:text-tr transition-all"
          >
            Return home
          </Link>
        </div>
      </section>
    </>
  );
}

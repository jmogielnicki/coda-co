import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getPlans } from "@/lib/api/plans";

export const metadata: Metadata = {
  title: "Choose a plan — CodaCo",
};

interface PlanPageProps {
  searchParams: Promise<{ type?: "goods" | "services" }>;
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const { type = "goods" } = await searchParams;
  const plans = await getPlans(type);

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List with us", href: "/list-with-us" },
          { label: "Choose a plan" },
        ]}
      />

      <section className="bg-tr-vp px-10 py-14">
        <div className="max-w-[740px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-2">Pricing</p>
            <h1 className="font-serif text-[38px] font-light text-ch">Choose a plan</h1>
            <p className="text-[14px] text-ink mt-2">Start free. Upgrade when you are ready.</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={[
                  "bg-white rounded-[14px] border p-6 cursor-pointer transition-all hover:-translate-y-0.5",
                  plan.popular
                    ? "border-tr shadow-[0_4px_20px_rgba(193,99,79,.15)]"
                    : "border-[rgba(44,40,37,.1)]",
                ].join(" ")}
              >
                {plan.popular && (
                  <div className="text-[10px] bg-tr text-white px-2 py-0.5 rounded-full inline-block mb-3">
                    Most popular
                  </div>
                )}
                <div className="text-[18px] font-medium text-ch mb-1">{plan.name}</div>
                <div className="font-serif text-[32px] font-light text-tr mb-4">
                  {plan.price == null ? "Free" : `$${plan.price}`}
                  {plan.period && (
                    <span className="text-[14px] text-cl font-sans">/{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-[13px] text-cm flex items-start gap-2">
                      <span className="text-sg mt-px flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="text-[11px] text-cl border-t border-[rgba(44,40,37,.08)] pt-3">
                  {plan.transactionFee}
                </div>
                <Link
                  href="/list-with-us/confirm"
                  className={[
                    "block text-center mt-4 px-4 py-2.5 rounded-full text-[13px] no-underline transition-colors",
                    plan.popular
                      ? "bg-tr text-white hover:bg-tr-d"
                      : "border border-[rgba(44,40,37,.2)] text-ch hover:border-tr hover:text-tr",
                  ].join(" ")}
                >
                  Select {plan.name}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-[12px] text-ink">
            All plans include CodaCo buyer protection, secure messaging, and vetting support.
          </p>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { requireVendor } from "./lib";

export const metadata: Metadata = {
  title: "Dashboard — CodaCo",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { vendor } = await requireVendor();

  const [productCount, draftCount, serviceCount] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id, status: "published" } }),
    prisma.product.count({ where: { vendorId: vendor.id, status: "draft" } }),
    prisma.service.count({ where: { vendorId: vendor.id } }),
  ]);

  const subscription = vendor.subscriptions[0];

  return (
    <>
      <Breadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
            <h1 className="font-serif text-[32px] font-light text-ch">{vendor.displayName}</h1>
            <p className="text-[13px] text-cl mt-1.5">
              {vendor.kind === "services" ? "Services provider" : "Goods seller"} ·{" "}
              {subscription
                ? `${subscription.planId} plan`
                : "No active subscription"}{" "}
              · {vendor.location}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
            <DashStat label="Published products" value={productCount} />
            <DashStat label="Draft products" value={draftCount} />
            <DashStat label="Services" value={serviceCount} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashCard
              title="Your products"
              body={
                productCount + draftCount === 0
                  ? "Add your first product so buyers can find it."
                  : `${productCount + draftCount} total. Edit, publish, and adjust stock.`
              }
              href="/dashboard/products"
              cta={
                productCount + draftCount === 0
                  ? "Create a product →"
                  : "Manage products →"
              }
            />
            <DashCard
              title="Your public profile"
              body={`Edit your photo and bio — buyers see this at /services/${vendor.slug}.`}
              href="/dashboard/profile"
              cta="Edit profile →"
            />
          </div>
        </Container>
      </section>
    </>
  );
}

function DashStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-[10px] border border-line px-5 py-4">
      <p className="font-serif text-[28px] font-light text-ch tabular-nums">{value}</p>
      <p className="text-[12px] text-cm mt-0.5">{label}</p>
    </div>
  );
}

function DashCard({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="bg-white rounded-[10px] border border-line p-6">
      <h2 className="font-serif text-[20px] text-ch mb-2">{title}</h2>
      <p className="text-[13px] text-cm mb-4 leading-relaxed">{body}</p>
      <Link href={href} className="text-[13px] text-tr no-underline hover:underline">
        {cta}
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { requireVendor } from "../lib";

export const metadata: Metadata = {
  title: "Your services — CodaCo",
};

export const dynamic = "force-dynamic";

const LOCATION_LABELS: Record<string, string> = {
  virtual: "Virtual",
  in_person: "In-person",
  both: "Virtual & in-person",
  unknown: "—",
};

const PRICING_LABELS: Record<string, string> = {
  fixed: "Fixed",
  hourly: "Hourly",
  quote: "By quote",
  unknown: "—",
};

function formatPrice(pricingModel: string, priceCents: number | null): string {
  if (pricingModel === "quote") return "By quote";
  if (priceCents == null || priceCents <= 0) return "—";
  const dollars = priceCents / 100;
  return pricingModel === "hourly" ? `$${dollars}/hr` : `$${dollars}`;
}

export default async function VendorServicesPage() {
  const { vendor } = await requireVendor();

  const services = await prisma.service.findMany({
    where: { vendorId: vendor.id },
    include: { serviceType: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Services" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
              <h1 className="font-serif text-[32px] font-light text-ch">Your services</h1>
            </div>
            <Link href="/dashboard/services/new" className="btn-primary btn-md no-underline">
              + Add service
            </Link>
          </div>

          <div className="bg-white rounded-[10px] border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pl border-b border-pl2">
                <tr>
                  <Th>Title</Th>
                  <Th>Type</Th>
                  <Th>Location</Th>
                  <Th>Pricing</Th>
                  <Th>Status</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <p className="text-[14px] text-cm mb-3">
                        You haven&apos;t added any services yet.
                      </p>
                      <Link
                        href="/dashboard/services/new"
                        className="btn-primary btn-sm no-underline"
                      >
                        Add your first service →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.id} className="border-b border-pl2">
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-medium text-ch">{s.title}</div>
                        <div className="text-[11px] text-cl">slug: {s.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-cm">{s.serviceType.name}</td>
                      <td className="px-4 py-3 text-[12px] text-cm">
                        {LOCATION_LABELS[s.locationType] ?? s.locationType}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-cm tabular-nums">
                        {formatPrice(s.pricingModel, s.priceCents)}
                        <div className="text-[11px] text-cl">
                          {PRICING_LABELS[s.pricingModel] ?? s.pricingModel}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/services/${s.id}`}
                          className="text-[12px] text-tr no-underline hover:underline"
                        >
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-cl whitespace-nowrap">
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "published"
      ? "bg-sg-p text-sg-d"
      : status === "draft"
        ? "bg-tr-p text-tr-d"
        : "bg-pl2 text-cm";
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

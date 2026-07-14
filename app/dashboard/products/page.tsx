import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { formatPriceRange } from "@/lib/format/product";
import { requireVendor } from "../lib";

export const metadata: Metadata = {
  title: "Your products — CodaCo",
};

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
  const { vendor } = await requireVendor();

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    include: { variants: true, productType: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
              <h1 className="font-serif text-[32px] font-light text-ch">Your products</h1>
            </div>
            <Link href="/dashboard/products/new" className="btn-primary btn-md no-underline">
              + Add product
            </Link>
          </div>

          <div className="bg-white rounded-[10px] border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pl border-b border-pl2">
                <tr>
                  <Th>Title</Th>
                  <Th>Type</Th>
                  <Th>Price</Th>
                  <Th>Total stock</Th>
                  <Th>Status</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <p className="text-[14px] text-cm mb-3">
                        You haven&apos;t added any products yet.
                      </p>
                      <Link href="/dashboard/products/new" className="btn-primary btn-sm no-underline">
                        Add your first product →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const totalStock = p.variants.reduce((n, v) => n + v.stock, 0);
                    const prices = p.variants.map((v) => v.priceCents / 100);
                    const priceMin = prices.length ? Math.min(...prices) : 0;
                    const priceMax = prices.length ? Math.max(...prices) : 0;
                    return (
                      <tr key={p.id} className="border-b border-pl2">
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium text-ch">{p.title}</div>
                          <div className="text-[11px] text-cl">slug: {p.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-cm">{p.productType.name}</td>
                        <td className="px-4 py-3 text-[12px] text-cm tabular-nums">
                          {formatPriceRange(priceMin, priceMax)}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-cm tabular-nums">{totalStock}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/products/${p.id}`}
                            className="text-[12px] text-tr no-underline hover:underline"
                          >
                            Edit →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
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
      : status === "pending_review" || status === "draft"
        ? "bg-tr-p text-tr-d"
        : "bg-pl2 text-cm";
  const label = status === "pending_review" ? "In review" : status;
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${styles}`}
    >
      {label}
    </span>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { formatPriceRange } from "@/lib/format/product";
import { ListingRow } from "./ListingRow";

export const metadata: Metadata = {
  title: "Listing review — Admin | CodaCo",
};

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin/listings");
  if (session.user.role !== "admin") redirect("/");

  const products = await prisma.product.findMany({
    where: { status: "pending_review" },
    include: {
      productType: true,
      variants: true,
      vendor: { select: { displayName: true, user: { select: { email: true } } } },
    },
    orderBy: { updatedAt: "asc" },
  });

  const listings = products.map((p) => {
    const prices = p.variants.map((v) => v.priceCents / 100);
    const priceMin = prices.length ? Math.min(...prices) : 0;
    const priceMax = prices.length ? Math.max(...prices) : 0;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      productType: p.productType.name,
      priceLabel: formatPriceRange(priceMin, priceMax),
      vendorName: p.vendor.displayName,
      vendorEmail: p.vendor.user.email,
      hasCover: p.coverImageUrl !== null,
      submittedAt: p.updatedAt.toISOString().slice(0, 10),
    };
  });

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Listing review" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Admin</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Listing review</h1>
            <p className="text-[13px] text-cl mt-1.5">
              A goods seller&apos;s first listing waits here until it&apos;s
              approved. Approving publishes it and clears the seller to publish
              future listings without review.
            </p>
          </div>

          <h2 className="text-[15px] font-medium text-ch mb-3">
            Awaiting review <span className="text-cl">({listings.length})</span>
          </h2>
          <div className="bg-white rounded-[10px] border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pl border-b border-pl2">
                <tr>
                  <Th>Listing</Th>
                  <Th>Seller</Th>
                  <Th>Type</Th>
                  <Th>Price</Th>
                  <Th>Submitted</Th>
                  <Th>Decision</Th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-cm text-sm">
                      No listings awaiting review.
                    </td>
                  </tr>
                ) : (
                  listings.map((l) => <ListingRow key={l.id} listing={l} />)
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-cl whitespace-nowrap">
      {children}
    </th>
  );
}

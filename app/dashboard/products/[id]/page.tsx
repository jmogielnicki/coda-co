import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { requireVendor } from "../../lib";
import { ProductEditor } from "./Editor";

export const metadata: Metadata = {
  title: "Edit product — CodaCo",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorProductEditorPage({ params }: PageProps) {
  const { vendor } = await requireVendor();
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, vendorId: vendor.id },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });
  if (!product) notFound();

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/dashboard/products" },
          { label: product.title },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="mid">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
              <h1 className="font-serif text-[32px] font-light text-ch">{product.title}</h1>
              <p className="text-[13px] text-cl mt-1.5">slug: {product.slug}</p>
            </div>
            {product.status === "published" && (
              <Link
                href={`/shop/${product.slug}`}
                className="text-[13px] text-tr no-underline hover:underline"
              >
                View live →
              </Link>
            )}
          </div>

          <ProductEditor
            product={{
              id: product.id,
              slug: product.slug,
              title: product.title,
              description: product.description,
              basePriceCents: product.basePriceCents,
              status: product.status,
              variants: product.variants.map((v) => ({
                id: v.id,
                label: v.label,
                priceCents: v.priceCents,
                stock: v.stock,
              })),
            }}
          />
        </Container>
      </section>
    </>
  );
}

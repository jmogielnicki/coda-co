import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { getServiceTypes } from "@/lib/api/serviceTypes";
import { prisma } from "@/lib/db";
import { requireVendor } from "../../lib";
import { ServiceEditor } from "./Editor";

export const metadata: Metadata = {
  title: "Edit service — CodaCo",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorServiceEditorPage({ params }: PageProps) {
  const { vendor } = await requireVendor();
  const { id } = await params;

  const service = await prisma.service.findFirst({
    where: { id, vendorId: vendor.id },
    include: { serviceType: true },
  });
  if (!service) notFound();

  const serviceTypes = await getServiceTypes();

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Services", href: "/dashboard/services" },
          { label: service.title },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="mid">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
              <h1 className="font-serif text-[32px] font-light text-ch">{service.title}</h1>
              <p className="text-[13px] text-cl mt-1.5">slug: {service.slug}</p>
            </div>
            {service.status === "published" && (
              <Link
                href={`/services/${vendor.slug}`}
                className="text-[13px] text-tr no-underline hover:underline"
              >
                View live →
              </Link>
            )}
          </div>

          <ServiceEditor
            service={{
              id: service.id,
              slug: service.slug,
              title: service.title,
              description: service.description,
              serviceTypeSlug: service.serviceType.slug,
              locationType: service.locationType,
              pricingModel: service.pricingModel,
              priceCents: service.priceCents,
              status: service.status,
            }}
            serviceTypes={serviceTypes}
          />
        </Container>
      </section>
    </>
  );
}

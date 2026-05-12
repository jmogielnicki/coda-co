import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { requireVendor } from "@/app/dashboard/lib";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = {
  title: "Profile — CodaCo",
};

export const dynamic = "force-dynamic";

export default async function VendorProfilePage() {
  const { vendor } = await requireVendor();

  const tone: "sage" | "terracotta" =
    vendor.photoTone === "terracotta" ? "terracotta" : "sage";

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="narrow">
          <div className="mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">
              Vendor
            </p>
            <h1 className="font-serif text-[32px] font-light text-ch">
              Your profile
            </h1>
            <p className="text-[13px] text-cl mt-1.5">
              Upload a headshot and pick the frame color buyers see on{" "}
              <Link
                href={`/services/${vendor.slug}`}
                className="text-tr no-underline hover:underline"
              >
                your public profile
              </Link>
              .
            </p>
          </div>

          <ProfileForm currentPhotoSrc={vendor.photoSrc} currentTone={tone} />
        </Container>
      </section>
    </>
  );
}

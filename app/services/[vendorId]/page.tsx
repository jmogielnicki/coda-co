import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContactVendorForm } from "@/components/services/ContactVendorForm";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stars } from "@/components/ui/Stars";
import { VendorPhoto } from "@/components/ui/VendorPhoto";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getServices } from "@/lib/api/services";
import { getVendor } from "@/lib/api/vendors";
import { getVendorReviews } from "@/lib/api/vendor-reviews";
import { formatMonthYear } from "@/lib/format/date";
import { lifeStageLabel } from "@/lib/format/lifeStage";
import { serviceTypeLabel } from "@/lib/format/vendor";

interface PageProps {
  params: Promise<{ vendorId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vendorId } = await params;
  const vendor = await getVendor(vendorId);
  if (!vendor) return { title: "Provider not found — CodaCo" };
  return {
    title: `${vendor.name} — CodaCo`,
    description: vendor.bio,
  };
}

// Splits bio on blank lines so vendors can write multi-paragraph bios
// in the dashboard's single textarea and have them render as proper
// paragraphs here.
function bioParagraphs(bio: string): string[] {
  return bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function VendorProfilePage({ params }: PageProps) {
  const { vendorId } = await params;
  const [vendor, vendorServices, vendorReviewList] = await Promise.all([
    getVendor(vendorId),
    getServices({ vendorId }),
    getVendorReviews(vendorId),
  ]);
  if (!vendor) notFound();

  const primaryType = vendorServices[0]?.serviceType;

  // Derive a default "Formats" string from the union of the vendor's
  // services' location types. The vendor's own serviceFormats string
  // overrides this when set.
  const inPerson = vendorServices.some(
    (s) => s.locationType === "in_person" || s.locationType === "both",
  );
  const virtual = vendorServices.some(
    (s) => s.locationType === "virtual" || s.locationType === "both",
  );
  const derivedFormats = [inPerson && "In-home", virtual && "Virtual"]
    .filter(Boolean)
    .join(" · ");
  const formats = vendor.serviceFormats ?? (derivedFormats || null);

  const paragraphs = bioParagraphs(vendor.bio);
  const hasReviews = vendorReviewList.length > 0;

  // Instagram display: prepend "@" for the visible label, keep handle
  // raw on the link path.
  const instagramHandle = vendor.instagramHandle ?? null;
  const instagramLabel = instagramHandle ? `@${instagramHandle}` : null;
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : null;

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Find services", href: "/services" },
          { label: vendor.name },
        ]}
      />

      {/* Hero */}
      <section className="bg-white px-10 pt-10 pb-12">
        <Container width="mid">
          <div className="flex gap-6 items-start mb-6">
            <VendorPhoto
              src={vendor.photoSrc}
              alt={vendor.name}
              initials={vendor.initials}
              size="xl"
              tone={vendor.photoTone}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-serif text-[34px] font-light text-ch leading-tight">
                  {vendor.name}
                </h1>
                {vendor.verified && (
                  <span className="text-[10px] tracking-[.06em] uppercase bg-sg-p text-sg-d border border-sg-l px-2.5 py-0.5 rounded-full">
                    CodaCo verified
                  </span>
                )}
                {vendor.lifeStages.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] tracking-[.06em] uppercase bg-tr-p text-tr-d border border-tr-l px-2.5 py-0.5 rounded-full"
                  >
                    {lifeStageLabel(s)}
                  </span>
                ))}
              </div>
              {primaryType && (
                <div className="text-[11px] tracking-[.14em] uppercase text-tr mb-3">
                  {serviceTypeLabel(primaryType)}
                </div>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mb-2">
                <span className="text-[13px] text-cm">📍 {vendor.location}</span>
                {vendor.distanceMi != null && (
                  <span className="text-[13px] text-cl">{vendor.distanceMi} mi away</span>
                )}
                {vendor.memberSince && (
                  <span className="text-[13px] text-cl">
                    CodaCo member since {formatMonthYear(vendor.memberSince)}
                  </span>
                )}
              </div>
              <Stars
                rating={vendor.rating}
                reviewCount={vendor.reviewCount}
                className="text-[13px]"
              />
              <div className="flex flex-wrap gap-3 items-center mt-5">
                <a href="#contact" className="btn-primary btn-md no-underline">
                  Contact ↗
                </a>
                <button className="btn-ghost btn-md">Save</button>
              </div>
            </div>
          </div>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-[14px] leading-[1.7] text-cm ${i < paragraphs.length - 1 ? "mb-4" : ""}`}
            >
              {p}
            </p>
          ))}
        </Container>
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-sg-vp)" />

      {/* Services + service area */}
      <section className="bg-sg-vp px-10 pt-4 pb-16">
        <Container width="mid">
          <SectionHeader
            eyebrow="At a glance"
            eyebrowTone="sg"
            title="Services & service area"
            className="mb-8"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[10px] p-6 border border-line">
              {vendor.serviceDescription && (
                <p className="text-[13px] text-cm leading-relaxed mb-5 whitespace-pre-line">
                  {vendor.serviceDescription}
                </p>
              )}
              <div className="text-[11px] tracking-[.08em] uppercase text-cl mb-3">
                Services offered
              </div>
              <ul className="space-y-3 mb-5">
                {vendorServices.length === 0 && (
                  <li className="text-[13px] text-cl italic">No services listed yet.</li>
                )}
                {vendorServices.map((s) => (
                  <li key={s.id} className="border-b border-line last:border-b-0 pb-2 last:pb-0">
                    <div className="text-[13px] font-medium text-ch">{s.title}</div>
                    <p className="text-[12px] text-cm leading-relaxed mt-0.5">{s.description}</p>
                  </li>
                ))}
              </ul>
              {vendor.pricingNotes && (
                <>
                  <div className="text-[11px] tracking-[.08em] uppercase text-cl mb-1">
                    Pricing
                  </div>
                  <p className="text-[13px] text-cm leading-relaxed mb-5 whitespace-pre-line">
                    {vendor.pricingNotes}
                  </p>
                </>
              )}
              {vendor.credentials && (
                <>
                  <div className="text-[11px] tracking-[.08em] uppercase text-cl mb-1">
                    Credentials
                  </div>
                  <div className="text-[13px] text-cm">{vendor.credentials}</div>
                </>
              )}
            </div>

            <div className="bg-white rounded-[10px] p-6 border border-line">
              <div className="text-[11px] tracking-[.08em] uppercase text-cl mb-3">
                Service area & availability
              </div>
              <dl className="text-[13px] space-y-2.5">
                <ProfileRow label="Located in">{vendor.location}</ProfileRow>
                {vendor.serviceRadius && (
                  <ProfileRow label="Radius">{vendor.serviceRadius}</ProfileRow>
                )}
                {formats && <ProfileRow label="Formats">{formats}</ProfileRow>}
                {vendor.serviceDays && (
                  <ProfileRow label="Days">{vendor.serviceDays}</ProfileRow>
                )}
                {vendor.serviceHours && (
                  <ProfileRow label="Hours">{vendor.serviceHours}</ProfileRow>
                )}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {hasReviews && (
        <>
          <WaveDivider topColor="var(--color-sg-vp)" bottomColor="var(--color-tr-vp)" />

          {/* Reviews */}
          <section className="bg-tr-vp px-10 pt-4 pb-16">
            <Container width="narrow">
              <SectionHeader eyebrow="What clients say" title="Reviews" className="mb-8" />
              <div className="text-center mb-8">
                <div className="font-serif text-[42px] font-light text-ch leading-none mb-2">
                  {vendor.rating.toFixed(1)}
                </div>
                <Stars
                  rating={vendor.rating}
                  reviewCount={vendor.reviewCount}
                  className="text-[14px]"
                />
              </div>
              <div className="space-y-4">
                {vendorReviewList.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-[10px] p-5 border border-line"
                  >
                    <Stars rating={r.rating} className="text-[13px]" />
                    <p className="font-serif text-[16px] font-light text-ch leading-[1.7] italic my-3">
                      &ldquo;{r.body}&rdquo;
                    </p>
                    <div className="text-[12px] text-cl">
                      {r.reviewer} · {r.location} · {formatMonthYear(r.date)}
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}

      <WaveDivider
        topColor={hasReviews ? "var(--color-tr-vp)" : "var(--color-sg-vp)"}
        bottomColor="var(--color-white)"
      />

      {/* Contact CTA */}
      <section id="contact" className="bg-white px-10 pt-4 pb-16 scroll-mt-24">
        <Container width="narrow">
          <div className="bg-tr-vp border border-tr-p rounded-[14px] p-8">
            <div className="text-center">
              <h2 className="font-serif text-[26px] font-light text-ch mb-3">
                Reach out to {vendor.name}
              </h2>
              <p className="text-[13px] text-ink max-w-[420px] mx-auto mb-6 leading-[1.75]">
                Send a message and {vendor.name} will reply straight to your email. Initial
                calls are free.
              </p>
            </div>
            <ContactVendorForm vendorSlug={vendor.id} vendorName={vendor.name} />
            <div className="text-center mt-4">
              <Link href="/services" className="text-[13px] text-tr no-underline hover:underline">
                Browse other providers →
              </Link>
            </div>
            {(vendor.websiteUrl || instagramLabel) && (
              <div className="text-[12px] text-cm pt-4 border-t border-tr-p mt-5 flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {vendor.websiteUrl && (
                  <a
                    href={vendor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tr no-underline hover:underline"
                  >
                    {vendor.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
                {vendor.websiteUrl && instagramLabel && <span>·</span>}
                {instagramLabel && instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tr no-underline hover:underline"
                  >
                    {instagramLabel}
                  </a>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <dt className="text-cl w-[78px] flex-shrink-0">{label}</dt>
      <dd className="text-cm flex-1">{children}</dd>
    </div>
  );
}

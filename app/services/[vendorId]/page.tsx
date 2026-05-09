import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Avatar } from "@/components/ui/Avatar";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stars } from "@/components/ui/Stars";
import { VendorPhoto } from "@/components/ui/VendorPhoto";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getServices } from "@/lib/api/services";
import { getVendor } from "@/lib/api/vendors";
import { getVendorReviews } from "@/lib/api/vendor-reviews";
import { formatMonthYear } from "@/lib/format/date";
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

interface TeamMember {
  initials: string;
  name: string;
  role: string;
  bio: string;
}

interface Offering {
  title: string;
  desc: string;
}

interface VendorExtras {
  longBio: string;
  team?: TeamMember[];
  offerings?: Offering[];
  serviceArea: {
    radius: string;
    formats: string;
    days: string;
    hours: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    instagram?: string;
  };
}

const VENDOR_EXTRAS: Record<string, VendorExtras> = {
  "threshold-wellness": {
    longBio:
      "Threshold Wellness is a Boulder-based collective of three certified end-of-life doulas. We bring decades of combined experience in nursing, hospice care, and grief work to families navigating illness, dying, and bereavement.\n\nWe practice on a sliding scale because deathcare should never be rationed by ability to pay. Sessions can be virtual, in-home, or in a hospital or facility — wherever you need us.",
    team: [
      {
        initials: "HP",
        name: "Helen Park, RN, INELDA",
        role: "Hospital & home transitions",
        bio: "Twenty years as an oncology nurse before training as a death doula. Helen leads our medical-facility work and supports families navigating ICU and hospice handoffs.",
      },
      {
        initials: "MO",
        name: "Marisol Ortega, CEND",
        role: "Cultural & ceremonial customs",
        bio: "Bilingual Spanish/English. Marisol brings ten years of bereavement and ceremony work, with a focus on multi-generational and multi-faith families.",
      },
      {
        initials: "RL",
        name: "Rae Linville, INELDA",
        role: "Dementia & family communication",
        bio: "Specializes in supporting families when a loved one has dementia or is no longer able to participate in their own end-of-life decisions.",
      },
    ],
    offerings: [
      {
        title: "Advance care planning",
        desc: "One to two sessions, in-home or virtual. We help you write a living will and document wishes.",
      },
      {
        title: "Active dying support",
        desc: "Bedside companionship and family coaching during the active phase of dying — at home, in a facility, or in hospital.",
      },
      {
        title: "Vigil sitting",
        desc: "Overnight or daytime presence so family members can rest. We sit with the dying person.",
      },
      {
        title: "Bereavement check-ins",
        desc: "Six months of follow-up calls and visits after a death. Available individually or as a family.",
      },
      {
        title: "Group circles",
        desc: "Monthly group circles for grieving families, hosted at our Boulder studio. Free to attend.",
      },
      {
        title: "Family communication",
        desc: "Facilitated family conversations and gentle mediation when relatives disagree about care or rituals.",
      },
    ],
    serviceArea: {
      radius: "25 mile radius",
      formats: "In-home, hospital/facility, and virtual",
      days: "Tue–Fri primary; weekends by arrangement",
      hours: "Morning, afternoon, and evening sessions",
    },
    contact: {
      email: "hello@thresholdwellness.co",
      phone: "(303) 555-0142",
      website: "thresholdwellness.co",
      instagram: "@thresholdwellness",
    },
  },
};

export default async function VendorProfilePage({ params }: PageProps) {
  const { vendorId } = await params;
  const [vendor, vendorServices, vendorReviewList] = await Promise.all([
    getVendor(vendorId),
    getServices({ vendorId }),
    getVendorReviews(vendorId),
  ]);
  if (!vendor) notFound();

  const extras = VENDOR_EXTRAS[vendorId];
  const primaryType = vendorServices[0]?.serviceType;

  const inPerson = vendorServices.some(
    (s) => s.locationType === "in_person" || s.locationType === "both",
  );
  const virtual = vendorServices.some(
    (s) => s.locationType === "virtual" || s.locationType === "both",
  );

  const lastTintBeforeContact = vendorReviewList.length > 0 ? "var(--color-tr-vp)" : "var(--color-sg-vp)";

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
                <button className="btn-primary btn-md">Contact ↗</button>
                <button className="btn-ghost btn-md">Save</button>
              </div>
            </div>
          </div>
          <p className="text-[14px] leading-[1.7] text-cm">{vendor.bio}</p>
        </Container>
      </section>

      {extras && (
        <>
          <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

          {/* About + team */}
          <section className="bg-tr-vp px-10 pt-2 pb-16">
            <Container width="mid">
              <SectionHeader
                eyebrow="About the practice"
                title="Who we are"
                className="mb-6"
              />
              <p className="text-[14px] leading-[1.8] text-ink whitespace-pre-line max-w-[640px] mx-auto text-center mb-10">
                {extras.longBio}
              </p>
              {extras.team && (
                <div className="grid-auto-200">
                  {extras.team.map((member) => (
                    <div
                      key={member.initials}
                      className="bg-white rounded-[10px] p-5 border border-line"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar initials={member.initials} size="md" />
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium text-ch truncate">
                            {member.name}
                          </div>
                          <div className="text-[11px] tracking-[.08em] uppercase text-cl">
                            {member.role}
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] text-cm leading-relaxed">{member.bio}</p>
                    </div>
                  ))}
                </div>
              )}
            </Container>
          </section>

          {extras.offerings && (
            <>
              <WaveDivider topColor="var(--color-tr-vp)" bottomColor="var(--color-white)" />

              {/* Offerings */}
              <section className="bg-white px-10 pt-4 pb-16">
                <Container width="mid">
                  <SectionHeader
                    eyebrow="What we offer"
                    eyebrowTone="sg"
                    title="Services we provide"
                    className="mb-8"
                  />
                  <div className="grid-auto-200">
                    {extras.offerings.map((o) => (
                      <div
                        key={o.title}
                        className="bg-pl border border-line rounded-[10px] p-5"
                      >
                        <div className="text-[14px] font-medium text-ch mb-1">{o.title}</div>
                        <p className="text-[13px] text-cm leading-relaxed">{o.desc}</p>
                      </div>
                    ))}
                  </div>
                </Container>
              </section>
            </>
          )}
        </>
      )}

      <WaveDivider
        topColor={
          extras && !extras.offerings ? "var(--color-tr-vp)" : "var(--color-white)"
        }
        bottomColor="var(--color-sg-vp)"
      />

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
                {extras?.serviceArea.radius && (
                  <ProfileRow label="Radius">{extras.serviceArea.radius}</ProfileRow>
                )}
                <ProfileRow label="Formats">
                  {extras?.serviceArea.formats ??
                    [inPerson && "In-home", virtual && "Virtual"]
                      .filter(Boolean)
                      .join(" · ")}
                </ProfileRow>
                {extras?.serviceArea.days && (
                  <ProfileRow label="Days">{extras.serviceArea.days}</ProfileRow>
                )}
                {extras?.serviceArea.hours && (
                  <ProfileRow label="Hours">{extras.serviceArea.hours}</ProfileRow>
                )}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {vendorReviewList.length > 0 && (
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

      <WaveDivider topColor={lastTintBeforeContact} bottomColor="var(--color-white)" />

      {/* Contact CTA */}
      <section className="bg-white px-10 pt-4 pb-16">
        <Container width="narrow">
          <div className="bg-tr-vp border border-tr-p rounded-[14px] p-8 text-center">
            <h2 className="font-serif text-[26px] font-light text-ch mb-3">
              Reach out to {vendor.name}
            </h2>
            <p className="text-[13px] text-ink max-w-[420px] mx-auto mb-6 leading-[1.75]">
              Send a message and the team will respond within 1–2 business days. Initial calls
              are free.
            </p>
            <div className="flex gap-3 justify-center flex-wrap mb-2">
              <button className="btn-primary btn-md">Send a message →</button>
              <Link href="/services" className="btn-ghost btn-md no-underline">
                Browse other providers
              </Link>
            </div>
            {extras?.contact && (
              <div className="text-[12px] text-cm pt-4 border-t border-tr-p mt-5 flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {extras.contact.email && <span>{extras.contact.email}</span>}
                {extras.contact.phone && <span>· {extras.contact.phone}</span>}
                {extras.contact.website && (
                  <span>
                    ·{" "}
                    <a className="text-tr no-underline hover:underline">
                      {extras.contact.website}
                    </a>
                  </span>
                )}
                {extras.contact.instagram && <span>· {extras.contact.instagram}</span>}
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

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { Container } from "@/components/ui/Container";
import { LifeStageChips } from "@/components/ui/filters/LifeStageChips";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getServices } from "@/lib/api/services";
import { getVendors } from "@/lib/api/vendors";
import { parseLifeStageParam } from "@/lib/format/lifeStage";
import type { Service, ServiceLocationType, ServiceType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Find services — CodaCo",
  description:
    "Find death doulas, estate attorneys, grief counselors, and other end-of-life service providers near you.",
};

interface ServicesPageProps {
  searchParams: Promise<{
    type?: string;
    minRating?: string;
    locationType?: string;
    verified?: string;
    lifeStage?: string;
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  doula: "Death doula",
  attorney: "Estate attorney",
  cleaner: "Death cleaning",
  celebrant: "Celebrant",
  organizer: "EOL organizer",
  "home-funeral": "Home funeral",
  "green-burial": "Green burial",
  cafe: "Death cafe",
  "life-celebration": "Celebration of life planner",
};

const VALID_LOCATION_TYPES = new Set<ServiceLocationType>([
  "virtual",
  "in_person",
  "both",
]);

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { type, minRating, locationType: locParam, verified, lifeStage } =
    await searchParams;

  const serviceType = (type ?? undefined) as ServiceType | undefined;
  const locationType = locParam && VALID_LOCATION_TYPES.has(locParam as ServiceLocationType)
    ? (locParam as ServiceLocationType)
    : undefined;

  const [matchedServices, allServices, allVendors] = await Promise.all([
    getServices({ serviceType, locationType }),
    getServices(),
    getVendors({
      verified: verified === "1" ? true : undefined,
      lifeStage: parseLifeStageParam(lifeStage),
      minRating: minRating ? parseFloat(minRating) : undefined,
    }),
  ]);

  const vendorIds = new Set(matchedServices.map((s) => s.vendorId));
  const vendors = allVendors.filter((v) => vendorIds.has(v.id));

  // Group services by vendor for card display.
  const servicesByVendor = new Map<string, Service[]>();
  for (const s of matchedServices) {
    const arr = servicesByVendor.get(s.vendorId) ?? [];
    arr.push(s);
    servicesByVendor.set(s.vendorId, arr);
  }

  const totalProviders = new Set(allServices.map((s) => s.vendorId)).size;
  const filtered = vendors.length;
  const hasActiveFilter =
    serviceType != null ||
    locationType != null ||
    minRating != null ||
    verified === "1" ||
    lifeStage != null;

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Find services" }]} />

      {/* Search header */}
      <section className="bg-white px-10 pt-6 pb-5 border-b border-line">
        <Container width="mid" className="mb-4">
          <h1 className="font-serif text-[30px] font-light text-ch">
            Find services near you
          </h1>
        </Container>
        <Container width="mid" className="flex gap-2.5 items-center flex-wrap">
          <div className="flex flex-1 min-w-[200px] border-[1.5px] border-[rgba(193,99,79,.22)] rounded-[8px] overflow-hidden bg-white">
            <div className="px-3 py-2.5 border-r border-line flex items-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#9A9189" strokeWidth="1.3" />
                <line x1="11" y1="11" x2="15" y2="15" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <input
              className="flex-1 border-0 px-3.5 py-2.5 font-sans text-[13px] text-ch outline-none bg-transparent"
              defaultValue={type ? TYPE_LABELS[type] ?? type : ""}
              placeholder="Service type…"
            />
          </div>
          <div className="flex flex-1 min-w-[180px] border-[1.5px] border-line-bold rounded-[8px] overflow-hidden bg-white">
            <div className="px-3 py-2.5 border-r border-line flex items-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="7" r="3.5" stroke="#9A9189" strokeWidth="1.3" />
                <path d="M8 10.5 L8 14" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <input
              className="flex-1 border-0 px-3.5 py-2.5 font-sans text-[13px] text-ch outline-none bg-transparent"
              defaultValue="Boulder, CO 80301"
              placeholder="Location…"
            />
          </div>
          <button className="bg-tr text-white border-0 px-[22px] py-[11px] rounded-[8px] text-[13px] font-sans cursor-pointer hover:bg-tr-d transition-colors whitespace-nowrap">
            Search
          </button>
        </Container>
        <Container width="mid" className="mt-4">
          <Suspense>
            <LifeStageChips />
          </Suspense>
        </Container>
      </section>

      <WaveDivider topColor="#ffffff" bottomColor="#F0AE90" />

      {/* Results section */}
      <section className="bg-tr-vp px-10 pb-12 pt-10">
        <Container width="mid" className="grid grid-cols-[210px_1fr] gap-0">
          {/* Filter column */}
          <Suspense>
            <ServiceFilters />
          </Suspense>

          {/* Results column */}
          <div className="pt-6 pb-8 pl-6">
            {/* Count + sort */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[13px] text-ink">
                {hasActiveFilter ? (
                  <>
                    {totalProviders} providers · <strong className="text-ch">{filtered}</strong> after filters
                  </>
                ) : (
                  <>{totalProviders} providers</>
                )}
              </span>
              <div className="flex items-center gap-[7px]">
                <label className="text-[12px] text-ink">Sort by</label>
                <select className="text-[12px] text-cm border border-line-bold rounded-[6px] px-2.5 py-[5px] bg-white font-sans outline-none">
                  <option>Best match</option>
                  <option>Rating: high to low</option>
                  <option>Nearest first</option>
                  <option>Most reviewed</option>
                </select>
              </div>
            </div>

            <ServiceGrid vendors={vendors} servicesByVendor={servicesByVendor} />

            {totalProviders > filtered && (
              <div className="text-center pt-2">
                <a className="inline-block text-[13px] text-tr border-b border-dotted border-tr-l cursor-pointer hover:text-tr-d">
                  Show {totalProviders - filtered} more results →
                </a>
              </div>
            )}
            <div className="text-center mt-3">
              <Link
                href="/where-to-start"
                className="inline-block text-[13px] text-sg border-b border-dotted border-sg-l no-underline hover:text-sg-d"
              >
                Not sure what you need? See our guide →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

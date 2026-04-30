import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getVendors } from "@/lib/api/vendors";
import type { VendorType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Find services — CodaCo",
  description:
    "Find death doulas, estate attorneys, grief counselors, and other end-of-life service providers near you.",
};

interface ServicesPageProps {
  searchParams: Promise<{
    type?: string;
    minRating?: string;
    accepting?: string;
    virtual?: string;
    verified?: string;
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  doula: "Death doula",
  attorney: "Estate attorney",
  cleaner: "Death cleaning",
  celebrant: "Celebrant",
  organizer: "EOL organizer",
  "home-funeral": "Home funeral",
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { type, minRating, accepting, virtual: virt, verified } = await searchParams;

  const filters = {
    type: type as VendorType | undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    accepting: accepting === "1" ? true : undefined,
    virtual: virt === "1" ? true : undefined,
    verified: verified === "1" ? true : undefined,
  };

  const [vendors, totalVendors] = await Promise.all([
    getVendors(filters),
    getVendors(),
  ]);

  const total = totalVendors.length;
  const filtered = vendors.length;
  const hasActiveFilter =
    filters.type != null ||
    filters.minRating != null ||
    filters.accepting === true ||
    filters.virtual === true ||
    filters.verified === true;

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Find services" }]} />

      {/* Search header */}
      <section className="bg-white px-10 pt-6 pb-5 border-b border-[rgba(44,40,37,.07)]">
        <div className="max-w-[880px] mx-auto mb-4">
          <h1 className="font-serif text-[30px] font-light text-ch">
            Find services near you
          </h1>
        </div>
        <div className="max-w-[880px] mx-auto flex gap-2.5 items-center flex-wrap">
          <div className="flex flex-1 min-w-[200px] border-[1.5px] border-[rgba(193,99,79,.22)] rounded-[8px] overflow-hidden bg-white">
            <div className="px-3 py-2.5 border-r border-[rgba(44,40,37,.09)] flex items-center">
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
          <div className="flex flex-1 min-w-[180px] border-[1.5px] border-[rgba(44,40,37,.15)] rounded-[8px] overflow-hidden bg-white">
            <div className="px-3 py-2.5 border-r border-[rgba(44,40,37,.09)] flex items-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="7" r="3.5" stroke="#9A9189" strokeWidth="1.3" />
                <path d="M8 10.5 L8 14" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <input
              className="flex-1 border-0 px-3.5 py-2.5 font-sans text-[13px] text-ch outline-none bg-transparent"
              defaultValue="New York, NY 10001"
              placeholder="Location…"
            />
          </div>
          <button className="bg-tr text-white border-0 px-[22px] py-[11px] rounded-[8px] text-[13px] font-sans cursor-pointer hover:bg-tr-d transition-colors whitespace-nowrap">
            Search
          </button>
        </div>
      </section>

      <WaveDivider topColor="#ffffff" bottomColor="#F0AE90" />

      {/* Results section */}
      <section className="bg-tr-vp px-10 pb-12 pt-10">
        <div className="max-w-[880px] mx-auto grid grid-cols-[210px_1fr] gap-0">
          {/* Filter column */}
          <Suspense>
            <ServiceFilters />
          </Suspense>

          {/* Results column */}
          <div className="pt-6 pb-8 pl-6">
            {/* Map */}
            <div className="bg-pl2 border border-[rgba(44,40,37,.1)] rounded-[10px] h-[155px] flex items-center justify-center mb-5">
              <svg width="280" height="80" viewBox="0 0 280 80" fill="none">
                <rect x="10" y="10" width="260" height="60" rx="6" stroke="#9A9189" strokeWidth="1" fill="none" />
                <circle cx="80" cy="40" r="7" stroke="#C1634F" strokeWidth="1.5" fill="none" />
                <circle cx="80" cy="40" r="3" fill="#C1634F" />
                <circle cx="140" cy="28" r="7" stroke="#C1634F" strokeWidth="1.5" fill="none" />
                <circle cx="140" cy="28" r="3" fill="#C1634F" />
                <circle cx="195" cy="45" r="7" stroke="#7A9E82" strokeWidth="1.5" fill="none" />
                <circle cx="195" cy="45" r="3" fill="#7A9E82" />
                <path
                  d="M30 55 Q70 44 100 50 Q130 56 155 40 Q180 24 210 34 Q235 42 255 38"
                  stroke="#9A9189"
                  strokeWidth=".8"
                  fill="none"
                  strokeDasharray="4 3"
                />
                <text x="140" y="72" fontSize="10" fill="#9A9189" textAnchor="middle" fontFamily="sans-serif">
                  {total} providers near New York, NY
                </text>
              </svg>
            </div>

            {/* Count + sort */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[13px] text-ink">
                {hasActiveFilter ? (
                  <>
                    {total} providers · <strong className="text-ch">{filtered}</strong> after filters
                  </>
                ) : (
                  <>{total} providers</>
                )}
              </span>
              <div className="flex items-center gap-[7px]">
                <label className="text-[12px] text-ink">Sort by</label>
                <select className="text-[12px] text-cm border border-[rgba(44,40,37,.15)] rounded-[6px] px-2.5 py-[5px] bg-white font-sans outline-none">
                  <option>Best match</option>
                  <option>Rating: high to low</option>
                  <option>Nearest first</option>
                  <option>Most reviewed</option>
                </select>
              </div>
            </div>

            <ServiceGrid vendors={vendors} />

            {total > filtered && (
              <div className="text-center pt-2">
                <a className="inline-block text-[13px] text-tr border-b border-dotted border-tr-l cursor-pointer hover:text-tr-d">
                  Show {total - filtered} more results →
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
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VendorCard } from "@/components/ui/VendorCard";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getHomeFeaturedVendors } from "@/lib/api/vendors";

export const metadata: Metadata = {
  title: "CodaCo — A curated marketplace for death and dying",
  description:
    "CodaCo connects you with thoughtfully curated goods, local services and expert resources to help you approach death — yours or someone you love — with grace and intention.",
};

const categories = [
  {
    label: "Urns & vessels",
    href: "/shop?category=urns",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 6 C12 6 8 11 8 18 C8 25 12 30 18 30 C24 30 28 25 28 18 C28 11 24 6 18 6Z" stroke="var(--color-tr)" strokeWidth="1.5" fill="none"/>
        <path d="M13 18 C13 14 15 11 18 11 C21 11 23 14 23 18" stroke="var(--color-tr)" strokeWidth="1.3" fill="none"/>
        <line x1="18" y1="6" x2="18" y2="4" stroke="var(--color-tr)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Ash jewelry",
    href: "/shop?category=jewelry",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 8 L20 14 L26 14 L21 18 L23 24 L18 20 L13 24 L15 18 L10 14 L16 14 Z" stroke="var(--color-tr)" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Burial shrouds",
    href: "/shop?category=shrouds",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M11 8 C11 8 13 10 18 10 C23 10 25 8 25 8 L25 24 C25 27 22 29 18 29 C14 29 11 27 11 24 Z" stroke="var(--color-sg)" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    label: "Planning docs",
    href: "/shop?category=planning",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="8" y="6" width="20" height="24" rx="2" stroke="var(--color-tr)" strokeWidth="1.5"/>
        <line x1="12" y1="13" x2="24" y2="13" stroke="var(--color-tr)" strokeWidth="1.2"/>
        <line x1="12" y1="17" x2="24" y2="17" stroke="var(--color-tr)" strokeWidth="1.2"/>
        <line x1="12" y1="21" x2="19" y2="21" stroke="var(--color-tr)" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    label: "Death doulas",
    href: "/services?type=doula",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="14" cy="13" r="4.5" stroke="var(--color-sg)" strokeWidth="1.5"/>
        <path d="M6 28 C6 23 9.5 20 14 20 C18.5 20 22 23 22 28" stroke="var(--color-sg)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 15 C24 15 27 13 29 16" stroke="var(--color-tr)" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Estate attorneys",
    href: "/services?type=attorney",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="10" y="10" width="16" height="16" rx="2" stroke="var(--color-sg)" strokeWidth="1.5"/>
        <line x1="14" y1="16" x2="22" y2="16" stroke="var(--color-sg)" strokeWidth="1.2"/>
        <line x1="14" y1="20" x2="20" y2="20" stroke="var(--color-sg)" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    label: "Death cleaning",
    href: "/services?type=cleaner",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M10 28 L10 14 L18 8 L26 14 L26 28" stroke="var(--color-tr)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="14" y="20" width="8" height="8" stroke="var(--color-tr)" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    label: "Celebrants",
    href: "/services?type=celebrant",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="10" stroke="var(--color-sg)" strokeWidth="1.5" fill="none"/>
        <path d="M14 18 C14 15 16 13 18 13 C20 13 22 15 22 18" stroke="var(--color-sg)" strokeWidth="1.3" fill="none"/>
        <line x1="18" y1="23" x2="18" y2="26" stroke="var(--color-sg)" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Books",
    href: "/books",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="9" y="6" width="12" height="22" rx="1.5" stroke="var(--color-tr)" strokeWidth="1.5"/>
        <rect x="14" y="8" width="12" height="22" rx="1.5" stroke="var(--color-sg)" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    label: "Gifts & humor",
    href: "/shop?category=humor",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M10 22 C10 22 10 14 18 14 C26 14 26 22 26 22 L10 22Z" stroke="var(--color-tr)" strokeWidth="1.5" fill="none"/>
        <rect x="14" y="22" width="8" height="5" rx="1" stroke="var(--color-tr)" strokeWidth="1.3"/>
      </svg>
    ),
  },
];

export default async function LandingPage() {
  const featuredVendors = await getHomeFeaturedVendors();

  return (
    <>
      {/* Hero */}
      <section className="bg-white px-10 pt-[4.5rem] pb-12 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">
          Welcome
        </p>
        <h1 className="font-serif italic text-[52px] font-light leading-[1.12] text-ch mb-5">
          Death is a part of life.
          <br />
          <span className="text-tr">Support shouldn&apos;t be hard to find.</span>
        </h1>
        <p className="text-[15px] text-cm max-w-[560px] mx-auto leading-[1.78] mb-8">
          CodaCo connects you with thoughtfully curated goods, local services
          and expert resources to help you approach death — yours or someone
          you love — with grace and intention.
        </p>

        <HeroSearch />
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

      {/* Browse by category */}
      <section className="bg-tr-vp px-10 pt-12 pb-10">
        <Container width="wide">
          <SectionHeader
            eyebrow="Browse by category"
            title="What are you looking for?"
            subtitle="Goods by mail · Services by location"
            subtitleTone="ink"
          />
          <div className="grid-auto-130">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="bg-white border border-line rounded-[12px] py-[1.2rem] px-4 text-center cursor-pointer transition-all duration-200 hover:border-tr-l hover:-translate-y-0.5 no-underline block"
              >
                <div className="w-10 h-10 mx-auto mb-2.5 flex items-center justify-center">
                  {cat.icon}
                </div>
                <div className="text-[12px] font-medium text-ch leading-tight">
                  {cat.label}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-tr-vp)" bottomColor="var(--color-white)" />

      {/* Support in your area */}
      <section className="bg-white px-10 pt-12 pb-12">
        <Container width="wide">
          <SectionHeader
            eyebrow="Find local services"
            eyebrowTone="sg"
            title="Support in your area"
            subtitle="Vetted providers · search by zip or city"
          />

          <div className="flex items-center gap-2.5 bg-white border border-line rounded-[8px] px-4 py-2.5 mb-6">
            <span className="text-[13px] text-cm flex-1">
              Showing results near:
            </span>
            <input
              defaultValue="Boulder, CO 80301"
              className="border-0 bg-transparent font-sans text-[13px] text-tr font-medium outline-none w-[200px]"
            />
            <button className="btn-secondary btn-sm">
              Change
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
            {featuredVendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>

          <div className="text-center mt-5">
            <Link
              href="/services"
              className="inline-block text-[13px] text-tr border-b border-dotted border-tr-l no-underline hover:text-tr-d"
            >
              Search all service providers →
            </Link>
          </div>
          <div className="text-center mt-2">
            <Link
              href="/where-to-start"
              className="inline-block text-[13px] text-sg border-b border-dotted border-sg-l no-underline hover:text-sg-d"
            >
              Not sure what you need? See our guide for recently bereaved →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

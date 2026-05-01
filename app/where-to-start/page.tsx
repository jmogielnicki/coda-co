import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Where to Start — CodaCo",
  description:
    "Guidance for people navigating death and dying for the first time.",
};

const sections = [
  {
    eyebrow: "First 24–48 hours",
    heading: "If someone just died",
    body: "You don't have to do anything immediately except be present. If the death was expected and at home, you have time. If it was sudden or unattended, contact emergency services. There is no rush to call a funeral home in the first hour.",
    links: [
      { label: "Find a death doula near me →", href: "/services?type=doula" },
      { label: "Find a home funeral guide →", href: "/services?type=home-funeral" },
    ],
    bg: "bg-tr-vp",
    accent: "text-tr",
  },
  {
    eyebrow: "Planning ahead",
    heading: "If you're doing this while you're healthy",
    body: "The greatest gift you can give your family is a clear record of your wishes. An advance directive, a will, and a list of your accounts can save months of difficulty. You don't need an attorney for all of it.",
    links: [
      { label: "Browse planning workbooks →", href: "/shop?category=planning" },
      { label: "Find an estate attorney →", href: "/services?type=attorney" },
    ],
    bg: "bg-sg-vp",
    accent: "text-sg-d",
  },
  {
    eyebrow: "After the death",
    heading: "If you're in grief",
    body: "Grief has no timeline. A grief counselor or death doula can provide structure when everything feels formless. Many offer sliding-scale sessions. You don't have to be in crisis to seek support.",
    links: [
      { label: "Find a grief counselor →", href: "/services?type=grief" },
      { label: "Find a death doula →", href: "/services?type=doula" },
    ],
    bg: "bg-tr-vp",
    accent: "text-tr",
  },
  {
    eyebrow: "Honoring someone",
    heading: "If you want to create a memorial",
    body: "Meaningful objects and rituals help. A handmade urn, a memorial portrait, an ash pendant — these are ways of keeping someone present. There is no right or wrong way to honor a life.",
    links: [
      { label: "Shop memorial goods →", href: "/shop?category=memorial" },
      { label: "Shop urns & vessels →", href: "/shop?category=urns" },
    ],
    bg: "bg-sg-vp",
    accent: "text-sg-d",
  },
];

const books = [
  {
    title: "Smoke Gets in Your Eyes",
    author: "Caitlin Doughty",
    description:
      "A mortician's memoir that demystifies the funeral industry and encourages a healthier relationship with death.",
    bg: "#6B4B3E",
  },
  {
    title: "The American Way of Death",
    author: "Jessica Mitford",
    description:
      "A sharp critique of the US funeral industry — still relevant decades later.",
    bg: "#3C4F5A",
  },
  {
    title: "Being Mortal",
    author: "Atul Gawande",
    description:
      "A physician's honest account of how we die in America and how to reclaim agency in the process.",
    bg: "#4A4030",
  },
];

export default function WhereToStartPage() {
  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Where to start" }]} />

      {/* Intro */}
      <section className="bg-tr-vp px-10 py-14 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-2">A gentle guide</p>
        <h1 className="font-serif text-[42px] font-light text-ch mb-4 leading-tight">
          Where to start
        </h1>
        <p className="text-[15px] text-ink max-w-[480px] mx-auto leading-relaxed">
          Death touches everyone differently. These are starting points — not prescriptions. Use
          what helps.
        </p>
      </section>

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.heading} className={`${section.bg} px-10 py-12`}>
          <Container width="narrow">
            <p className={`text-[11px] tracking-[.14em] uppercase ${section.accent} mb-2`}>
              {section.eyebrow}
            </p>
            <h2 className="font-serif text-[28px] font-light text-ch mb-4">{section.heading}</h2>
            <p
              className={`text-[14px] leading-[1.8] mb-5 ${
                section.bg === "bg-tr-vp" ? "text-ink" : "text-cm"
              }`}
            >
              {section.body}
            </p>
            <div className="flex flex-wrap gap-3">
              {section.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-[13px] ${section.accent} border-b border-dotted border-current pb-px hover:opacity-80 transition-opacity no-underline`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* Reading room */}
      <section className="bg-white px-10 py-14">
        <Container width="mid">
          <SectionHeader
            eyebrow="Reading room"
            eyebrowTone="sg"
            title="Books worth reading"
            className="mb-8"
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {books.map((book) => (
              <div
                key={book.title}
                className="bg-white border border-line rounded-[10px] p-5 flex gap-3"
              >
                <div
                  className="w-10 h-10 rounded-[6px] flex-shrink-0"
                  style={{ background: book.bg }}
                />
                <div>
                  <div className="font-serif text-[15px] text-ch mb-0.5">{book.title}</div>
                  <div className="text-[12px] text-cl mb-2 italic">{book.author}</div>
                  <div className="text-[12px] text-cm leading-relaxed">{book.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-tr-vp border border-tr-p rounded-[12px] mx-10 my-10 px-8 py-8 text-center">
        <h2 className="font-serif text-[24px] font-light text-ch mb-3">
          You don&apos;t have to do this alone.
        </h2>
        <p className="text-[13px] text-ink max-w-[480px] mx-auto mb-6 leading-[1.75]">
          Every provider listed on CodaCo has been vetted. If you&apos;re not sure who to contact
          first, a death doula is often the right starting point — they can help you figure out what
          else you need.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/services?type=doula"
            className="bg-tr text-white px-7 py-3 rounded-full text-[14px] no-underline hover:bg-tr-d transition-colors"
          >
            Find a death doula near me →
          </Link>
          <Link
            href="/services"
            className="border border-[rgba(44,40,37,.25)] text-ch px-7 py-3 rounded-full text-[13px] no-underline hover:border-tr hover:text-tr transition-all"
          >
            Browse all services
          </Link>
        </div>
      </section>
    </>
  );
}

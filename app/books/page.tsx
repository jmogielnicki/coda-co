import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BooksGrid } from "@/components/BooksGrid";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Books — CodaCo",
  description: "Honest, beautifully written guides for the journey.",
};

const books = [
  {
    title: "Briefly Perfectly Human",
    author: "Alua Arthur",
    isbn: "9780063240063",
    localCover: true,
    bg: "#8B4F42",
    desc: "Death doula Alua Arthur explores what it means to be alive through honest, moving encounters with the dying.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <line x1="0" y1="20" x2="160" y2="0" stroke="#fff" strokeWidth=".7"/>
        <line x1="0" y1="60" x2="160" y2="40" stroke="#fff" strokeWidth=".5"/>
        <line x1="0" y1="100" x2="160" y2="80" stroke="#fff" strokeWidth=".6"/>
        <line x1="0" y1="140" x2="160" y2="120" stroke="#fff" strokeWidth=".5"/>
      </svg>
    ),
  },
  {
    title: "Being Mortal",
    author: "Atul Gawande",
    isbn: "9781250076229",
    coverIsbn: "9781250081247",
    bg: "#4A4030",
    desc: "A physician's exploration of how medicine can better serve people at the end of life on their own terms.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <rect x="20" y="20" width="120" height="130" stroke="#fff" strokeWidth=".6" fill="none"/>
        <rect x="36" y="36" width="88" height="98" stroke="#fff" strokeWidth=".4" fill="none"/>
      </svg>
    ),
  },
  {
    title: "When Breath Becomes Air",
    author: "Paul Kalanithi",
    isbn: "9780812988406",
    bg: "#2C3A5A",
    desc: "A young neurosurgeon's luminous memoir, written as he faced his own terminal diagnosis.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <path d="M0 170 Q80 60 160 170" stroke="#fff" strokeWidth=".7" fill="none"/>
        <path d="M0 130 Q80 30 160 130" stroke="#fff" strokeWidth=".5" fill="none"/>
      </svg>
    ),
  },
  {
    title: "Smoke Gets in Your Eyes",
    author: "Caitlin Doughty",
    isbn: "9780393351903",
    bg: "#3D5C47",
    desc: "A mortician's dark, funny memoir challenging how Americans hide from death — and why we shouldn't.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <circle cx="80" cy="85" r="60" stroke="#fff" strokeWidth=".7" fill="none"/>
        <circle cx="80" cy="85" r="35" stroke="#fff" strokeWidth=".5" fill="none"/>
      </svg>
    ),
  },
  {
    title: "The Party of Your Life",
    author: "Erika Dillman",
    isbn: "9781595800626",
    localCover: true,
    bg: "#6B4561",
    desc: "A practical, surprisingly buoyant workbook for designing the funeral you actually want — and sparing the people you love a guessing game.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <line x1="0" y1="0" x2="160" y2="170" stroke="#fff" strokeWidth=".5"/>
        <line x1="0" y1="170" x2="160" y2="0" stroke="#fff" strokeWidth=".5"/>
        <line x1="80" y1="0" x2="80" y2="170" stroke="#fff" strokeWidth=".4"/>
        <line x1="0" y1="85" x2="160" y2="85" stroke="#fff" strokeWidth=".4"/>
      </svg>
    ),
  },
  {
    title: "A Beginner's Guide to the End",
    author: "BJ Miller & Shoshana Berger",
    isbn: "9781501157219",
    localCover: true,
    bg: "#4A5A5C",
    desc: "A palliative-care physician and a writer team up on a thorough, compassionate field manual for everything dying asks of us.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <circle cx="30" cy="30" r="1.8" fill="#fff"/>
        <circle cx="80" cy="30" r="1.8" fill="#fff"/>
        <circle cx="130" cy="30" r="1.8" fill="#fff"/>
        <circle cx="30" cy="85" r="1.8" fill="#fff"/>
        <circle cx="80" cy="85" r="1.8" fill="#fff"/>
        <circle cx="130" cy="85" r="1.8" fill="#fff"/>
        <circle cx="30" cy="140" r="1.8" fill="#fff"/>
        <circle cx="80" cy="140" r="1.8" fill="#fff"/>
        <circle cx="130" cy="140" r="1.8" fill="#fff"/>
      </svg>
    ),
  },
  {
    title: "Never Can Say Goodbye",
    author: "Darnell Lamont Walker",
    isbn: "9780063421837",
    localCover: true,
    bg: "#5C3A38",
    desc: "A working death doula's memoir of holding space at the bedside, and what the dying have to teach the rest of us about a peaceful end.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <path d="M0 45 Q40 25 80 45 T160 45" stroke="#fff" strokeWidth=".6" fill="none"/>
        <path d="M0 85 Q40 65 80 85 T160 85" stroke="#fff" strokeWidth=".5" fill="none"/>
        <path d="M0 125 Q40 105 80 125 T160 125" stroke="#fff" strokeWidth=".6" fill="none"/>
      </svg>
    ),
  },
  {
    title: "With the End in Mind",
    author: "Kathryn Mannix",
    isbn: "9780316504478",
    bg: "#3F4D4A",
    desc: "A palliative-care doctor's gentle, story-rich case that a good death is still possible — and often nearer than we fear.",
    overlay: (
      <svg width="100%" height="100%" viewBox="0 0 160 170">
        <polygon points="80,25 40,100 120,100" stroke="#fff" strokeWidth=".6" fill="none"/>
        <polygon points="80,55 55,110 105,110" stroke="#fff" strokeWidth=".4" fill="none"/>
        <polygon points="80,80 65,120 95,120" stroke="#fff" strokeWidth=".4" fill="none"/>
      </svg>
    ),
  },
];

export default function BooksPage() {
  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Books" }]} />

      <section className="bg-white px-10 pt-12 pb-12">
        <Container width="wide">
          <div className="text-center mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-1.5">
              The reading room
            </p>
            <h1 className="font-serif text-[42px] font-light text-ch mb-2">
              Books on death &amp; dying
            </h1>
            <p className="text-[13px] text-cl">
              Honest, beautifully written guides for the journey. Handpicked for
              you by the CodaCo team.
            </p>
          </div>
          <BooksGrid books={books} />
        </Container>
      </section>
    </>
  );
}

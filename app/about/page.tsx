import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WaveDivider } from "@/components/ui/WaveDivider";

export const metadata: Metadata = {
  title: "About CodaCo — A curated marketplace for death and dying",
  description:
    "Death is not the opposite of life, but a part of it — and those who help us navigate it deserve a place as honored as any healer.",
};

const principles: { lead: string; detail?: string }[] = [
  {
    lead: "Inclusive of all traditions",
    detail:
      "we welcome providers from every cultural, religious, and secular background.",
  },
  {
    lead: "No upselling, no pressure",
    detail:
      "listings are straightforward. We flag providers who offer sliding-scale fees.",
  },
  {
    lead: "Privacy by default",
    detail:
      "your searches are never stored or shared with third parties.",
  },
  { lead: "Built with intention." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero — the ethos */}
      <section className="bg-white px-10 pt-[4.5rem] pb-12 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-3">
          About CodaCo
        </p>
        <h1 className="font-serif italic text-[44px] font-light leading-[1.25] text-ch max-w-[760px] mx-auto mb-8">
          Death is not the opposite of life, but a part of it
          <br />
          <span className="text-tr">
            and those who help us navigate it deserve a place as honored as any
            healer.
          </span>
        </h1>
        <p className="text-[11px] tracking-[.14em] uppercase text-cl">
          — The CodaCo Market Ethos
        </p>
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

      {/* Our purpose */}
      <section className="bg-tr-vp px-10 pt-2 pb-16">
        <Container width="narrow">
          <SectionHeader
            eyebrow="Our purpose"
            title={
              <>
                Death is part of life.
                <br />
                Support shouldn&apos;t be hard to find.
              </>
            }
          />

          <div className="space-y-5 text-[15px] text-ink leading-[1.78]">
            <p>
              CodaCo Market was created out of a simple frustration: when
              facing the death of someone we love — or planning for our own —
              the resources we need are scattered, poorly described, and hard
              to compare.
            </p>
            <p>
              We believe that death literacy matters. We believe that every
              family deserves access to compassionate, qualified support,
              regardless of geography or budget. And we believe that the
              practitioners and makers who have dedicated their work to this
              space deserve a dignified home to be found.
            </p>
          </div>

          <p className="font-serif italic text-[26px] font-light text-tr-d text-center mt-6 mb-10 leading-[1.4]">
            We believe death and dying should be as integrated a part of life
            as birth, marriage, and ordering pizza.
          </p>

          <ul className="space-y-3">
            {principles.map((p) => (
              <li
                key={p.lead}
                className="flex gap-3 text-[14px] text-ink leading-[1.7]"
              >
                <span className="text-tr-d mt-[2px] flex-shrink-0" aria-hidden="true">
                  •
                </span>
                <span>
                  <span className="font-medium">{p.lead}</span>
                  {p.detail && <> — {p.detail}</>}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}


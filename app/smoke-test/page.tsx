import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { WaveDivider } from "@/components/ui/WaveDivider";

export const metadata: Metadata = {
  title: "Smoke test — CodaCo",
  description:
    "A visual smoke test for the CodaCo design system — tokens, type, and primitives on one page.",
};

const swatches: { name: string; label: string; className: string }[] = [
  { name: "tr", label: "Terracotta", className: "bg-tr" },
  { name: "tr-l", label: "Terracotta light", className: "bg-tr-l" },
  { name: "tr-p", label: "Terracotta pale", className: "bg-tr-p" },
  { name: "tr-d", label: "Terracotta deep", className: "bg-tr-d" },
  { name: "tr-vp", label: "Terracotta very pale", className: "bg-tr-vp" },
  { name: "sg", label: "Sage", className: "bg-sg" },
  { name: "sg-l", label: "Sage light", className: "bg-sg-l" },
  { name: "sg-p", label: "Sage pale", className: "bg-sg-p" },
  { name: "sg-d", label: "Sage deep", className: "bg-sg-d" },
  { name: "sg-vp", label: "Sage very pale", className: "bg-sg-vp" },
  { name: "pl", label: "Page light", className: "bg-pl border border-line" },
  { name: "pl2", label: "Page light 2", className: "bg-pl2 border border-line" },
];

export default function SmokeTestPage() {
  return (
    <div data-testid="smoke-test-page">
      {/* Hero — mirrors the landing hero's vibe */}
      <section className="bg-white px-10 pt-[4.5rem] pb-12 text-center">
        <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">
          Smoke test
        </p>
        <h1 className="font-serif italic text-[52px] font-light leading-[1.12] text-ch mb-5">
          All systems quiet.
          <br />
          <span className="text-tr">Everything is in its place.</span>
        </h1>
        <p className="text-[15px] text-cm max-w-[560px] mx-auto leading-[1.78] mb-8">
          A one-page check on the CodaCo design system — tokens, type, and the
          primitives the marketplace is built from.
        </p>
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

      {/* Color tokens */}
      <section className="bg-tr-vp px-10 pt-12 pb-10" data-testid="smoke-palette">
        <Container width="wide">
          <SectionHeader
            eyebrow="Tokens"
            title="Brand palette"
            subtitle="Terracotta, sage, and warm neutrals"
            subtitleTone="ink"
          />
          <div className="grid-auto-178">
            {swatches.map((s) => (
              <div
                key={s.name}
                className="bg-white border border-line rounded-[10px] p-3 flex items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-[8px] ${s.className}`} />
                <div className="leading-tight">
                  <div className="text-[13px] text-ch font-medium">{s.label}</div>
                  <div className="text-[11px] text-cl">--color-{s.name}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-tr-vp)" bottomColor="var(--color-white)" />

      {/* Typography */}
      <section className="bg-white px-10 pt-12 pb-12" data-testid="smoke-typography">
        <Container width="mid">
          <SectionHeader
            eyebrow="Typography"
            eyebrowTone="sg"
            title="Crimson Pro & Nunito Sans"
            subtitle="Italic serif for warmth, sans for body"
          />

          <div className="space-y-5">
            <p className="font-serif italic text-[52px] font-light leading-[1.12] text-ch">
              Italic serif <span className="text-tr">terracotta tail</span>
            </p>
            <p className="font-serif text-[32px] font-light text-ch">
              Serif title — 32px / 300
            </p>
            <p className="text-[15px] text-cm leading-[1.78]">
              Body sans 15px with 1.78 line-height. Nunito Sans is the body
              voice — quiet and even, generous in its leading. It carries the
              long passages so the serif can carry the moments.
            </p>
            <p className="text-[13px] text-cl">
              Subtitle 13px in --color-cl.
            </p>
            <p className="text-overline text-tr">Overline label</p>
          </div>
        </Container>
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-pl)" />

      {/* Primitives */}
      <section className="bg-pl px-10 pt-12 pb-12" data-testid="smoke-primitives">
        <Container width="mid">
          <SectionHeader
            eyebrow="Primitives"
            title="Buttons, pills, and surfaces"
            subtitle="The reusable bits the marketplace is built from"
          />

          <div className="space-y-8">
            {/* Buttons */}
            <div className="bg-white border border-line rounded-[10px] p-6">
              <p className="text-overline text-cl mb-4">Buttons</p>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-primary btn-sm">Primary sm</button>
                <button className="btn-primary btn-md">Primary md</button>
                <button className="btn-primary btn-lg">Primary lg</button>
                <button className="btn-secondary btn-md">Secondary</button>
                <button className="btn-ghost btn-md">Ghost</button>
              </div>
            </div>

            {/* Filter pills (static demo using the class hook) */}
            <div className="bg-white border border-line rounded-[10px] p-6">
              <p className="text-overline text-cl mb-4">Filter pills</p>
              <div className="flex flex-wrap gap-[5px]">
                <span className="filter-pill filter-pill-on">Active</span>
                <span className="filter-pill filter-pill-off">Inactive</span>
                <span className="filter-pill filter-pill-off">Verified</span>
                <span className="filter-pill filter-pill-on">Within 15 mi</span>
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              <Card hoverTone="terracotta">
                <p className="text-overline text-tr mb-2">Hover terracotta</p>
                <p className="font-serif text-[20px] text-ch leading-snug">
                  A quiet card surface
                </p>
                <p className="text-[13px] text-cm mt-1">
                  Hover to see the terracotta border lift.
                </p>
              </Card>
              <Card hoverTone="sage">
                <p className="text-overline text-sg mb-2">Hover sage</p>
                <p className="font-serif text-[20px] text-ch leading-snug">
                  A second surface
                </p>
                <p className="text-[13px] text-cm mt-1">
                  Sage borders for service-side content.
                </p>
              </Card>
              <Card hoverTone="none">
                <p className="text-overline text-cl mb-2">Static</p>
                <p className="font-serif text-[20px] text-ch leading-snug">
                  No hover affordance
                </p>
                <p className="text-[13px] text-cm mt-1">
                  For surfaces that aren&apos;t links.
                </p>
              </Card>
            </div>

            {/* Avatars + stars */}
            <div className="bg-white border border-line rounded-[10px] p-6 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <Avatar initials="MR" size="sm" />
                <Avatar initials="MR" size="md" />
                <Avatar initials="MR" size="lg" />
              </div>
              <div className="flex items-center gap-3">
                <Avatar initials="JL" size="sm" tone="terracotta" />
                <Avatar initials="JL" size="md" tone="terracotta" />
                <Avatar initials="JL" size="lg" tone="terracotta" />
              </div>
              <Stars rating={4.6} reviewCount={128} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

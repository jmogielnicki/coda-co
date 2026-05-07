import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CodaCo — A curated marketplace for death and dying",
  description:
    "Death is not the opposite of life, but a part of it — and those who help us navigate it deserve a place as honored as any healer.",
};

export default function AboutPage() {
  return (
    <section className="bg-white px-10 pt-[5rem] pb-24 text-center">
      <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-3">
        About CodaCo
      </p>
      <h1 className="font-serif italic text-[44px] font-light leading-[1.25] text-ch max-w-[760px] mx-auto mb-8">
        Death is not the opposite of life, but a part of it —
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
  );
}

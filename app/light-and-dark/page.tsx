import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "Grief Meets Humor — CodaCo",
  description:
    "Prints, mugs, cards and gifts that find the levity in life's only guarantee.",
};

const humor = [
  { quote: "Eventually, we are all just stardust with opinions.", item: "Art print, 8×10", price: "$18" },
  { quote: "I've made peace with my mortality. My accountant has not.", item: "Ceramic mug, 12 oz", price: "$24" },
  { quote: "YOLO was taken. So I planned ahead.", item: "Tote bag", price: "$22" },
  { quote: "My estate plan is the most loving thing I've ever done.", item: "Greeting card set", price: "$14" },
];

export default function GriefMeetsHumorPage() {
  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Grief Meets Humor" }]} />

      <section className="bg-tr-vp px-10 pt-12 pb-12">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-ch rounded-[12px] px-8 py-6 flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="font-serif text-[28px] font-light text-tr-vp mb-0.5">
                Grief Meets Humor — Because death is also funny.
              </h1>
              <p className="text-[13px] text-tr-vp/60 max-w-[340px]">
                Prints, mugs, cards and gifts that find the levity in life&apos;s
                only guarantee.
              </p>
            </div>
            <Link
              href="/shop?category=humor"
              className="bg-tr text-white border-0 px-5 py-2.5 rounded-[18px] text-[13px] no-underline hover:bg-tr-d transition-colors"
            >
              Shop all →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3.5">
            {humor.map((h) => (
              <div
                key={h.quote}
                className="bg-white border border-[rgba(44,40,37,.08)] rounded-[10px] p-3.5 text-center cursor-pointer transition-colors hover:border-cl"
              >
                <div className="h-[86px] bg-ch rounded-[7px] flex items-center justify-center mb-2.5 font-serif text-[12px] text-tr-vp/85 px-3 leading-[1.45] italic">
                  {h.quote}
                </div>
                <div className="text-[12px] text-ch font-medium">{h.item}</div>
                <div className="text-[12px] text-tr mt-0.5">{h.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

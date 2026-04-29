import Link from "next/link";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="block bg-white border border-[rgba(44,40,37,.08)] rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[rgba(193,99,79,.3)] hover:-translate-y-0.5 no-underline"
    >
      {/* Thumbnail */}
      <div
        className="h-[130px] flex items-center justify-center"
        style={{ background: product.thumbBg }}
      >
        <ProductThumbnail id={product.id} category={product.category} />
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-[.95rem]">
        <div className="text-[13px] font-medium text-ch mb-[3px] leading-[1.35]">
          {product.title}
        </div>
        <div className="text-[11px] text-cl mb-[6px]">
          {product.seller}, {product.location}
        </div>
        <div className="text-[14px] font-medium text-tr flex items-center flex-wrap gap-1">
          ${product.price}
          {product.badge && <Badge badge={product.badge} />}
        </div>
      </div>
    </Link>
  );
}

function ProductThumbnail({ id, category }: { id: string; category: string }) {
  if (id.startsWith("urn")) {
    return (
      <svg width="48" height="58" viewBox="0 0 60 70" fill="none">
        <path
          d="M30 8 C18 8 10 20 10 38 C10 52 18 62 30 62 C42 62 50 52 50 38 C50 20 42 8 30 8Z"
          stroke="#C1634F"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M20 38 C20 28 24 22 30 22 C36 22 40 28 40 38"
          stroke="#C1634F"
          strokeWidth="1.5"
          fill="none"
        />
        <line x1="30" y1="8" x2="30" y2="2" stroke="#C1634F" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="30" cy="2" rx="7" ry="3.5" stroke="#C1634F" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }
  if (id.startsWith("pendant") || category === "jewelry") {
    return (
      <svg width="44" height="44" viewBox="0 0 60 60" fill="none">
        <path
          d="M30 10 L33 22 L44 22 L35 28 L38 38 L30 32 L22 38 L25 28 L16 22 L27 22 Z"
          stroke="#5A534C"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (id.startsWith("shroud") || category === "shrouds") {
    return (
      <svg width="44" height="50" viewBox="0 0 60 62" fill="none">
        <path
          d="M18 58 L18 22 L30 14 L42 22 L42 58"
          stroke="#7A9E82"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }
  if (category === "planning") {
    return (
      <svg width="44" height="54" viewBox="0 0 60 70" fill="none">
        <rect x="12" y="8" width="36" height="52" rx="3" stroke="#C1634F" strokeWidth="1.8" fill="none" />
        <line x1="18" y1="22" x2="42" y2="22" stroke="#C1634F" strokeWidth="1.4" />
        <line x1="18" y1="30" x2="42" y2="30" stroke="#C1634F" strokeWidth="1.4" />
        <line x1="18" y1="38" x2="36" y2="38" stroke="#C1634F" strokeWidth="1.4" />
      </svg>
    );
  }
  if (category === "memorial") {
    return (
      <svg width="44" height="40" viewBox="0 0 60 54" fill="none">
        <path
          d="M10 44 C10 44 10 28 30 22 C50 28 50 44 50 44"
          stroke="#5A534C"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="30" cy="44" rx="20" ry="4" stroke="#5A534C" strokeWidth="1.3" fill="none" />
      </svg>
    );
  }
  return (
    <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="18" stroke="#9A9189" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

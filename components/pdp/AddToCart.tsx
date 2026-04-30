"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import type { Product } from "@/lib/types";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedGlaze, setSelectedGlaze] = useState(0);
  const [added, setAdded] = useState(false);

  const variant = product.variants[selectedVariant];
  const price = variant?.price ?? product.price;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        title: product.title,
        seller: product.seller,
        price,
        thumbBg: product.thumbBg,
        variant: variant?.label,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Glaze selector */}
      {product.glazeOptions && product.glazeOptions.length > 0 && (
        <div>
          <div className="text-[12px] font-medium text-ch mb-2 uppercase tracking-wide">
            Glaze color
          </div>
          <div className="flex gap-2 flex-wrap">
            {product.glazeOptions.map((glaze, i) => {
              const colors: Record<string, string> = {
                Sage:     "var(--color-sg)",
                Terra:    "var(--color-tr)",
                Cream:    "var(--color-pl2)",
                Charcoal: "var(--color-ch)",
              };
              return (
                <button
                  key={glaze}
                  onClick={() => setSelectedGlaze(i)}
                  className={[
                    "flex flex-col items-center gap-1 cursor-pointer",
                    selectedGlaze === i ? "opacity-100" : "opacity-60 hover:opacity-80",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "w-7 h-7 rounded-full border-2 transition-all",
                      selectedGlaze === i ? "border-ch" : "border-transparent",
                    ].join(" ")}
                    style={{ background: colors[glaze] ?? "#ccc" }}
                  />
                  <span className="text-[11px] text-cl">{glaze}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Variant / size selector */}
      {product.variants.length > 1 && (
        <div>
          <div className="text-[12px] font-medium text-ch mb-2 uppercase tracking-wide">Size</div>
          <div className="flex flex-col gap-1.5">
            {product.variants.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setSelectedVariant(i)}
                className={[
                  "text-left px-4 py-2 rounded-[8px] border text-[13px] cursor-pointer transition-all",
                  selectedVariant === i
                    ? "border-ch text-ch font-medium bg-pl"
                    : "border-[rgba(44,40,37,.2)] text-cm hover:border-ch",
                ].join(" ")}
              >
                {v.label}
                <span className="float-right font-medium text-tr">${v.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-[12px] font-medium text-ch mb-2 uppercase tracking-wide">Quantity</div>
          <div className="flex items-center border border-[rgba(44,40,37,.2)] rounded-[8px] overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-[16px] text-cm hover:bg-pl cursor-pointer"
            >
              −
            </button>
            <span className="px-4 py-2 text-[15px] font-medium text-ch min-w-[40px] text-center">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="px-3 py-2 text-[16px] text-cm hover:bg-pl cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
        <div className="text-[12px] text-cl leading-relaxed pt-5">
          Free shipping · Ships in 3–5 business days
        </div>
      </div>

      {/* Personalization note */}
      <div className="bg-sg-vp border border-sg-p rounded-[8px] px-4 py-3 text-[13px] text-cm">
        <strong>Personalization available.</strong> Add a name or inscription — contact seller after
        purchase.
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        className={[
          "w-full py-3.5 rounded-full text-[15px] font-medium transition-all cursor-pointer",
          added
            ? "bg-sg text-white"
            : "bg-tr text-white hover:bg-tr-d",
        ].join(" ")}
      >
        {added ? "Added to cart ✓" : `Add to cart — $${price}`}
      </button>

      <button className="w-full py-3 rounded-full text-[14px] text-cm border border-[rgba(44,40,37,.2)] hover:border-tr hover:text-tr transition-all cursor-pointer">
        Save to wishlist
      </button>

      {/* Trust signals */}
      <div className="space-y-2 pt-1">
        {[
          "CodaCo buyer protection on every order",
          "Secure checkout · cards, PayPal, Affirm",
          "Returns within 14 days for non-personalized items",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-[12px] text-cm">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="var(--color-sg)" strokeWidth="1.1" />
              <path d="M5.5 8 L7.5 10 L11 6" stroke="var(--color-sg)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

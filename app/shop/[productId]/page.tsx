import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AddToCart } from "@/components/pdp/AddToCart";
import { ProductTabs } from "@/components/pdp/ProductTabs";
import { ProductGallery } from "@/components/pdp/ProductGallery";
import { Avatar } from "@/components/ui/Avatar";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { Stars } from "@/components/ui/Stars";
import { getProduct, getRelatedProducts } from "@/lib/api/products";
import { getReviews, getReviewSummary } from "@/lib/api/reviews";
import { getVendor } from "@/lib/api/vendors";
import { formatPriceRange, productThumbBg } from "@/lib/format/product";

interface PDPProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: PDPProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) return { title: "Product not found — CodaCo" };
  return {
    title: `${product.title} — CodaCo`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const { productId } = await params;

  const [product, reviews, summary] = await Promise.all([
    getProduct(productId),
    getReviews(productId),
    getReviewSummary(productId),
  ]);

  if (!product) notFound();

  const [related, vendor] = await Promise.all([
    getRelatedProducts(product),
    getVendor(product.sellerId),
  ]);

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.title },
        ]}
      />

      {/* Main product grid */}
      <section className="bg-white px-10 py-8">
        <Container width="mid" className="grid grid-cols-[1fr_1fr] gap-10">
          {/* Gallery */}
          {product.coverImageUrl ? (
            <ProductGallery
              cover={{ id: "cover", url: product.coverImageUrl }}
              gallery={product.images}
              title={product.title}
            />
          ) : (
            // Mock-data fallback for products that pre-date Phase 2. New
            // vendor uploads can't reach this branch — publishing now
            // requires a cover.
            <div>
              <div
                className="rounded-[12px] h-[360px] flex items-center justify-center mb-3"
                style={{ background: productThumbBg(product.id) }}
              >
                <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
                  <path
                    d="M60 18 C36 18 22 36 22 65 C22 96 36 120 60 120 C84 120 98 96 98 65 C98 36 84 18 60 18Z"
                    stroke="#C1634F"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M38 65 C38 50 47 40 60 40 C73 40 82 50 82 65"
                    stroke="#C1634F"
                    strokeWidth="1.8"
                    fill="none"
                  />
                  <line x1="60" y1="18" x2="60" y2="12" stroke="#C1634F" strokeWidth="2" strokeLinecap="round" />
                  <ellipse cx="60" cy="12" rx="9" ry="5" stroke="#C1634F" strokeWidth="1.6" fill="none" />
                </svg>
              </div>
            </div>
          )}

          {/* Product info */}
          <div>
            {/* Seller */}
            <div className="flex items-center gap-2 mb-4">
              <Avatar initials={product.seller.slice(0, 2).toUpperCase()} size="sm" />
              <div>
                <div className="text-[14px] font-medium text-ch">{product.seller}</div>
                <div className="text-[12px] text-cl">{product.location}</div>
              </div>
              {product.verified && (
                <span className="ml-auto text-[10px] bg-sg-p text-sg-d px-2 py-0.5 rounded-full border border-sg-l">
                  CodaCo verified
                </span>
              )}
            </div>

            <h1 className="font-serif text-[28px] font-light text-ch mb-3 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              <Stars rating={product.rating} />
              <span className="text-[13px] text-cl">
                {product.reviewCount > 0 ? product.rating.toFixed(1) : "—"} · {product.reviewCount} reviews
              </span>
            </div>

            <div className="font-serif text-[32px] font-light text-tr mb-5">
              {formatPriceRange(product.priceMin, product.priceMax)}
            </div>

            <AddToCart product={product} />
          </div>
        </Container>
      </section>

      {/* Tabs section */}
      <section className="bg-tr-vp py-0">
        <Container width="mid">
          <ProductTabs
            product={product}
            reviews={reviews}
            summary={summary}
            sellerBio={vendor?.bio}
          />
        </Container>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-sg-vp px-10 py-10">
          <Container width="mid">
            <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-1">You might also like</p>
            <h2 className="font-serif text-[28px] font-light text-ch mb-6">
              More from this seller &amp; category
            </h2>
            <div className="grid-auto-178">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

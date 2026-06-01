export interface Variant {
  id: string;
  label: string;
  price: number;
  currency: string;
  stock: number;
}

export type ProductType =
  | "urns"
  | "jewelry"
  | "shrouds"
  | "planning"
  | "memorial"
  | "humor";

export type LifeStage =
  | "planning-ahead"
  | "active-dying"
  | "post-death"
  | "throughout";

export type ProductStatus =
  | "unknown"
  | "draft"
  | "published"
  | "archived";

export interface ProductDetail {
  dimensions?: string;
  capacity?: string;
  material?: string;
  finish?: string;
  closure?: string;
  weight?: string;
  shipsIn?: string;
  madeIn?: string;
  format?: string;
  delivery?: string;
  glazes?: string[];
  [key: string]: string | string[] | undefined;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  title: string;
  seller: string;
  sellerId: string;
  location: string;
  // Derived from variants. `priceMin === priceMax` for single-variant or
  // uniform-price products; listings render a "$X – $Y" range otherwise.
  priceMin: number;
  priceMax: number;
  currency: string;
  productType: ProductType;
  variants: Variant[];
  status: ProductStatus;
  verified: boolean;
  description: string;
  details: ProductDetail;
  lifeStages: LifeStage[];
  relatedIds?: string[];
  // Required at publish but nullable for drafts. Square 1024×1024 webp
  // uploaded via the vendor dashboard.
  coverImageUrl: string | null;
  // Empty on list views (getProducts); populated on getProduct.
  images: ProductImage[];
}

export interface ProductWithRating extends Product {
  rating: number;
  reviewCount: number;
}

export type VendorKind = "unknown" | "goods" | "services" | "both";

export interface Vendor {
  id: string;
  initials: string;
  name: string;
  kind: VendorKind;
  location: string;
  bio: string;
  credentials?: string;
  distanceMi?: number;
  lifeStages: LifeStage[];
  verified: boolean;
  memberSince?: string;
  photoSrc?: string;
  photoTone?: "sage" | "terracotta";
  // Public profile extras — all optional. Vendors fill them in from
  // the dashboard; the public profile renders only what's set.
  websiteUrl?: string;
  instagramHandle?: string;
  serviceRadius?: string;
  serviceFormats?: string;
  serviceDays?: string;
  serviceHours?: string;
  zip?: string;
  serviceDescription?: string;
  pricingNotes?: string;
  specializations: string[];
}

export interface VendorWithRating extends Vendor {
  rating: number;
  reviewCount: number;
}

export type ServiceType =
  | "doula"
  | "attorney"
  | "cleaner"
  | "celebrant"
  | "organizer"
  | "grief"
  | "home-funeral"
  | "green-burial"
  | "cafe"
  | "life-celebration"
  | "somatic-practitioner"
  | "mediator"
  | "spiritual-support"
  | "other";

export type ServiceLocationType =
  | "unknown"
  | "virtual"
  | "in_person"
  | "both";

export type ServicePricingModel =
  | "unknown"
  | "fixed"
  | "hourly"
  | "quote";

export type ServiceStatus =
  | "unknown"
  | "draft"
  | "published"
  | "archived";

export interface Service {
  id: string;
  vendorId: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  locationType: ServiceLocationType;
  pricingModel: ServicePricingModel;
  price?: number;
  currency: string;
  status: ServiceStatus;
}

export interface Review {
  id: string;
  productId: string;
  reviewer: string;
  location: string;
  date: string;
  rating: number;
  body: string;
}

export interface VendorReview {
  id: string;
  vendorId: string;
  reviewer: string;
  location: string;
  date: string;
  rating: number;
  body: string;
}

// Derived response shape — never persisted. Computed from `reviews`.
export interface ReviewSummary {
  productId: string;
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
}

export interface VendorReviewSummary {
  vendorId: string;
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
}

export interface Plan {
  id: "starter" | "standard" | "pro";
  name: string;
  price: number | null;
  period: "month" | null;
  // Discounted annual price, when offered alongside the monthly tier.
  priceYearly?: number | null;
  // Free-trial label shown in place of the price (e.g. "Free for 3 months").
  trial?: string;
  features: string[];
  popular: boolean;
  // Empty string hides the line on the plan card.
  transactionFee: string;
  targetType: "goods" | "services" | "both";
}

export interface CartItem {
  productId: string;
  variantId: string;
  qty: number;
}

export interface VendorStats {
  orders: number;
  avgRating: number;
  onTimePercent: number;
  memberSince: string;
}

export interface SellerProfile extends Vendor {
  shopName?: string;
}

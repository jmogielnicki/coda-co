export interface Variant {
  label: string;
  price: number;
  stock: number;
}

export type ProductCategory =
  | "urns"
  | "jewelry"
  | "shrouds"
  | "planning"
  | "memorial"
  | "humor";

export interface Badge {
  label: string;
  variant: "terracotta" | "sage";
}

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
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  title: string;
  seller: string;
  sellerId: string;
  location: string;
  price: number;
  category: ProductCategory;
  badge?: Badge;
  thumbBg: string;
  variants: Variant[];
  glazeOptions?: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  description: string;
  details: ProductDetail;
  relatedIds?: string[];
}

export type VendorType =
  | "doula"
  | "attorney"
  | "cleaner"
  | "celebrant"
  | "organizer"
  | "grief"
  | "home-funeral"
  | "funeral-home"
  | "green-burial"
  | "cremation";

export interface Vendor {
  id: string;
  initials: string;
  name: string;
  type: VendorType;
  location: string;
  bio: string;
  credentials?: string;
  rating: number;
  reviewCount: number;
  distanceMi?: number;
  accepting: boolean;
  virtual: boolean;
  inHome: boolean;
  specializations: string[];
  verified: boolean;
  memberSince?: string;
  // Excludes product-only sellers (ceramics studios, jewelers, etc.) from
  // service-provider listings. Defaults to true; set false on shop sellers.
  isServiceProvider?: boolean;
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

export interface ReviewSummary {
  productId: string;
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
}

export interface Plan {
  id: "starter" | "standard" | "pro";
  name: string;
  price: number | null;
  period: "month" | null;
  features: string[];
  popular: boolean;
  transactionFee: string;
  targetType: "goods" | "services" | "both";
}

export interface CartItem {
  productId: string;
  title: string;
  seller: string;
  price: number;
  qty: number;
  variant?: string;
  thumbBg: string;
}

export interface VendorStats {
  orders: number;
  avgRating: number;
  onTimePercent: number;
  memberSince: string;
}

export interface SellerProfile extends Vendor {
  shopName?: string;
  bio: string;
  stats: VendorStats;
}

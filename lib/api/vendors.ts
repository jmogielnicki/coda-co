import { vendors } from "@/lib/data/vendors";
import { vendorReviews } from "@/lib/data/vendor-reviews";
import { matchesLifeStage } from "@/lib/format/lifeStage";
import type {
  LifeStage,
  Vendor,
  VendorKind,
  VendorWithRating,
} from "@/lib/types";

export interface VendorFilters {
  kind?: VendorKind;
  minRating?: number;
  verified?: boolean;
  ids?: string[];
  lifeStage?: LifeStage | LifeStage[];
}

function withRating(vendor: Vendor): VendorWithRating {
  const rs = vendorReviews.filter((r) => r.vendorId === vendor.id);
  if (rs.length === 0) return { ...vendor, rating: 0, reviewCount: 0 };
  const sum = rs.reduce((n, r) => n + r.rating, 0);
  return { ...vendor, rating: sum / rs.length, reviewCount: rs.length };
}

export async function getVendors(filters: VendorFilters = {}): Promise<VendorWithRating[]> {
  let results = vendors;
  if (filters.kind) {
    results = results.filter((v) =>
      filters.kind === "both" ? v.kind === "both" : v.kind === filters.kind || v.kind === "both",
    );
  }
  if (filters.verified != null) results = results.filter((v) => v.verified === filters.verified);
  if (filters.ids) results = results.filter((v) => filters.ids!.includes(v.id));
  if (filters.lifeStage) {
    results = results.filter((v) => matchesLifeStage(v.lifeStages, filters.lifeStage));
  }
  const augmented = results.map(withRating);
  if (filters.minRating != null) {
    return augmented.filter((v) => v.rating >= filters.minRating!);
  }
  return augmented;
}

export async function getVendor(id: string): Promise<VendorWithRating | null> {
  const found = vendors.find((v) => v.id === id);
  return found ? withRating(found) : null;
}

export async function getFeaturedVendors(limit = 4): Promise<VendorWithRating[]> {
  return vendors
    .filter((v) => v.verified && (v.kind === "services" || v.kind === "both"))
    .slice(0, limit)
    .map(withRating);
}

// Curated set of vendors shown in the home page's "Support in your area"
// section, in the order the prototype displays them.
const HOME_VENDOR_IDS = [
  "maria-rosales",
  "james-thornton",
  "sunlight-leaving",
  "alma-park-celebrations",
] as const;

export async function getHomeFeaturedVendors(): Promise<VendorWithRating[]> {
  const byId = new Map(vendors.map((v) => [v.id, v]));
  return HOME_VENDOR_IDS.map((id) => byId.get(id))
    .filter((v): v is Vendor => v != null)
    .map(withRating);
}

// Placeholder until orders exist. Returns zeroed stats.
export async function getVendorStats(vendorId: string) {
  const vendor = vendors.find((v) => v.id === vendorId);
  return {
    orders: 0,
    avgRating: 0,
    onTimePercent: 0,
    memberSince: vendor?.memberSince ?? "",
  };
}

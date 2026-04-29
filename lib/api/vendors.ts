import { vendors } from "@/lib/data/vendors";
import type { Vendor, VendorType } from "@/lib/types";

export interface VendorFilters {
  type?: VendorType;
  minRating?: number;
  accepting?: boolean;
  virtual?: boolean;
  verified?: boolean;
  specialization?: string;
}

export async function getVendors(filters: VendorFilters = {}): Promise<Vendor[]> {
  let results = vendors;
  if (filters.type) results = results.filter((v) => v.type === filters.type);
  if (filters.minRating != null) results = results.filter((v) => v.rating >= filters.minRating!);
  if (filters.accepting != null) results = results.filter((v) => v.accepting === filters.accepting);
  if (filters.virtual != null) results = results.filter((v) => v.virtual === filters.virtual);
  if (filters.verified != null) results = results.filter((v) => v.verified === filters.verified);
  if (filters.specialization) {
    results = results.filter((v) =>
      v.specializations.some((s) =>
        s.toLowerCase().includes(filters.specialization!.toLowerCase())
      )
    );
  }
  return results;
}

export async function getVendor(id: string): Promise<Vendor | null> {
  return vendors.find((v) => v.id === id) ?? null;
}

export async function getFeaturedVendors(limit = 4): Promise<Vendor[]> {
  return vendors.filter((v) => v.verified && v.accepting).slice(0, limit);
}

// Curated set of vendors shown in the home page's "Support in your area"
// section, in the order the prototype displays them.
const HOME_VENDOR_IDS = [
  "maria-rosales",
  "james-thornton",
  "sunlight-leaving",
  "alma-park-celebrations",
] as const;

export async function getHomeFeaturedVendors(): Promise<Vendor[]> {
  const byId = new Map(vendors.map((v) => [v.id, v]));
  return HOME_VENDOR_IDS.map((id) => byId.get(id)).filter(
    (v): v is Vendor => v != null
  );
}

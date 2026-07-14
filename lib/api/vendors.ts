import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isKnownZip, milesBetweenZips } from "@/lib/geo";
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
  // OR semantics — vendor matches if any of their specializations are
  // in this list. Already-validated against the canonical list by the
  // caller (lib/data/specializations.parseSpecializationsParam).
  specializations?: string[];
  // Searcher's zip (or free text containing one). When set and
  // resolvable, vendors with a declared service area (zip +
  // serviceRadiusMi) are kept only if the searcher falls within their
  // radius; their distance from the searcher is attached as distanceMi.
  // Vendors without a service area (virtual / nationwide) always pass.
  near?: string;
}

type DbVendor = Prisma.VendorProfileGetPayload<{}>;

function toVendor(v: DbVendor): Vendor {
  return {
    id: v.slug,
    initials: v.initials ?? deriveInitials(v.displayName),
    name: v.displayName,
    kind: v.kind as VendorKind,
    location: v.location,
    bio: v.bio,
    credentials: v.credentials ?? undefined,
    distanceMi: v.distanceMi ?? undefined,
    lifeStages: v.lifeStages as LifeStage[],
    verified: v.verified,
    memberSince: v.memberSince ? v.memberSince.toISOString().slice(0, 10) : undefined,
    photoSrc: v.photoSrc ?? undefined,
    photoTone: (v.photoTone as Vendor["photoTone"]) ?? undefined,
    websiteUrl: v.websiteUrl ?? undefined,
    instagramHandle: v.instagramHandle ?? undefined,
    serviceRadius: v.serviceRadius ?? undefined,
    serviceRadiusMi: v.serviceRadiusMi ?? undefined,
    serviceFormats: v.serviceFormats ?? undefined,
    serviceDays: v.serviceDays ?? undefined,
    serviceHours: v.serviceHours ?? undefined,
    zip: v.zip ?? undefined,
    serviceDescription: v.serviceDescription ?? undefined,
    pricingNotes: v.pricingNotes ?? undefined,
    specializations: v.specializations,
  };
}

function deriveInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function expandLifeStageFilter(filter: LifeStage | LifeStage[]): LifeStage[] {
  const list = Array.isArray(filter) ? filter : [filter];
  if (list.includes("throughout")) return list;
  return [...list, "throughout"];
}

async function attachRatings(
  rows: { dbId: string; vendor: Vendor }[],
): Promise<VendorWithRating[]> {
  if (rows.length === 0) return [];
  const grouped = await prisma.vendorReview.groupBy({
    by: ["vendorId"],
    where: { vendorId: { in: rows.map((r) => r.dbId) } },
    _count: { _all: true },
    _avg: { rating: true },
  });
  const byId = new Map(grouped.map((g) => [g.vendorId, g]));
  return rows.map(({ dbId, vendor }) => {
    const g = byId.get(dbId);
    return {
      ...vendor,
      rating: g?._avg.rating ?? 0,
      reviewCount: g?._count._all ?? 0,
    };
  });
}

export async function getVendors(filters: VendorFilters = {}): Promise<VendorWithRating[]> {
  const where: Prisma.VendorProfileWhereInput = {};
  if (filters.kind) {
    // 'both' covers either listing surface; an exact 'goods' or 'services'
    // filter should still surface vendors flagged as 'both'.
    if (filters.kind === "both") where.kind = "both";
    else where.kind = { in: [filters.kind, "both"] };
  }
  if (filters.verified != null) where.verified = filters.verified;
  if (filters.ids) where.slug = { in: filters.ids };
  if (filters.lifeStage) {
    where.lifeStages = { hasSome: expandLifeStageFilter(filters.lifeStage) };
  }
  if (filters.specializations && filters.specializations.length > 0) {
    where.specializations = { hasSome: filters.specializations };
  }

  const rows = await prisma.vendorProfile.findMany({ where, orderBy: { createdAt: "asc" } });
  let results = await attachRatings(rows.map((v) => ({ dbId: v.id, vendor: toVendor(v) })));

  // Geographic filter (vendor service-area semantics). Applied in JS
  // rather than SQL because the distance lookup is a zip-centroid
  // calculation. Only runs when the searcher's zip resolves — an
  // unknown/blank zip is a no-op so the page never silently empties.
  if (filters.near && isKnownZip(filters.near)) {
    results = results.filter((v) => {
      // No vendor zip → not geographically bound (virtual / nationwide
      // / incomplete profile). Always surface.
      if (!v.zip) return true;
      const d = milesBetweenZips(filters.near, v.zip);
      // Unknown vendor zip → can't measure, so don't hide them.
      if (d == null) return true;
      v.distanceMi = Math.round(d * 10) / 10;
      // No declared radius → not bound to a service area; surface
      // regardless of distance (but distance is now shown).
      if (v.serviceRadiusMi == null) return true;
      return d <= v.serviceRadiusMi;
    });
  }

  if (filters.minRating != null) {
    results = results.filter((v) => v.rating >= filters.minRating!);
  }
  return results;
}

export async function getVendor(id: string): Promise<VendorWithRating | null> {
  const v = await prisma.vendorProfile.findUnique({ where: { slug: id } });
  if (!v) return null;
  const summary = await prisma.vendorReview.aggregate({
    where: { vendorId: v.id },
    _count: { _all: true },
    _avg: { rating: true },
  });
  return {
    ...toVendor(v),
    rating: summary._avg.rating ?? 0,
    reviewCount: summary._count._all,
  };
}

export async function getFeaturedVendors(limit = 4): Promise<VendorWithRating[]> {
  const rows = await prisma.vendorProfile.findMany({
    where: { verified: true, kind: { in: ["services", "both"] } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return attachRatings(rows.map((v) => ({ dbId: v.id, vendor: toVendor(v) })));
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
  const rows = await prisma.vendorProfile.findMany({
    where: { slug: { in: [...HOME_VENDOR_IDS] } },
  });
  const bySlug = new Map(rows.map((v) => [v.slug, v]));
  const ordered = HOME_VENDOR_IDS.map((id) => bySlug.get(id)).filter(
    (v): v is DbVendor => v != null,
  );
  return attachRatings(ordered.map((v) => ({ dbId: v.id, vendor: toVendor(v) })));
}

// Placeholder until orders exist. Returns zeroed stats — the future shape
// is documented in docs/data-model-evolution.md.
export async function getVendorStats(vendorId: string) {
  const vendor = await prisma.vendorProfile.findUnique({ where: { slug: vendorId } });
  return {
    orders: 0,
    avgRating: 0,
    onTimePercent: 0,
    memberSince: vendor?.memberSince ? vendor.memberSince.toISOString().slice(0, 10) : "",
  };
}

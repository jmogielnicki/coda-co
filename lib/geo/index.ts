// Server-only geo lookups backed by the bundled `zipcodes` US dataset.
// Importing this module pulls the full dataset into the bundle, so keep
// it out of client components — use lib/geo/zip for the pure helpers
// (normalizeZip, parseRadiusLabel), which this module re-exports.

import zipcodes from "zipcodes";
import { normalizeZip } from "./zip";

export { normalizeZip, parseRadiusLabel } from "./zip";

// True when the zip resolves to a known US centroid. Used to decide
// whether a searcher's location is usable before we filter by it.
export function isKnownZip(zip: string | null | undefined): boolean {
  const z = normalizeZip(zip);
  return z != null && zipcodes.lookup(z) != null;
}

// Great-circle distance in miles between two zips, or null when either
// zip is unknown to the dataset.
export function milesBetweenZips(
  a: string | null | undefined,
  b: string | null | undefined,
): number | null {
  const za = normalizeZip(a);
  const zb = normalizeZip(b);
  if (!za || !zb) return null;
  const d = zipcodes.distance(za, zb);
  return typeof d === "number" && Number.isFinite(d) ? d : null;
}

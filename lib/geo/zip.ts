import { ZCTA_CENTROIDS, type Centroid } from "./zcta-data";

export interface LatLng {
  lat: number;
  lng: number;
}

// Mean Earth radius in miles (IUGG). Straight-line ("as the crow flies")
// distance — drive-time is out of scope for v1 (docs/geo-search-plan.md).
const EARTH_RADIUS_MI = 3958.7613;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

// US ZIP: exactly 5 digits, optionally a ZIP+4 suffix ("-1234"). We only
// geocode at the 5-digit level, so the +4 is tolerated but ignored.
const US_ZIP = /^\d{5}(?:-\d{4})?$/;

export function isValidUsZip(raw: string): boolean {
  return US_ZIP.test(raw.trim());
}

// Reduce any accepted ZIP form to its bare 5-digit key. Returns null when
// the input isn't a valid US ZIP so callers can branch instead of guessing.
export function normalizeZip(raw: string): string | null {
  const trimmed = raw.trim();
  if (!isValidUsZip(trimmed)) return null;
  return trimmed.slice(0, 5);
}

// Resolve a ZIP to its ZCTA centroid. Returns null for invalid input or a
// ZIP absent from the table (e.g. the seed subset in dev, or genuinely
// non-existent ZIPs) — callers must handle the miss, never assume a point.
export function zipToCentroid(raw: string): LatLng | null {
  const zip = normalizeZip(raw);
  if (!zip) return null;
  const hit: Centroid | undefined = ZCTA_CENTROIDS[zip];
  if (!hit) return null;
  return { lat: hit[0], lng: hit[1] };
}

// Great-circle distance between two points, in miles.
export function haversineMi(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(h));
}

// Convenience: distance between two ZIPs. Null if either can't be resolved.
export function zipDistanceMi(fromZip: string, toZip: string): number | null {
  const from = zipToCentroid(fromZip);
  const to = zipToCentroid(toZip);
  if (!from || !to) return null;
  return haversineMi(from, to);
}

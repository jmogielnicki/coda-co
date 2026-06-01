// ZIP Code Tabulation Area (ZCTA) centroids: `zip → [lat, lng]`.
//
// This is a SEED SUBSET — real, verified centroids for the cities used by
// the mock vendor data (lib/data/vendors.ts) plus a few reference points,
// so geocoding works in dev and `scripts/verify-geo.ts` has known
// distances to assert against.
//
// The full ~33k-row national table is generated, not hand-maintained:
// run `node scripts/build-zcta.mjs <path-to-census-gazetteer.txt>` in a
// network-enabled environment before launch to overwrite this file. The
// shape below is exactly what the generator emits.
//
// Centroid precision is city-level (±1–3 mi), which is well within
// tolerance for 5–50 mi radius matching — see docs/geo-search-plan.md.

export type Centroid = readonly [lat: number, lng: number];

export const ZCTA_CENTROIDS: Readonly<Record<string, Centroid>> = {
  // Colorado — Front Range (covers the mock vendors)
  "80301": [40.0466, -105.2295], // Boulder
  "80302": [40.0263, -105.2992], // Boulder (west)
  "80026": [40.0008, -105.1019], // Lafayette
  "80020": [39.9331, -105.0512], // Broomfield
  "80525": [40.5226, -105.0509], // Fort Collins
  "80537": [40.3895, -105.0807], // Loveland
  "80118": [39.2069, -104.8772], // Larkspur
  "80202": [39.7525, -104.9986], // Denver (downtown)
  "80203": [39.7308, -104.9787], // Denver (Capitol Hill)

  // Other mock-vendor cities
  "97201": [45.4979, -122.6918], // Portland, OR
  "78701": [30.2716, -97.7426], // Austin, TX
  "11201": [40.6939, -73.9903], // Brooklyn, NY
};

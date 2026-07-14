// Minimal type surface for the `zipcodes` package (no bundled types).
// We only use lookup + distance; declare just those.
declare module "zipcodes" {
  interface ZipEntry {
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }
  /** Returns the centroid record for a 5-digit US zip, or undefined. */
  export function lookup(zip: string | number): ZipEntry | undefined;
  /** Great-circle distance between two zips in miles, or null/undefined
   * if either zip is unknown. */
  export function distance(a: string | number, b: string | number): number | null;
  const _default: {
    lookup: typeof lookup;
    distance: typeof distance;
  };
  export default _default;
}

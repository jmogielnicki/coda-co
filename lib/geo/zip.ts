// Pure zip helpers — no data dependency, safe to import from client
// components. The heavier zipcodes-backed lookups live in lib/geo
// (index.ts) and must stay server-only so the ~2MB dataset never ships
// to the browser.

// Pull the first 5-digit run out of a raw string. Accepts a bare zip
// ("80301"), a zip+4 ("80301-1234" -> "80301"), or free text the search
// box might contain ("Boulder, CO 80301" -> "80301"). Returns null when
// there's no 5-digit run.
export function normalizeZip(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const m = String(raw).match(/\d{5}/);
  return m ? m[0] : null;
}

// Parse a signup radius pill ("5 mi", "15 mi", "Virtual only") into a
// numeric mile value. Labels with no number ("Virtual only") return
// null, meaning the vendor isn't bound to a geographic service radius
// and should surface in searches regardless of distance.
export function parseRadiusLabel(label: string | null | undefined): number | null {
  if (label == null) return null;
  const m = String(label).match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

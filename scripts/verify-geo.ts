// Smoke test for lib/geo/zip.ts — runnable without a test framework:
//   npx tsx scripts/verify-geo.ts
//
// Asserts the pure helpers (validation, normalization, lookup, Haversine)
// against known values, including the original "Fort Collins → ?" scenario
// from docs/geo-search-plan.md.

import {
  haversineMi,
  isValidUsZip,
  normalizeZip,
  zipDistanceMi,
  zipToCentroid,
} from "../lib/geo/zip";

let failures = 0;
function check(label: string, pass: boolean, detail = "") {
  const mark = pass ? "✓" : "✗";
  if (!pass) failures++;
  console.log(`  ${mark} ${label}${detail ? ` — ${detail}` : ""}`);
}
function near(label: string, actual: number, expected: number, tolMi: number) {
  const ok = Math.abs(actual - expected) <= tolMi;
  check(label, ok, `${actual.toFixed(1)} mi (expected ~${expected} ±${tolMi})`);
}

console.log("ZIP validation");
check("5-digit valid", isValidUsZip("80525"));
check("ZIP+4 valid", isValidUsZip("80525-1234"));
check("whitespace tolerated", isValidUsZip("  80525 "));
check("4-digit rejected", !isValidUsZip("8052"));
check("non-numeric rejected", !isValidUsZip("8052a"));
check("normalize strips +4", normalizeZip("80525-1234") === "80525");
check("normalize bad → null", normalizeZip("nope") === null);

console.log("Lookup");
check("known ZIP resolves", zipToCentroid("80525") !== null);
check("absent ZIP → null", zipToCentroid("99999") === null);
check("invalid ZIP → null", zipToCentroid("abc") === null);

console.log("Haversine");
near("identity is zero", haversineMi({ lat: 40, lng: -105 }, { lat: 40, lng: -105 }), 0, 0.01);
// Reference: Boulder 80301 ↔ Denver 80202 ≈ 24 mi straight-line.
near("Boulder ↔ Denver", zipDistanceMi("80301", "80202")!, 24, 4);

console.log("Original scenario — buyer in Fort Collins (80525)");
near("→ Boulder (80301)", zipDistanceMi("80525", "80301")!, 35, 6);
near("→ Denver (80202)", zipDistanceMi("80525", "80202")!, 53, 6);
near("→ Loveland (80537)", zipDistanceMi("80525", "80537")!, 9, 4);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);

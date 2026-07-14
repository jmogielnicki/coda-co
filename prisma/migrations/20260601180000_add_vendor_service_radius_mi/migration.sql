-- Numeric service radius (miles) used by the live geographic search
-- filter. A vendor surfaces for a searcher whose zip is within
-- service_radius_mi miles of the vendor's zip. Null = no geographic
-- service area (virtual-only / nationwide), surfaced regardless of
-- distance. Stored alongside the existing free-form `service_radius`
-- display string.

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "service_radius_mi" INTEGER;

-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "service_radius_mi" INTEGER;

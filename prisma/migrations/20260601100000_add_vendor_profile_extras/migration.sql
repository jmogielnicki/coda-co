-- Public-facing extras for the vendor profile page: contact links
-- (website + Instagram) and four free-form service-area fields shown
-- on the "Services & service area" card. All optional — vendors fill
-- in only what they want shown.

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "website_url" TEXT;
ALTER TABLE "vendor_profile" ADD COLUMN     "instagram_handle" TEXT;
ALTER TABLE "vendor_profile" ADD COLUMN     "service_radius" TEXT;
ALTER TABLE "vendor_profile" ADD COLUMN     "service_formats" TEXT;
ALTER TABLE "vendor_profile" ADD COLUMN     "service_days" TEXT;
ALTER TABLE "vendor_profile" ADD COLUMN     "service_hours" TEXT;

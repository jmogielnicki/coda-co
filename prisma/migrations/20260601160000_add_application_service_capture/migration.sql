-- Capture the specific service type + location type the applicant
-- picked on Step 2/3 of the services form, so approveApplication can
-- auto-create the vendor's first draft Service row from the data
-- they already provided — no second-form step on the way in.

-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "service_type_slug" TEXT;
ALTER TABLE "vendor_applications" ADD COLUMN     "service_location_type" "ServiceLocationType" NOT NULL DEFAULT 'unknown';

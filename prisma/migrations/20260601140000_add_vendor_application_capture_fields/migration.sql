-- Capture-fields update: persist Zip, Service description, Pricing
-- notes, and Life stages from the application form all the way to the
-- vendor profile. Three columns added to both tables; lifeStages was
-- already on vendor_profile but is added to vendor_applications now so
-- the application captures it before approval.

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "zip" TEXT;
ALTER TABLE "vendor_profile" ADD COLUMN     "service_description" TEXT;
ALTER TABLE "vendor_profile" ADD COLUMN     "pricing_notes" TEXT;

-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "zip" TEXT;
ALTER TABLE "vendor_applications" ADD COLUMN     "service_description" TEXT;
ALTER TABLE "vendor_applications" ADD COLUMN     "pricing_notes" TEXT;
ALTER TABLE "vendor_applications" ADD COLUMN     "life_stages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Vendor specializations: curated tag arrays on both the application
-- (what the applicant declared) and the profile (carried forward by
-- the approval action). Drives the /services search filter.

-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[];

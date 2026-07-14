-- AlterEnum
-- Adds the `pending_review` state a vendor's first listing sits in until a
-- CodaCo admin approves it. `BEFORE 'published'` keeps the Postgres enum
-- sort order aligned with the schema (so `ORDER BY status` stays sensible).
ALTER TYPE "ProductStatus" ADD VALUE 'pending_review' BEFORE 'published';

-- AlterTable
-- Flips true when a vendor's first listing is approved; thereafter their
-- listings publish without per-listing review.
ALTER TABLE "vendor_profile" ADD COLUMN "listings_auto_approve" BOOLEAN NOT NULL DEFAULT false;

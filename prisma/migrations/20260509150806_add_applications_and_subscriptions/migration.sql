-- CreateEnum
CREATE TYPE "ApplicationKind" AS ENUM ('unknown', 'goods', 'services', 'both');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('unknown', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "SubscriptionPlanId" AS ENUM ('unknown', 'starter', 'standard', 'pro');

-- CreateEnum
CREATE TYPE "SubscriptionKind" AS ENUM ('unknown', 'goods', 'services');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('unknown', 'active', 'past_due', 'cancelled');

-- CreateTable
CREATE TABLE "vendor_applications" (
    "id" TEXT NOT NULL,
    "applicant_user_id" TEXT NOT NULL,
    "kind" "ApplicationKind" NOT NULL DEFAULT 'unknown',
    "proposed_display_name" TEXT NOT NULL,
    "proposed_slug" TEXT NOT NULL,
    "proposed_bio" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "plan_id" "SubscriptionPlanId" NOT NULL DEFAULT 'unknown',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'submitted',
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "plan_id" "SubscriptionPlanId" NOT NULL DEFAULT 'unknown',
    "kind" "SubscriptionKind" NOT NULL DEFAULT 'unknown',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'unknown',
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendor_applications_applicant_user_id_idx" ON "vendor_applications"("applicant_user_id");

-- CreateIndex
CREATE INDEX "vendor_applications_status_idx" ON "vendor_applications"("status");

-- CreateIndex
CREATE INDEX "subscriptions_vendor_id_idx" ON "subscriptions"("vendor_id");

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_applicant_user_id_fkey" FOREIGN KEY ("applicant_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

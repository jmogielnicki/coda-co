-- One-time vendor charges (today: the Storefront plan set-up fee). Kept
-- separate from `subscriptions` so one-time charges + their Stripe
-- references don't muddy the recurring-plan relationship. Rows are
-- created at signup in `pending`; Stripe later sets paid_at + the
-- payment-intent id and flips status to `paid`.

-- CreateEnum
CREATE TYPE "VendorPaymentType" AS ENUM ('unknown', 'setup_fee');

-- CreateEnum
CREATE TYPE "VendorPaymentStatus" AS ENUM ('unknown', 'pending', 'paid', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "vendor_payments" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "plan_id" "SubscriptionPlanId" NOT NULL DEFAULT 'unknown',
    "type" "VendorPaymentType" NOT NULL DEFAULT 'unknown',
    "status" "VendorPaymentStatus" NOT NULL DEFAULT 'unknown',
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripe_customer_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendor_payments_vendor_id_idx" ON "vendor_payments"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_payments_status_idx" ON "vendor_payments"("status");

-- AddForeignKey
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Client-to-vendor inquiries captured by the public profile contact
-- form. Saved before the notification email is sent so a lead is never
-- lost on a delivery failure. read_at is null until the vendor opens
-- their messages (drives the dashboard unread badge). The client's
-- email is stored here and used as the notification's reply-to; the
-- vendor's own email is never exposed to the client.

-- CreateTable
CREATE TABLE "vendor_inquiries" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendor_inquiries_vendor_id_idx" ON "vendor_inquiries"("vendor_id");

-- AddForeignKey
ALTER TABLE "vendor_inquiries" ADD CONSTRAINT "vendor_inquiries_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

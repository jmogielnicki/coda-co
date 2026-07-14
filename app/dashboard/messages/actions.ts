"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/app/dashboard/lib";
import { prisma } from "@/lib/db";

// Marks all of the signed-in vendor's unread inquiries as read. Scoped
// to the vendor derived from the session — never trusts a client id.
export async function markAllInquiriesRead() {
  const { vendor } = await requireVendor();
  await prisma.vendorInquiry.updateMany({
    where: { vendorId: vendor.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
}

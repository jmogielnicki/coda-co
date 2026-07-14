"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendListingApprovedEmail } from "@/lib/email/templates";
import { log } from "@/lib/log";

export type ListingReviewResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session.user;
}

// Approve a vendor's listing that's awaiting review. Publishes it and —
// crucially — flips the vendor's `listingsAutoApprove` so every later
// listing they publish goes live without review. Both writes happen in
// one transaction so a vendor can't end up "trusted" with an unpublished
// first listing (or vice versa).
export async function approveListing(
  productId: string,
): Promise<ListingReviewResult> {
  const admin = await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: {
        select: {
          id: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });
  if (!product) return { ok: false, error: "Listing not found." };
  if (product.status !== "pending_review") {
    return { ok: false, error: "This listing isn't awaiting review." };
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: { status: "published" },
    }),
    prisma.vendorProfile.update({
      where: { id: product.vendor.id },
      data: { listingsAutoApprove: true },
    }),
  ]);

  log.info("listing.approved", {
    productId: product.id,
    vendorId: product.vendor.id,
    adminId: admin.id,
  });

  // Best-effort — a missed email never blocks the listing going live.
  const email = await sendListingApprovedEmail({
    toEmail: product.vendor.user.email,
    toName: product.vendor.user.name ?? null,
    productTitle: product.title,
    productSlug: product.slug,
  });
  if (!email.ok) {
    log.warn("listing.approved_email_failed", {
      productId: product.id,
      err: email.error,
    });
  }

  revalidatePath("/admin/listings");
  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${product.id}`);
  revalidatePath("/shop");
  return { ok: true };
}

// Send a listing back to the vendor as a draft so they can revise and
// resubmit. (A reviewer-note email is a sensible follow-up; for now the
// vendor sees it return to "Draft" in their dashboard.)
export async function rejectListing(
  productId: string,
): Promise<ListingReviewResult> {
  const admin = await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true },
  });
  if (!product) return { ok: false, error: "Listing not found." };
  if (product.status !== "pending_review") {
    return { ok: false, error: "This listing isn't awaiting review." };
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { status: "draft" },
  });
  log.info("listing.sent_back_to_draft", { productId: product.id, adminId: admin.id });

  revalidatePath("/admin/listings");
  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${product.id}`);
  return { ok: true };
}

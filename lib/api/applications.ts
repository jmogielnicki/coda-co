import type { ApplicationKind, ApplicationStatus, SubscriptionPlanId } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export interface ApplicationDraft {
  applicantUserId: string;
  kind: ApplicationKind;
  proposedDisplayName: string;
  proposedSlug: string;
  proposedBio: string;
  location: string;
  planId: SubscriptionPlanId;
}

// Slug must be URL-safe and unique. We strip everything but lowercase
// alphanumerics + hyphens; the caller already collision-checks before
// writing, but Prisma's unique constraint backstops races.
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createApplication(draft: ApplicationDraft) {
  return prisma.vendorApplication.create({
    data: {
      applicantUserId: draft.applicantUserId,
      kind: draft.kind,
      proposedDisplayName: draft.proposedDisplayName,
      proposedSlug: draft.proposedSlug,
      proposedBio: draft.proposedBio,
      location: draft.location,
      planId: draft.planId,
      status: "submitted",
    },
  });
}

export async function listApplications(status?: ApplicationStatus) {
  return prisma.vendorApplication.findMany({
    where: status ? { status } : undefined,
    include: { applicant: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplication(id: string) {
  return prisma.vendorApplication.findUnique({
    where: { id },
    include: { applicant: { select: { id: true, email: true, name: true } } },
  });
}

// Approval is the only place a vendor_profile + subscription gets created
// outside the mock script. We do both rows in one transaction so a half-
// approved application can't leave a vendor without a subscription.
export async function approveApplication(applicationId: string, reviewerId: string) {
  return prisma.$transaction(async (tx) => {
    const app = await tx.vendorApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new Error("Application not found");
    if (app.status !== "submitted") throw new Error("Application is not pending review");

    const subscriptionKind = app.kind === "services" ? "services" : "goods";

    const vendor = await tx.vendorProfile.create({
      data: {
        userId: app.applicantUserId,
        slug: app.proposedSlug,
        displayName: app.proposedDisplayName,
        bio: app.proposedBio,
        location: app.location,
        kind: app.kind,
        verified: false,
      },
    });

    await tx.subscription.create({
      data: {
        vendorId: vendor.id,
        planId: app.planId,
        kind: subscriptionKind,
        status: "active",
      },
    });

    await tx.vendorApplication.update({
      where: { id: applicationId },
      data: {
        status: "approved",
        reviewedByUserId: reviewerId,
        reviewedAt: new Date(),
      },
    });

    return vendor;
  });
}

export async function rejectApplication(applicationId: string, reviewerId: string, notes?: string) {
  return prisma.vendorApplication.update({
    where: { id: applicationId },
    data: {
      status: "rejected",
      reviewedByUserId: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: notes,
    },
  });
}

// Convenience used by demo auto-approve and the admin queue alike.
export async function autoApproveAsAdmin(applicationId: string) {
  // Find any admin to attribute the auto-approval to so the audit trail
  // shows it didn't happen out of nowhere. Falls back to the applicant's
  // own id only if no admin exists (dev edge case).
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  const reviewerId = admin?.id ?? (await prisma.vendorApplication.findUnique({
    where: { id: applicationId },
    select: { applicantUserId: true },
  }))?.applicantUserId;
  if (!reviewerId) throw new Error("No reviewer available for auto-approval");
  return approveApplication(applicationId, reviewerId);
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session.user;
}

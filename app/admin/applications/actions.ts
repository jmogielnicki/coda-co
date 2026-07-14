"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  approveApplication,
  getApplication,
  rejectApplication,
} from "@/lib/api/applications";
import { sendApplicationApprovedEmail } from "@/lib/email/templates";
import { log } from "@/lib/log";
import { rateLimit } from "@/lib/rate-limit";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function approve(applicationId: string) {
  const admin = await requireAdmin();
  await approveApplication(applicationId, admin.id);
  revalidatePath("/admin/applications");
}

export async function reject(applicationId: string, formData: FormData) {
  const admin = await requireAdmin();
  const notes = String(formData.get("notes") ?? "").trim();
  await rejectApplication(applicationId, admin.id, notes || undefined);
  revalidatePath("/admin/applications");
}

export type ResendResult = { ok: true } | { ok: false; error: string };

// Re-sends the approval email for an already-approved application. The
// original auto-send is skipped when RESEND_API_KEY isn't configured, so
// this covers vendors approved during that window. Rebuilds the email
// from the application data — the same inputs the original send used.
export async function resendApprovalEmail(
  applicationId: string,
): Promise<ResendResult> {
  const admin = await requireAdmin();

  const limited = rateLimit(`resend-approval:${admin.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return { ok: false, error: "Too many resends in the last hour. Try again later." };
  }

  const app = await getApplication(applicationId);
  if (!app) return { ok: false, error: "Application not found." };
  if (app.status !== "approved") {
    return { ok: false, error: "Only approved applications have an approval email." };
  }

  const result = await sendApplicationApprovedEmail({
    toEmail: app.applicant.email,
    toName: app.applicant.name,
    displayName: app.proposedDisplayName,
    vendorSlug: app.proposedSlug,
  });
  if (!result.ok) {
    log.warn("application.resend_approval_failed", { applicationId, err: result.error });
    return { ok: false, error: result.error };
  }
  log.info("application.approval_email_resent", { applicationId, adminId: admin.id });
  return { ok: true };
}

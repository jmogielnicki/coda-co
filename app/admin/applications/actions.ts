"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { approveApplication, rejectApplication } from "@/lib/api/applications";

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

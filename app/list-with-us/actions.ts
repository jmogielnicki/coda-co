"use server";

import type { ApplicationKind, SubscriptionPlanId } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  autoApproveAsAdmin,
  createApplication,
  normalizeSlug,
} from "@/lib/api/applications";
import { prisma } from "@/lib/db";

export interface ApplicationFormState {
  error?: string;
}

const VALID_KINDS = new Set<ApplicationKind>(["goods", "services", "both"]);
const VALID_PLANS = new Set<SubscriptionPlanId>(["starter", "standard", "pro"]);

interface SubmitInput {
  kind: ApplicationKind;
  displayName: string;
  bio: string;
  city: string;
  state: string;
  planId: SubscriptionPlanId;
}

// Returns a unique slug by appending -2, -3, … if the seed collides.
async function uniqueSlug(seed: string): Promise<string> {
  const base = normalizeSlug(seed);
  if (!base) throw new Error("Could not derive a slug from the display name");
  let candidate = base;
  let n = 2;
  // Vendor profiles are the canonical owners of slugs once approved; we
  // also probe vendor_applications so a new applicant doesn't collide
  // with one already in flight.
  while (true) {
    const [profile, app] = await Promise.all([
      prisma.vendorProfile.findUnique({ where: { slug: candidate }, select: { id: true } }),
      prisma.vendorApplication.findFirst({ where: { proposedSlug: candidate }, select: { id: true } }),
    ]);
    if (!profile && !app) return candidate;
    candidate = `${base}-${n++}`;
  }
}

async function submit(input: SubmitInput): Promise<ApplicationFormState> {
  if (!VALID_KINDS.has(input.kind)) return { error: "Invalid application kind." };
  if (!VALID_PLANS.has(input.planId)) return { error: "Pick a plan to continue." };
  if (!input.displayName.trim()) return { error: "Tell us your shop or practice name." };
  if (!input.city.trim() || !input.state.trim()) {
    return { error: "Add a city and state." };
  }

  const session = await auth();
  if (!session?.user) {
    // Visitors who hit this server action while signed-out get sent to
    // signup with a deep-link back to the form they came from.
    redirect(`/signup?next=/list-with-us/${input.kind === "services" ? "services" : "goods"}`);
  }

  const slug = await uniqueSlug(input.displayName);

  const app = await createApplication({
    applicantUserId: session.user.id,
    kind: input.kind,
    proposedDisplayName: input.displayName.trim(),
    proposedSlug: slug,
    proposedBio: input.bio.trim(),
    location: `${input.city.trim()}, ${input.state.trim()}`,
    planId: input.planId,
  });

  // Demo auto-approve: a single env flag flips the admin queue off so a
  // prospect can sign up and have a working dashboard in under a minute.
  // Off in production. The admin queue still works either way.
  if (process.env.DEMO_AUTO_APPROVE_VENDORS === "1") {
    await autoApproveAsAdmin(app.id);
    redirect("/dashboard");
  }

  redirect("/list-with-us/confirm");
}

export async function submitGoodsApplication(input: Omit<SubmitInput, "kind">) {
  return submit({ ...input, kind: "goods" });
}

export async function submitServicesApplication(input: Omit<SubmitInput, "kind">) {
  return submit({ ...input, kind: "services" });
}

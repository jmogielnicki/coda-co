"use server";

import type { ApplicationKind, SubscriptionPlanId } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  autoApproveAsAdmin,
  createApplication,
  normalizeSlug,
} from "@/lib/api/applications";
import { isValidSpecialization } from "@/lib/data/specializations";
import { normalizeZip, parseRadiusLabel } from "@/lib/geo/zip";
import { prisma } from "@/lib/db";
import {
  sendApplicationSubmittedEmail,
  sendListYourGoodsEmail,
} from "@/lib/email/templates";
import { log } from "@/lib/log";

export interface ApplicationFormState {
  error?: string;
}

const VALID_KINDS = new Set<ApplicationKind>(["goods", "services", "both"]);
const VALID_PLANS = new Set<SubscriptionPlanId>(["starter", "standard", "pro"]);
// Mirrors the maxLength on the corresponding textareas in ServicesForm
// / GoodsForm. Server-side enforcement is what actually keeps a
// copy-paste or scripted client from overrunning the column.
const BIO_MAX = 500;
const DESC_MAX = 500;
const NOTES_MAX = 500;

interface SubmitInput {
  kind: Exclude<ApplicationKind, "unknown">;
  displayName: string;
  bio: string;
  city: string;
  state: string;
  planId: SubscriptionPlanId;
  // Curated tags the applicant picked on Step 2. Validated against
  // the canonical list — anything unrecognized is dropped silently.
  specializations?: string[];
  zip?: string;
  // Services form only — the chosen service-radius pill ("15 mi",
  // "Virtual only"). Parsed to a numeric mileage server-side.
  radius?: string;
  serviceDescription?: string;
  pricingNotes?: string;
  lifeStages?: string[];
  // Services form only — used by approveApplication to auto-create
  // the vendor's first draft Service from data they already gave us.
  serviceTypeSlug?: string;
  inHome?: boolean;
  virtual?: boolean;
}

const VALID_LIFE_STAGES = new Set<string>([
  "planning-ahead",
  "active-dying",
  "post-death",
  "throughout",
]);

type ServiceLocation = "unknown" | "virtual" | "in_person" | "both";

function deriveLocationType(
  inHome: boolean | undefined,
  virtual: boolean | undefined,
): ServiceLocation {
  if (inHome && virtual) return "both";
  if (inHome) return "in_person";
  if (virtual) return "virtual";
  return "unknown";
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
  // Zip is required for every applicant — it drives the geographic
  // search filter (zip + radius for services; location for goods).
  const normalizedZip = normalizeZip(input.zip);
  if (!normalizedZip) {
    return { error: "Add a valid 5-digit zip code so buyers can find you." };
  }
  if (!input.bio.trim()) {
    return { error: "Tell clients a bit about you (the 'About you' field)." };
  }
  if (input.bio.length > BIO_MAX) {
    return { error: `Bio is too long — keep it under ${BIO_MAX} characters.` };
  }
  // serviceDescription/pricingNotes are sent by the services form only.
  // Goods leaves them undefined; we skip both checks in that case.
  if (input.serviceDescription !== undefined) {
    if (!input.serviceDescription.trim()) {
      return { error: "Add a service description." };
    }
    if (input.serviceDescription.length > DESC_MAX) {
      return { error: `Service description is too long — keep it under ${DESC_MAX} characters.` };
    }
  }
  if (
    input.pricingNotes !== undefined &&
    input.pricingNotes.length > NOTES_MAX
  ) {
    return { error: `Pricing notes are too long — keep them under ${NOTES_MAX} characters.` };
  }

  const session = await auth();
  if (!session?.user) {
    // Visitors who hit this server action while signed-out get sent to
    // signup with a deep-link back to the form they came from.
    redirect(`/signup?next=/list-with-us/${input.kind === "services" ? "services" : "goods"}`);
  }

  const slug = await uniqueSlug(input.displayName);

  // Drop anything not in the canonical lists; de-dupe just in case the
  // client sent the same tag twice.
  const specializations = Array.from(
    new Set((input.specializations ?? []).filter(isValidSpecialization)),
  );
  const lifeStages = Array.from(
    new Set((input.lifeStages ?? []).filter((s) => VALID_LIFE_STAGES.has(s))),
  );

  const zip = normalizedZip ?? (input.zip?.trim() || null);
  const serviceRadiusMi = parseRadiusLabel(input.radius);
  const serviceDescription = input.serviceDescription?.trim() || null;
  const pricingNotes = input.pricingNotes?.trim() || null;

  // For services applicants, look up the picked service type so we
  // only persist a slug that resolves at approval time. For goods, no
  // service type is in play.
  let serviceTypeSlug: string | null = null;
  if (input.kind === "services" || input.kind === "both") {
    const raw = input.serviceTypeSlug?.trim();
    if (raw) {
      const match = await prisma.serviceType.findUnique({
        where: { slug: raw },
        select: { slug: true },
      });
      serviceTypeSlug = match?.slug ?? null;
    }
  }
  const serviceLocationType = deriveLocationType(input.inHome, input.virtual);

  const app = await createApplication({
    applicantUserId: session.user.id,
    kind: input.kind,
    proposedDisplayName: input.displayName.trim(),
    proposedSlug: slug,
    proposedBio: input.bio.trim(),
    location: `${input.city.trim()}, ${input.state.trim()}`,
    planId: input.planId,
    specializations,
    zip,
    serviceRadiusMi,
    serviceDescription,
    pricingNotes,
    lifeStages,
    serviceTypeSlug,
    serviceLocationType,
  });

  // Pure goods shops are self-serve: we don't review the shop page itself,
  // only the vendor's first product listing (see the per-listing review
  // gate in app/admin/listings + setProductStatus). Auto-approve silently
  // so the maker lands straight in their dashboard, then send the
  // "list your goods" welcome/nudge instead of the generic approval email.
  // Services / both still go through manual review below.
  if (input.kind === "goods") {
    await autoApproveAsAdmin(app.id, { notify: false });
    const nudge = await sendListYourGoodsEmail({
      toEmail: session.user.email!,
      toName: session.user.name ?? null,
      displayName: input.displayName.trim(),
    });
    if (!nudge.ok) {
      log.warn("application.list_goods_email_failed", {
        applicationId: app.id,
        err: nudge.error,
      });
    }
    redirect("/dashboard");
  }

  // Demo auto-approve: a single env flag flips the admin queue off so a
  // prospect can sign up and have a working dashboard in under a minute.
  // Off in production. The admin queue still works either way. The
  // approval email fires from approveApplication, so we deliberately do
  // NOT also send the "we got it" email here — back-to-back submitted +
  // approved emails in seconds is confusing.
  if (process.env.DEMO_AUTO_APPROVE_VENDORS === "1") {
    await autoApproveAsAdmin(app.id);
    redirect("/dashboard");
  }

  // Manual-review path: confirm receipt by email. Best-effort — never
  // fail the submission because Resend hiccuped.
  const emailResult = await sendApplicationSubmittedEmail({
    toEmail: session.user.email!,
    toName: session.user.name ?? null,
    displayName: input.displayName.trim(),
    kind: input.kind,
  });
  if (!emailResult.ok) {
    log.warn("application.submitted_email_failed", {
      applicationId: app.id,
      err: emailResult.error,
    });
  }

  redirect("/list-with-us/confirm");
}

export async function submitGoodsApplication(input: Omit<SubmitInput, "kind">) {
  return submit({ ...input, kind: "goods" });
}

export async function submitServicesApplication(input: Omit<SubmitInput, "kind">) {
  return submit({ ...input, kind: "services" });
}

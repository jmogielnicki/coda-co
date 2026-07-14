"use server";

import { prisma } from "@/lib/db";
import { sendVendorInquiryEmail } from "@/lib/email/templates";
import { log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 100;
const EMAIL_MAX = 200;
const MESSAGE_MAX = 2000;

export interface ContactInput {
  vendorSlug: string;
  name: string;
  email: string;
  message: string;
  // Honeypot — a hidden field real users never see. Bots that fill every
  // input give themselves away; we silently drop those submissions.
  company?: string;
}

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function sendVendorInquiry(input: ContactInput): Promise<ContactResult> {
  // Honeypot tripped: act like it worked so the bot doesn't retune, but
  // save nothing and send nothing.
  if (input.company && input.company.trim() !== "") {
    log.warn("inquiry.honeypot_tripped", { vendorSlug: input.vendorSlug });
    return { ok: true };
  }

  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (!name) return { ok: false, error: "Please add your name." };
  if (name.length > NAME_MAX) return { ok: false, error: "That name is too long." };
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!message) return { ok: false, error: "Please add a short message." };
  if (message.length > MESSAGE_MAX) {
    return { ok: false, error: `Keep your message under ${MESSAGE_MAX} characters.` };
  }

  // Per-IP limit across all vendors — cheap first gate against scripted
  // abuse before we touch the DB.
  const ip = await clientIp();
  const ipLimit = rateLimit(`inquiry:ip:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!ipLimit.ok) {
    log.warn("inquiry.rate_limited", { scope: "ip" });
    return { ok: false, error: "You've sent several messages recently. Please try again later." };
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug: input.vendorSlug },
    include: { user: { select: { email: true } } },
  });
  if (!vendor) return { ok: false, error: "We couldn't find that provider." };

  // Per-vendor flood guard.
  const vendorLimit = rateLimit(`inquiry:vendor:${vendor.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!vendorLimit.ok) {
    log.warn("inquiry.rate_limited", { scope: "vendor", vendorId: vendor.id });
    return {
      ok: false,
      error: "This provider is receiving a lot of messages right now. Please try again later.",
    };
  }

  // Save the lead first — a delivery failure must not lose it. It'll show
  // in the vendor's dashboard regardless of whether the email lands.
  await prisma.vendorInquiry.create({
    data: { vendorId: vendor.id, clientName: name, clientEmail: email, message },
  });

  const result = await sendVendorInquiryEmail({
    toEmail: vendor.user.email,
    vendorName: vendor.displayName,
    clientName: name,
    clientEmail: email,
    message,
  });
  if (!result.ok) {
    // Best-effort — the lead is already saved. Log so a sustained pattern
    // of delivery failures is visible in ops.
    log.warn("inquiry.email_failed", { vendorId: vendor.id, err: result.error });
  }

  log.info("inquiry.created", { vendorId: vendor.id });
  return { ok: true };
}

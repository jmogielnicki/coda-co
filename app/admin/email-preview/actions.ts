"use server";

import { auth } from "@/auth";
import { sendEmail } from "@/lib/email/client";
import { log } from "@/lib/log";
import { rateLimit } from "@/lib/rate-limit";
import { buildSample, TEMPLATE_KEYS, type TemplateKey } from "./fixtures";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type TestSendResult = { ok: true } | { ok: false; error: string };

export async function sendTestEmail(
  templateKey: TemplateKey,
  toEmail: string,
): Promise<TestSendResult> {
  const session = await auth();
  // Admin gate is the only thing standing between this action and a
  // free email-sending tool for the internet at large. Be strict.
  if (!session?.user || session.user.role !== "admin") {
    return { ok: false, error: "Admin only." };
  }
  if (!TEMPLATE_KEYS.includes(templateKey)) {
    return { ok: false, error: "Unknown template." };
  }
  const recipient = toEmail.trim();
  if (!EMAIL_RE.test(recipient)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  // Per-admin cap so a stolen session can't blast a domain.
  const limited = rateLimit(`email-preview:${session.user.id}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    log.warn("email_preview.rate_limited", { userId: session.user.id });
    return { ok: false, error: "Too many test sends in the last hour. Try again later." };
  }

  const payload = buildSample(templateKey);
  const result = await sendEmail({ to: recipient, ...payload });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  log.info("email_preview.test_sent", {
    userId: session.user.id,
    templateKey,
    to: recipient,
  });
  return { ok: true };
}

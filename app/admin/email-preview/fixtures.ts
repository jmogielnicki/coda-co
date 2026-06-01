// Shared between the preview page (server component) and the
// "send test" server action so the test email is byte-identical to
// what the page just rendered — no drift between preview and reality.

import {
  buildApplicationApprovedEmail,
  buildApplicationRejectedEmail,
  buildApplicationSubmittedEmail,
  type EmailPayload,
} from "@/lib/email/templates";

export const FIXTURE = {
  toEmail: "jane@example.com",
  toName: "Jane Mitchell",
  displayName: "Earthen Studio",
  vendorSlug: "earthen-studio",
};

export const TEMPLATE_KEYS = ["submitted", "approved", "rejected"] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export function buildSample(key: TemplateKey): EmailPayload {
  switch (key) {
    case "submitted":
      return buildApplicationSubmittedEmail({ ...FIXTURE, kind: "services" });
    case "approved":
      return buildApplicationApprovedEmail({ ...FIXTURE });
    case "rejected":
      return buildApplicationRejectedEmail({
        ...FIXTURE,
        notes:
          "Thanks for applying — we're not currently accepting applications in your specialty, but please reach out again in a few months.",
      });
  }
}

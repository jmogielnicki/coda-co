// Shared between the preview page (server component) and the
// "send test" server action so the test email is byte-identical to
// what the page just rendered — no drift between preview and reality.

import {
  buildApplicationApprovedEmail,
  buildApplicationRejectedEmail,
  buildApplicationSubmittedEmail,
  buildListingApprovedEmail,
  buildListYourGoodsEmail,
  buildVendorInquiryEmail,
  type EmailPayload,
} from "@/lib/email/templates";

export const FIXTURE = {
  toEmail: "jane@example.com",
  toName: "Jane Mitchell",
  displayName: "Earthen Studio",
  vendorSlug: "earthen-studio",
};

export const TEMPLATE_KEYS = [
  "submitted",
  "approved",
  "rejected",
  "list-goods",
  "listing-approved",
  "inquiry",
] as const;
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
    case "list-goods":
      return buildListYourGoodsEmail({
        toEmail: FIXTURE.toEmail,
        toName: FIXTURE.toName,
        displayName: FIXTURE.displayName,
      });
    case "listing-approved":
      return buildListingApprovedEmail({
        toEmail: FIXTURE.toEmail,
        toName: FIXTURE.toName,
        productTitle: "Hand-thrown ceramic urn, sage glaze",
        productSlug: "urn-sage-001",
      });
    case "inquiry":
      return buildVendorInquiryEmail({
        toEmail: FIXTURE.toEmail,
        vendorName: FIXTURE.displayName,
        clientName: "Jordan Lee",
        clientEmail: "jordan.lee@example.com",
        message:
          "Hi — my mother is in hospice and we're hoping to arrange a home vigil in the next couple of weeks. Are you available, and what does that look like?",
      });
  }
}

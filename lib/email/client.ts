import { log } from "@/lib/log";

// Lazy: don't load the Resend SDK or read env until first use. Keeps
// `next build` green when RESEND_API_KEY is unset (same rationale as
// the Prisma client proxy in lib/db.ts).

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  // Defaults to the configured From address. Set this when the recipient
  // should be able to reply to a real person (e.g. the contact form).
  replyTo?: string;
}

export type SendResult = { ok: true; id?: string } | { ok: false; error: string };

type SendFn = (args: SendArgs) => Promise<SendResult>;

const DEFAULT_FROM = "CodaCo <hello@codaco.market>";

let cached: SendFn | null = null;

async function getSender(): Promise<SendFn> {
  if (cached) return cached;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? DEFAULT_FROM;

  if (!apiKey) {
    // Dev / unconfigured: log the send instead of crashing. The product
    // flow that triggered the email still completes — visible in logs,
    // not visible to the recipient until an API key is set.
    cached = async ({ to, subject }) => {
      log.warn("email.skipped_no_api_key", { to, subject });
      return { ok: true };
    };
    return cached;
  }

  const { Resend } = await import("resend");
  const client = new Resend(apiKey);

  cached = async ({ to, subject, html, text, replyTo }) => {
    try {
      const res = await client.emails.send({
        from,
        to,
        subject,
        html,
        text,
        replyTo,
      });
      if (res.error) {
        log.error("email.send_failed", { to, subject, err: res.error });
        return { ok: false, error: res.error.message };
      }
      log.info("email.sent", { to, subject, id: res.data?.id });
      return { ok: true, id: res.data?.id };
    } catch (err) {
      log.error("email.send_threw", { to, subject, err });
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  };
  return cached;
}

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const send = await getSender();
  return send(args);
}

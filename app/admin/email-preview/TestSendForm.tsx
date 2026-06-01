"use client";

import { useState, useTransition } from "react";
import { sendTestEmail } from "./actions";
import type { TemplateKey } from "./fixtures";

type Status =
  | { kind: "idle" }
  | { kind: "ok"; recipient: string }
  | { kind: "error"; msg: string };

export function TestSendForm({
  templateKey,
  defaultEmail,
}: {
  templateKey: TemplateKey;
  defaultEmail: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      setStatus({ kind: "idle" });
      const result = await sendTestEmail(templateKey, email);
      setStatus(
        result.ok
          ? { kind: "ok", recipient: email }
          : { kind: "error", msg: result.error },
      );
    });
  }

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <div className="text-[11px] tracking-[.1em] uppercase text-cl mb-2">Send a test</div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-[220px] border border-line-bold rounded-[8px] px-3 py-2 text-[13px] text-ch bg-white outline-none focus:border-tr transition-colors"
          placeholder="you@example.com"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="btn-secondary btn-sm disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send test"}
        </button>
      </div>
      <div className="text-[12px] mt-2 min-h-[16px]">
        {status.kind === "ok" && (
          <span className="text-sg-d">Sent to {status.recipient} — check the inbox.</span>
        )}
        {status.kind === "error" && <span className="text-tr-d">{status.msg}</span>}
      </div>
    </div>
  );
}

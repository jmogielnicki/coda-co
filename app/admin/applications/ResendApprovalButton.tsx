"use client";

import { useState, useTransition } from "react";
import { resendApprovalEmail } from "./actions";

// Admin-only "resend approval email" control for an already-approved
// application. Shows inline success/error feedback so the admin knows
// whether the email actually went out.
export function ResendApprovalButton({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await resendApprovalEmail(applicationId);
      if (res.ok) setSent(true);
      else setError(res.error);
    });
  }

  if (sent) {
    return <span className="text-[12px] text-sg-d">Sent ✓</span>;
  }

  return (
    <div className="flex flex-col gap-1 min-w-[150px]">
      <button
        type="button"
        disabled={pending}
        onClick={onClick}
        className="btn-ghost btn-sm disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend approval email"}
      </button>
      {error && <span className="text-[11px] text-tr-d">{error}</span>}
    </div>
  );
}

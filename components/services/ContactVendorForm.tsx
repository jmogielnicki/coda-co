"use client";

import { useState, useTransition } from "react";
import { sendVendorInquiry } from "@/app/services/contact-actions";

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

// Public "get in touch" form on the vendor profile. Posts to the
// sendVendorInquiry server action, which validates, spam-checks, saves
// the lead, and emails the vendor (reply-to the client). Uncontrolled
// inputs read via FormData so the honeypot captures whatever a bot types.
export function ContactVendorForm({
  vendorSlug,
  vendorName,
}: {
  vendorSlug: string;
  vendorName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await sendVendorInquiry({
        vendorSlug,
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
        company: String(fd.get("company") ?? ""),
      });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <div className="bg-white border border-tr-p rounded-[10px] p-6 text-center">
        <p className="text-[14px] text-ch font-medium mb-1">Message sent</p>
        <p className="text-[13px] text-cm">
          {vendorName} will get back to you by email. Thanks for reaching out.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-tr-p rounded-[10px] p-6 space-y-4 text-left"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ci-name" className="block text-[12px] text-cm mb-1.5">
            Your name
          </label>
          <input
            id="ci-name"
            name="name"
            required
            maxLength={100}
            className={inputCls}
            placeholder="Jordan Lee"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="ci-email" className="block text-[12px] text-cm mb-1.5">
            Your email
          </label>
          <input
            id="ci-email"
            name="email"
            type="email"
            required
            maxLength={200}
            className={inputCls}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ci-message" className="block text-[12px] text-cm mb-1.5">
          What are you looking for?
        </label>
        <textarea
          id="ci-message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          className={`${inputCls} resize-y`}
          placeholder="A few words about what you need help with…"
        />
      </div>

      {/* Honeypot — hidden from people, tempting to bots. Leave it empty. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="ci-company">Company</label>
        <input id="ci-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p className="text-[13px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary btn-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Sending…" : "Send message →"}
        </button>
        <span className="text-[11px] text-cl">
          Your email is shared only with {vendorName}.
        </span>
      </div>
    </form>
  );
}

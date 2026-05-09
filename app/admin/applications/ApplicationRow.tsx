"use client";

import { useTransition } from "react";
import { approve, reject } from "./actions";

interface Applicant {
  id: string;
  email: string;
  name: string | null;
}

interface Application {
  id: string;
  kind: string;
  status: string;
  proposedDisplayName: string;
  proposedSlug: string;
  proposedBio: string;
  location: string;
  planId: string;
  createdAt: string;
  applicant: Applicant;
}

export function ApplicationRow({ application }: { application: Application }) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-pl2">
      <td className="px-4 py-3 align-top">
        <div className="text-[13px] font-medium text-ch">{application.proposedDisplayName}</div>
        <div className="text-[11px] text-cl">slug: {application.proposedSlug}</div>
        <div className="text-[11px] text-cl">{application.location}</div>
      </td>
      <td className="px-4 py-3 align-top">
        <div className="text-[13px] text-ch">{application.applicant.name ?? application.applicant.email}</div>
        <div className="text-[11px] text-cl">{application.applicant.email}</div>
      </td>
      <td className="px-4 py-3 align-top text-[12px] text-cm capitalize">{application.kind}</td>
      <td className="px-4 py-3 align-top text-[12px] text-cm capitalize">{application.planId}</td>
      <td className="px-4 py-3 align-top max-w-md text-[12px] text-cm whitespace-pre-wrap">
        {application.proposedBio || <span className="text-cl italic">No bio provided</span>}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-2 min-w-[140px]">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => approve(application.id))}
            className="btn-primary btn-sm disabled:opacity-60"
          >
            {pending ? "…" : "Approve"}
          </button>
          <form
            action={(formData) => startTransition(() => reject(application.id, formData))}
            className="flex flex-col gap-1"
          >
            <input
              name="notes"
              placeholder="Reason (optional)"
              className="text-[12px] border border-line-bold rounded px-2 py-1 bg-white"
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-ghost btn-sm disabled:opacity-60"
            >
              Reject
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

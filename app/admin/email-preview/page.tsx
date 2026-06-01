import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import type { EmailPayload } from "@/lib/email/templates";
import { buildSample, type TemplateKey } from "./fixtures";
import { TestSendForm } from "./TestSendForm";

export const metadata: Metadata = {
  title: "Email preview — Admin | CodaCo",
};

export const dynamic = "force-dynamic";

interface PreviewSection {
  key: TemplateKey;
  title: string;
  sentWhen: string;
  editFn: string;
  payload: EmailPayload;
}

const SECTIONS: PreviewSection[] = [
  {
    key: "submitted",
    title: "Application submitted",
    sentWhen:
      "After a vendor submits an application on the manual-review path. Suppressed when DEMO_AUTO_APPROVE_VENDORS=1.",
    editFn: "buildApplicationSubmittedEmail",
    payload: buildSample("submitted"),
  },
  {
    key: "approved",
    title: "Application approved",
    sentWhen:
      "After an admin (or auto-approve) approves the application. Fires from approveApplication, so admin-queue and auto-approve paths both send it.",
    editFn: "buildApplicationApprovedEmail",
    payload: buildSample("approved"),
  },
  {
    key: "rejected",
    title: "Application rejected",
    sentWhen:
      "After an admin rejects the application. The optional reviewer note is rendered inline (the example here uses a sample note).",
    editFn: "buildApplicationRejectedEmail",
    payload: buildSample("rejected"),
  },
];

export default async function AdminEmailPreviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin/email-preview");
  if (session.user.role !== "admin") redirect("/");

  const defaultTestEmail = session.user.email ?? "";

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Email preview" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Admin</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Email preview</h1>
            <p className="text-[13px] text-cl mt-1.5">
              Read-only renderings of every transactional email, using sample data.
              Edit copy in <code className="text-ch bg-pl px-1 py-0.5 rounded">lib/email/templates.ts</code>,
              then refresh this page. Each block also has a &quot;Send a test&quot; form so you can
              see the email in a real inbox.
            </p>
          </div>

          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <PreviewBlock key={s.key} section={s} defaultTestEmail={defaultTestEmail} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function PreviewBlock({
  section,
  defaultTestEmail,
}: {
  section: PreviewSection;
  defaultTestEmail: string;
}) {
  return (
    <div className="bg-white rounded-[10px] border border-line p-6">
      <div className="mb-4">
        <h2 className="font-serif text-[22px] text-ch mb-1">{section.title}</h2>
        <p className="text-[12px] text-cl leading-relaxed">{section.sentWhen}</p>
        <p className="text-[11px] text-cl mt-1">
          Edit in{" "}
          <code className="text-ch bg-pl px-1 py-0.5 rounded">
            lib/email/templates.ts → {section.editFn}
          </code>
        </p>
      </div>

      <div className="mb-4">
        <Label>Subject</Label>
        <div className="text-[14px] text-ch font-medium">{section.payload.subject}</div>
      </div>

      <div className="mb-4">
        <Label>HTML</Label>
        <iframe
          title={`${section.title} HTML preview`}
          srcDoc={section.payload.html}
          className="w-full h-[640px] border border-line rounded-[6px] bg-white"
          sandbox=""
        />
      </div>

      <details>
        <summary className="text-[11px] tracking-[.1em] uppercase text-cl cursor-pointer select-none">
          Plain text
        </summary>
        <pre className="mt-2 text-[12px] text-ch bg-pl2 rounded-[6px] p-3 overflow-x-auto whitespace-pre-wrap font-mono">
          {section.payload.text}
        </pre>
      </details>

      <TestSendForm templateKey={section.key} defaultEmail={defaultTestEmail} />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] tracking-[.1em] uppercase text-cl mb-1">{children}</div>
  );
}

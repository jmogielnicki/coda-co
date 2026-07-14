import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { listApplications } from "@/lib/api/applications";
import { ApplicationRow } from "./ApplicationRow";
import { ResendApprovalButton } from "./ResendApprovalButton";

export const metadata: Metadata = {
  title: "Vendor applications — Admin | CodaCo",
};

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin/applications");
  if (session.user.role !== "admin") redirect("/");

  const [pending, decided] = await Promise.all([
    listApplications("submitted"),
    listApplications().then((all) => all.filter((a) => a.status !== "submitted").slice(0, 20)),
  ]);

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Applications" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Admin</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Vendor applications</h1>
            <p className="text-[13px] text-cl mt-1.5">
              Approve to create the vendor profile + subscription. Reject with optional notes.
            </p>
          </div>

          <h2 className="text-[15px] font-medium text-ch mb-3">
            Pending review <span className="text-cl">({pending.length})</span>
          </h2>
          <div className="bg-white rounded-[10px] border border-line overflow-hidden mb-10">
            <table className="w-full text-sm">
              <thead className="bg-pl border-b border-pl2">
                <Tr header>
                  <Th>Vendor</Th>
                  <Th>Applicant</Th>
                  <Th>Kind</Th>
                  <Th>Plan</Th>
                  <Th>Bio</Th>
                  <Th>Decision</Th>
                </Tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-cm text-sm">
                      No applications pending review.
                    </td>
                  </tr>
                ) : (
                  pending.map((app) => (
                    <ApplicationRow
                      key={app.id}
                      application={{
                        id: app.id,
                        kind: app.kind,
                        status: app.status,
                        proposedDisplayName: app.proposedDisplayName,
                        proposedSlug: app.proposedSlug,
                        proposedBio: app.proposedBio,
                        location: app.location,
                        planId: app.planId,
                        createdAt: app.createdAt.toISOString(),
                        applicant: app.applicant,
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h2 className="text-[15px] font-medium text-ch mb-3">
            Recently decided
          </h2>
          <div className="bg-white rounded-[10px] border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pl border-b border-pl2">
                <Tr header>
                  <Th>Vendor</Th>
                  <Th>Applicant</Th>
                  <Th>Status</Th>
                  <Th>Decided</Th>
                  <Th>Email</Th>
                </Tr>
              </thead>
              <tbody>
                {decided.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-cm text-sm">
                      Nothing decided yet.
                    </td>
                  </tr>
                ) : (
                  decided.map((app) => (
                    <tr key={app.id} className="border-b border-pl2">
                      <td className="px-4 py-3 align-top text-[13px] text-ch">
                        {app.proposedDisplayName}
                      </td>
                      <td className="px-4 py-3 align-top text-[12px] text-cm">
                        {app.applicant.email}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={[
                            "inline-block text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                            app.status === "approved" ? "bg-sg-p text-sg-d" : "bg-tr-p text-tr-d",
                          ].join(" ")}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-[12px] text-cm">
                        {app.reviewedAt?.toISOString().slice(0, 10) ?? "—"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {app.status === "approved" ? (
                          <ResendApprovalButton applicationId={app.id} />
                        ) : (
                          <span className="text-cl">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </>
  );
}

function Tr({ children, header }: { children: React.ReactNode; header?: boolean }) {
  return <tr className={header ? "" : "border-b border-pl2"}>{children}</tr>;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-cl whitespace-nowrap">
      {children}
    </th>
  );
}

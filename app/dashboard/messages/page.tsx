import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { requireVendor } from "@/app/dashboard/lib";
import { prisma } from "@/lib/db";
import { formatMonthYear } from "@/lib/format/date";
import { markAllInquiriesRead } from "./actions";

export const metadata: Metadata = {
  title: "Messages — CodaCo",
};

export const dynamic = "force-dynamic";

export default async function VendorMessagesPage() {
  const { vendor } = await requireVendor();

  const inquiries = await prisma.vendorInquiry.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });
  const unreadCount = inquiries.filter((i) => i.readAt == null).length;

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Messages" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="mid">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
              <h1 className="font-serif text-[32px] font-light text-ch">Messages</h1>
              <p className="text-[13px] text-cl mt-1.5">
                Inquiries from clients who used the contact form on your public profile.
                {unreadCount > 0 && (
                  <>
                    {" "}
                    <strong className="text-ch">{unreadCount}</strong> unread.
                  </>
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <form action={markAllInquiriesRead}>
                <button type="submit" className="btn-ghost btn-sm">
                  Mark all as read
                </button>
              </form>
            )}
          </div>

          {inquiries.length === 0 ? (
            <div className="bg-white rounded-[10px] border border-line p-8 text-center">
              <p className="text-[14px] text-ch font-medium mb-1">No messages yet</p>
              <p className="text-[13px] text-cm">
                When a client contacts you from your profile, their message lands here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((i) => {
                const unread = i.readAt == null;
                return (
                  <div
                    key={i.id}
                    className={`bg-white rounded-[10px] border p-5 ${unread ? "border-tr-l" : "border-line"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {unread && (
                          <span className="text-[10px] tracking-[.06em] uppercase bg-tr-p text-tr-d border border-tr-l px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                        <span className="text-[14px] font-medium text-ch">{i.clientName}</span>
                      </div>
                      <span className="text-[12px] text-cl">
                        {formatMonthYear(i.createdAt.toISOString().slice(0, 10))}
                      </span>
                    </div>
                    <p className="text-[13px] text-cm leading-[1.7] whitespace-pre-line mb-3">
                      {i.message}
                    </p>
                    <a
                      href={`mailto:${i.clientEmail}?subject=${encodeURIComponent(
                        `Re: your inquiry on CodaCo`,
                      )}`}
                      className="text-[13px] text-tr no-underline hover:underline"
                    >
                      Reply to {i.clientEmail} →
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { getServiceTypes } from "@/lib/api/serviceTypes";
import { requireVendor } from "../../lib";
import { createService } from "../actions";

export const metadata: Metadata = {
  title: "New service — CodaCo",
};

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await requireVendor();
  const serviceTypes = await getServiceTypes();

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Services", href: "/dashboard/services" },
          { label: "New" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="narrow">
          <div className="mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Add a service</h1>
            <p className="text-[13px] text-cl mt-1.5">
              Saved as a draft — clients won&apos;t see it until you publish.
            </p>
          </div>

          <form
            action={createService}
            className="bg-white rounded-[10px] border border-line p-6 space-y-4"
          >
            <Field label="Title">
              <input
                name="title"
                required
                className={inputCls}
                placeholder="In-home doula consultation"
              />
            </Field>
            <Field label="Service type">
              <select name="serviceType" required className={inputCls} defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                {serviceTypes.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                name="description"
                className={`${inputCls} min-h-[120px] resize-y`}
                placeholder="Describe the service — what you offer, who it's for, what to expect…"
              />
              <span className="block text-[11px] text-cl mt-1">
                You&apos;ll set location, pricing, and other details on the next screen.
              </span>
            </Field>
            <button type="submit" className="btn-primary btn-md w-full">
              Create draft →
            </button>
          </form>
        </Container>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-ch mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

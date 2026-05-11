import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { requireVendor } from "../../lib";
import { createProduct } from "../actions";

export const metadata: Metadata = {
  title: "New product — CodaCo",
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireVendor();
  const productTypes = await prisma.productType.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/dashboard/products" },
          { label: "New" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="narrow">
          <div className="mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Add a product</h1>
            <p className="text-[13px] text-cl mt-1.5">
              Saved as a draft — buyers won&apos;t see it until you publish.
            </p>
          </div>

          <form action={createProduct} className="bg-white rounded-[10px] border border-line p-6 space-y-4">
            <Field label="Title">
              <input name="title" required className={inputCls} placeholder="Hand-thrown ceramic urn" />
            </Field>
            <Field label="Product type">
              <select name="productType" required className={inputCls} defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                {productTypes.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Starting price (USD)">
              <input
                name="startingPrice"
                type="number"
                step="0.01"
                min="0"
                required
                className={inputCls}
                placeholder="0.00"
              />
              <span className="block text-[11px] text-cl mt-1">
                Seeds your first variant. Add more variants and edit prices from the product editor.
              </span>
            </Field>
            <Field label="Description">
              <textarea
                name="description"
                className={`${inputCls} min-h-[120px] resize-y`}
                placeholder="Describe your product — materials, sizing, what makes it special…"
              />
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

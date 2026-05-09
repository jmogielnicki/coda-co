import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ServicesForm } from "@/components/vendor/ServicesForm";

export const metadata: Metadata = {
  title: "List services — CodaCo",
};

export default async function ListServicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/signup?next=/list-with-us/services");

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List with us", href: "/list-with-us" },
          { label: "List services" },
        ]}
      />
      <ServicesForm />
    </>
  );
}

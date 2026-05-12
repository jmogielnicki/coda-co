import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GoodsForm } from "@/components/vendor/GoodsForm";

export const metadata: Metadata = {
  title: "List goods — CodaCo",
};

// The form posts to a server action that requires a signed-in user. We
// also redirect anonymous visitors here so they don't fill out four
// steps before being asked to sign up.
export default async function ListGoodsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signup?next=/list-with-us/goods");

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List with us", href: "/list-with-us" },
          { label: "List goods" },
        ]}
      />
      <GoodsForm />
    </>
  );
}

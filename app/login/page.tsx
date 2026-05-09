import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — CodaCo",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next: nextParam } = await searchParams;
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/";

  const session = await auth();
  if (session?.user) redirect(next);

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Sign in" }]} />

      <section className="bg-tr-vp px-10 py-16">
        <Container width="narrow">
          <div className="text-center mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">CodaCo</p>
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">Sign in</h1>
            <p className="text-[13px] text-cl">Continue to your account.</p>
          </div>
          <LoginForm next={next} />
        </Container>
      </section>
    </>
  );
}

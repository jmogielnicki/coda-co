import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/ui/Logo";

interface NavProps {
  active?: "shop" | "services" | "books" | "light" | "list";
}

export async function Nav({ active }: NavProps) {
  const session = await auth();

  const link = (label: string, href: string, key: NavProps["active"]) => (
    <li key={href}>
      <Link
        href={href}
        className={[
          "text-[13px] no-underline transition-colors duration-150",
          active === key
            ? "text-tr font-medium"
            : "text-cm hover:text-tr",
        ].join(" ")}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <nav className="bg-white border-b border-[rgba(44,40,37,.07)] px-10 flex items-center justify-between h-[68px] sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-[13px] no-underline cursor-pointer">
        <Logo />
        <div>
          <div className="font-serif text-[30px] font-medium tracking-[.02em] leading-none">
            <span className="text-tr">Coda</span>
            <span className="text-sg">Co</span>
          </div>
          <div className="text-[10px] tracking-[.11em] uppercase text-cl mt-[3px] whitespace-nowrap">
            A curated marketplace for death and dying
          </div>
        </div>
      </Link>

      <ul className="flex gap-6 items-center list-none">
        {link("Shop goods", "/shop", "shop")}
        {link("Find services", "/services", "services")}
        {link("Books", "/books", "books")}
        {link("Grief meets humor", "/light-and-dark", "light")}
        {link("List with us", "/list-with-us", "list")}
        {session?.user ? <SignedInControls user={session.user} /> : <SignedOutControls />}
      </ul>
    </nav>
  );
}

function SignedOutControls() {
  return (
    <li>
      <Link href="/login" className="btn-primary btn-sm no-underline">
        Sign in
      </Link>
    </li>
  );
}

function SignedInControls({
  user,
}: {
  user: { name?: string | null; email: string; role: string };
}) {
  const display = user.name?.trim() || user.email;
  return (
    <>
      {user.role === "admin" && (
        <li>
          <Link href="/admin" className="text-[13px] text-cm hover:text-tr no-underline">
            Admin
          </Link>
        </li>
      )}
      <li className="text-[13px] text-cm">{display}</li>
      <li>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="btn-ghost btn-sm">
            Sign out
          </button>
        </form>
      </li>
    </>
  );
}

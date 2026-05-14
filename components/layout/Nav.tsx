import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/ui/Logo";
import { prisma } from "@/lib/db";

interface NavProps {
  active?: "shop" | "services" | "books" | "light" | "list";
}

export async function Nav({ active }: NavProps) {
  const session = await auth();
  // Look up vendor status once so the "Dashboard" link only renders for
  // approved vendors. The query is cheap (unique lookup on user_id) and
  // every Nav render already touches the session.
  const vendor = session?.user
    ? await prisma.vendorProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
    : null;

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
        {link("Bookshop", "/books", "books")}
        {link("List with us", "/list-with-us", "list")}
        {session?.user ? (
          <SignedInControls user={session.user} hasVendorProfile={vendor != null} />
        ) : (
          <SignedOutControls />
        )}
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
  hasVendorProfile,
}: {
  user: { name?: string | null; email: string; role: string };
  hasVendorProfile: boolean;
}) {
  const display = user.name?.trim() || user.email;
  return (
    <>
      {hasVendorProfile && (
        <li>
          <Link href="/dashboard" className="text-[13px] text-cm hover:text-tr no-underline">
            Dashboard
          </Link>
        </li>
      )}
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

import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PREVIEW_COOKIE_NAME, previewToken } from "@/lib/preview-gate";

export const metadata: Metadata = {
  title: "Preview access — CodaCo",
  robots: { index: false, follow: false },
};

// Constrain `next=` to relative same-origin paths so a malicious link
// can't bounce visitors to an external URL after they unlock.
function safeNext(raw: string | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

async function tryUnlock(formData: FormData) {
  "use server";
  const password = process.env.PREVIEW_PASSWORD;
  const submitted = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  if (!password) redirect(next);

  if (submitted !== password) {
    redirect(`/preview-access?error=1&next=${encodeURIComponent(next)}`);
  }

  const jar = await cookies();
  jar.set(PREVIEW_COOKIE_NAME, await previewToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}

export default async function PreviewAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);

  return (
    <div className="min-h-screen bg-pl flex items-center justify-center px-6 py-16">
      <Container width="narrow">
        <div className="card-surface p-10 text-center">
          <div className="font-serif text-[36px] font-medium leading-none mb-2">
            <span className="text-tr">Coda</span>
            <span className="text-sg">Co</span>
          </div>
          <p className="text-overline text-cl mb-7">Private preview</p>
          <h1 className="font-serif text-[24px] font-light text-ch mb-3">
            This site is in private development.
          </h1>
          <p className="text-[14px] text-cm mb-7 leading-relaxed">
            Enter the preview password to continue, or visit our{" "}
            <Link href="/homepage" className="text-tr underline hover:text-tr-d">
              public welcome page
            </Link>
            .
          </p>

          <form action={tryUnlock} className="flex flex-col gap-3 text-left">
            <input type="hidden" name="next" value={next} />
            <label className="text-[12px] text-cm" htmlFor="preview-password">
              Preview password
            </label>
            <input
              id="preview-password"
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="off"
              className="border border-line-strong rounded-[8px] px-4 py-3 text-[14px] text-ch outline-none focus:border-tr"
            />
            {error && (
              <p className="text-[13px] text-tr">
                That password isn&apos;t right. Try again.
              </p>
            )}
            <button type="submit" className="btn-primary btn-md mt-1">
              Continue
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}

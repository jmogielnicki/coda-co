import { NextRequest, NextResponse } from "next/server";
import { PREVIEW_COOKIE_NAME, previewToken } from "@/lib/preview-gate";

// Shared-password preview gate. The whole site is hidden behind a single
// password except the public teaser (/homepage), the password entry page
// (/preview-access), Next's own asset routes, and robots.txt.
//
// Gate is engaged iff PREVIEW_PASSWORD is set. Unset (e.g. local dev)
// means every request passes through untouched.
//
// Lives at `proxy.ts` (Next 16+ name) — the older `middleware.ts`
// convention is deprecated but functionally identical.

const PUBLIC_EXACT = new Set(["/homepage", "/preview-access", "/robots.txt"]);

function isAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  return /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|map|txt)$/i.test(
    pathname,
  );
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Pass the pathname through as a header so the root layout can hide
  // its nav/footer on /homepage and /preview-access without restructuring
  // every route into a route group.
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  const passThrough = NextResponse.next({ request: { headers } });

  const password = process.env.PREVIEW_PASSWORD;
  if (!password) return passThrough;

  if (PUBLIC_EXACT.has(pathname) || isAsset(pathname)) return passThrough;

  const cookie = req.cookies.get(PREVIEW_COOKIE_NAME)?.value;
  if (cookie) {
    const expected = await previewToken(password);
    if (timingSafeEqual(cookie, expected)) return passThrough;
  }

  const redirectUrl = new URL("/preview-access", req.url);
  redirectUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};

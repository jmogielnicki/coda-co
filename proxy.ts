import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, signToken } from '@/lib/admin-auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let the login page through unconditionally.
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_COOKIE_SECRET;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (secret && token) {
    const expected = await signToken(secret);
    if (token === expected) {
      return NextResponse.next();
    }
  }

  const loginUrl = new URL('/admin/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};

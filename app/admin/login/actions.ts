'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, signToken } from '@/lib/admin-auth';

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const password = formData.get('password');

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password.' };
  }

  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret) {
    return { error: 'Server misconfiguration: ADMIN_COOKIE_SECRET is not set.' };
  }

  const token = await signToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  redirect('/admin');
}

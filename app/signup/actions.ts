"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";

export interface SignupState {
  error?: string;
}

export async function signupAction(
  _prev: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const rawNext = String(formData.get("next") ?? "/");
  const redirectTo = rawNext.startsWith("/") ? rawNext : "/";

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      // New signups are buyers by default. Vendor onboarding (Phase D) will
      // upgrade selected users with a `vendor_profile` row of their own.
      role: "user",
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try /login." };
    }
    throw err;
  }

  return {};
}

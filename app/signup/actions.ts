"use server";

import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export interface SignupState {
  error?: string;
}

// Constant-time compare so a slow attacker can't measure character-by-character.
function inviteCodeMatches(submitted: string): boolean {
  const expected = process.env.INVITE_CODE ?? "";
  if (!expected) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function signupAction(
  _prev: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const inviteCode = String(formData.get("inviteCode") ?? "");
  const rawNext = String(formData.get("next") ?? "/");
  const redirectTo = rawNext.startsWith("/") ? rawNext : "/";

  // Fail closed: with INVITE_CODE unset, signup is fully disabled. Local
  // dev and preview deploys must set the env var (see .env.example).
  if (!process.env.INVITE_CODE) {
    return { error: "Signup is currently disabled." };
  }
  if (!inviteCodeMatches(inviteCode)) {
    return { error: "That invite code isn't valid." };
  }

  // Cheap brute-force / signup-spam shield. Keyed by IP — token bucket
  // refills slowly so a legit retry after a typo isn't blocked.
  const ip = await clientIp();
  const limited = rateLimit(`signup:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limited.ok) {
    return { error: "Too many signup attempts. Try again later." };
  }

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

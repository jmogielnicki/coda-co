"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { isNextControlFlow, log } from "@/lib/log";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "/");
  const redirectTo = rawNext.startsWith("/") ? rawNext : "/";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (err instanceof AuthError) {
      // Auth.js wraps every credential failure as `CredentialsSignin`. We
      // surface a single generic message so the form doesn't leak whether
      // the email exists.
      return { error: "Email or password is incorrect." };
    }
    if (!isNextControlFlow(err)) {
      log.error("login.unexpected_error", { email, err });
    }
    throw err;
  }

  return {};
}

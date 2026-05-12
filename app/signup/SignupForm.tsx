"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "./actions";

const inputCls =
  "w-full h-10 px-3 text-sm rounded border border-line-bold bg-white text-ch placeholder:text-cl focus:outline-none focus:border-tr transition-colors";

export function SignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<SignupState | null, FormData>(
    signupAction,
    null,
  );

  return (
    <form action={formAction} className="bg-white rounded-[10px] border border-line p-6 space-y-4">
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="block text-[12px] font-medium text-ch mb-1.5">Name (optional)</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          className={inputCls}
          placeholder="Your name"
        />
      </label>

      <label className="block">
        <span className="block text-[12px] font-medium text-ch mb-1.5">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputCls}
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="block text-[12px] font-medium text-ch mb-1.5">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputCls}
          placeholder="At least 8 characters"
        />
      </label>

      {state?.error && (
        <p className="text-[13px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 bg-tr text-white text-[14px] font-medium rounded-full hover:bg-tr-d transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-[12px] text-cl text-center">
        Already have an account?{" "}
        <Link href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-tr no-underline hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

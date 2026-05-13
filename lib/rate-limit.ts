// Tiny in-memory rate limiter. Per-process state, so it doesn't share
// across Vercel function instances — if we ever need cross-instance
// limits (or persistence across cold starts), swap the Map for a Redis
// or DB-backed store.
//
// Good enough for the demo phase: blocks naive scripted abuse and
// signup-spam from a single source. Not a defense against a distributed
// attacker — that's what a real WAF / Turnstile is for.

import { headers } from "next/headers";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1 };
  }

  if (bucket.count >= opts.limit) {
    return { ok: false, remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, remaining: opts.limit - bucket.count };
}

// Best-effort client IP. On Vercel `x-forwarded-for` is the trusted
// chain; we take the leftmost entry, which is the original client.
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

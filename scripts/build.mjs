#!/usr/bin/env node
// Build wrapper used by both `npm run build` and `npm run vercel-build`.
// Decides whether to run the Prisma chain based on env vars rather than
// the npm script name, so the same package.json works in CI (no DB), on
// Vercel (full chain), and locally without depending on Vercel's
// Project Settings → Build Command override being set correctly.
//
// Rules:
//   - DATABASE_URL unset (e.g. CI):           just `next build`
//   - DATABASE_URL set, VERCEL_ENV=preview:   just `next build` (preview
//     builds must NOT mutate the production DB — both for safety and to
//     avoid racing on Prisma's migration advisory lock with the
//     production build)
//   - DATABASE_URL set, prod / local:         migrate + system seed,
//                                             then `next build`
//
// Note: `db:mock` is intentionally NOT part of this chain — it wipes the
// DB and is only safe as a one-shot bootstrap. It was here temporarily
// for the initial Neon seed; the cleanup PR removed it so future
// deploys preserve real signups. If you need to re-bootstrap a fresh
// DB, either re-add it for one deploy or run `npm run db:mock`
// manually against the target DATABASE_URL.

import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`[build] $ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const hasDb = Boolean(process.env.DATABASE_URL);
const isPreview = process.env.VERCEL_ENV === "preview";

if (hasDb && !isPreview) {
  run("prisma migrate deploy");
  run("prisma db seed");
} else if (hasDb && isPreview) {
  console.log("[build] VERCEL_ENV=preview; skipping Prisma migrate/seed");
} else {
  console.log("[build] DATABASE_URL not set; skipping Prisma steps");
}

run("next build");

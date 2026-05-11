#!/usr/bin/env node
// Build wrapper used by both `npm run build` and `npm run vercel-build`.
// Decides whether to run the Prisma chain based on env vars rather than
// the npm script name, so the same package.json works in CI (no DB), on
// Vercel (full chain), and locally (next build only) without needing
// Vercel's Project Settings -> Build Command override to be set
// correctly.
//
// Rules:
//   - DATABASE_URL unset (e.g. CI):        just `next build`
//   - DATABASE_URL set:                    migrate + system seed, then `next build`
//   - DATABASE_URL + ALLOW_MOCK_SEED=1:    also run db:mock (destructive — bootstrap only)

import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`[build] $ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

const hasDb = !!process.env.DATABASE_URL;
const allowMock = process.env.ALLOW_MOCK_SEED === "1";

if (hasDb) {
  run("prisma migrate deploy");
  run("prisma db seed");
  if (allowMock) {
    run("npm run db:mock");
  } else {
    console.log("[build] ALLOW_MOCK_SEED not set; skipping db:mock");
  }
} else {
  console.log("[build] DATABASE_URL not set; skipping Prisma steps");
}

run("next build");

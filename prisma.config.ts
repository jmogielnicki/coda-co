import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Neon ships two URLs: pooled (for runtime queries) and unpooled
    // (for direct connections). `migrate deploy` issues DDL that the
    // pgbouncer pooler can't proxy in transaction mode, so the CLI gets
    // the unpooled URL when it's available. The runtime adapter in
    // `lib/db.ts` reads `DATABASE_URL` directly and stays on the pool.
    // Local dev (embedded `prisma dev`) only provides one URL, so we
    // fall back to it.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
    // Optional. Set for local dev so `prisma migrate dev` and `prisma
    // migrate diff` can use a clean shadow DB to detect drift. Unset in
    // CI / Vercel — `migrate deploy` doesn't need it. See
    // AGENTS.md → "Local DB for migration generation".
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});

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
    url: process.env.DATABASE_URL!,
    // Optional. Set for local dev so `prisma migrate dev` and `prisma
    // migrate diff` can use a clean shadow DB to detect drift. Unset in
    // CI / Vercel — `migrate deploy` doesn't need it. See
    // AGENTS.md → "Local DB for migration generation".
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});

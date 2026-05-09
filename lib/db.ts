import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Avoid spawning a fresh client on every dev hot-reload. Next.js's dev
// runtime evaluates this module repeatedly; without the global cache each
// reload would open new connections until Postgres rejects them.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buildClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

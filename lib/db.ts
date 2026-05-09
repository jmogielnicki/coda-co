import { PrismaClient } from "@prisma/client";

// Avoid spawning a fresh client on every dev hot-reload. Next.js's dev
// runtime evaluates this module repeatedly; without the global cache each
// reload would open new connections until Postgres rejects them.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { normalizeSslmode } from "./connectionString";

// Avoid spawning a fresh client on every dev hot-reload. Next.js's dev
// runtime evaluates this module repeatedly; without the global cache each
// reload would open new connections until Postgres rejects them.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buildClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaPg({ connectionString: normalizeSslmode(url) });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

function getClient(): PrismaClient {
  return globalForPrisma.prisma ?? buildClient();
}

// Lazy proxy so we don't read DATABASE_URL or open a connection until
// something actually queries. Without this, `next build`'s page-data
// collection step imports every route module — and because Auth.js +
// the nav transitively pull in this file, even routes like /_not-found
// would fail when DATABASE_URL isn't set at build time (e.g. on Vercel
// before env vars are configured). Methods are bound to the underlying
// client so internal `this` references resolve correctly.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

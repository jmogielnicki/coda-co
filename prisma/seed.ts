// System seed — required structural rows the app cannot run without.
// Safe to run in any environment, including production. Wired to
// `prisma db seed` via prisma.config.ts so `prisma migrate deploy`
// runs it automatically. Idempotent: re-running upserts existing rows.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { normalizeSslmode } from "../lib/connectionString";

config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: normalizeSslmode(process.env.DATABASE_URL!),
});
const prisma = new PrismaClient({ adapter });

const PRODUCT_TYPES = [
  { slug: "urns", name: "Urns & vessels" },
  { slug: "jewelry", name: "Ash jewelry" },
  { slug: "shrouds", name: "Burial shrouds" },
  { slug: "planning", name: "Planning documents" },
  { slug: "memorial", name: "Memorial items" },
  { slug: "humor", name: "Gifts & humor" },
];

const SERVICE_TYPES = [
  { slug: "doula", name: "End of life doula" },
  { slug: "attorney", name: "Estate attorney" },
  { slug: "cleaner", name: "Death cleaning" },
  { slug: "celebrant", name: "Funeral celebrant" },
  { slug: "organizer", name: "End of life organizer" },
  { slug: "grief", name: "Grief counselor" },
  { slug: "home-funeral", name: "Home funeral guide" },
  { slug: "green-burial", name: "Green burial" },
  { slug: "cafe", name: "Death cafe" },
  { slug: "life-celebration", name: "Event planner" },
  { slug: "somatic-practitioner", name: "Somatic practitioner (yoga, massage)" },
  { slug: "mediator", name: "Mediator" },
  { slug: "spiritual-support", name: "Spiritual support" },
  { slug: "other", name: "Other" },
];

async function main() {
  for (const t of PRODUCT_TYPES) {
    await prisma.productType.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: t,
    });
  }
  for (const t of SERVICE_TYPES) {
    await prisma.serviceType.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: t,
    });
  }
  console.log(
    `Seeded ${PRODUCT_TYPES.length} product types, ${SERVICE_TYPES.length} service types.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

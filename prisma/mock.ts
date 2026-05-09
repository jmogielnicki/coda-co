// Mock data — fake users, vendors, products, services, reviews — sourced
// from the lib/data/*.ts arrays carried over from Phase A. Run via
// `npm run db:mock`. Hard-fails in production so a deploy can never seed
// fake vendors. NOT wired to `prisma db seed`.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { products } from "../lib/data/products";
import { vendors } from "../lib/data/vendors";
import { services } from "../lib/data/services";
import { reviews } from "../lib/data/reviews";
import { vendorReviews } from "../lib/data/vendor-reviews";

config({ path: ".env" });

if (process.env.NODE_ENV === "production") {
  console.error("npm run db:mock cannot run in production.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Every mock account uses the same dev password so a tester can sign in as
// any vendor without a credential cheat-sheet. Never store this in a real
// system — the mock script hard-fails in production for that reason.
const DEV_PASSWORD = "codaco-dev";
const ADMIN_EMAIL = "admin@codaco.local";

async function clear() {
  // Order matters — children before parents. Cascade deletes would also
  // work but being explicit makes the intent obvious.
  await prisma.productReview.deleteMany();
  await prisma.vendorReview.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clear();

  const productTypes = await prisma.productType.findMany();
  const productTypeBySlug = new Map(productTypes.map((t) => [t.slug, t]));

  const serviceTypes = await prisma.serviceType.findMany();
  const serviceTypeBySlug = new Map(serviceTypes.map((t) => [t.slug, t]));

  if (productTypeBySlug.size === 0 || serviceTypeBySlug.size === 0) {
    throw new Error(
      "System seed has not run yet. Run `npx prisma db seed` first.",
    );
  }

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // One admin user for testing role-gated routes.
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: "CodaCo Admin",
      passwordHash,
      role: "admin",
    },
  });

  // Vendors. Each gets a paired user (role=user). Email derived from slug
  // so testers can sign in with `${slug}@codaco.local` + DEV_PASSWORD.
  const vendorBySlug = new Map<string, { id: string }>();
  for (const v of vendors) {
    const user = await prisma.user.create({
      data: {
        email: `${v.id}@codaco.local`,
        name: v.name,
        passwordHash,
        role: "user",
      },
    });
    const created = await prisma.vendorProfile.create({
      data: {
        slug: v.id,
        displayName: v.name,
        bio: v.bio,
        location: v.location,
        kind: v.kind,
        verified: v.verified,
        initials: v.initials,
        credentials: v.credentials,
        distanceMi: v.distanceMi,
        lifeStages: v.lifeStages,
        memberSince: v.memberSince ? new Date(v.memberSince) : null,
        photoSrc: v.photoSrc,
        photoTone: v.photoTone,
        user: { connect: { id: user.id } },
      },
    });
    vendorBySlug.set(v.id, created);
  }

  // Products. The base price + currency live on the product; per-variant
  // overrides land on product_variants.
  const productBySlug = new Map<string, { id: string }>();
  for (const p of products) {
    const vendor = vendorBySlug.get(p.sellerId);
    const productType = productTypeBySlug.get(p.productType);
    if (!vendor) throw new Error(`No vendor for product ${p.id} (${p.sellerId})`);
    if (!productType) throw new Error(`No productType ${p.productType}`);

    const created = await prisma.product.create({
      data: {
        slug: p.id,
        title: p.title,
        description: p.description,
        basePriceCents: Math.round(p.price * 100),
        currency: p.currency,
        details: p.details as object,
        status: p.status,
        verified: p.verified,
        lifeStages: p.lifeStages,
        vendor: { connect: { id: vendor.id } },
        productType: { connect: { id: productType.id } },
        variants: {
          create: p.variants.map((v) => ({
            label: v.label,
            priceCents: Math.round(v.price * 100),
            currency: v.currency,
            stock: v.stock,
          })),
        },
      },
    });
    productBySlug.set(p.id, created);
  }

  // Services. One row per service, joined to vendor + service_type by slug.
  for (const s of services) {
    const vendor = vendorBySlug.get(s.vendorId);
    const serviceType = serviceTypeBySlug.get(s.serviceType);
    if (!vendor) throw new Error(`No vendor for service ${s.id} (${s.vendorId})`);
    if (!serviceType) throw new Error(`No serviceType ${s.serviceType}`);

    await prisma.service.create({
      data: {
        slug: s.id,
        title: s.title,
        description: s.description,
        locationType: s.locationType,
        pricingModel: s.pricingModel,
        priceCents: s.price != null ? Math.round(s.price * 100) : null,
        currency: s.currency,
        status: s.status,
        vendor: { connect: { id: vendor.id } },
        serviceType: { connect: { id: serviceType.id } },
      },
    });
  }

  for (const r of reviews) {
    const product = productBySlug.get(r.productId);
    if (!product) throw new Error(`No product for review ${r.id} (${r.productId})`);
    await prisma.productReview.create({
      data: {
        product: { connect: { id: product.id } },
        reviewerName: r.reviewer,
        reviewerLocation: r.location,
        rating: r.rating,
        body: r.body,
        reviewedAt: new Date(r.date),
      },
    });
  }

  for (const r of vendorReviews) {
    const vendor = vendorBySlug.get(r.vendorId);
    if (!vendor) throw new Error(`No vendor for vendor-review ${r.id} (${r.vendorId})`);
    await prisma.vendorReview.create({
      data: {
        vendor: { connect: { id: vendor.id } },
        reviewerName: r.reviewer,
        reviewerLocation: r.location,
        rating: r.rating,
        body: r.body,
        reviewedAt: new Date(r.date),
      },
    });
  }

  console.log(
    `Mock data: ${vendorBySlug.size + 1} users (1 admin + ${vendorBySlug.size} vendors), ` +
      `${productBySlug.size} products, ` +
      `${services.length} services, ${reviews.length} product reviews, ` +
      `${vendorReviews.length} vendor reviews.`,
  );
  console.log(
    `Sign in with admin: ${ADMIN_EMAIL} / ${DEV_PASSWORD}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

-- Price + currency now live exclusively on product_variants. The product
-- row no longer carries a base price; listings derive a display range
-- from the variant set.

ALTER TABLE "products" DROP COLUMN "base_price_cents";
ALTER TABLE "products" DROP COLUMN "currency";

/**
 * Bookshop.org affiliate helpers.
 *
 * Earnings are attributed to this affiliate id. Per Bookshop's affiliate
 * docs, a per-book affiliate link is `bookshop.org/a/{affiliateId}/{isbn13}`.
 * See https://bookshop.org/info/links-and-widgets.
 */
export const BOOKSHOP_AFFILIATE_ID = "124868";

export function bookshopAffiliateUrl(isbn13: string): string {
  return `https://bookshop.org/a/${BOOKSHOP_AFFILIATE_ID}/${isbn13}`;
}

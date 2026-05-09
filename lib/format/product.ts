// Five soft, prototype-matching tints. Indexing by a hashed slug keeps a
// product's thumbnail color stable across renders without the DB needing a
// `thumb_bg` column. Replace with real product images in a later phase.
const THUMB_PALETTE = [
  "#F5EAE6", // tr-vp / pale terracotta
  "#F3F1EE", // pl
  "#EAF0EB", // sg-vp / pale sage
  "#F0E4D9", // sand
  "#EDE6E2", // dust
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function productThumbBg(slug: string): string {
  return THUMB_PALETTE[hashSlug(slug) % THUMB_PALETTE.length];
}

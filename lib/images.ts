// Shared validation for vendor-uploaded images. Used by both the client
// uploader (for immediate user feedback) and the server action (the real
// gate). Keep the rules in one place so they don't drift.

import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_OUTPUT_DIMENSION = 2000;
// Decompression-bomb guard. Caps the *decoded* pixel count, so a tiny
// hostile file that expands to gigapixels gets rejected before we
// allocate memory for it.
const MAX_INPUT_PIXELS = 24_000_000;

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

export const MAX_IMAGE_BYTES_LABEL = "5 MB";
export const ALLOWED_IMAGE_LABEL = "JPEG, PNG, or WebP";

export function isAllowedImageMime(mime: string): mime is AllowedImageMime {
  return (ALLOWED_IMAGE_MIME as readonly string[]).includes(mime);
}

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg": return "jpg";
    case "image/png":  return "png";
    case "image/webp": return "webp";
    default: return "bin";
  }
}

export interface ImageValidationError {
  code: "too-large" | "wrong-type" | "empty";
  message: string;
}

// A URL counts as "ours to delete" only if it points at our Blob store.
// Legacy /public paths and any other origin are left alone so we never
// trigger a delete against something we don't own.
export function isOwnedBlobUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function validateImageFile(file: File): ImageValidationError | null {
  if (file.size === 0) {
    return { code: "empty", message: "That file looks empty." };
  }
  if (!isAllowedImageMime(file.type)) {
    return {
      code: "wrong-type",
      message: `Use ${ALLOWED_IMAGE_LABEL}.`,
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      code: "too-large",
      message: `Image must be under ${MAX_IMAGE_BYTES_LABEL}.`,
    };
  }
  return null;
}

export interface ProcessedImage {
  buffer: Buffer;
  contentType: AllowedImageMime;
  ext: string;
}

// Decode → strip metadata → resize → re-encode. Two things matter:
//   1. We never store attacker-controlled bytes verbatim. Whatever
//      comes out is freshly emitted by libvips, so embedded scripts /
//      EXIF / polyglot tricks die at the boundary.
//   2. Output dimensions are capped, so a 12000x12000 source can't
//      cost us bandwidth on every page view.
// Returns null + reason if the file is unreadable as an image (e.g.
// renamed `.exe`, corrupt data, or a decompression-bomb input).
export async function processUploadedImage(
  file: File,
): Promise<{ ok: true; image: ProcessedImage } | { ok: false; error: string }> {
  const validation = validateImageFile(file);
  if (validation) return { ok: false, error: validation.message };

  const input = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
    .rotate() // bake EXIF orientation in, then strip metadata below
    .resize({
      width: MAX_OUTPUT_DIMENSION,
      height: MAX_OUTPUT_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

  // Re-emit in the same family the user uploaded so URLs/extensions
  // stay predictable. Sharp drops metadata by default unless you
  // call .withMetadata(), which we deliberately don't.
  let buffer: Buffer;
  try {
    if (file.type === "image/png") {
      buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    } else if (file.type === "image/webp") {
      buffer = await pipeline.webp({ quality: 82 }).toBuffer();
    } else {
      buffer = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    }
  } catch {
    return { ok: false, error: "That file doesn't look like a real image." };
  }

  return {
    ok: true,
    image: {
      buffer,
      contentType: file.type as AllowedImageMime,
      ext: extensionForMime(file.type),
    },
  };
}

// Server-only image processing. Kept separate from lib/images.ts because
// sharp depends on libvips + native bindings and can't be bundled for
// the browser — importing it from a client component (even transitively)
// breaks the build. The `.server.ts` suffix signals intent; the bundler
// enforces it (sharp fails to resolve in client chunks).

import sharp from "sharp";
import {
  type AllowedImageMime,
  extensionForMime,
  validateImageFile,
} from "@/lib/images";

const MAX_OUTPUT_DIMENSION = 2000;
// Decompression-bomb guard. Caps the *decoded* pixel count, so a tiny
// hostile file that expands to gigapixels gets rejected before we
// allocate memory for it.
const MAX_INPUT_PIXELS = 24_000_000;

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
// Returns ok:false + reason if the file is unreadable as an image (e.g.
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

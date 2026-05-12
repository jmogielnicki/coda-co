// Shared validation for vendor-uploaded images. Used by both the client
// uploader (for immediate user feedback) and the server action (the real
// gate). Keep the rules in one place so they don't drift.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

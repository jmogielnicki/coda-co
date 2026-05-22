// Shared helpers for the preview-access gate. Imported by both
// middleware.ts (Edge runtime) and the /preview-access server action
// (Node runtime). Both runtimes have WebCrypto.

export const PREVIEW_COOKIE_NAME = "coda-preview";
const TOKEN_SALT = "coda-preview-v1";

export async function previewToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${TOKEN_SALT}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

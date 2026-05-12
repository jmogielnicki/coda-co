// Shared constants + types for product image actions. Lives outside
// actions.ts because "use server" files can only export async functions.

export const MAX_GALLERY_IMAGES = 5;

export type ActionError = { ok: false; error: string };
export type ActionOk = { ok: true };
export type ImageActionResult = ActionOk | ActionError;

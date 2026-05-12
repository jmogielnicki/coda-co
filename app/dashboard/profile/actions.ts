"use server";

import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { requireVendor } from "@/app/dashboard/lib";
import { prisma } from "@/lib/db";
import { extensionForMime, validateImageFile } from "@/lib/images";

const TONES = ["sage", "terracotta"] as const;
type Tone = (typeof TONES)[number];

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

// A URL counts as "ours to delete" only if it points at our Blob store.
// Legacy /public/vendors/* paths and any other origin are left alone.
function isOwnedBlobUrl(url: string | null): url is string {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export type ProfileFormState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; error: string };

export async function updateVendorProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { vendor } = await requireVendor();

  const toneRaw = String(formData.get("photoTone") ?? "").trim();
  if (!isTone(toneRaw)) {
    return { status: "error", error: "Pick a frame color." };
  }

  const photo = formData.get("photo");
  const hasNewPhoto = photo instanceof File && photo.size > 0;

  let nextPhotoUrl: string | null | undefined; // undefined = leave column alone
  if (hasNewPhoto) {
    const problem = validateImageFile(photo);
    if (problem) {
      return { status: "error", error: problem.message };
    }
    const ext = extensionForMime(photo.type);
    const key = `vendors/${vendor.slug}/photo-${Date.now()}.${ext}`;
    const blob = await put(key, photo, {
      access: "public",
      contentType: photo.type,
    });
    nextPhotoUrl = blob.url;
  }

  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      photoTone: toneRaw,
      ...(nextPhotoUrl !== undefined ? { photoSrc: nextPhotoUrl } : {}),
    },
  });

  // Old blob cleanup is best-effort. If the delete fails (network blip,
  // already gone), the row is still correct — we just leak one object.
  if (hasNewPhoto && isOwnedBlobUrl(vendor.photoSrc)) {
    try {
      await del(vendor.photoSrc);
    } catch {
      // Swallow — the user's update succeeded and that's what matters.
    }
  }

  revalidatePath("/dashboard/profile");
  revalidatePath(`/services/${vendor.slug}`);
  revalidatePath("/services");

  return { status: "ok" };
}

"use client";

import { useActionState, useCallback, useRef } from "react";
import {
  ImageUploader,
  type ImageUploaderHandle,
} from "@/components/ui/ImageUploader";
import { updateVendorProfile, type ProfileFormState } from "./actions";

interface ProfileFormProps {
  currentPhotoSrc: string | null;
  currentTone: "sage" | "terracotta";
}

const initial: ProfileFormState = { status: "idle" };

export function ProfileForm({ currentPhotoSrc, currentTone }: ProfileFormProps) {
  const uploaderRef = useRef<ImageUploaderHandle>(null);

  // Pull the cropped Blob from the uploader and swap it into FormData
  // before the server sees the request. The native file input would
  // otherwise send the full-size original.
  const action = useCallback(
    async (
      prev: ProfileFormState,
      formData: FormData,
    ): Promise<ProfileFormState> => {
      const blob = await uploaderRef.current?.getCroppedBlob();
      if (blob) {
        formData.set(
          "photo",
          new File([blob], "photo.webp", { type: blob.type }),
        );
      }
      return updateVendorProfile(prev, formData);
    },
    [],
  );

  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form
      action={formAction}
      // Keying on the saved URL remounts the uploader after a successful
      // save so the new photo is what the user sees, not their stale
      // cropper state.
      key={currentPhotoSrc ?? "empty"}
      className="bg-white rounded-[10px] border border-line p-6 space-y-6"
    >
      <ImageUploader
        ref={uploaderRef}
        name="photo"
        currentSrc={currentPhotoSrc}
        shape="circle"
        label="Profile photo"
      />

      <fieldset className="space-y-2">
        <legend className="block text-[12px] font-medium text-ch mb-1.5">
          Frame color
        </legend>
        <div className="flex gap-4">
          <ToneRadio value="sage" defaultChecked={currentTone === "sage"} />
          <ToneRadio
            value="terracotta"
            defaultChecked={currentTone === "terracotta"}
          />
        </div>
      </fieldset>

      {state.status === "error" && (
        <p className="text-[13px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">
          {state.error}
        </p>
      )}
      {state.status === "ok" && (
        <p className="text-[13px] text-sg-d bg-sg-p border border-sg-l rounded px-3 py-2">
          Profile updated.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary btn-md">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function ToneRadio({
  value,
  defaultChecked,
}: {
  value: "sage" | "terracotta";
  defaultChecked: boolean;
}) {
  const label = value === "sage" ? "Sage" : "Terracotta";
  const swatchCls = value === "sage" ? "bg-sg" : "bg-tr";
  return (
    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-ch">
      <input
        type="radio"
        name="photoTone"
        value={value}
        defaultChecked={defaultChecked}
        className="accent-tr"
      />
      <span className={`inline-block w-4 h-4 rounded-sm ${swatchCls}`} />
      {label}
    </label>
  );
}

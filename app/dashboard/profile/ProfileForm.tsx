"use client";

import { useActionState } from "react";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { updateVendorProfile, type ProfileFormState } from "./actions";

interface ProfileFormProps {
  currentPhotoSrc: string | null;
  currentTone: "sage" | "terracotta";
}

const initial: ProfileFormState = { status: "idle" };

export function ProfileForm({ currentPhotoSrc, currentTone }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateVendorProfile, initial);

  return (
    <form
      action={action}
      className="bg-white rounded-[10px] border border-line p-6 space-y-6"
    >
      <ImageUploader
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
  const swatchCls =
    value === "sage" ? "bg-sg" : "bg-tr";
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

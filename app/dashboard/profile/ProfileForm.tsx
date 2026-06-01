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
  currentBio: string;
  currentWebsiteUrl: string | null;
  currentInstagramHandle: string | null;
  currentServiceRadius: string | null;
  currentServiceFormats: string | null;
  currentServiceDays: string | null;
  currentServiceHours: string | null;
}

const initial: ProfileFormState = { status: "idle" };

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

export function ProfileForm({
  currentPhotoSrc,
  currentTone,
  currentBio,
  currentWebsiteUrl,
  currentInstagramHandle,
  currentServiceRadius,
  currentServiceFormats,
  currentServiceDays,
  currentServiceHours,
}: ProfileFormProps) {
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
      className="bg-white rounded-[10px] border border-line p-6 space-y-7"
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

      <Section title="About" subtitle="Shown at the top of your public profile. Use blank lines to break into paragraphs.">
        <Field label="Bio">
          <textarea
            name="bio"
            defaultValue={currentBio}
            className={`${inputCls} min-h-[140px] resize-y`}
            placeholder="Tell clients about your practice, your background, and how you work."
          />
        </Field>
      </Section>

      <Section title="Contact links" subtitle="Shown below the 'Send a message' button. Leave any field blank to hide it.">
        <Field label="Website URL">
          <input
            type="url"
            name="websiteUrl"
            defaultValue={currentWebsiteUrl ?? ""}
            className={inputCls}
            placeholder="https://example.com"
          />
        </Field>
        <Field label="Instagram handle">
          <input
            type="text"
            name="instagramHandle"
            defaultValue={currentInstagramHandle ?? ""}
            className={inputCls}
            placeholder="@yourhandle"
          />
        </Field>
      </Section>

      <Section title="Service area & availability" subtitle="Shown on your public profile's service-area card. Leave blank to hide a row.">
        <Field label="Radius">
          <input
            type="text"
            name="serviceRadius"
            defaultValue={currentServiceRadius ?? ""}
            className={inputCls}
            placeholder="e.g. 25 mile radius"
          />
        </Field>
        <Field label="Formats">
          <input
            type="text"
            name="serviceFormats"
            defaultValue={currentServiceFormats ?? ""}
            className={inputCls}
            placeholder="e.g. In-home, hospital/facility, and virtual"
          />
          <span className="block text-[11px] text-cl mt-1">
            Leave blank to auto-derive from your services&apos; location types.
          </span>
        </Field>
        <Field label="Days">
          <input
            type="text"
            name="serviceDays"
            defaultValue={currentServiceDays ?? ""}
            className={inputCls}
            placeholder="e.g. Tue–Fri primary; weekends by arrangement"
          />
        </Field>
        <Field label="Hours">
          <input
            type="text"
            name="serviceHours"
            defaultValue={currentServiceHours ?? ""}
            className={inputCls}
            placeholder="e.g. Morning, afternoon, and evening sessions"
          />
        </Field>
      </Section>

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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 pt-5 border-t border-line">
      <div>
        <h2 className="font-serif text-[18px] text-ch">{title}</h2>
        {subtitle && (
          <p className="text-[12px] text-cl mt-0.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-ch mb-1.5">{label}</span>
      {children}
    </label>
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

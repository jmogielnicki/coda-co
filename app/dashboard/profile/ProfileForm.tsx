"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import {
  ImageUploader,
  type ImageUploaderHandle,
} from "@/components/ui/ImageUploader";
import { SPECIALIZATIONS } from "@/lib/data/specializations";
import { LIFE_STAGES } from "@/lib/format/lifeStage";
import { updateVendorProfile, type ProfileFormState } from "./actions";

interface ProfileFormProps {
  currentPhotoSrc: string | null;
  currentTone: "sage" | "terracotta";
  currentBio: string;
  currentWebsiteUrl: string | null;
  currentInstagramHandle: string | null;
  currentServiceRadius: string | null;
  currentServiceRadiusMi: number | null;
  currentServiceFormats: string | null;
  currentServiceDays: string | null;
  currentServiceHours: string | null;
  currentSpecializations: string[];
  currentZip: string | null;
  currentServiceDescription: string | null;
  currentPricingNotes: string | null;
  currentLifeStages: string[];
}

const initial: ProfileFormState = { status: "idle" };

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

// Server enforces these in actions.ts. Keep in sync.
const BIO_MAX = 500;
const DESC_MAX = 500;
const NOTES_MAX = 500;

export function ProfileForm({
  currentPhotoSrc,
  currentTone,
  currentBio,
  currentWebsiteUrl,
  currentInstagramHandle,
  currentServiceRadius,
  currentServiceRadiusMi,
  currentServiceFormats,
  currentServiceDays,
  currentServiceHours,
  currentSpecializations,
  currentZip,
  currentServiceDescription,
  currentPricingNotes,
  currentLifeStages,
}: ProfileFormProps) {
  const uploaderRef = useRef<ImageUploaderHandle>(null);
  // Chip toggles drive local state; hidden inputs at submit time
  // serialize the selected set back into FormData (server reads via
  // formData.getAll()).
  const [specs, setSpecs] = useState<string[]>(currentSpecializations);
  const [stages, setStages] = useState<string[]>(currentLifeStages);

  // Character-count state for the three capped textareas. We keep the
  // textareas uncontrolled (defaultValue) so React doesn't have to
  // mirror their full value — only the length goes through state.
  const [bioLen, setBioLen] = useState(currentBio.length);
  const [descLen, setDescLen] = useState(
    (currentServiceDescription ?? "").length,
  );
  const [notesLen, setNotesLen] = useState((currentPricingNotes ?? "").length);

  function toggleSpec(s: string) {
    setSpecs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function toggleStage(s: string) {
    setStages((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

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
        <Field label="Bio" required>
          <textarea
            name="bio"
            defaultValue={currentBio}
            className={`${inputCls} min-h-[140px] resize-y`}
            placeholder="Tell clients about your practice, your background, and how you work."
            maxLength={BIO_MAX}
            required
            onChange={(e) => setBioLen(e.target.value.length)}
          />
          <div className="text-[11px] text-cl mt-1 text-right tabular-nums">
            {bioLen} / {BIO_MAX}
          </div>
        </Field>
      </Section>

      <Section title="Service description" subtitle="A short overview of what you offer, shown above the list of specific services on your public profile.">
        <Field label="Description" required>
          <textarea
            name="serviceDescription"
            defaultValue={currentServiceDescription ?? ""}
            className={`${inputCls} min-h-[120px] resize-y`}
            placeholder="Describe your usual services, including any packages that you offer."
            maxLength={DESC_MAX}
            required
            onChange={(e) => setDescLen(e.target.value.length)}
          />
          <div className="text-[11px] text-cl mt-1 text-right tabular-nums">
            {descLen} / {DESC_MAX}
          </div>
        </Field>
      </Section>

      <Section title="Pricing notes" subtitle="Free-form pricing context. Shown alongside your services on the public profile.">
        <Field label="Notes">
          <textarea
            name="pricingNotes"
            defaultValue={currentPricingNotes ?? ""}
            className={`${inputCls} min-h-[120px] resize-y`}
            placeholder={`Please list detailed information about your pricing. Examples: "Hourly rates range from $55–125/hour. Sliding scale available." Also please list prices or price ranges for packages that you offer.`}
            maxLength={NOTES_MAX}
            onChange={(e) => setNotesLen(e.target.value.length)}
          />
          <div className="text-[11px] text-cl mt-1 text-right tabular-nums">
            {notesLen} / {NOTES_MAX}
          </div>
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

      <Section title="Specializations" subtitle="Pick the tags clients can find you by. Same list that powers the search filter on the /services page.">
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => {
            const active = specs.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpec(s)}
                className={[
                  "px-3 py-1.5 rounded-full text-[12px] border transition-all cursor-pointer",
                  active
                    ? "bg-sg text-white border-sg"
                    : "bg-white text-cm border-line-bold hover:border-sg",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
        {specs.map((s) => (
          <input key={s} type="hidden" name="specializations" value={s} />
        ))}
      </Section>

      <Section title="Life stages" subtitle="Which phases of the end-of-life journey your practice serves. Drives the chip filters on the public /services page.">
        <div className="flex flex-wrap gap-2">
          {LIFE_STAGES.map((s) => {
            const active = stages.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleStage(s.value)}
                className={[
                  "px-3 py-1.5 rounded-full text-[12px] border transition-all cursor-pointer",
                  active
                    ? "bg-sg text-white border-sg"
                    : "bg-white text-cm border-line-bold hover:border-sg",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {stages.map((s) => (
          <input key={s} type="hidden" name="lifeStages" value={s} />
        ))}
      </Section>

      <Section title="Service area & availability" subtitle="Shown on your public profile's service-area card. Leave blank to hide a row.">
        <Field label="Zip">
          <input
            type="text"
            name="zip"
            defaultValue={currentZip ?? ""}
            className={inputCls}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            placeholder="11201"
          />
          <span className="block text-[11px] text-cl mt-1">
            Paired with your search radius below to show you to nearby clients.
          </span>
        </Field>
        <Field label="Search radius (miles)">
          <input
            type="number"
            name="serviceRadiusMi"
            defaultValue={currentServiceRadiusMi ?? ""}
            className={inputCls}
            inputMode="numeric"
            min={0}
            max={500}
            placeholder="e.g. 25"
          />
          <span className="block text-[11px] text-cl mt-1">
            Clients within this many miles of your zip will see you in
            search. Leave blank if you work virtually or nationwide.
          </span>
        </Field>
        <Field label="Radius (shown on profile)">
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-ch mb-1.5">
        {label}
        {required && <span className="text-tr ml-0.5">*</span>}
      </span>
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

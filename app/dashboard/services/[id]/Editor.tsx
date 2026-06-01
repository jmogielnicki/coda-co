"use client";

import { useState, useTransition } from "react";
import type {
  ServiceLocationType,
  ServicePricingModel,
  ServiceStatus,
} from "@/lib/types";
import type { ServiceTypeOption } from "@/lib/api/serviceTypes";
import { setServiceStatus, updateService } from "../actions";

interface ServiceView {
  id: string;
  slug: string;
  title: string;
  description: string;
  serviceTypeSlug: string;
  locationType: ServiceLocationType;
  pricingModel: ServicePricingModel;
  priceCents: number | null;
  status: ServiceStatus;
}

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

const LOCATION_OPTIONS: { value: ServiceLocationType; label: string }[] = [
  { value: "unknown", label: "Choose…" },
  { value: "virtual", label: "Virtual only" },
  { value: "in_person", label: "In-person only" },
  { value: "both", label: "Virtual & in-person" },
];

const PRICING_OPTIONS: { value: ServicePricingModel; label: string }[] = [
  { value: "unknown", label: "Choose…" },
  { value: "fixed", label: "Fixed price" },
  { value: "hourly", label: "Hourly rate" },
  { value: "quote", label: "By quote" },
];

export function ServiceEditor({
  service,
  serviceTypes,
}: {
  service: ServiceView;
  serviceTypes: ServiceTypeOption[];
}) {
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [serviceTypeSlug, setServiceTypeSlug] = useState(service.serviceTypeSlug);
  const [locationType, setLocationType] = useState<ServiceLocationType>(service.locationType);
  const [pricingModel, setPricingModel] = useState<ServicePricingModel>(service.pricingModel);
  const [priceInput, setPriceInput] = useState(
    service.priceCents != null ? String(service.priceCents / 100) : "",
  );
  const [status, setStatus] = useState<ServiceStatus>(service.status);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const priceRequired = pricingModel === "fixed" || pricingModel === "hourly";

  function save() {
    startTransition(async () => {
      setError(null);
      const price = priceRequired && priceInput.trim() !== "" ? Number(priceInput) : null;
      const result = await updateService(service.id, {
        title: title.trim(),
        description: description.trim(),
        serviceTypeSlug,
        locationType,
        pricingModel,
        price,
      });
      if (!result.ok) setError(result.error);
      else setSavedAt(new Date().toLocaleTimeString());
    });
  }

  function changeStatus(next: "draft" | "published" | "archived") {
    startTransition(async () => {
      setError(null);
      const result = await setServiceStatus(service.id, next);
      if (!result.ok) setError(result.error);
      else {
        setStatus(next);
        setSavedAt(new Date().toLocaleTimeString());
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] border border-line p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[20px] text-ch">Status</h2>
          <StatusBadge status={status} />
        </div>
        <div className="flex flex-wrap gap-2">
          {status !== "published" && (
            <button
              type="button"
              onClick={() => changeStatus("published")}
              disabled={pending}
              className="btn-primary btn-sm disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {status === "published" && (
            <button
              type="button"
              onClick={() => changeStatus("draft")}
              disabled={pending}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              Unpublish (back to draft)
            </button>
          )}
          {status !== "archived" && (
            <button
              type="button"
              onClick={() => changeStatus("archived")}
              disabled={pending}
              className="btn-ghost btn-sm disabled:opacity-50"
            >
              Archive
            </button>
          )}
          {status === "archived" && (
            <button
              type="button"
              onClick={() => changeStatus("draft")}
              disabled={pending}
              className="btn-secondary btn-sm disabled:opacity-50"
            >
              Restore to draft
            </button>
          )}
        </div>
        {status === "draft" && (
          <p className="text-[12px] text-cl mt-3">
            Drafts are private. Publish once the description, location, and pricing are set.
          </p>
        )}
        {status === "archived" && (
          <p className="text-[12px] text-cl mt-3">
            Archived services don&apos;t show on your public profile. Restore to edit again.
          </p>
        )}
      </div>

      <div className="bg-white rounded-[10px] border border-line p-6 space-y-4">
        <h2 className="font-serif text-[20px] text-ch">Details</h2>

        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="In-home doula consultation"
          />
        </Field>

        <Field label="Service type">
          <select
            value={serviceTypeSlug}
            onChange={(e) => setServiceTypeSlug(e.target.value)}
            className={inputCls}
          >
            {serviceTypes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputCls} min-h-[140px] resize-y`}
            placeholder="What you offer, who it's for, what to expect…"
          />
        </Field>

        <Field label="Location">
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as ServiceLocationType)}
            className={inputCls}
          >
            {LOCATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pricing model">
          <select
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value as ServicePricingModel)}
            className={inputCls}
          >
            {PRICING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        {priceRequired && (
          <Field
            label={pricingModel === "hourly" ? "Hourly rate (USD)" : "Price (USD)"}
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className={inputCls}
              placeholder="0.00"
            />
          </Field>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-[12px] text-cl">
            {error ? (
              <span className="text-tr-d">{error}</span>
            ) : savedAt ? (
              `Saved at ${savedAt}`
            ) : (
              " "
            )}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="btn-primary btn-md disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
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

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "published"
      ? "bg-sg-p text-sg-d"
      : status === "draft"
        ? "bg-tr-p text-tr-d"
        : "bg-pl2 text-cm";
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

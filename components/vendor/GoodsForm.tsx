"use client";

import { useState, useTransition } from "react";
import { submitGoodsApplication } from "@/app/list-with-us/actions";
import { StepsBar } from "@/components/ui/StepsBar";
import { LIFE_STAGES } from "@/lib/format/lifeStage";
import type { LifeStage } from "@/lib/types";

type PlanId = "starter" | "standard" | "pro";

const STEPS = [
  { label: "Your profile" },
  { label: "Your listing" },
  { label: "Photos & pricing" },
  { label: "Choose a plan" },
];

const CATEGORIES = [
  "Urns & vessels",
  "Ash jewelry",
  "Burial shrouds",
  "Planning documents",
  "Memorial art & prints",
  "Custom keepsakes",
  "Gifts & humor",
  "Other",
];

const TAGS = [
  "Handmade",
  "Ceramic",
  "Eco-friendly",
  "Ships anywhere",
  "Local pickup",
  "Custom / personalized",
  "Made to order",
  "Digital download",
];

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  instagram: string;
  facebook: string;
  website: string;
  city: string;
  state: string;
  bio: string;
  productName: string;
  category: string;
  description: string;
  tags: string[];
  lifeStages: LifeStage[];
  basePrice: string;
}

export function GoodsForm() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanId>("starter");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<FormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    instagram: "",
    facebook: "",
    website: "",
    city: "",
    state: "",
    bio: "",
    productName: "",
    category: CATEGORIES[0],
    description: "",
    tags: [],
    lifeStages: [],
    basePrice: "",
  });

  function field(key: keyof FormData) {
    return {
      value: data[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  function toggleTag(tag: string) {
    setData((d) => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag],
    }));
  }

  function toggleLifeStage(stage: LifeStage) {
    setData((d) => ({
      ...d,
      lifeStages: d.lifeStages.includes(stage)
        ? d.lifeStages.filter((x) => x !== stage)
        : [...d.lifeStages, stage],
    }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    startTransition(async () => {
      const displayName =
        data.companyName.trim() || `${data.firstName} ${data.lastName}`.trim();
      const result = await submitGoodsApplication({
        displayName,
        bio: data.bio,
        city: data.city,
        state: data.state,
        planId: plan,
      });
      // The action redirects on success, so we only land here on a
      // validation failure with the error returned in the payload.
      if (result?.error) setSubmitError(result.error);
    });
  }

  return (
    <div>
      <StepsBar steps={STEPS} current={step} />

      <section className="bg-tr-vp px-10 py-10">
        <div className="max-w-[780px] mx-auto flex gap-8">
          {/* Main form */}
          <div className="flex-1 min-w-0">
            {step === 0 && (
              <div className="bg-white rounded-[14px] border border-line p-8">
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 1 — Your seller profile
                </h2>
                <p className="text-[13px] text-cl mb-6">
                  This is how buyers will know and trust you. You can edit this at any time.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField label="First name">
                    <input className={inputCls} placeholder="First name" {...field("firstName")} />
                  </FormField>
                  <FormField label="Last name">
                    <input className={inputCls} placeholder="Last name" {...field("lastName")} />
                  </FormField>
                </div>
                <FormField label="Company name (optional)">
                  <input className={inputCls} placeholder="Earthen Studio" {...field("companyName")} />
                </FormField>
                <FormField label="Email address">
                  <input className={inputCls} type="email" placeholder="you@example.com" {...field("email")} />
                </FormField>
                <FormField label="Website (optional)">
                  <input className={inputCls} placeholder="https://" {...field("website")} />
                </FormField>
                <FormField label="Instagram (optional)">
                  <input className={inputCls} placeholder="@yourhandle" {...field("instagram")} />
                </FormField>
                <FormField label="Facebook page (optional)">
                  <input className={inputCls} placeholder="facebook.com/yourpage" {...field("facebook")} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="City">
                    <input className={inputCls} placeholder="Portland" {...field("city")} />
                  </FormField>
                  <FormField label="State">
                    <select className={inputCls} {...field("state")}>
                      {["OR", "CA", "NY", "TX", "WA", "FL", "CO", "MA"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <FormField label="About you (shown on your profile)">
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    placeholder="Tell buyers about yourself and your work…"
                    {...field("bio")}
                  />
                </FormField>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-[14px] border border-line p-8">
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 2 — Your listing
                </h2>
                <p className="text-[13px] text-cl mb-6">
                  Describe your product clearly and warmly.
                </p>

                <FormField label="Product name">
                  <input className={inputCls} placeholder="Hand-thrown ceramic urn, sage glaze" {...field("productName")} />
                </FormField>
                <FormField label="Category">
                  <select className={inputCls} {...field("category")}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Description">
                  <textarea
                    className={`${inputCls} min-h-[120px] resize-y`}
                    placeholder="Describe your product — materials, process, sizing, what makes it special…"
                    {...field("description")}
                  />
                </FormField>
                <FormField label="Tags (select all that apply)">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={[
                          "px-3 py-1.5 rounded-full text-[12px] border transition-all cursor-pointer",
                          data.tags.includes(tag)
                            ? "bg-tr text-white border-tr"
                            : "bg-white text-cm border-[rgba(44,40,37,.2)] hover:border-tr",
                        ].join(" ")}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Who is this for? (select all that apply)">
                  <p className="text-[12px] text-cl mb-2 -mt-1">
                    Helps buyers filter goods by where they are in the journey.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {LIFE_STAGES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => toggleLifeStage(s.value)}
                        className={[
                          "px-3 py-1.5 rounded-full text-[12px] border transition-all cursor-pointer",
                          data.lifeStages.includes(s.value)
                            ? "bg-tr text-white border-tr"
                            : "bg-white text-cm border-line-bold hover:border-tr",
                        ].join(" ")}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-[14px] border border-line p-8">
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 3 — Photos &amp; pricing
                </h2>
                <p className="text-[13px] text-cl mb-6">
                  Add photos and set your price. You can add variants after approval.
                </p>

                {/* Upload zone */}
                <div className="border-2 border-dashed border-[rgba(44,40,37,.2)] rounded-[10px] p-8 text-center mb-6 cursor-pointer hover:border-tr transition-colors">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
                    <path d="M6 22 L6 26 L26 26 L26 22" stroke="#9A9189" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 6 L16 20" stroke="#9A9189" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10 12 L16 6 L22 12" stroke="#9A9189" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[13px] text-cl">Drop photos here or click to browse</p>
                  <p className="text-[11px] text-cl mt-1">JPG, PNG up to 10MB each</p>
                </div>

                <FormField label="Base price ($)">
                  <input
                    className={inputCls}
                    type="number"
                    placeholder="145"
                    {...field("basePrice")}
                  />
                </FormField>

                <div className="bg-sg-vp rounded-[8px] px-4 py-3 text-[13px] text-cm border border-sg-p">
                  You can add size variants and pricing tiers after your listing is approved.
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-[14px] border border-line p-8">
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 4 — Choose a plan
                </h2>
                <p className="text-[13px] text-cl mb-6">
                  Start free. Upgrade anytime.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      id: "starter" as const,
                      name: "Starter",
                      price: "Free",
                      features: ["Up to 3 listings", "Marketplace visibility", "5% transaction fee"],
                      popular: false,
                    },
                    {
                      id: "standard" as const,
                      name: "Standard",
                      price: "$12/mo",
                      features: ["Unlimited listings", "Verified badge", "Customer reviews", "5% transaction fee"],
                      popular: true,
                    },
                    {
                      id: "pro" as const,
                      name: "Pro",
                      price: "$29/mo",
                      features: ["Featured placement", "Analytics", "Priority support", "3% transaction fee"],
                      popular: false,
                    },
                  ].map((p) => {
                    const selected = plan === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlan(p.id)}
                        className={[
                          "block w-full text-left border rounded-[10px] p-4 cursor-pointer transition-all",
                          selected
                            ? "border-tr bg-tr-vp"
                            : "border-line-strong hover:border-tr",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[15px] font-medium text-ch">{p.name}</span>
                          <span className="text-[15px] font-medium text-tr">{p.price}</span>
                          {p.popular && (
                            <span className="text-[10px] bg-tr text-white px-2 py-0.5 rounded-full ml-2">
                              Most popular
                            </span>
                          )}
                        </div>
                        <ul className="space-y-1">
                          {p.features.map((f) => (
                            <li key={f} className="text-[12px] text-cm flex items-center gap-1.5">
                              <span className="text-sg">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="px-6 py-2.5 rounded-full border border-[rgba(44,40,37,.2)] text-[13px] text-ink cursor-pointer hover:border-ch transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="px-8 py-2.5 rounded-full bg-tr text-white text-[13px] cursor-pointer hover:bg-tr-d transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={pending}
                  className="px-8 py-2.5 rounded-full bg-tr text-white text-[13px] cursor-pointer hover:bg-tr-d transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? "Submitting…" : "Submit listing →"}
                </button>
              )}
            </div>

            {submitError && (
              <p className="mt-3 text-[13px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">
                {submitError}
              </p>
            )}
          </div>

          {/* Sidebar preview */}
          <div className="w-[220px] flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-[12px] border border-line p-4 sticky top-[88px]">
              <div className="text-[11px] tracking-[.08em] uppercase text-cl mb-3">
                Listing preview
              </div>
              <div
                className="h-[90px] rounded-[8px] bg-tr-p flex items-center justify-center mb-3"
              >
                <svg width="32" height="38" viewBox="0 0 60 70" fill="none">
                  <path d="M30 8 C18 8 10 20 10 38 C10 52 18 62 30 62 C42 62 50 52 50 38 C50 20 42 8 30 8Z" stroke="#C1634F" strokeWidth="1.8" fill="none" />
                </svg>
              </div>
              <div className="text-[13px] font-medium text-ch mb-1 truncate">
                {data.productName || "Your product name"}
              </div>
              <div className="text-[11px] text-cl mb-1 truncate">
                {data.companyName || `${data.firstName} ${data.lastName}`.trim() || "Your shop name"}
              </div>
              {data.basePrice && (
                <div className="text-[14px] font-medium text-tr">${data.basePrice}</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-medium text-ch mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-[rgba(44,40,37,.18)] rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

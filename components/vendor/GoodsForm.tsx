"use client";

import { useState, useTransition } from "react";
import { submitGoodsApplication } from "@/app/list-with-us/actions";
import { StepsBar } from "@/components/ui/StepsBar";
import { normalizeZip } from "@/lib/geo/zip";

type PlanId = "starter" | "standard" | "pro";

const STEPS = [{ label: "Your shop" }, { label: "Choose a plan" }];

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
  zip: string;
  bio: string;
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
    zip: "",
    bio: "",
  });

  function field(key: keyof FormData) {
    return {
      value: data[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  const shopName =
    data.companyName.trim() || `${data.firstName} ${data.lastName}`.trim();

  async function handleSubmit() {
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitGoodsApplication({
        displayName: shopName,
        bio: data.bio,
        city: data.city,
        state: data.state,
        zip: data.zip,
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
                  Step 1 — Set up your shop
                </h2>
                <p className="text-[13px] text-cl mb-6">
                  This is how buyers will know and trust you. You can edit it any
                  time, and you&apos;ll add your individual goods — with photos and
                  prices — right after this.
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
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
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
                  <FormField label="Zip" required>
                    <input
                      className={inputCls}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={10}
                      placeholder="97201"
                      {...field("zip")}
                    />
                  </FormField>
                </div>
                <FormField label="About you (shown on your shop page)">
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
                  Step 2 — Choose a plan
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
                      name: "Storefront",
                      price: "$28 one-time set-up",
                      features: ["Unlimited listings", "Customer reviews", "5% transaction fee"],
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

                <div className="mt-5 bg-sg-vp rounded-[8px] px-4 py-3 text-[13px] text-cm border border-sg-p">
                  After this, you&apos;ll add your goods from your dashboard. Your
                  first listing is reviewed by our team before it goes live; every
                  listing after that publishes instantly.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setSubmitError(null);
                  setStep((s) => s - 1);
                }}
                disabled={step === 0}
                className="px-6 py-2.5 rounded-full border border-[rgba(44,40,37,.2)] text-[13px] text-ink cursor-pointer hover:border-ch transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => {
                    // Zip is required and powers geo search — gate Step 1 so
                    // the seller fixes it here rather than bouncing back from
                    // the final submit.
                    if (step === 0 && !normalizeZip(data.zip)) {
                      setSubmitError("Enter a valid 5-digit zip code so buyers can find you.");
                      return;
                    }
                    setSubmitError(null);
                    setStep((s) => s + 1);
                  }}
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
                  {pending ? "Creating…" : "Create my shop →"}
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
                Shop preview
              </div>
              <div className="h-[90px] rounded-[8px] bg-tr-p flex items-center justify-center mb-3">
                <svg width="32" height="38" viewBox="0 0 60 70" fill="none">
                  <path d="M30 8 C18 8 10 20 10 38 C10 52 18 62 30 62 C42 62 50 52 50 38 C50 20 42 8 30 8Z" stroke="#C1634F" strokeWidth="1.8" fill="none" />
                </svg>
              </div>
              <div className="text-[13px] font-medium text-ch mb-1 truncate">
                {shopName || "Your shop name"}
              </div>
              <div className="text-[11px] text-cl truncate">
                {[data.city.trim(), data.state.trim()].filter(Boolean).join(", ") ||
                  "Your location"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-medium text-ch mb-1.5">
        {label}
        {required && <span className="text-tr ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-[rgba(44,40,37,.18)] rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

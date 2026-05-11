"use client";

import { useState, useTransition } from "react";
import { submitServicesApplication } from "@/app/list-with-us/actions";
import { StepsBar } from "@/components/ui/StepsBar";
import type { ServiceTypeOption } from "@/lib/api/serviceTypes";
import { LIFE_STAGES } from "@/lib/format/lifeStage";
import type { LifeStage } from "@/lib/types";

type PlanId = "starter" | "standard" | "pro";

const STEPS = [
  { label: "Your profile" },
  { label: "Your service" },
  { label: "Area & availability" },
  { label: "Choose a plan" },
];

const SPECIALIZATIONS = [
  "EOL planning",
  "Grief support",
  "Dementia",
  "Home-centered dying",
  "Legacy work",
  "Advance directives",
  "Events",
  "Memorial goods",
  "Wills + estates",
  "Mediation",
  "Green burial",
  "Funerals",
  "Cleaning + organization",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HOURS = [
  "Early morning (6–9a)",
  "Morning (9a–12p)",
  "Afternoon (12–5p)",
  "Evening (5–9p)",
];

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  credentials: string;
  email: string;
  instagram: string;
  facebook: string;
  website: string;
  city: string;
  state: string;
  bio: string;
  serviceType: string;
  serviceDescription: string;
  specializations: string[];
  lifeStages: LifeStage[];
  radius: string;
  virtual: boolean;
  inHome: boolean;
  availableDays: string[];
  availableHours: string[];
}

export function ServicesForm({ serviceTypes }: { serviceTypes: ServiceTypeOption[] }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanId>("starter");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<FormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    credentials: "",
    email: "",
    instagram: "",
    facebook: "",
    website: "",
    city: "",
    state: "",
    bio: "",
    serviceType: serviceTypes[0]?.slug ?? "",
    serviceDescription: "",
    specializations: [],
    lifeStages: [],
    radius: "15 mi",
    virtual: false,
    inHome: true,
    availableDays: [],
    availableHours: [],
  });

  function field(key: keyof FormData) {
    return {
      value: data[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value })),
    };
  }

  function toggleSpec(s: string) {
    setData((d) => ({
      ...d,
      specializations: d.specializations.includes(s)
        ? d.specializations.filter((x) => x !== s)
        : [...d.specializations, s],
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

  function toggleDay(day: string) {
    setData((d) => ({
      ...d,
      availableDays: d.availableDays.includes(day)
        ? d.availableDays.filter((x) => x !== day)
        : [...d.availableDays, day],
    }));
  }

  function toggleHour(hour: string) {
    setData((d) => ({
      ...d,
      availableHours: d.availableHours.includes(hour)
        ? d.availableHours.filter((x) => x !== hour)
        : [...d.availableHours, hour],
    }));
  }

  return (
    <div>
      <StepsBar steps={STEPS} current={step} />

      <section className="bg-sg-vp px-10 py-10">
        <div className="max-w-[780px] mx-auto">
          <div className="bg-white rounded-[14px] border border-line p-8">
            {step === 0 && (
              <>
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 1 — Your profile
                </h2>
                <p className="text-[13px] text-cl mb-6">
                  This is how clients will find and trust you.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField label="First name">
                    <input className={inputCls} placeholder="Maria" {...field("firstName")} />
                  </FormField>
                  <FormField label="Last name">
                    <input className={inputCls} placeholder="Rosales" {...field("lastName")} />
                  </FormField>
                </div>
                <FormField label="Company name (optional)">
                  <input className={inputCls} placeholder="Rosales Doula Care" {...field("companyName")} />
                </FormField>
                <FormField label="Credentials or certification (optional)">
                  <input className={inputCls} placeholder="CEND, INELDA, J.D., etc." {...field("credentials")} />
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
                    <input className={inputCls} placeholder="Brooklyn" {...field("city")} />
                  </FormField>
                  <FormField label="State">
                    <select className={inputCls} {...field("state")}>
                      {["NY", "CA", "OR", "TX", "WA", "FL", "CO", "MA"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <FormField label="About you (shown on your profile)">
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    placeholder="Your background, approach, and what clients can expect…"
                    {...field("bio")}
                  />
                </FormField>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 2 — Your service
                </h2>
                <p className="text-[13px] text-cl mb-6">Tell clients what you offer.</p>
                <FormField label="Service type">
                  <select className={inputCls} {...field("serviceType")}>
                    {serviceTypes.map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Service description">
                  <textarea
                    className={`${inputCls} min-h-[120px] resize-y`}
                    placeholder="Describe what you offer, your approach, typical session structure, pricing, etc."
                    {...field("serviceDescription")}
                  />
                </FormField>
                <FormField label="Specializations (select all that apply)">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SPECIALIZATIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpec(s)}
                        className={[
                          "px-3 py-1.5 rounded-full text-[12px] border transition-all cursor-pointer",
                          data.specializations.includes(s)
                            ? "bg-sg text-white border-sg"
                            : "bg-white text-cm border-[rgba(44,40,37,.2)] hover:border-sg",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Who is this for? (select all that apply)">
                  <p className="text-[12px] text-cl mb-2 -mt-1">
                    Helps clients filter providers by where they are in the journey.
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
                            ? "bg-sg text-white border-sg"
                            : "bg-white text-cm border-line-bold hover:border-sg",
                        ].join(" ")}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </FormField>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 3 — Area &amp; availability
                </h2>
                <p className="text-[13px] text-cl mb-6">Help clients know if you can reach them.</p>

                <FormField label="Service radius">
                  <div className="flex flex-wrap gap-2">
                    {["5 mi", "15 mi", "30 mi", "50 mi", "Virtual only"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setData((d) => ({ ...d, radius: r }))}
                        className={[
                          "px-4 py-2 rounded-full text-[13px] border cursor-pointer transition-all",
                          data.radius === r
                            ? "bg-tr text-white border-tr"
                            : "bg-white text-cm border-[rgba(44,40,37,.2)] hover:border-tr",
                        ].join(" ")}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Centered on">
                  <div className="text-[14px] text-ch">
                    {data.city && data.state ? (
                      `${data.city}, ${data.state}`
                    ) : (
                      <span className="text-cl italic">
                        Set your city and state in Step 1.
                      </span>
                    )}
                  </div>
                </FormField>

                <FormField label="Session types">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-cm">
                      <input
                        type="checkbox"
                        checked={data.inHome}
                        onChange={() => setData((d) => ({ ...d, inHome: !d.inHome }))}
                        className="accent-tr"
                      />
                      In-home / in-person
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-cm">
                      <input
                        type="checkbox"
                        checked={data.virtual}
                        onChange={() => setData((d) => ({ ...d, virtual: !d.virtual }))}
                        className="accent-tr"
                      />
                      Virtual
                    </label>
                  </div>
                </FormField>

                <FormField label="Typical availability">
                  <p className="text-[12px] text-cl mb-2 -mt-1">
                    Pick the days and times you typically offer sessions.
                  </p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={[
                          "w-12 h-10 rounded-[8px] text-[13px] border cursor-pointer transition-all",
                          data.availableDays.includes(day)
                            ? "bg-tr text-white border-tr"
                            : "bg-white text-cm border-[rgba(44,40,37,.2)] hover:border-tr",
                        ].join(" ")}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap mt-3">
                    {HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => toggleHour(hour)}
                        className={[
                          "px-4 py-2 rounded-full text-[13px] border cursor-pointer transition-all",
                          data.availableHours.includes(hour)
                            ? "bg-tr text-white border-tr"
                            : "bg-white text-cm border-[rgba(44,40,37,.2)] hover:border-tr",
                        ].join(" ")}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </FormField>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-serif text-[24px] font-light text-ch mb-1">
                  Step 4 — Choose a plan
                </h2>
                <p className="text-[13px] text-cl mb-6">Start free. Upgrade anytime.</p>
                <div className="space-y-3">
                  {[
                    {
                      id: "starter" as const,
                      name: "Starter",
                      price: "Free",
                      features: ["1 service profile", "CodaCo messaging", "Basic visibility"],
                      popular: false,
                    },
                    {
                      id: "standard" as const,
                      name: "Standard",
                      price: "$12/mo",
                      features: ["Unlimited profiles", "Verified badge", "Client reviews", "Priority search"],
                      popular: true,
                    },
                    {
                      id: "pro" as const,
                      name: "Pro",
                      price: "$29/mo",
                      features: ["Featured placement", "Advanced analytics", "Priority support", "Team accounts"],
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
                          selected ? "border-sg bg-sg-vp" : "border-line-strong hover:border-sg",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[15px] font-medium text-ch">{p.name}</span>
                          <span className="text-[15px] font-medium text-sg-d">{p.price}</span>
                          {p.popular && (
                            <span className="text-[10px] bg-sg text-white px-2 py-0.5 rounded-full">
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
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="px-6 py-2.5 rounded-full border border-[rgba(44,40,37,.2)] text-[13px] text-cm cursor-pointer hover:border-ch transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-8 py-2.5 rounded-full bg-sg text-white text-[13px] cursor-pointer hover:bg-sg-d transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={() => {
                  setSubmitError(null);
                  startTransition(async () => {
                    const displayName =
                      data.companyName.trim() ||
                      `${data.firstName} ${data.lastName}`.trim();
                    const result = await submitServicesApplication({
                      displayName,
                      bio: data.bio,
                      city: data.city,
                      state: data.state,
                      planId: plan,
                    });
                    if (result?.error) setSubmitError(result.error);
                  });
                }}
                disabled={pending}
                className="px-8 py-2.5 rounded-full bg-sg text-white text-[13px] cursor-pointer hover:bg-sg-d transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
  "w-full border border-[rgba(44,40,37,.18)] rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-sg transition-colors";

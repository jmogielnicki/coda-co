"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SERVICE_TYPES = [
  { value: "doula", label: "Death doula" },
  { value: "attorney", label: "Estate attorney" },
  { value: "cleaner", label: "Death cleaning" },
  { value: "celebrant", label: "Celebrant" },
  { value: "organizer", label: "EOL organizer" },
  { value: "home-funeral", label: "Home funeral" },
];

const DISTANCES = ["5 mi", "15 mi", "30 mi", "50 mi", "Virtual only"];
const RATINGS = [
  { value: "", label: "Any" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5 only" },
];

const SPECIALIZATIONS = [
  "EOL planning",
  "Grief support",
  "LGBTQ+ affirming",
  "Bilingual (Spanish)",
  "Perinatal loss",
];

const VERIFIED_OPTIONS = [
  "Background checked",
  "Certified provider",
  "CodaCo verified",
];

export function ServiceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function toggleBool(key: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === "1") next.delete(key);
    else next.set(key, "1");
    router.push(`${pathname}?${next.toString()}`);
  }

  const activeType = params.get("type") ?? "";
  const activeDist = params.get("distance") ?? "";
  const activeRating = params.get("minRating") ?? "";

  return (
    <div className="pt-6 pr-5 pb-8 border-r border-[rgba(44,40,37,.08)]">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[13px] font-medium text-ch">Filters</span>
        <button
          onClick={() => router.push(pathname)}
          className="text-[12px] text-ink bg-transparent border-0 font-sans cursor-pointer underline hover:text-tr"
        >
          Clear all
        </button>
      </div>

      <FilterSection heading="Service type">
        <Pills>
          {SERVICE_TYPES.map((t) => (
            <FilterPill
              key={t.value}
              label={t.label}
              active={activeType === t.value}
              onClick={() => setParam("type", activeType === t.value ? "" : t.value)}
            />
          ))}
        </Pills>
      </FilterSection>

      <Divider />

      <FilterSection heading="Distance">
        <Pills>
          {DISTANCES.map((d) => (
            <FilterPill
              key={d}
              label={d}
              active={activeDist === d}
              onClick={() => setParam("distance", activeDist === d ? "" : d)}
            />
          ))}
        </Pills>
      </FilterSection>

      <Divider />

      <FilterSection heading="Availability">
        <FilterCheck
          label="Accepting new clients"
          checked={params.get("accepting") === "1"}
          onChange={() => toggleBool("accepting")}
        />
        <FilterCheck label="Available this month" checked={false} onChange={() => {}} />
        <FilterCheck
          label="Virtual sessions"
          checked={params.get("virtual") === "1"}
          onChange={() => toggleBool("virtual")}
        />
        <FilterCheck
          label="Home visits"
          checked={params.get("inHome") === "1"}
          onChange={() => toggleBool("inHome")}
        />
      </FilterSection>

      <Divider />

      <FilterSection heading="Minimum rating">
        <Pills>
          {RATINGS.map((r) => (
            <FilterPill
              key={r.value}
              label={r.label}
              active={activeRating === r.value}
              onClick={() => setParam("minRating", r.value)}
            />
          ))}
        </Pills>
      </FilterSection>

      <Divider />

      <FilterSection heading="Specializations">
        {SPECIALIZATIONS.map((s, i) => (
          <FilterCheck key={s} label={s} checked={i === 0} onChange={() => {}} />
        ))}
      </FilterSection>

      <Divider />

      <FilterSection heading="Verified & vetted">
        {VERIFIED_OPTIONS.map((s, i) => (
          <FilterCheck
            key={s}
            label={s}
            checked={s === "CodaCo verified" ? params.get("verified") === "1" : i === 0}
            onChange={s === "CodaCo verified" ? () => toggleBool("verified") : () => {}}
          />
        ))}
      </FilterSection>
    </div>
  );
}

function FilterSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[1.4rem]">
      <h4 className="text-[11px] tracking-[.1em] uppercase text-ink font-medium mb-[.65rem]">
        {heading}
      </h4>
      {children}
    </div>
  );
}

function Pills({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-[5px]">{children}</div>;
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-[11px] py-[5px] rounded-[14px] text-[12px] font-sans cursor-pointer transition-colors",
        active
          ? "bg-tr text-white border border-tr"
          : "bg-pl text-cm border border-[rgba(44,40,37,.12)] hover:bg-tr hover:text-white hover:border-tr",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer mb-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-tr w-[13px] h-[13px]"
      />
      <span className="text-[12px] text-ink">{label}</span>
    </label>
  );
}

function Divider() {
  return <div className="h-px bg-[rgba(44,40,37,.07)] my-[1.1rem]" />;
}

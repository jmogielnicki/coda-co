"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterPill } from "@/components/ui/filters/FilterPill";
import { FilterPillGroup } from "@/components/ui/filters/FilterPillGroup";
import { FilterCheck } from "@/components/ui/filters/FilterCheck";
import { FilterSection } from "@/components/ui/filters/FilterSection";
import { FilterDivider } from "@/components/ui/filters/FilterDivider";

const SERVICE_TYPES = [
  { value: "doula", label: "Death doula" },
  { value: "attorney", label: "Estate attorney" },
  { value: "cleaner", label: "Death cleaning" },
  { value: "celebrant", label: "Celebrant" },
  { value: "organizer", label: "EOL organizer" },
  { value: "home-funeral", label: "Home funeral" },
  { value: "green-burial", label: "Green burial" },
  { value: "cafe", label: "Death cafe" },
  { value: "life-celebration", label: "Celebration of life planner" },
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
  const { get, setParam, toggleBool, clearAll } = useFilterParams();

  const activeType = get("type");
  const activeDist = get("distance");
  const activeRating = get("minRating");
  const activeLocation = get("locationType");

  return (
    <div className="pt-6 pr-5 pb-8 border-r border-line">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[13px] font-medium text-ch">Filters</span>
        <button
          onClick={clearAll}
          className="text-[12px] text-ink bg-transparent border-0 font-sans cursor-pointer underline hover:text-tr"
        >
          Clear all
        </button>
      </div>

      <FilterSection heading="Service type">
        <FilterPillGroup>
          {SERVICE_TYPES.map((t) => (
            <FilterPill
              key={t.value}
              label={t.label}
              active={activeType === t.value}
              onClick={() => setParam("type", activeType === t.value ? "" : t.value)}
            />
          ))}
        </FilterPillGroup>
      </FilterSection>

      <FilterDivider />

      <FilterSection heading="Distance">
        <FilterPillGroup>
          {DISTANCES.map((d) => (
            <FilterPill
              key={d}
              label={d}
              active={activeDist === d}
              onClick={() => setParam("distance", activeDist === d ? "" : d)}
            />
          ))}
        </FilterPillGroup>
      </FilterSection>

      <FilterDivider />

      <FilterSection heading="Format">
        <FilterCheck
          label="Available this month"
          checked={false}
          onChange={() => {}}
        />
        <FilterCheck
          label="Virtual sessions"
          checked={activeLocation === "virtual"}
          onChange={() =>
            setParam("locationType", activeLocation === "virtual" ? "" : "virtual")
          }
        />
        <FilterCheck
          label="Home visits"
          checked={activeLocation === "in_person"}
          onChange={() =>
            setParam("locationType", activeLocation === "in_person" ? "" : "in_person")
          }
        />
      </FilterSection>

      <FilterDivider />

      <FilterSection heading="Minimum rating">
        <FilterPillGroup>
          {RATINGS.map((r) => (
            <FilterPill
              key={r.value}
              label={r.label}
              active={activeRating === r.value}
              onClick={() => setParam("minRating", r.value)}
            />
          ))}
        </FilterPillGroup>
      </FilterSection>

      <FilterDivider />

      <FilterSection heading="Specializations">
        {SPECIALIZATIONS.map((s, i) => (
          <FilterCheck key={s} label={s} checked={i === 0} onChange={() => {}} />
        ))}
      </FilterSection>

      <FilterDivider />

      <FilterSection heading="Verified & vetted">
        {VERIFIED_OPTIONS.map((s, i) => (
          <FilterCheck
            key={s}
            label={s}
            checked={s === "CodaCo verified" ? get("verified") === "1" : i === 0}
            onChange={s === "CodaCo verified" ? () => toggleBool("verified") : () => {}}
          />
        ))}
      </FilterSection>
    </div>
  );
}

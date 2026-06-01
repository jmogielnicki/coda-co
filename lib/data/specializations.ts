export const SPECIALIZATIONS = [
  "Advance directives",
  "Dementia",
  "Green burials",
  "Home-centered dying",
  "Legacy projects",
  "Perinatal loss",
  "Sliding scale available",
  "Virtual services",
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

const VALID = new Set<string>(SPECIALIZATIONS);

export function isValidSpecialization(value: string): value is Specialization {
  return VALID.has(value);
}

// Parses a comma-separated specializations URL param into a typed array,
// dropping anything not in the canonical list. Returns undefined when
// nothing valid is present so callers can short-circuit (same shape as
// parseLifeStageParam).
export function parseSpecializationsParam(
  raw: string | undefined,
): Specialization[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(isValidSpecialization);
  return parts.length ? parts : undefined;
}

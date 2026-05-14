export const SPECIALIZATIONS = [
  "EOL planning",
  "Grief support",
  "Perinatal loss",
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
  "Somatic therapies",
  "Sliding scale available",
  "Virtual services",
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

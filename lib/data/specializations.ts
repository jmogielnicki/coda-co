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

import type { ServiceLocationType, ServiceType, Vendor } from "@/lib/types";

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  doula: "End of life doula",
  attorney: "Estate attorney",
  cleaner: "Death cleaning",
  celebrant: "Funeral celebrant",
  organizer: "End of life organizer",
  grief: "Grief counselor",
  "home-funeral": "Home funeral guide",
  "green-burial": "Green burial",
  cafe: "Death cafe",
  "life-celebration": "Event planner",
  "somatic-practitioner": "Somatic practitioner (yoga, massage)",
  mediator: "Mediator",
  "spiritual-support": "Spiritual support",
  other: "Other",
};

export function serviceTypeLabel(type: ServiceType | string): string {
  return SERVICE_TYPE_LABELS[type as ServiceType] ?? type;
}

// Aggregate the location capabilities of a vendor's services into a single
// "In-home & virtual" / "In-home" / "Virtual" suffix appended to their city.
export function vendorLocationSuffix(
  vendor: Vendor,
  locationTypes: ServiceLocationType[] = [],
): string {
  const parts: string[] = [vendor.location];
  const inPerson = locationTypes.some((l) => l === "in_person" || l === "both");
  const virtual = locationTypes.some((l) => l === "virtual" || l === "both");
  if (inPerson && virtual) parts.push("In-home & virtual");
  else if (inPerson) parts.push("In-home");
  else if (virtual) parts.push("Virtual");
  return parts.join(" · ");
}

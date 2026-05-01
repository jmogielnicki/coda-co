import type { Vendor } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  doula: "Death doula",
  attorney: "Estate attorney",
  cleaner: "Death cleaning",
  celebrant: "Funeral celebrant",
  organizer: "EOL organizer",
  grief: "Grief counselor",
  "home-funeral": "Home funeral guide",
  "green-burial": "Green burial",
};

export function vendorTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function vendorLocationSuffix(vendor: Vendor): string {
  const parts: string[] = [vendor.location];
  if (vendor.inHome && vendor.virtual) parts.push("In-home & virtual");
  else if (vendor.inHome) parts.push("In-home");
  else if (vendor.virtual) parts.push("Virtual");
  return parts.join(" · ");
}

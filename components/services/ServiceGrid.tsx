import type { Service, VendorWithRating } from "@/lib/types";
import { VendorCard } from "@/components/ui/VendorCard";

interface ServiceGridProps {
  vendors: VendorWithRating[];
  servicesByVendor: Map<string, Service[]>;
}

export function ServiceGrid({ vendors, servicesByVendor }: ServiceGridProps) {
  if (vendors.length === 0) {
    return (
      <div className="text-center py-16 text-ink">
        <p className="text-[15px] mb-2">No providers found.</p>
        <p className="text-[13px] text-ink">Try different filters or broaden your search.</p>
      </div>
    );
  }

  return (
    <div>
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          layout="search"
          services={servicesByVendor.get(vendor.id) ?? []}
        />
      ))}
    </div>
  );
}

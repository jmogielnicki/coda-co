import type { Vendor } from "@/lib/types";
import { ServiceSearchCard } from "@/components/ui/ServiceCard";

export function ServiceGrid({ vendors }: { vendors: Vendor[] }) {
  if (vendors.length === 0) {
    return (
      <div className="text-center py-16 text-cm">
        <p className="text-[15px] mb-2">No providers found.</p>
        <p className="text-[13px] text-cl">Try different filters or broaden your search.</p>
      </div>
    );
  }

  return (
    <div>
      {vendors.map((vendor) => (
        <ServiceSearchCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  );
}

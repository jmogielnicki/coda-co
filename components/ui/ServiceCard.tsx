import type { Vendor } from "@/lib/types";
import { StarRating } from "@/components/ui/StarRating";

const typeLabels: Record<string, string> = {
  doula: "Death doula",
  attorney: "Estate attorney",
  cleaner: "Death cleaning",
  celebrant: "Funeral celebrant",
  organizer: "EOL organizer",
  grief: "Grief counselor",
  "home-funeral": "Home funeral guide",
};

function locationSuffix(vendor: Vendor): string {
  const parts: string[] = [vendor.location];
  if (vendor.inHome && vendor.virtual) parts.push("In-home & virtual");
  else if (vendor.inHome) parts.push("In-home");
  else if (vendor.virtual) parts.push("Virtual");
  return parts.join(" · ");
}

function ratingLine(rating: number, reviewCount: number): string {
  const filled = Math.round(rating);
  const empty = Math.max(0, 5 - filled);
  const stars = "★".repeat(filled) + "☆".repeat(empty);
  return `${stars} · ${reviewCount} reviews`;
}

export function ServiceCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-white border border-[rgba(44,40,37,.09)] rounded-[10px] p-5 cursor-pointer transition-colors duration-200 hover:border-sg-l">
      <div className="w-10 h-10 rounded-full bg-sg-p border-[1.5px] border-sg-l flex items-center justify-center font-serif text-[16px] text-sg-d mb-3">
        {vendor.initials}
      </div>
      <div className="text-[14px] font-medium text-ch mb-[2px]">
        {vendor.name}
      </div>
      <div className="text-[10px] tracking-[.08em] uppercase text-cl mb-[7px]">
        {typeLabels[vendor.type] ?? vendor.type}
      </div>
      <div className="text-[12px] text-cm mb-[5px]">
        {locationSuffix(vendor)}
      </div>
      <div className="text-[12px] text-tr">
        {ratingLine(vendor.rating, vendor.reviewCount)}
      </div>
    </div>
  );
}

export function ServiceSearchCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-white border border-[rgba(44,40,37,.08)] rounded-[10px] p-5 flex gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-sg-p border-[1.5px] border-sg-l flex items-center justify-center font-serif text-[16px] text-sg-d flex-shrink-0">
        {vendor.initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-medium text-ch">{vendor.name}</span>
          <span className="text-[10px] bg-tr-p text-tr-d px-2 py-0.5 rounded-full">
            {typeLabels[vendor.type] ?? vendor.type}
          </span>
        </div>
        <div className="text-[13px] text-cm mb-2 leading-relaxed">{vendor.bio}</div>
        <div className="flex flex-wrap gap-3 text-[12px] text-cm">
          <span>
            📍 <strong>{vendor.location}</strong>
            {vendor.distanceMi != null && ` · ${vendor.distanceMi} mi`}
          </span>
          {vendor.inHome && vendor.virtual && <span>In-home &amp; virtual</span>}
          {vendor.inHome && !vendor.virtual && <span>In-home</span>}
          {!vendor.inHome && vendor.virtual && <span>Virtual only</span>}
          {vendor.accepting && <span className="text-sg-d">Accepting clients</span>}
        </div>
      </div>

      {/* Rating + actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <StarRating rating={vendor.rating} />
        <div className="text-[12px] text-cl">{vendor.reviewCount} reviews</div>
        <button className="text-[12px] bg-tr text-white px-3 py-1.5 rounded-full hover:bg-tr-d transition-colors">
          Contact ↗
        </button>
        <button className="text-[12px] text-cm border border-[rgba(44,40,37,.2)] px-3 py-1.5 rounded-full hover:border-tr hover:text-tr transition-all">
          Save
        </button>
      </div>
    </div>
  );
}

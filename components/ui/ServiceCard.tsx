import type { Vendor } from "@/lib/types";

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
  const stars = (() => {
    const filled = Math.round(vendor.rating);
    return "★".repeat(filled) + "☆".repeat(Math.max(0, 5 - filled));
  })();

  return (
    <div className="bg-white border border-[rgba(44,40,37,.09)] rounded-[10px] py-[1.1rem] px-5 mb-3 cursor-pointer grid grid-cols-[48px_1fr_120px] gap-3 items-start hover:border-sg-l transition-colors">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-sg-p border-[1.5px] border-sg-l flex items-center justify-center font-serif text-[18px] text-sg-d">
        {vendor.initials}
      </div>

      {/* Main info */}
      <div className="min-w-0">
        <div className="text-[14px] font-medium text-ch mb-[2px]">{vendor.name}</div>
        <span className="inline-block text-[10px] tracking-[.07em] uppercase bg-sg-p text-sg-d border border-sg-l px-[9px] py-[2px] rounded-[10px] mb-[6px]">
          {typeLabels[vendor.type] ?? vendor.type}
        </span>
        <div className="text-[12px] text-cm leading-[1.5] mb-[6px]">{vendor.bio}</div>
        <div className="flex flex-wrap gap-3">
          <span className="text-[12px] text-cl">
            📍 <strong className="text-cm">{vendor.location}</strong>
            {vendor.distanceMi != null && ` · ${vendor.distanceMi} mi`}
          </span>
          {vendor.inHome && vendor.virtual && (
            <span className="text-[12px] text-cl">In-home &amp; virtual</span>
          )}
          {vendor.inHome && !vendor.virtual && (
            <span className="text-[12px] text-cl">In-home</span>
          )}
          {!vendor.inHome && vendor.virtual && (
            <span className="text-[12px] text-cl">Virtual only</span>
          )}
          {vendor.accepting && (
            <span className="text-[12px] text-cl">Accepting clients</span>
          )}
        </div>
      </div>

      {/* Rating + actions */}
      <div className="text-right">
        <div className="text-[13px] text-tr whitespace-nowrap">{stars}</div>
        <div className="text-[11px] text-cl mb-[10px]">{vendor.reviewCount} reviews</div>
        <button className="bg-tr text-white border-0 px-4 py-2 rounded-[18px] text-[12px] font-sans cursor-pointer w-full transition-colors hover:bg-tr-d">
          Contact ↗
        </button>
        <button className="bg-transparent text-cl border border-[rgba(44,40,37,.15)] px-3.5 py-[7px] rounded-[18px] text-[12px] font-sans cursor-pointer w-full mt-1.5 transition-colors hover:border-tr hover:text-tr">
          Save
        </button>
      </div>
    </div>
  );
}

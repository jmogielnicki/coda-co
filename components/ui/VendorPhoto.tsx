type VendorPhotoSize = "sm" | "md" | "lg" | "xl";
type VendorPhotoTone = "sage" | "terracotta";

const sizeClass: Record<VendorPhotoSize, string> = {
  sm: "vendor-photo-sm",
  md: "vendor-photo-md",
  lg: "vendor-photo-lg",
  xl: "vendor-photo-xl",
};

interface VendorPhotoProps {
  src?: string;
  alt?: string;
  initials: string;
  size?: VendorPhotoSize;
  tone?: VendorPhotoTone;
  className?: string;
}

export function VendorPhoto({
  src,
  alt,
  initials,
  size = "md",
  tone = "sage",
  className = "",
}: VendorPhotoProps) {
  return (
    <span
      className={`vendor-photo ${sizeClass[size]} ${tone === "terracotta" ? "vendor-photo-tr" : ""} ${className}`.trim()}
    >
      <span className="vendor-photo-disc">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? ""}
            className="vendor-photo-img"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </span>
    </span>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  cover: GalleryImage;
  gallery: GalleryImage[];
  title: string;
}

export function ProductGallery({ cover, gallery, title }: ProductGalleryProps) {
  const all = [cover, ...gallery];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = all[activeIndex] ?? cover;

  return (
    <div>
      <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-pl2 mb-3">
        <Image
          src={active.url}
          alt={active.alt ?? title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          // Cover gets cropped to square (it's stored that way). Gallery
          // photos are free-aspect, so contain them inside the square
          // frame to avoid lossy cropping when the user clicks through.
          className={activeIndex === 0 ? "object-cover" : "object-contain"}
          priority
        />
      </div>

      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {all.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              className={[
                "relative shrink-0 w-16 h-16 rounded-[8px] overflow-hidden border-2 transition-colors cursor-pointer",
                i === activeIndex ? "border-ch" : "border-line hover:border-ch",
              ].join(" ")}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ALLOWED_IMAGE_LABEL,
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES_LABEL,
  validateImageFile,
} from "@/lib/images";
import type { ProductImage } from "@/lib/types";
import {
  addProductGalleryImage,
  deleteProductGalleryImage,
  reorderProductGalleryImages,
} from "@/app/dashboard/products/actions";

const NORMALIZE_MAX_DIM = 2048;
const NORMALIZE_MIME = "image/webp";

interface ImageGalleryUploaderProps {
  productId: string;
  initial: ProductImage[];
  max: number;
}

export function ImageGalleryUploader({
  productId,
  initial,
  max,
}: ImageGalleryUploaderProps) {
  const [images, setImages] = useState<ProductImage[]>(initial);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError(null);

    const available = max - images.length - uploading;
    const incoming = Array.from(fileList);
    const accepted = incoming.slice(0, Math.max(available, 0));
    if (accepted.length < incoming.length) {
      setError(
        `Only ${accepted.length} added — gallery is capped at ${max}.`,
      );
    }
    if (accepted.length === 0) return;

    setUploading((n) => n + accepted.length);
    for (const file of accepted) {
      const problem = validateImageFile(file);
      if (problem) {
        setError(problem.message);
        setUploading((n) => n - 1);
        continue;
      }
      try {
        const normalized = await normalizeImage(file, NORMALIZE_MAX_DIM);
        const fd = new FormData();
        fd.append("photo", normalized);
        const result = await addProductGalleryImage(productId, fd);
        if (result.ok) {
          setImages((prev) => [...prev, result.image]);
        } else {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const before = images;
    const reordered = arrayMove(images, oldIndex, newIndex);
    setImages(reordered);

    startTransition(async () => {
      const result = await reorderProductGalleryImages(
        productId,
        reordered.map((i) => i.id),
      );
      if (!result.ok) {
        setImages(before);
        setError(result.error);
      }
    });
  }

  function handleDelete(imageId: string) {
    const before = images;
    setImages((prev) => prev.filter((i) => i.id !== imageId));
    startTransition(async () => {
      const result = await deleteProductGalleryImage(imageId);
      if (!result.ok) {
        setImages(before);
        setError(result.error);
      }
    });
  }

  const canAdd = images.length + uploading < max;

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((image) => (
                <SortableTile
                  key={image.id}
                  image={image}
                  onDelete={() => handleDelete(image.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {canAdd ? (
          <label className="inline-flex items-center gap-2 text-[13px] text-ch border border-line-bold rounded-full px-3 py-1.5 cursor-pointer hover:bg-pl2">
            + Add photos
            <input
              type="file"
              accept={ALLOWED_IMAGE_MIME.join(",")}
              multiple
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
              className="sr-only"
            />
          </label>
        ) : (
          <span className="text-[12px] text-cl">Gallery full.</span>
        )}
        <span className="text-[11px] text-cl">
          {images.length} / {max} used
          {uploading > 0 ? ` · uploading ${uploading}…` : ""}
        </span>
      </div>

      <p className="text-[11px] text-cl">
        {ALLOWED_IMAGE_LABEL}, under {MAX_IMAGE_BYTES_LABEL}. Drag tiles to
        reorder; the first photo shows after the cover on the product page.
      </p>

      {error && (
        <p className="text-[12px] text-tr-d bg-tr-p border border-tr-l rounded px-2.5 py-1.5 inline-block">
          {error}
        </p>
      )}
    </div>
  );
}

function SortableTile({
  image,
  onDelete,
}: {
  image: ProductImage;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-[10px] overflow-hidden border border-line-bold bg-pl2 group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt ?? ""}
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-white/90 text-cm text-[14px] leading-none flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ⠿
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Remove photo"
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-cm text-[16px] leading-none flex items-center justify-center hover:text-tr opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
}

async function normalizeImage(file: File, maxDim: number): Promise<File> {
  const src = URL.createObjectURL(file);
  try {
    const img = await loadImage(src);
    const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
    const w = Math.max(1, Math.round(img.width * ratio));
    const h = Math.max(1, Math.round(img.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable in this browser.");
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, NORMALIZE_MIME, 0.85),
    );
    if (!blob) throw new Error("Failed to encode image.");
    return new File([blob], "gallery.webp", { type: NORMALIZE_MIME });
  } finally {
    URL.revokeObjectURL(src);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

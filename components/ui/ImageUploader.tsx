"use client";

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  ALLOWED_IMAGE_LABEL,
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES_LABEL,
  validateImageFile,
} from "@/lib/images";

type Shape = "circle" | "square";

const CROPPED_OUTPUT_MAX = 1024;
const CROPPED_OUTPUT_MIME = "image/webp";

export interface ImageUploaderHandle {
  getCroppedBlob: () => Promise<Blob | null>;
}

interface ImageUploaderProps {
  ref?: React.Ref<ImageUploaderHandle>;
  name: string;
  currentSrc?: string | null;
  shape?: Shape;
  label?: string;
  hint?: string;
}

export function ImageUploader({
  ref,
  name,
  currentSrc,
  shape = "circle",
  label = "Photo",
  hint,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (!file) {
      setSourceUrl(null);
      return;
    }
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem.message);
      e.target.value = "";
      setSourceUrl(null);
      return;
    }
    setSourceUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  }

  function clearSelection() {
    if (inputRef.current) inputRef.current.value = "";
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setCroppedArea(null);
    setError(null);
  }

  useImperativeHandle(
    ref,
    () => ({
      async getCroppedBlob() {
        if (!sourceUrl || !croppedArea) return null;
        return cropImageToBlob(sourceUrl, croppedArea);
      },
    }),
    [sourceUrl, croppedArea],
  );

  const previewRadius = shape === "circle" ? "rounded-full" : "rounded-[10px]";

  return (
    <div className="space-y-4">
      <label
        htmlFor={inputId}
        className="block text-[12px] font-medium text-ch"
      >
        {label}
      </label>

      {sourceUrl ? (
        <div className="space-y-3">
          <div className="relative w-full max-w-sm mx-auto aspect-square bg-ch overflow-hidden rounded-[10px]">
            <Cropper
              image={sourceUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape={shape === "circle" ? "round" : "rect"}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex items-center gap-3 max-w-sm mx-auto">
            <span className="text-[11px] text-cl w-10 shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-tr"
              aria-label="Zoom"
            />
          </div>
          <p className="text-[11px] text-cl text-center">
            Drag to reposition, scroll or use the slider to zoom.
          </p>
        </div>
      ) : currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt=""
          className={`block w-32 h-32 mx-auto object-cover border border-line-bold ${previewRadius}`}
        />
      ) : (
        <div
          className={`w-32 h-32 mx-auto ${previewRadius} border border-line-bold bg-pl2 flex items-center justify-center`}
        >
          <span className="text-[11px] text-cl px-3 text-center">
            No photo yet
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="file"
          accept={ALLOWED_IMAGE_MIME.join(",")}
          onChange={onPick}
          className="block text-[13px] text-cm file:mr-3 file:py-1.5 file:px-3 file:border file:border-line-bold file:rounded-full file:bg-white file:text-[13px] file:text-ch file:cursor-pointer hover:file:bg-pl2"
        />
        <p className="text-[11px] text-cl">
          {hint ?? `${ALLOWED_IMAGE_LABEL}, under ${MAX_IMAGE_BYTES_LABEL}.`}
        </p>
        {sourceUrl && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-[12px] text-tr no-underline hover:underline"
          >
            Cancel selection
          </button>
        )}
        {error && (
          <p className="text-[12px] text-tr-d bg-tr-p border border-tr-l rounded px-2.5 py-1.5 inline-block">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

async function cropImageToBlob(
  sourceUrl: string,
  area: Area,
): Promise<Blob | null> {
  const image = await loadImage(sourceUrl);
  const outSize = Math.min(CROPPED_OUTPUT_MAX, Math.round(area.width));
  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outSize,
    outSize,
  );
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), CROPPED_OUTPUT_MIME, 0.9);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = src;
  });
}

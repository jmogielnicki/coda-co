"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ALLOWED_IMAGE_MIME,
  ALLOWED_IMAGE_LABEL,
  MAX_IMAGE_BYTES_LABEL,
  validateImageFile,
} from "@/lib/images";

type Shape = "circle" | "square";

interface ImageUploaderProps {
  name: string;
  currentSrc?: string | null;
  shape?: Shape;
  label?: string;
  hint?: string;
}

export function ImageUploader({
  name,
  currentSrc,
  shape = "circle",
  label = "Photo",
  hint,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem.message);
      e.target.value = "";
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  function onClear() {
    if (inputRef.current) inputRef.current.value = "";
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
  }

  const shown = previewUrl ?? currentSrc ?? null;
  const radiusCls = shape === "circle" ? "rounded-full" : "rounded-[10px]";

  return (
    <div className="flex items-start gap-5">
      <div
        className={`shrink-0 w-32 h-32 ${radiusCls} border border-line-bold bg-pl2 overflow-hidden flex items-center justify-center`}
      >
        {shown ? (
          // Local blob: URLs and arbitrary remote URLs (legacy /public,
          // mock images) — keep raw <img> for the preview. next/image is
          // used in the consumer components that render the saved URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[11px] text-cl px-3 text-center">
            No photo yet
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <label
          htmlFor={inputId}
          className="block text-[12px] font-medium text-ch mb-1.5"
        >
          {label}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="file"
          accept={ALLOWED_IMAGE_MIME.join(",")}
          onChange={onChange}
          className="block text-[13px] text-cm file:mr-3 file:py-1.5 file:px-3 file:border file:border-line-bold file:rounded-full file:bg-white file:text-[13px] file:text-ch file:cursor-pointer hover:file:bg-pl2"
        />
        <p className="text-[11px] text-cl mt-1.5">
          {hint ?? `${ALLOWED_IMAGE_LABEL}, under ${MAX_IMAGE_BYTES_LABEL}. Square images work best.`}
        </p>
        {previewUrl && (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] text-tr no-underline hover:underline mt-2"
          >
            Clear selection
          </button>
        )}
        {error && (
          <p className="text-[12px] text-tr-d bg-tr-p border border-tr-l rounded px-2.5 py-1.5 mt-2 inline-block">
            {error}
          </p>
        )}
      </div>

    </div>
  );
}

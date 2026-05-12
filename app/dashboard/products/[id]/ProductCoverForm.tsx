"use client";

import { useRef, useState, useTransition } from "react";
import {
  ImageUploader,
  type ImageUploaderHandle,
} from "@/components/ui/ImageUploader";
import { updateProductCover } from "../actions";

type SaveStatus =
  | { kind: "idle" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

interface ProductCoverFormProps {
  productId: string;
  currentCoverUrl: string | null;
  onSaved: (url: string) => void;
}

export function ProductCoverForm({
  productId,
  currentCoverUrl,
  onSaved,
}: ProductCoverFormProps) {
  const uploaderRef = useRef<ImageUploaderHandle>(null);
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setStatus({ kind: "idle" });
    startTransition(async () => {
      const blob = await uploaderRef.current?.getCroppedBlob();
      if (!blob) {
        setStatus({ kind: "error", message: "Pick a photo first." });
        return;
      }
      const fd = new FormData();
      fd.append(
        "photo",
        new File([blob], "cover.webp", { type: blob.type }),
      );
      const result = await updateProductCover(productId, fd);
      if (result.ok) {
        setStatus({ kind: "ok" });
        onSaved(result.url);
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    });
  }

  return (
    // Remount on save so the uploader resets to showing the new cover
    // instead of leaving the user staring at their stale cropper state.
    <div key={currentCoverUrl ?? "empty"} className="space-y-4">
      <ImageUploader
        ref={uploaderRef}
        name="cover"
        currentSrc={currentCoverUrl}
        shape="square"
        label="Cover photo"
        hint="JPEG, PNG, or WebP, under 5 MB. Drag to position; the crop becomes the /shop tile."
      />

      {status.kind === "error" && (
        <p className="text-[13px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">
          {status.message}
        </p>
      )}
      {status.kind === "ok" && (
        <p className="text-[13px] text-sg-d bg-sg-p border border-sg-l rounded px-3 py-2">
          Cover updated.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="btn-primary btn-md disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save cover"}
      </button>
    </div>
  );
}

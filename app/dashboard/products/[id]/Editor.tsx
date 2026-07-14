"use client";

import { useState, useTransition } from "react";
import { ImageGalleryUploader } from "@/components/ui/ImageGalleryUploader";
import type { ProductImage } from "@/lib/types";
import {
  setProductStatus,
  updateProduct,
  updateVariantPrice,
  updateVariantStock,
} from "../actions";
import { MAX_GALLERY_IMAGES } from "../constants";
import { ProductCoverForm } from "./ProductCoverForm";

interface Variant {
  id: string;
  label: string;
  priceCents: number;
  stock: number;
}

interface ProductView {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: "draft" | "pending_review" | "published" | "archived" | "unknown";
  details: Record<string, unknown>;
  variants: Variant[];
  coverImageUrl: string | null;
  images: ProductImage[];
}

interface DetailRow {
  key: string;
  value: string;
}

const inputCls =
  "w-full border border-line-bold rounded-[8px] px-3 py-2.5 text-[14px] text-ch bg-white outline-none focus:border-tr transition-colors";

function scalarDetailRows(details: Record<string, unknown>): DetailRow[] {
  return Object.entries(details)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, value]) => ({ key, value }));
}

export function ProductEditor({
  product,
  // True once this vendor's first listing has been approved — they can
  // then publish straight to /shop. Until then, "publish" submits the
  // listing to CodaCo for review.
  canSelfPublish,
}: {
  product: ProductView;
  canSelfPublish: boolean;
}) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [detailRows, setDetailRows] = useState<DetailRow[]>(() =>
    scalarDetailRows(product.details),
  );
  const [variants, setVariants] = useState(product.variants);
  const [coverUrl, setCoverUrl] = useState<string | null>(product.coverImageUrl);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveProduct() {
    // Drop empty-keyed rows and de-dupe by key (last write wins) so the
    // server never sees junk entries from in-progress edits.
    const details: Record<string, string> = {};
    for (const row of detailRows) {
      const key = row.key.trim();
      if (!key) continue;
      details[key] = row.value;
    }
    startTransition(async () => {
      await updateProduct(product.id, {
        title: title.trim(),
        description: description.trim(),
        details,
      });
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  function setStock(variantId: string, raw: string) {
    const stock = Math.max(0, Math.floor(Number(raw) || 0));
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, stock } : v)),
    );
  }

  function commitStock(variantId: string, stock: number) {
    startTransition(async () => {
      await updateVariantStock(variantId, stock);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  function setPrice(variantId: string, raw: string) {
    const cents = Math.max(0, Math.round((Number(raw) || 0) * 100));
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, priceCents: cents } : v)),
    );
  }

  function commitPrice(variantId: string, priceCents: number) {
    startTransition(async () => {
      await updateVariantPrice(variantId, priceCents / 100);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  // A "publish" request: for trusted vendors it goes live; for everyone
  // else the server parks it in pending_review. Either way the page
  // revalidates and re-renders with the new status, so we just surface
  // any error here.
  function requestGoLive() {
    setStatusError(null);
    startTransition(async () => {
      const result = await setProductStatus(product.id, "published");
      if (result.ok) {
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        setStatusError(result.error);
      }
    });
  }

  function returnToDraft() {
    setStatusError(null);
    startTransition(async () => {
      const result = await setProductStatus(product.id, "draft");
      if (result.ok) {
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        setStatusError(result.error);
      }
    });
  }

  function addDetailRow() {
    setDetailRows((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateDetailKey(i: number, key: string) {
    setDetailRows((prev) => prev.map((row, j) => (j === i ? { ...row, key } : row)));
  }

  function updateDetailValue(i: number, value: string) {
    setDetailRows((prev) => prev.map((row, j) => (j === i ? { ...row, value } : row)));
  }

  function removeDetailRow(i: number) {
    setDetailRows((prev) => prev.filter((_, j) => j !== i));
  }

  const isPublished = product.status === "published";
  const isPending = product.status === "pending_review";
  const hasCover = coverUrl !== null;
  // The go-live action (publish or submit-for-review) needs a cover photo.
  const goLiveLabel = canSelfPublish ? "Publish" : "Submit for review";

  const statusMeta = isPublished
    ? { label: "Published", cls: "bg-sg-p text-sg-d" }
    : isPending
      ? { label: "In review", cls: "bg-tr-p text-tr-d" }
      : { label: "Draft", cls: "bg-pl2 text-cm" };

  const statusBlurb = isPublished
    ? "Live on /shop. Buyers can see this product."
    : isPending
      ? "Submitted to CodaCo for review. We'll email you when it's approved — usually a day or two. Withdraw it if you need to make changes."
      : !hasCover
        ? `Add a cover photo below before you can ${canSelfPublish ? "publish" : "submit for review"}.`
        : canSelfPublish
          ? "Draft only. Hidden from /shop until you publish."
          : "Draft only. Submit it for review — CodaCo approves your first listing before it goes live. After that, your listings publish instantly.";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] border border-line p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[.08em] uppercase text-cl mb-0.5">Status</p>
            <span
              className={[
                "inline-block text-[11px] font-medium px-2 py-0.5 rounded-full",
                statusMeta.cls,
              ].join(" ")}
            >
              {statusMeta.label}
            </span>
            <p className="text-[12px] text-cl mt-1.5">{statusBlurb}</p>
          </div>
          {isPublished ? (
            <button
              type="button"
              disabled={pending}
              onClick={returnToDraft}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-pl2 text-cm hover:bg-pl"
            >
              Unpublish
            </button>
          ) : isPending ? (
            <button
              type="button"
              disabled={pending}
              onClick={returnToDraft}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-pl2 text-cm hover:bg-pl"
            >
              Withdraw
            </button>
          ) : (
            <button
              type="button"
              disabled={pending || !hasCover}
              onClick={requestGoLive}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-tr text-white hover:bg-tr-d"
              title={!hasCover ? "Add a cover photo first" : undefined}
            >
              {goLiveLabel}
            </button>
          )}
        </div>
        {statusError && (
          <p className="text-[12px] text-tr-d bg-tr-p border border-tr-l rounded px-2.5 py-1.5 mb-3">
            {statusError}
          </p>
        )}

        <Field label="Title">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputCls} min-h-[120px] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-[12px] font-medium text-ch">Details</span>
            <button
              type="button"
              onClick={addDetailRow}
              className="text-[12px] text-tr no-underline hover:underline"
            >
              + Add detail
            </button>
          </div>
          <p className="text-[11px] text-cl mb-2">
            Free-form key / value pairs shown on the product page (e.g. material, dimensions, finish).
          </p>
          {detailRows.length === 0 ? (
            <p className="text-[12px] text-cl italic">No details yet.</p>
          ) : (
            <div className="space-y-2">
              {detailRows.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <input
                    className={inputCls}
                    placeholder="Key (e.g. material)"
                    value={row.key}
                    onChange={(e) => updateDetailKey(i, e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => updateDetailValue(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeDetailRow(i)}
                    aria-label="Remove detail"
                    className="px-3 text-[16px] text-cl hover:text-tr cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            disabled={pending}
            onClick={saveProduct}
            className="btn-primary btn-md disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          {savedAt && (
            <span className="text-[12px] text-cl">Saved at {savedAt}</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-line p-6">
        <h2 className="text-[15px] font-medium text-ch mb-1">Cover photo</h2>
        <p className="text-[12px] text-cl mb-4">
          Square. Shown on /shop tiles and at the start of the carousel on
          the product page. Required to publish.
        </p>
        <ProductCoverForm
          productId={product.id}
          currentCoverUrl={coverUrl}
          onSaved={setCoverUrl}
        />
      </div>

      <div className="bg-white rounded-[10px] border border-line p-6">
        <h2 className="text-[15px] font-medium text-ch mb-1">Gallery photos</h2>
        <p className="text-[12px] text-cl mb-4">
          Up to {MAX_GALLERY_IMAGES} additional photos. Any aspect ratio.
          Shown after the cover on the product detail page.
        </p>
        <ImageGalleryUploader
          productId={product.id}
          initial={product.images}
          max={MAX_GALLERY_IMAGES}
        />
      </div>

      <div className="bg-white rounded-[10px] border border-line p-6">
        <h2 className="text-[15px] font-medium text-ch mb-1">Variants &amp; stock</h2>
        <p className="text-[12px] text-cl mb-4">
          Price and stock changes save the moment you commit them.
        </p>
        <table className="w-full text-sm">
          <thead className="border-b border-line">
            <tr>
              <Th>Variant</Th>
              <Th className="w-36">Price (USD)</Th>
              <Th className="w-32">Stock</Th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-line last:border-b-0">
                <td className="px-3 py-3 text-[13px] text-ch">{v.label}</td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(v.priceCents / 100).toFixed(2)}
                    onChange={(e) => setPrice(v.id, e.target.value)}
                    onBlur={() => commitPrice(v.id, v.priceCents)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitPrice(v.id, v.priceCents);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-28 border border-line-bold rounded-[6px] px-2 py-1.5 text-[13px] text-ch bg-white outline-none focus:border-tr"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={v.stock}
                    onChange={(e) => setStock(v.id, e.target.value)}
                    onBlur={() => commitStock(v.id, v.stock)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commitStock(v.id, v.stock);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-24 border border-line-bold rounded-[6px] px-2 py-1.5 text-[13px] text-ch bg-white outline-none focus:border-tr"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-[12px] font-medium text-ch mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-cl ${className}`}>
      {children}
    </th>
  );
}

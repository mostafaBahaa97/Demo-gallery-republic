"use client";

import { useRef, useState } from "react";
import { PenLine, Upload, X } from "lucide-react";
import { CONFIG } from "@/lib/config";
import type { EngravingInfo } from "@/lib/types";

const fmt = (n: number) => n.toLocaleString("ar-EG") + " ج.م";
const MAX_TEXT_LEN = 24;
const MAX_LOGO_DIMENSION = 800; // بكسل — كافي لنقش بالليزر ومحافظ على حجم الملف خفيف

export function emptyEngraving(qty: number): EngravingInfo {
  return {
    type: "text",
    mode: "single",
    singleText: "",
    perPieceTexts: Array(Math.max(1, qty)).fill(""),
    logoBase64: "",
    logoMimeType: "",
    logoFileName: "",
    logoPreviewUrl: "",
  };
}

/** بتصغّر أي صورة مرفوعة لأبعاد معقولة قبل ما تتحول لـ base64 وتتبعت للسيرفر
 * — عشان الطلب يفضل خفيف. بتحافظ على شفافية PNG لو الأصل PNG (مهم
 * للوجوهات)، وإلا بتحوّلها JPEG بجودة كويسة. */
async function resizeImageToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_LOGO_DIMENSION || height > MAX_LOGO_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_LOGO_DIMENSION) / width);
            width = MAX_LOGO_DIMENSION;
          } else {
            width = Math.round((width * MAX_LOGO_DIMENSION) / height);
            height = MAX_LOGO_DIMENSION;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("تعذّر معالجة الصورة."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outputMime, outputMime === "image/jpeg" ? 0.85 : undefined);
        resolve({ base64: dataUrl.split(",")[1] || "", mimeType: outputMime });
      };
      img.onerror = () => reject(new Error("تعذّر قراءة الصورة، جربي ملف تاني."));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("تعذّر قراءة الملف."));
    reader.readAsDataURL(file);
  });
}

function pillClass(active: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
    active ? "border-gold bg-gold text-ink" : "border-[var(--line)] text-umber/70 hover:border-gold"
  }`;
}

/**
 * محرر النقش الخاص بسطر منتج واحد في السلة (تصميم + خامة معيّنة). بيظهر
 * جوه كارت المنتج نفسه بمجرد ما تختار العميلة كمية. لو الكمية أكتر من
 * قطعة، بتقدر تختار نفس النص/اللوجو لكل القطع، أو اسم مختلف لكل قطعة.
 */
export function EngravingLineEditor({
  qty,
  value,
  onChange,
}: {
  qty: number;
  value: EngravingInfo | undefined;
  onChange: (next: EngravingInfo | undefined) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [logoError, setLogoError] = useState("");

  if (qty <= 0) return null;

  const enabled = !!value;
  const fee = enabled ? CONFIG.ENGRAVING_FEE_PER_PIECE * qty : 0;

  const patch = (p: Partial<EngravingInfo>) => {
    if (!value) return;
    onChange({ ...value, ...p });
  };

  const setPerPieceText = (index: number, text: string) => {
    if (!value) return;
    const next = [...value.perPieceTexts];
    next[index] = text;
    patch({ perPieceTexts: next });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("من فضلك اختاري ملف صورة (jpg, png, إلخ).");
      return;
    }
    setLogoError("");
    setProcessing(true);
    try {
      const { base64, mimeType } = await resizeImageToBase64(file);
      patch({
        logoBase64: base64,
        logoMimeType: mimeType,
        logoFileName: file.name,
        logoPreviewUrl: `data:${mimeType};base64,${base64}`,
      });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "تعذّر معالجة الصورة.");
    } finally {
      setProcessing(false);
    }
  };

  const removeLogo = () => {
    patch({ logoBase64: "", logoMimeType: "", logoFileName: "", logoPreviewUrl: "" });
  };

  return (
    <div className="mt-4 rounded-xl border border-gold/30 bg-gold/[0.06] p-3.5">
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked ? emptyEngraving(qty) : undefined)}
          className="mt-0.5 h-4 w-4 accent-gold"
        />
        <span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <PenLine size={14} className="text-golddeep" />
            أضيفي نقش بالليزر على القطعة دي
          </span>
          <span className="mt-0.5 block text-xs text-umber/60">
            {fmt(CONFIG.ENGRAVING_FEE_PER_PIECE)} × {qty} قطعة = {fmt(fee || CONFIG.ENGRAVING_FEE_PER_PIECE * qty)}
          </span>
        </span>
      </label>

      {enabled && value && (
        <div className="mt-3.5 space-y-3.5 border-t border-gold/20 pt-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-umber">نوع النقش</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => patch({ type: "text" })} className={pillClass(value.type === "text")}>
                نص
              </button>
              <button type="button" onClick={() => patch({ type: "logo" })} className={pillClass(value.type === "logo")}>
                لوجو
              </button>
            </div>
          </div>

          {value.type === "text" && qty > 1 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-umber">طريقة النقش</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => patch({ mode: "single" })} className={pillClass(value.mode === "single")}>
                  نفس الاسم على كل القطع
                </button>
                <button type="button" onClick={() => patch({ mode: "perPiece" })} className={pillClass(value.mode === "perPiece")}>
                  اسم مختلف لكل قطعة
                </button>
              </div>
            </div>
          )}

          {value.type === "text" && (qty === 1 || value.mode === "single") && (
            <div>
              <input
                type="text"
                maxLength={MAX_TEXT_LEN}
                placeholder="مثال: Sara"
                value={value.singleText}
                onChange={(e) => patch({ singleText: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm"
              />
              {qty > 1 && (
                <p className="mt-1 text-[11px] text-umber/50">هيتنقش نفس الاسم على كل الـ{qty} قطعة سوا.</p>
              )}
            </div>
          )}

          {value.type === "text" && qty > 1 && value.mode === "perPiece" && (
            <div className="space-y-2">
              {Array.from({ length: qty }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-umber/50">القطعة {i + 1}</span>
                  <input
                    type="text"
                    maxLength={MAX_TEXT_LEN}
                    placeholder={`اسم القطعة ${i + 1}`}
                    value={value.perPieceTexts[i] || ""}
                    onChange={(e) => setPerPieceText(i, e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3.5 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {value.type === "logo" && (
            <div>
              {value.logoPreviewUrl ? (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-white p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value.logoPreviewUrl}
                    alt="معاينة اللوجو"
                    className="h-14 w-14 rounded-md border border-[var(--line)] object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-umber/70">{value.logoFileName}</p>
                    <p className="text-[11px] text-umber/45">تم رفع اللوجو بنجاح</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-umber/60 hover:border-rose-300 hover:text-rose-700"
                    aria-label="إزالة اللوجو"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold/50 bg-white py-3 text-xs text-umber/70 hover:border-gold disabled:opacity-60"
                  >
                    <Upload size={14} />
                    {processing ? "جاري تجهيز الصورة…" : "ارفعي صورة اللوجو"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    // sr-only هي الطريقة القياسية المُجرَّبة لإخفاء إنبوت الملف
                    // بصريًا من غير ما تبوّظ فتح نافذة اختيار الصور على الموبايل
                    className="sr-only"
                    tabIndex={-1}
                  />
                </div>
              )}
              {logoError && <p className="mt-1.5 text-xs text-rose-700">{logoError}</p>}
              {qty > 1 && (
                <p className="mt-1.5 text-[11px] text-umber/50">نفس اللوجو هيتنقش على كل الـ{qty} قطعة سوا.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { PenLine, Upload, X } from "lucide-react";
import { CONFIG } from "@/lib/config";
import type { EngravingType } from "@/lib/types";

const fmt = (n: number) => n.toLocaleString("ar-EG") + " ج.م";
const MAX_ENGRAVING_TEXT_LEN = 24;
const MAX_LOGO_DIMENSION = 800; // بكسل — كافي جدًا لنقش بالليزر ومحافظ على حجم الملف خفيف

export interface EngravingState {
  enabled: boolean;
  pieces: number;
  type: EngravingType | "";
  text: string;
  logoBase64: string;
  logoMimeType: string;
  logoFileName: string;
  logoPreviewUrl: string;
}

export const initialEngravingState: EngravingState = {
  enabled: false,
  pieces: 1,
  type: "",
  text: "",
  logoBase64: "",
  logoMimeType: "",
  logoFileName: "",
  logoPreviewUrl: "",
};

/** بتصغّر أي صورة مرفوعة لأبعاد معقولة قبل ما تتحول لـ base64 وتتبعت للسيرفر
 * — عشان الطلب يفضل خفيف ومنعتموش أي مشكلة حجم. بتحافظ على شفافية PNG لو
 * الأصل PNG (مهم للوجوهات)، وإلا بتحوّلها JPEG بجودة كويسة. */
async function resizeImageToBase64(
  file: File
): Promise<{ base64: string; mimeType: string }> {
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

export function EngravingSection({
  value,
  onChange,
  maxPieces,
}: {
  value: EngravingState;
  onChange: (next: EngravingState) => void;
  maxPieces: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [logoError, setLogoError] = useState("");

  const fee = value.enabled ? CONFIG.ENGRAVING_FEE_PER_PIECE * value.pieces : 0;

  const patch = (p: Partial<EngravingState>) => onChange({ ...value, ...p });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // يسمح باختيار نفس الملف تاني لو عايزة تستبدليه
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
    <div className="rounded-xl border border-gold/30 bg-gold/[0.06] p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => {
            const checked = e.target.checked;
            patch({
              enabled: checked,
              type: checked ? value.type || "text" : value.type,
              // افتراضيًا بنبدأ بكل قطع الطلب، وهي تقدر تقلّل العدد لو عايزة
              // تنقش على جزء من القطع بس (شوفي الملاحظة في الأسفل).
              pieces: checked ? maxPieces : value.pieces,
            });
          }}
          className="mt-0.5 h-4 w-4 accent-gold"
        />
        <span>
          <span className="flex items-center gap-1.5 font-medium text-ink">
            <PenLine size={15} className="text-golddeep" />
            أضيفي نقش بالليزر (اسم أو لوجو) على قطعة
          </span>
          <span className="mt-0.5 block text-xs text-umber/60">
            {fmt(CONFIG.ENGRAVING_FEE_PER_PIECE)} لكل قطعة يُنقش عليها — اختياري
          </span>
        </span>
      </label>

      {value.enabled && (
        <div className="mt-4 space-y-4 border-t border-gold/20 pt-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-umber">
              كام قطعة عايزة تنقشيها؟
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => patch({ pieces: Math.max(1, value.pieces - 1) })}
                className="h-8 w-8 rounded-full border border-[var(--line)] text-umber hover:border-gold"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-ink">{value.pieces}</span>
              <button
                type="button"
                onClick={() => patch({ pieces: Math.min(maxPieces, value.pieces + 1) })}
                className="h-8 w-8 rounded-full border border-[var(--line)] text-umber hover:border-gold"
              >
                +
              </button>
              <span className="text-xs text-umber/50">من أصل {maxPieces} قطعة في طلبك</span>
            </div>
            <p className="mt-1.5 text-[11px] text-umber/50">
              بشكل افتراضي هيتم النقش على كل قطع طلبك — قلّلي العدد لو عايزة تنقشي على جزء منها بس.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-umber">نوع النقش</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => patch({ type: "text" })}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  value.type === "text"
                    ? "border-gold bg-gold text-ink"
                    : "border-[var(--line)] text-umber/70 hover:border-gold"
                }`}
              >
                نص (اسم/كلمة)
              </button>
              <button
                type="button"
                onClick={() => patch({ type: "logo" })}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  value.type === "logo"
                    ? "border-gold bg-gold text-ink"
                    : "border-[var(--line)] text-umber/70 hover:border-gold"
                }`}
              >
                لوجو (صورة)
              </button>
            </div>
          </div>

          {value.type === "text" && (
            <div>
              <input
                type="text"
                maxLength={MAX_ENGRAVING_TEXT_LEN}
                placeholder="اكتبي بالظبط الحروف اللي عايزة تتنقش، مثال: Sara"
                value={value.text}
                onChange={(e) => patch({ text: e.target.value })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
              />
              <p className="mt-1 text-[11px] text-umber/50">
                {value.text.length}/{MAX_ENGRAVING_TEXT_LEN} حرف — النقش هيكون بنفس الحروف
                والحالة (كبيرة/صغيرة) اللي هتكتبيها بالظبط.
              </p>
            </div>
          )}

          {value.type === "logo" && (
            <div>
              {value.logoPreviewUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value.logoPreviewUrl}
                    alt="معاينة اللوجو"
                    className="h-16 w-16 rounded-lg border border-[var(--line)] object-contain"
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gold/50 bg-white py-4 text-sm text-umber/70 hover:border-gold disabled:opacity-60"
                >
                  <Upload size={16} />
                  {processing ? "جاري تجهيز الصورة…" : "ارفعي صورة اللوجو"}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                // ملحوظة: مينفعش نستخدم display:none (زي كلاس hidden) هنا —
                // سفاري على آيفون بيرفض يفتح نافذة اختيار الصورة لو الإنبوت
                // كان display:none وقت ما بنستدعي click() عليه من زرار تاني،
                // حتى لو الضغطة أصلها فعليًا من المستخدم. فبنخفيه بصريًا بس
                // من غير ما نشيله من العرض خالص.
                className="absolute h-px w-px overflow-hidden opacity-0"
                tabIndex={-1}
                aria-hidden="true"
              />
              {logoError && <p className="mt-1.5 text-xs text-rose-700">{logoError}</p>}
            </div>
          )}

          {fee > 0 && (
            <div className="flex justify-between rounded-lg bg-white px-3.5 py-2.5 text-sm">
              <span className="text-umber/70">
                تكلفة النقش ({CONFIG.ENGRAVING_FEE_PER_PIECE} × {value.pieces})
              </span>
              <span className="font-semibold text-golddeep">{fmt(fee)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

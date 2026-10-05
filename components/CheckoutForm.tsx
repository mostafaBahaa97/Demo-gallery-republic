"use client";

import { useState } from "react";
import { MapPin, Lock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { GOVERNORATES, AREAS, getShippingFee } from "@/lib/governorates";
import { isValidEgyptianPhone, isValidFullName, normalizeDigits } from "@/lib/validation";
import { canPlaceOrder, recordOrderPlaced } from "@/hooks/useRateLimit";
import { callApi } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import type { CartItem } from "@/lib/types";
import { AreaCombobox } from "./AreaCombobox";

interface FormState {
  name: string;
  phone: string;
  area: string;
  address: string;
  website: string; // honeypot
}

const initialForm: FormState = {
  name: "",
  phone: "",
  area: "",
  address: "",
  website: "",
};

/** بتتأكد إن كل قطعة اخترتِ لها نقش، بيانات النقش بتاعتها مكتملة فعلاً
 * (نص مكتوب أو لوجو مرفوع). بترجع رسالة الخطأ الأولى اللي تلاقيها، أو
 * null لو كل حاجة تمام. */
function findIncompleteEngraving(items: CartItem[]): string | null {
  for (const item of items) {
    const eng = item.engraving;
    if (!eng) continue;
    if (eng.type === "logo") {
      if (!eng.logoBase64) return `من فضلك ارفعي صورة اللوجو لـ"${item.name}" أو ألغي اختيار النقش عليها.`;
    } else {
      const usesSingle = eng.mode === "single" || item.qty === 1;
      if (usesSingle) {
        if (!eng.singleText.trim()) {
          return `من فضلك اكتبي نص النقش لـ"${item.name}" أو ألغي اختيار النقش عليها.`;
        }
      } else if (eng.perPieceTexts.some((t) => !t.trim())) {
        return `من فضلك اكتبي اسم لكل قطعة من "${item.name}" أو ألغي اختيار النقش عليها.`;
      }
    }
  }
  return null;
}

export function CheckoutForm({
  governorate,
  onGovernorateChange,
  onSuccess,
}: {
  governorate: string;
  onGovernorateChange: (gov: string) => void;
  onSuccess: (orderId: string, firstName: string) => void;
}) {
  const { items, total, engravingFeeTotal, bundleLabel, clearCart } = useCart();
  const toast = useToast();

  const [form, setForm] = useState<FormState>(initialForm);
  const [gpsLink, setGpsLink] = useState("");
  const [gpsLabel, setGpsLabel] = useState("تحديد موقعي عبر GPS");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [engravingError, setEngravingError] = useState("");
  const [formMsg, setFormMsg] = useState<{ text: string; isHtml?: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasAreas = !!AREAS[governorate];

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleGovChange = (gov: string) => {
    onGovernorateChange(gov);
    update({ area: "" });
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast("المتصفح لا يدعم تحديد الموقع.", "error");
      return;
    }
    setGpsLabel("جاري تحديد الموقع…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const link = `https://www.google.com/maps?q=${lat},${lng}`;
        setGpsLink(link);
        update({ address: form.address + (form.address ? "\n" : "") + `📍 الموقع الجغرافي: ${link}` });
        setGpsLabel("✅ تم تحديد الموقع بنجاح");
      },
      () => {
        toast("تعذّر تحديد الموقع. من فضلك فعّلي إذن الموقع من المتصفح.", "error");
        setGpsLabel("تحديد موقعي عبر GPS");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const nextErrors: Record<string, boolean> = {
      name: !isValidFullName(form.name),
      phone: !isValidEgyptianPhone(form.phone),
      address: !form.address.trim(),
    };
    setErrors(nextErrors);
    const engIssue = findIncompleteEngraving(items);
    setEngravingError(engIssue || "");
    return (
      !nextErrors.name &&
      !nextErrors.phone &&
      !nextErrors.address &&
      !engIssue &&
      !!governorate
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    if (items.length === 0) {
      toast("من فضلك اختاري قطعة واحدة على الأقل.", "error");
      return;
    }
    if (!validate()) {
      toast("من فضلك راجعي بيانات النموذج.", "error");
      return;
    }
    if (!canPlaceOrder()) {
      const wa = `https://wa.me/${CONFIG.WHATSAPP_PHONE}`;
      setFormMsg({
        text: `لقد وصلتِ للحد الأقصى من الطلبات المسموح خلال آخر ساعتين. <a href="${wa}" target="_blank" class="text-gold underline">تواصلي معنا على واتساب</a> لإتمام الطلب مباشرة.`,
        isHtml: true,
      });
      return;
    }

    const cleanPhone = normalizeDigits(form.phone).trim();
    const cleanName = form.name.trim();
    const shippingFee = getShippingFee(governorate);

    const payload = {
      action: "createOrder",
      order: {
        website: form.website,
        customerName: cleanName,
        phone: cleanPhone,
        governorate,
        area: hasAreas ? form.area.trim() : "",
        address: form.address.trim(),
        gpsLink,
        bundleLabel,
        itemsSubtotal: total,
        shippingFee,
        engravingFeeTotal,
        totalPrice: total + shippingFee + engravingFeeTotal,
        items: items.map((i) => {
          const eng = i.engraving;
          const usesSingle = !eng || eng.type === "logo" || eng.mode === "single" || i.qty === 1;
          return {
            name: i.name,
            qty: i.qty,
            price: i.price,
            engravingRequested: !!eng,
            engravingType: eng?.type || "",
            engravingMode: eng ? (usesSingle ? ("single" as const) : ("perPiece" as const)) : "",
            engravingTexts: !eng
              ? []
              : eng.type === "logo"
                ? []
                : usesSingle
                  ? [eng.singleText.trim()]
                  : eng.perPieceTexts.map((t) => t.trim()),
            engravingLogoBase64: eng?.type === "logo" ? eng.logoBase64 : "",
            engravingLogoMimeType: eng?.type === "logo" ? eng.logoMimeType : "",
          };
        }),
      },
    };

    setSubmitting(true);
    try {
      const result = await callApi<{ orderId: string }>(payload);
      if (result.ok) {
        recordOrderPlaced();
        clearCart();
        const firstName = cleanName.split(/\s+/)[0] || "";
        setForm(initialForm);
        onGovernorateChange("");
        setGpsLink("");
        setGpsLabel("تحديد موقعي عبر GPS");
        onSuccess(result.orderId, firstName);
      } else {
        setFormMsg({ text: result.error || "حدث خطأ، من فضلك حاولي مرة أخرى." });
      }
    } catch {
      setFormMsg({ text: "تعذّر الاتصال بالخادم. تأكدي من الإنترنت وحاولي مرة أخرى." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id="orderForm"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-2xl border border-[var(--line)] bg-white p-6 md:p-8"
    >
      {/* honeypot */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => update({ website: e.target.value })}
        className="absolute -left-[9999px] -top-[9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-umber">الاسم بالكامل</label>
        <input
          id="fldName"
          type="text"
          required
          placeholder="مثال: سارة أحمد"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full rounded-xl border border-[var(--line)] bg-ivory/40 px-4 py-3"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-rose-700">من فضلك أدخلي الاسم الأول والأخير.</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-umber">رقم الهاتف</label>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11}
          required
          placeholder="01xxxxxxxxx"
          value={form.phone}
          onChange={(e) => update({ phone: normalizeDigits(e.target.value) })}
          className="w-full rounded-xl border border-[var(--line)] bg-ivory/40 px-4 py-3"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-rose-700">
            رقم غير صحيح — يجب أن يبدأ بـ 010 / 011 / 012 / 015 ويتكوّن من 11 رقمًا.
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-umber">المحافظة</label>
        <select
          required
          value={governorate}
          onChange={(e) => handleGovChange(e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] bg-ivory/40 px-4 py-3"
        >
          <option value="">اختاري المحافظة…</option>
          {GOVERNORATES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {hasAreas && (
        <AreaCombobox
          areas={AREAS[governorate]}
          value={form.area}
          onChange={(v) => update({ area: v })}
        />
      )}

      {governorate && (
        <div>
          <label className="mb-2 block text-sm font-medium text-umber">تفاصيل التوصيل الكاملة</label>
          <textarea
            rows={3}
            placeholder="اسم الشارع، رقم العقار، أقرب علامة مميزة…"
            value={form.address}
            onChange={(e) => update({ address: e.target.value })}
            className="w-full rounded-xl border border-[var(--line)] bg-ivory/40 px-4 py-3"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-rose-700">من فضلك أدخلي العنوان بالتفصيل.</p>
          )}
          <button
            type="button"
            onClick={handleLocate}
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-golddeep"
          >
            <MapPin size={15} />
            <span>{gpsLabel}</span>
          </button>
        </div>
      )}

      {engravingError && (
        <p className="-mt-3 text-xs text-rose-700">{engravingError}</p>
      )}

      <div className="border-t border-[var(--line)] pt-2">
        <p className="mb-2 text-sm font-medium text-umber">طريقة الدفع</p>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-ivory/60 px-4 py-3">
          <Lock size={18} className="text-golddeep" />
          <span className="text-sm text-ink">الدفع عند الاستلام (COD) — الطريقة الوحيدة المتاحة حاليًا</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 font-semibold text-ivory transition-colors hover:bg-umber disabled:opacity-70"
      >
        {submitting ? "جاري إرسال الطلب…" : "تأكيد الطلب"}
      </button>

      {formMsg &&
        (formMsg.isHtml ? (
          <p
            className="text-center text-sm text-rose-700"
            dangerouslySetInnerHTML={{ __html: formMsg.text }}
          />
        ) : (
          <p className="text-center text-sm text-rose-700">{formMsg.text}</p>
        ))}
    </form>
  );
}

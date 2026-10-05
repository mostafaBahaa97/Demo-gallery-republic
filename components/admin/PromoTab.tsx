"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { callApi } from "@/lib/api";
import type { PromoConfig } from "@/lib/types";

function formatPreview(hours: number): string {
  const totalSeconds = Math.max(0, Math.round(hours * 3600));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function PromoTab({
  token,
  onAuthError,
  refreshKey,
}: {
  token: string;
  onAuthError: () => void;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [durationHours, setDurationHours] = useState(7);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callApi<{ promo: PromoConfig }>({ action: "getPromoConfig" });
      if (result.ok && result.promo) {
        setEnabled(result.promo.enabled);
        setMessage(result.promo.message);
        setDurationHours(result.promo.durationHours);
      } else {
        setError(result.error || "تعذّر تحميل الإعدادات.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      const result = await callApi({
        action: "savePromoConfig",
        token,
        promo: { enabled, message: message.trim(), durationHours: Number(durationHours) },
      });
      if (result.ok) {
        setSavedMsg("تم الحفظ ✅ — العد التنازلي بدأ من الأول دلوقتي لكل زوار الموقع.");
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "تعذّر الحفظ.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-umber/50">جاري التحميل…</p>;
  }

  return (
    <section className="max-w-xl">
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
        <label className="mb-5 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          <span className="font-medium text-ink">تفعيل شريط العرض فوق الموقع</span>
        </label>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-umber">نص الرسالة</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="مثال: 🔥 149 ج.م للقطعة الواحدة من أول القطعة الثانية"
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-umber">مدة العرض (بالساعات)</label>
          <input
            type="number"
            min={0.1}
            step={0.5}
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="w-32 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
          <p className="mt-1.5 text-xs text-umber/50">
            كل عميلة بتاخد عدّاد خاص بيها بالمدة دي من أول لحظة تفتح فيها الموقع، ولو رجعت
            بعدها بساعة هيكمل من نفس المكان (مش يبدأ من الأول). لما العدّاد يخلص عندها،
            بيبدأ تاني تلقائيًا.
          </p>
        </div>

        {/* معاينة الشكل */}
        <div className="mb-5 overflow-hidden rounded-xl border border-[var(--line)]">
          <p className="border-b border-[var(--line)] bg-ivorysoft px-3 py-1.5 text-[11px] text-umber/50">
            معاينة الشريط
          </p>
          <div className="bg-ink px-4 py-2 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="text-xs font-medium text-ivory sm:text-sm">
                {message || "اكتبي نص الرسالة فوق…"}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 font-latin text-xs font-semibold tabular-nums text-gold sm:text-sm">
                <Clock size={13} />
                {formatPreview(durationHours)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/[0.06] p-3 text-xs leading-6 text-umber/70">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-golddeep" />
          <span>
             كل حفظ بيصفّر عدّاد
            كل الزوار (حتى اللي عدّادهم شغال من عرض سابق) ويبدأهم من الأول.
          </span>
        </div>

        {error && <p className="mb-3 text-sm text-rose-700">{error}</p>}
        {savedMsg && <p className="mb-3 text-sm text-emerald-700">{savedMsg}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-ivory disabled:opacity-60"
        >
          {saving ? "جاري الحفظ…" : "حفظ وبدء عرض جديد"}
        </button>
      </div>
    </section>
  );
}

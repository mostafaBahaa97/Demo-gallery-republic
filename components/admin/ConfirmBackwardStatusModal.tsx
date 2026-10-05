"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import { callApi } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";

/**
 * حاجز أمان قبل رجوع حالة الطلب للخلف (مثلاً من "خرج للتسليم" لـ"تحت
 * التصنيع") — تصرف ده مش منطقي في السير العادي للطلب، فبنطلب كلمة مرور
 * الأدمن كتأكيد إضافي عشان ميحصلش بضغطة غلط.
 */
export function ConfirmBackwardStatusModal({
  token,
  orderId,
  fromStatus,
  toStatus,
  onCancel,
  onConfirmed,
  onAuthError,
}: {
  token: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  onCancel: () => void;
  onConfirmed: () => void;
  onAuthError: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("من فضلك أدخلي كلمة المرور.");
      return;
    }
    setChecking(true);
    setError("");
    try {
      const result = await callApi({ action: "verifyPassword", token, password });
      if (result.ok) {
        onConfirmed();
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "كلمة المرور غير صحيحة.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 p-4"
      onClick={onCancel}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <Lock size={18} />
          </div>
          <button type="button" onClick={onCancel} className="text-umber/50 hover:text-umber">
            <X size={18} />
          </button>
        </div>

        <h3 className="mb-1.5 font-display text-lg text-ink">تأكيد الرجوع لحالة سابقة</h3>
        <p className="mb-4 text-sm leading-6 text-umber/70">
          طلب <span className="font-latin font-semibold text-ink">{orderId}</span> هيرجع من{" "}
          <span className="font-semibold text-ink">{fromStatus}</span> لـ{" "}
          <span className="font-semibold text-ink">{toStatus}</span>. ده رجوع للخلف عن السير
          الطبيعي للطلب — أدخلي كلمة مرور الأدمن للتأكيد.
        </p>

        <form onSubmit={handleConfirm} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة مرور الأدمن"
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
          />
          {error && <p className="text-xs text-rose-700">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full border border-[var(--line)] py-2.5 text-sm font-medium text-umber/70"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={checking}
              className="flex-1 rounded-full bg-rose-700 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {checking ? "جاري التأكيد…" : "تأكيد الرجوع"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

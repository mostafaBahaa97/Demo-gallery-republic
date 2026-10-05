"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { callApi } from "@/lib/api";
import { PRODUCTS } from "@/lib/products";
import type { BundleDiscountRule, ProductDiscountRule } from "@/lib/types";

export function DiscountsTab({
  token,
  onAuthError,
  refreshKey,
}: {
  token: string;
  onAuthError: () => void;
  refreshKey: number;
}) {
  const [bundleRules, setBundleRules] = useState<BundleDiscountRule[]>([]);
  const [productRules, setProductRules] = useState<ProductDiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callApi<{
        bundle: BundleDiscountRule[];
        product: ProductDiscountRule[];
      }>({ action: "getDiscountRules" });
      if (result.ok) {
        setBundleRules(result.bundle || []);
        setProductRules(result.product || []);
      } else {
        setError(result.error || "تعذّر تحميل قواعد الخصم.");
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

  useEffect(() => {
    if (!savedMsg) return;
    const t = setTimeout(() => setSavedMsg(""), 3000);
    return () => clearTimeout(t);
  }, [savedMsg]);

  const updateBundle = (index: number, patch: Partial<BundleDiscountRule>) => {
    setBundleRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const removeBundle = (index: number) => {
    setBundleRules((prev) => prev.filter((_, i) => i !== index));
  };
  const addBundle = () => {
    setBundleRules((prev) => [...prev, { pieces: prev.length ? Math.max(...prev.map((r) => r.pieces)) + 1 : 1, amount: 0 }]);
  };

  const updateProduct = (index: number, patch: Partial<ProductDiscountRule>) => {
    setProductRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const removeProduct = (index: number) => {
    setProductRules((prev) => prev.filter((_, i) => i !== index));
  };
  const addProduct = () => {
    setProductRules((prev) => [...prev, { productName: PRODUCTS[0]?.name || "", minQty: 2, percent: 10 }]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const result = await callApi({
        action: "saveDiscountRules",
        token,
        bundle: bundleRules,
        product: productRules,
      });
      if (result.ok) {
        setSavedMsg("تم حفظ الخصومات بنجاح ✅");
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "تعذّر حفظ الخصومات.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-16 text-center text-umber/50">جاري تحميل الخصومات…</p>;
  }

  return (
    <section className="space-y-8">
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {savedMsg && <p className="text-sm font-medium text-golddeep">{savedMsg}</p>}

      {/* Bundle discounts */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-5 md:p-6">
        <h3 className="mb-1 font-display text-lg text-ink">خصومات حسب إجمالي القطع</h3>
        

        <div className="space-y-2">
          {bundleRules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-umber/50">من كام قطعة</label>
                <input
                  type="number"
                  min={1}
                  value={rule.pieces}
                  onChange={(e) => updateBundle(i, { pieces: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-umber/50">قيمة الخصم (ج.م) للقطعة</label>
                <input
                  type="number"
                  min={0}
                  value={rule.amount}
                  onChange={(e) => updateBundle(i, { amount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => removeBundle(i)}
                aria-label="حذف"
                className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-700 hover:bg-rose-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addBundle}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gold hover:text-golddeep"
        >
          <Plus size={15} /> إضافة قاعدة
        </button>
      </div>

      {/* Product-specific discounts */}
      {/* <div className="rounded-2xl border border-[var(--line)] bg-white p-5 md:p-6">
        <h3 className="mb-1 font-display text-lg text-ink">خصومات على منتجات معينة</h3>
        <p className="mb-4 text-sm text-umber/60">
          مثال: منتج معيّن لو اتشرى منه قطعتين ياخد خصم 15% على سعر القطعتين دول بس (بيتحسب فوق
          خصم إجمالي القطع لو انطبق).
        </p>

        <div className="space-y-2">
          {productRules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-[2]">
                <label className="mb-1 block text-xs text-umber/50">المنتج</label>
                <select
                  value={rule.productName}
                  onChange={(e) => updateProduct(i, { productName: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-umber/50">من كام قطعة</label>
                <input
                  type="number"
                  min={1}
                  value={rule.minQty}
                  onChange={(e) => updateProduct(i, { minQty: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-umber/50">نسبة الخصم %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rule.percent}
                  onChange={(e) => updateProduct(i, { percent: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => removeProduct(i)}
                aria-label="حذف"
                className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-700 hover:bg-rose-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {productRules.length === 0 && (
            <p className="text-sm text-umber/50">لا يوجد عروض خاصة على منتجات معينة حاليًا.</p>
          )}
        </div>

        <button
          onClick={addProduct}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gold hover:text-golddeep"
        >
          <Plus size={15} /> إضافة عرض على منتج
        </button>
      </div> */}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-full bg-ink py-3.5 font-semibold text-ivory transition-colors hover:bg-umber disabled:opacity-60 md:w-auto md:px-8"
      >
        {saving ? "جاري الحفظ…" : "حفظ التغييرات"}
      </button>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/api";
import type { InventoryRow } from "@/lib/types";

export function InventoryTab({
  token,
  onAuthError,
  refreshKey,
}: {
  token: string;
  onAuthError: () => void;
  refreshKey: number;
}) {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qtyDraft, setQtyDraft] = useState<Record<string, string>>({});
  const [savingProduct, setSavingProduct] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callApi<{ inventory: InventoryRow[] }>({
        action: "getInventory",
        token,
      });
      if (result.ok && result.inventory) {
        setRows(result.inventory);
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "تعذّر تحميل المخزون.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(""), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const handleAddStock = async (productName: string) => {
    const qty = Number(qtyDraft[productName]);
    if (!qty || qty <= 0) {
      setError("اكتبي كمية صحيحة أكبر من صفر.");
      return;
    }
    setSavingProduct(productName);
    setError("");
    try {
      const result = await callApi({ action: "addStock", token, productName, qty });
      if (result.ok) {
        setToastMsg(`تمت إضافة ${qty} قطعة لمخزون "${productName}".`);
        setQtyDraft((prev) => ({ ...prev, [productName]: "" }));
        loadInventory();
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "تعذّر تحديث المخزون.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setSavingProduct(null);
    }
  };

  return (
    <section>
      {error && <p className="mb-4 text-sm text-rose-700">{error}</p>}
      {toastMsg && <p className="mb-4 text-sm text-golddeep">{toastMsg}</p>}

      <p className="mb-2 text-xs text-umber/50 sm:hidden">↔ مرّري بإصبعك يمين وشمال لعرض كل الأعمدة</p>

      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ivorysoft text-umber">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-start">المنتج</th>
                <th className="whitespace-nowrap px-4 py-3 text-start">المخزون الأولي</th>
                <th className="whitespace-nowrap px-4 py-3 text-start">المُباع</th>
                <th className="whitespace-nowrap px-4 py-3 text-start">المخزون الحالي</th>
                <th className="whitespace-nowrap px-4 py-3 text-start">مطلوب تصنيعه</th>
                <th className="whitespace-nowrap px-4 py-3 text-start">تسجيل إنتاج جديد</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-umber/50">
                    جاري التحميل…
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.productName} className="border-t border-[var(--line)]/60">
                    <td className="px-4 py-3">{row.productName}</td>
                    <td className="whitespace-nowrap px-4 py-3">{row.initialStock}</td>
                    <td className="whitespace-nowrap px-4 py-3">{row.sold}</td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 ${row.currentStock < 0 ? "bg-[#FBE1E1] font-semibold text-[#8a2f2f]" : ""}`}
                    >
                      {row.currentStock}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.requiredToManufacture > 0 ? row.requiredToManufacture : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="كام قطعة اتصنعت؟"
                          value={qtyDraft[row.productName] || ""}
                          onChange={(e) =>
                            setQtyDraft((prev) => ({ ...prev, [row.productName]: e.target.value }))
                          }
                          className="w-28 rounded-lg border border-[var(--line)] px-2 py-1.5 text-sm"
                        />
                        <button
                          onClick={() => handleAddStock(row.productName)}
                          disabled={savingProduct === row.productName}
                          className="whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-ivory disabled:opacity-60"
                        >
                          {savingProduct === row.productName ? "جاري الإضافة…" : "إضافة للمخزون"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

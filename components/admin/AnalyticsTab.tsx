"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { callApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["تحت التصنيع", "خرج للتسليم", "تم التسليم", "مرتجع"];

const STATUS_META: Record<OrderStatus, { label: string; icon: string; tone: string }> = {
  "تحت التصنيع": { label: "تحت التصنيع", icon: "", tone: "bg-[#FDF0DA] text-golddeep" },
  "خرج للتسليم": { label: "خرج للتسليم (قيد التوصيل)", icon: "", tone: "bg-[#e9e9fb] text-[#4e4eb7]" },
  "تم التسليم": { label: "تم التسليم (مبيعات مؤكدة)", icon: "", tone: "bg-[#DEF3E3] text-[#256a3f]" },
  مرتجع: { label: "مرتجع", icon: "", tone: "bg-[#FBE1E1] text-[#8a2f2f]" },
};

const fmt = (n: number) => Number(n || 0).toLocaleString("ar-EG") + " ج.م";

function startOfDay(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}
function endOfDay(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T23:59:59");
  return isNaN(d.getTime()) ? null : d;
}

export function AnalyticsTab({
  token,
  onAuthError,
  refreshKey,
}: {
  token: string;
  onAuthError: () => void;
  refreshKey: number;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [returnQuery, setReturnQuery] = useState("");
  const [adSpend, setAdSpend] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callApi<{ orders: Order[] }>({ action: "getOrders", token });
      if (result.ok && result.orders) {
        setOrders(result.orders);
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "تعذّر تحميل البيانات.");
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

  const from = useMemo(() => startOfDay(fromDate), [fromDate]);
  const to = useMemo(() => endOfDay(toDate), [toDate]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.timestamp);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [orders, from, to]);

  const byStatus = useMemo(() => {
    const map = {} as Record<OrderStatus, { count: number; total: number }>;
    STATUSES.forEach((s) => (map[s] = { count: 0, total: 0 }));
    filtered.forEach((o) => {
      if (map[o.status]) {
        map[o.status].count += 1;
        map[o.status].total += Number(o.totalPrice || 0);
      }
    });
    return map;
  }, [filtered]);

  const grandTotal = filtered.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
  const confirmedSales = byStatus["تم التسليم"].total;
  const pendingSales = byStatus["خرج للتسليم"].total + byStatus["تحت التصنيع"].total;
  const returnedValue = byStatus["مرتجع"].total;

  const adSpendNum = Number(adSpend) || 0;
  const netProfit = confirmedSales - adSpendNum;

  const returnedOrders = filtered.filter((o) => o.status === "مرتجع");
  const q = returnQuery.trim();
  const filteredReturns = q
    ? returnedOrders.filter(
        (o) => (o.note || "").includes(q) || o.orderId.includes(q) || o.customerName.includes(q)
      )
    : returnedOrders;

  const clearRange = () => {
    setFromDate("");
    setToDate("");
  };

  if (loading) {
    return <p className="py-16 text-center text-umber/50">جاري تحميل التقارير…</p>;
  }

  return (
    <section>
      {error && <p className="mb-4 text-sm text-rose-700">{error}</p>}

      {/* فلتر التاريخ */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--line)] bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-umber">من تاريخ</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-umber">إلى تاريخ</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={clearRange}
            className="rounded-full border border-[var(--line)] px-3.5 py-2 text-xs font-medium text-umber/70"
          >
            مسح الفلتر (عرض كل الفترات)
          </button>
        )}
        <p className="text-xs text-umber/50 md:ms-auto">{filtered.length} طلب في الفترة المحددة</p>
      </div>

      {/* مؤشرات سريعة لكل حالة */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s} className={`rounded-2xl p-4 ${STATUS_META[s].tone}`}>
            <p className="mb-1 text-xs font-medium opacity-80">
              {STATUS_META[s].icon} {STATUS_META[s].label}
            </p>
            <p className="text-lg font-bold">{fmt(byStatus[s].total)}</p>
            <p className="text-xs opacity-70">{byStatus[s].count} طلب</p>
          </div>
        ))}
      </div>

      {/* ملخص شامل + حاسبة جدوى الإعلان */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <h3 className="mb-3 font-display text-lg text-ink">ملخص الفترة</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-umber/60">إجمالي كل الطلبات (كل الحالات)</span>
              <span className="font-semibold">{fmt(grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-umber/60">مبيعات مؤكدة (تم التسليم)</span>
              <span className="font-semibold text-[#256a3f]">{fmt(confirmedSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-umber/60"> قيد التنفيذ (خرج للتسليم + تحت التصنيع)</span>
              <span className="font-semibold">{fmt(pendingSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-umber/60"> خسارة المرتجعات</span>
              <span className="font-semibold text-[#8a2f2f]">{fmt(returnedValue)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-5">
          <h3 className="mb-1 font-display text-lg text-ink">جدوى الإعلان (حاسبة سريعة)</h3>
          <p className="mb-3 text-xs text-umber/60">
            اكتبي تكلفة الإعلان في نفس الفترة دي، وشوفي صافي الربح من المبيعات المؤكدة.
          </p>
          <label className="mb-1 block text-xs font-medium text-umber">تكلفة الإعلان (ج.م)</label>
          <input
            type="number"
            min={0}
            value={adSpend}
            onChange={(e) => setAdSpend(e.target.value)}
            placeholder="0"
            className="mb-3 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          />
          <div
            className={`flex justify-between rounded-lg px-3 py-2.5 text-sm font-semibold ${
              netProfit >= 0 ? "bg-[#DEF3E3] text-[#256a3f]" : "bg-[#FBE1E1] text-[#8a2f2f]"
            }`}
          >
            <span>صافي الربح التقريبي</span>
            <span>{fmt(netProfit)}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-umber/45">
            = المبيعات المؤكدة (تم التسليم) − تكلفة الإعلان. رقم تقريبي بس، ومحسوب من غير خصم تكلفة
            المنتج أو الشحن الفعلية.
          </p>
        </div>
      </div>

      {/* قائمة المرتجعات + فلترة بالسبب */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg text-ink">الطلبات المرتجعة في الفترة ({returnedOrders.length})</h3>
          {returnedOrders.length > 0 && (
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-umber/40" />
              <input
                type="text"
                value={returnQuery}
                onChange={(e) => setReturnQuery(e.target.value)}
                placeholder="فلترة بالسبب أو الاسم أو رقم الطلب…"
                className="rounded-full border border-[var(--line)] py-1.5 pe-3 ps-8 text-xs"
              />
            </div>
          )}
        </div>
        {returnedOrders.length === 0 ? (
          <p className="text-sm text-umber/50">لا يوجد مرتجعات في الفترة المحددة</p>
        ) : filteredReturns.length === 0 ? (
          <p className="text-sm text-umber/50">لا توجد نتائج مطابقة للفلتر.</p>
        ) : (
          <div className="space-y-2">
            {filteredReturns.map((o) => (
              <div
                key={o.orderId}
                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-sm"
              >
                <div>
                  <p className="font-latin font-semibold">
                    {o.orderId} — {o.customerName}
                  </p>
                  <p className="text-xs text-umber/60">{new Date(o.timestamp).toLocaleDateString("ar-EG")}</p>
                  {o.note && <p className="mt-1 text-xs text-rose-700">📝 {o.note}</p>}
                </div>
                <span className="font-latin font-semibold text-[#8a2f2f]">{fmt(o.totalPrice)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

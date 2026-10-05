"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, PenLine } from "lucide-react";
import { callApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { ConfirmBackwardStatusModal } from "./ConfirmBackwardStatusModal";

const STATUSES: OrderStatus[] = ["تحت التصنيع", "خرج للتسليم", "تم التسليم", "مرتجع"];

const STATUS_CLASS: Record<OrderStatus, string> = {
  "تحت التصنيع": "bg-[#FDF0DA] text-golddeep",
  "تم التسليم": "bg-[#DEF3E3] text-[#256a3f]",
  "خرج للتسليم": "bg-[#4e4eb7] text-[#ffffff]",
  مرتجع: "bg-[#FBE1E1] text-[#8a2f2f]",
};

// ترتيب السير الطبيعي للطلب. "مرتجع" حالة جانبية (مش جزء من الترتيب
// التصاعدي) وممكن تتحط من أي حالة من غير تأكيد إضافي. أي انتقال لرقم أصغر
// جوه الترتيب ده (مثلاً من "خرج للتسليم" لـ"تحت التصنيع") بيعتبر رجوع للخلف
// ولازم تأكيد بكلمة المرور قبل ما يحصل.
const STATUS_ORDER: Partial<Record<OrderStatus, number>> = {
  "تحت التصنيع": 0,
  "خرج للتسليم": 1,
  "تم التسليم": 2,
};

function isBackwardMove(from: OrderStatus, to: OrderStatus): boolean {
  const fromIdx = STATUS_ORDER[from];
  const toIdx = STATUS_ORDER[to];
  if (fromIdx === undefined || toIdx === undefined) return false; // "مرتجع" مستثناة
  return toIdx < fromIdx;
}

const fmt = (n: number) => Number(n || 0).toLocaleString("ar-EG") + " ج.م";

/** ملاحظة اختيارية على الطلب — بتظهر تلقائيًا للطلبات المرتجعة (أو أي طلب
 * كُتبت له ملاحظة من قبل، حتى لو اتغيّرت حالته بعدين). */
function ReturnNoteEditor({
  order,
  token,
  onAuthError,
  onSaved,
}: {
  order: Order;
  token: string;
  onAuthError: () => void;
  onSaved: (orderId: string, note: string) => void;
}) {
  const [note, setNote] = useState(order.note || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await callApi({ action: "updateOrderNote", token, orderId: order.orderId, note });
      if (result.ok) {
        onSaved(order.orderId, note);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else if (result.authError) {
        onAuthError();
      }
    } catch {
      /* لو فشل الاتصال، الزرار بيفضل شغال، تقدر تحاول تاني عادي */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50/60 p-3">
      <label className="mb-1.5 block text-xs font-medium text-rose-800">
        ملاحظة (سبب الإرجاع مثلاً) — اختياري
      </label>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="مثال: العميل غيّر رأيه، المقاس مش مناسب، تأخر في الاستلام…"
        className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm"
      />
      <div className="mt-1.5 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving || note === (order.note || "")}
          className="rounded-full bg-rose-700 px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-40"
        >
          {saving ? "جاري الحفظ…" : "حفظ الملاحظة"}
        </button>
        {saved && <span className="text-xs text-emerald-700">✓ اتحفظت</span>}
      </div>
    </div>
  );
}

export function OrdersTab({
  token,
  onAuthError,
  onPrint,
  refreshKey,
}: {
  token: string;
  onAuthError: () => void;
  onPrint: (orders: Order[]) => void;
  refreshKey: number;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingChange, setPendingChange] = useState<{
    orderId: string;
    from: OrderStatus;
    to: OrderStatus;
  } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callApi<{ orders: Order[] }>({ action: "getOrders", token });
      if (result.ok && result.orders) {
        // بعض القيم بترجع من جوجل شيت كأرقام مش نصوص (مثلاً رقم الهاتف)، فبنثبّتها
        // كنصوص هنا عشان .includes() في البحث ما يعملش كراش.
        const normalized = result.orders.map((o) => ({
          ...o,
          orderId: String(o.orderId ?? ""),
          phone: String(o.phone ?? ""),
          customerName: String(o.customerName ?? ""),
          governorate: String(o.governorate ?? ""),
          area: String(o.area ?? ""),
          address: String(o.address ?? ""),
          note: String(o.note ?? ""),
        }));
        setOrders(normalized);
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "تعذّر تحميل الطلبات.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const result = await callApi({ action: "updateStatus", token, orderId, status });
      if (result.ok) {
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status } : o)));
      } else if (result.authError) {
        onAuthError();
      } else {
        setError(result.error || "تعذّر تحديث الحالة.");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    }
  };

  const handleNoteSaved = (orderId: string, note: string) => {
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, note } : o)));
  };

  // عدّاد كل حالة بيتحسب من كل الطلبات (مش متأثر بالبحث)، عشان يفضل ثابت
  // كمرجع سريع حتى وانتي بتدوّري باسم أو رقم معيّن.
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<OrderStatus, number>> = {};
    STATUSES.forEach((s) => {
      counts[s] = orders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [orders]);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    const q = query.trim();
    if (!q) return true;
    return o.orderId.includes(q) || o.phone.includes(q) || o.customerName.includes(q);
  });

  const handleStatusClick = (order: Order, status: OrderStatus) => {
    if (status === order.status) return;
    if (isBackwardMove(order.status, status)) {
      setPendingChange({ orderId: order.orderId, from: order.status, to: status });
      return;
    }
    updateStatus(order.orderId, status);
  };

  const confirmPendingChange = () => {
    if (!pendingChange) return;
    updateStatus(pendingChange.orderId, pendingChange.to);
    setPendingChange(null);
  };

  const toggleSelect = (orderId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.orderId));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        filtered.forEach((o) => next.delete(o.orderId));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((o) => next.add(o.orderId));
      return next;
    });
  };

  const printSelected = () => {
    const chosen = orders.filter((o) => selected.has(o.orderId));
    if (chosen.length) onPrint(chosen);
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "all"
              ? "border-ink bg-ink text-ivory"
              : "border-umber/20 text-umber/70 hover:border-ink/40"
          }`}
        >
          الكل ({orders.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "border-ink bg-ink text-ivory"
                : "border-umber/20 text-umber/70 hover:border-ink/40"
            }`}
          >
            {s} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحثي بالاسم أو رقم الطلب أو رقم الهاتف…"
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 md:max-w-sm"
        />
        {filtered.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-umber/70">
            <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} />
            تحديد الكل
          </label>
        )}
        <button
          onClick={printSelected}
          disabled={selected.size === 0}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-ivory transition-opacity disabled:opacity-40 md:ms-auto"
        >
          <Printer size={15} /> طباعة المحدد ({selected.size})
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="py-16 text-center text-umber/50">جاري تحميل الطلبات…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center text-umber/60">
          {statusFilter === "all" && !query.trim()
            ? "لا توجد طلبات بعد."
            : "لا توجد طلبات مطابقة لهذا الفلتر/البحث."}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.orderId} className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(o.orderId)}
                    onChange={() => toggleSelect(o.orderId)}
                  />
                  <div>
                    <p className="font-latin font-bold">{o.orderId}</p>
                    <p className="text-xs text-umber/50">
                      {new Date(o.timestamp).toLocaleString("ar-EG")}
                    </p>
                  </div>
                </label>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_CLASS[o.status]}`}>
                  {o.status}
                </span>
              </div>

              <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-umber/50">الاسم :</span> {o.customerName}
                </p>
                <p>
                  <span className="text-umber/50">الهاتف:</span> {o.phone}
                </p>
                <p>
                  <span className="text-umber/50">المحافظة:</span> {o.governorate}
                  {o.area ? ` - ${o.area}` : ""}
                </p>
                <p>
                  <span className="text-umber/50">الإجمالي:</span> {fmt(o.totalPrice)}
                  {(o.shippingFee > 0 || o.engravingFeeTotal > 0) && (
                    <span className="text-umber/50">
                      {" "}
                      (
                      {[
                        o.shippingFee > 0 ? `${fmt(o.shippingFee)} شحن` : null,
                        o.engravingFeeTotal > 0 ? `${fmt(o.engravingFeeTotal)} نقش` : null,
                      ]
                        .filter(Boolean)
                        .join(" + ")}
                      )
                    </span>
                  )}
                </p>
              </div>

              <p className="mb-3 text-sm text-umber/70">
                {(o.items || []).map((i) => `${i.productName} ×${i.qty}`).join("، ")}
              </p>

              {(o.items || [])
                .filter((i) => i.engravingRequested)
                .map((i, idx) => (
                  <div
                    key={idx}
                    className="mb-2 flex flex-wrap items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-sm"
                  >
                    <PenLine size={15} className="mt-0.5 shrink-0 text-golddeep" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-golddeep">
                        حفر على <span dir="auto">{i.productName}</span> ({i.qty.toLocaleString("ar-EG")} {i.qty === 1 ? "قطعة" : "قطع"})
                      </p>
                      {i.engravingType === "text" ? (
                        i.engravingMode === "perPiece" ? (
                          <p className="font-latin text-ink" dir="auto">
                            {i.engravingTexts
                              .map((t, ti) => `${(ti + 1).toLocaleString("ar-EG")}) ${t}`)
                              .join("  --  ")}
                          </p>
                        ) : (
                          <p className="font-latin text-ink" dir="auto">
                            &quot;{i.engravingTexts[0]}&quot;
                          </p>
                        )
                      ) : i.engravingLogoLink ? (
                        <a
                          href={i.engravingLogoLink}
                          target="_blank"
                          rel="noopener"
                          className="font-medium text-golddeep underline underline-offset-2"
                        >
                          عرض صورة اللوجو ↗
                        </a>
                      ) : (
                        <span className="text-rose-700">لوجو (تعذّر حفظ الصورة — تواصلي مع العميلة)</span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-umber/50">+{fmt(i.engravingFee)}</span>
                  </div>
                ))}

              {(o.status === "مرتجع" || o.note) && (
                <ReturnNoteEditor order={o} token={token} onAuthError={onAuthError} onSaved={handleNoteSaved} />
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)]/70 pt-3">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusClick(o, s)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      o.status === s
                        ? "border-ink bg-ink text-ivory"
                        : "border-umber/20 text-umber/70"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => onPrint([o])}
                  className="ms-auto flex items-center gap-1.5 rounded-full border border-gold px-3 py-1.5 text-xs font-medium text-golddeep"
                >
                  <Printer size={13} /> طباعة الفاتورة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingChange && (
        <ConfirmBackwardStatusModal
          token={token}
          orderId={pendingChange.orderId}
          fromStatus={pendingChange.from}
          toStatus={pendingChange.to}
          onCancel={() => setPendingChange(null)}
          onConfirmed={confirmPendingChange}
          onAuthError={onAuthError}
        />
      )}
    </section>
  );
}

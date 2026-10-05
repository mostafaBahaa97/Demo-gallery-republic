"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Order } from "@/lib/types";
import { InvoiceLabel } from "./InvoiceLabel";

export function PrintLabelsModal({ orders, onClose }: { orders: Order[]; onClose: () => void }) {
  // بنستخدم Portal عشان نطبع محتوى الفواتير بس، بره باقي عناصر لوحة التحكم
  // تمامًا. من غيره، الطريقة القديمة (visibility:hidden) كانت بتخلي المتصفح
  // "يحجز" مساحة باقي الصفحة فاضية في الطباعة، فتطلع صفحات فاضية زيادة.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 print:static print:bg-white print:p-0">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white print:max-h-none print:max-w-none print:overflow-visible print:rounded-none">
        <div className="no-print flex items-center justify-between border-b border-[var(--line)] p-4">
          <p className="text-sm text-umber/70">
            {orders.length === 1 ? "فاتورة شحن واحدة" : `${orders.length} فواتير شحن`}
          </p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-ivory">
              طباعة
            </button>
            <button onClick={onClose} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium">
              إغلاق
            </button>
          </div>
        </div>

        <div id="labels-grid" className="labels-grid p-2 print:p-0">
          {orders.map((order) => (
            <InvoiceLabel key={order.orderId} order={order} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .labels-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .label-cell {
          height: 350px;
        }

        @media print {
          @page {
            size: A4;
            margin: 5mm;
          }
          /* بنخفي كل حاجة في الصفحة كلها من غير استثناءات، وبعدين نظهر
             حاوية الطباعة (اللي هي دلوقتي جوّه الـ portal، بره شجرة لوحة
             التحكم تمامًا). display:none بيشيل العنصر من حساب المساحة
             خالص، على عكس visibility:hidden اللي بيسيب مكانه فاضي. */
          body > * {
            display: none !important;
          }
          #gr-print-portal-root {
            display: block !important;
          }
          .labels-grid {
            gap: 0;
          }
          .label-cell {
            width: 100mm;
            height: 95mm;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>,
    getPrintPortalRoot()
  );
}

/** بتنشئ (أو تلاقي) عنصر ثابت في جذر الصفحة مخصص لمحتوى الطباعة بس. */
function getPrintPortalRoot(): HTMLElement {
  var existing = document.getElementById("gr-print-portal-root");
  if (existing) return existing;
  var el = document.createElement("div");
  el.id = "gr-print-portal-root";
  document.body.appendChild(el);
  return el;
}

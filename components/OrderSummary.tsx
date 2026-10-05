"use client";

import { useCart } from "@/hooks/useCart";
import { CONFIG } from "@/lib/config";
import { getShippingFee } from "@/lib/governorates";
import { Reveal } from "./Reveal";

const fmt = (n: number) => n.toLocaleString("ar-EG") + " ج.م";

export function OrderSummary({ governorate }: { governorate: string }) {
  const {
    lines,
    subtotal,
    productDiscountTotal,
    bundleDiscountAmount,
    engravingFeeTotal,
    total,
    bundleLabel,
  } = useCart();

  const shippingFee = governorate ? getShippingFee(governorate) : null;
  const grandTotal = total + (shippingFee ?? 0) + engravingFeeTotal;

  return (
    <Reveal className="md:sticky md:top-28 rounded-2xl bg-ink p-6 text-ivory md:p-8">
      <h3 className="mb-1 font-display text-xl">ملخص الطلب</h3>
      <p className="mb-5 text-sm text-goldsoft">{bundleLabel}</p>

      <div className="mb-5 space-y-3 text-sm">
        {lines.length === 0 ? (
          <p className="text-ivory/40">—</p>
        ) : (
          lines.map((l) => (
            <div key={l.id} className="flex justify-between text-ivory/85">
              <span>
                {l.name}
                {l.qty > 1 ? ` ×${l.qty}` : ""}
                {l.productDiscountPercent > 0 && (
                  <span className="ms-1.5 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-goldsoft">
                    خصم {l.productDiscountPercent}%
                  </span>
                )}
                {l.engraving && (
                  <span className="ms-1.5 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-goldsoft">
                    حفر +{fmt(l.engravingFee)}
                  </span>
                )}
              </span>
              <span className="font-latin">{fmt(l.lineTotal + l.engravingFee)}</span>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 border-t border-[var(--line-dark)] pt-4 text-sm">
        <div className="flex justify-between text-ivory/70">
          <span>الإجمالي الفرعي</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {productDiscountTotal > 0 && (
          <div className="flex justify-between text-goldsoft">
            <span>خصومات المنتجات</span>
            <span>- {fmt(productDiscountTotal)}</span>
          </div>
        )}
        {bundleDiscountAmount > 0 && (
          <div className="flex justify-between text-goldsoft">
            <span>خصم الكمية</span>
            <span>- {fmt(bundleDiscountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ivory/70">
          <span>إجمالي القطع</span>
          <span>{fmt(total)}</span>
        </div>
        {shippingFee !== null ? (
          <div className="flex justify-between text-ivory/70">
            <span>مصاريف الشحن ({governorate})</span>
            <span>{fmt(shippingFee)}</span>
          </div>
        ) : (
          <p className="text-xs text-ivory/40">+ مصاريف شحن حسب المحافظة (هتظهر بعد اختيارها)</p>
        )}
        {engravingFeeTotal > 0 && (
          <div className="flex justify-between text-goldsoft">
            <span>حفر بالليزر (كل القطع)</span>
            <span>{fmt(engravingFeeTotal)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-[var(--line-dark)] pt-3 text-base font-semibold text-gold">
          <span>الإجمالي شامل الشحن</span>
          <span>{fmt(grandTotal)}</span>
        </div>
      </div>

      <p className="mt-5 text-xs leading-6 text-ivory/40">
        الحد الأقصى {CONFIG.MAX_PIECES} قطع للطلب الواحد. لطلبات أكبر، تواصلي معنا مباشرة.
      </p>
    </Reveal>
  );
}

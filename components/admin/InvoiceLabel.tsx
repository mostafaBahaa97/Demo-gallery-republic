import type { Order } from "@/lib/types";
import { FitBox } from "./FitBox";

const fmt = (n: number) => Number(n || 0).toLocaleString("ar-EG") + " ج.م";

// العنوان بيتكتب فيه أحيانًا سطر رابط خرائط جوجل (لو العميل استخدمت زرار GPS) —
// بنشيله وقت الطباعة لأن المطلوب على الفاتورة العنوان النصي بس من غير لينكات.
function addressWithoutGpsLink(address: string): string {
  return address
    .split("\n")
    .filter((line) => !line.includes("google.com/maps") && !line.includes("📍"))
    .join("\n")
    .trim();
}

export function InvoiceLabel({ order }: { order: Order }) {
  const qrUrl = "/gallery_qrcode.png";
  const engravedItems = (order.items || []).filter((i) => i.engravingRequested);

  return (
    <div className="label-cell flex flex-col border border-dashed border-umber/40 bg-white p-3">
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-[var(--line)] pb-1.5">
        <div>
          <p className="font-latin text-[11px] italic leading-none text-golddeep">Gallery Republic</p>
          <p className="font-latin text-xs font-semibold leading-tight">{order.orderId}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="QR" className="h-15 w-15 shrink-0" />
      </div>

      {/* Scales down uniformly if the address/engraving details run long, so every label stays the same size */}
      <FitBox className="min-h-0 flex-1">
        <div className="space-y-1 text-xs leading-snug">
          <p className="text-base font-bold text-ink">{order.customerName}</p>
          <p className="font-latin text-sm font-semibold text-ink">{order.phone}</p>
          <p className="font-medium text-umber/90">
            {order.governorate}
            {order.area ? ` - ${order.area}` : ""}
          </p>
          {order.address && (
            <p className="whitespace-pre-line text-umber/90">
              {addressWithoutGpsLink(order.address)}
            </p>
          )}
          {engravedItems.length > 0 && (
            <div className="mt-1.5 space-y-0.5 border-t border-dashed border-golddeep/40 pt-1.5">
              {engravedItems.map((i, idx) => (
                <p key={idx} className="font-bold leading-tight text-golddeep">
                   {i.productName} ({i.qty}):{" "}
                  {i.engravingType === "text" ? (
                    <span className="font-normal text-ink">
                      {i.engravingMode === "perPiece" ? i.engravingTexts.join("، ") : `"${i.engravingTexts[0]}"`}
                    </span>
                  ) : (
                    <span className="font-normal text-ink">لوجو — شوفي الصورة في لوحة التحكم</span>
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      </FitBox>

      {/* Footer */}
      <div className="mt-1.5 flex items-center justify-between border-t border-[var(--line)] pt-1.5 text-[10px]">
        <span className="text-umber/60">
          {(order.items || []).map((i) => `${i.productName} ×${i.qty}`).join("، ")}
        </span>
      </div>
      <div className="mt-1 space-y-0.5 text-[10px] text-umber/60">
        <div className="flex justify-between">
          <span>إجمالي القطع</span>
          <span className="font-latin">{fmt(order.itemsSubtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>مصاريف الشحن</span>
          <span className="font-latin">{fmt(order.shippingFee)}</span>
        </div>
        {order.engravingFeeTotal > 0 && (
          <div className="flex justify-between">
            <span>حفر بالليزر</span>
            <span className="font-latin">{fmt(order.engravingFeeTotal)}</span>
          </div>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between rounded bg-ivorysoft px-1.5 py-1 text-sm font-bold">
        <span className="text-[11px] font-medium text-umber/70">تحصيل عند الاستلام</span>
        <span className="font-latin text-golddeep">{fmt(order.totalPrice)}</span>
      </div>
    </div>
  );
}

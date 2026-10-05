"use client";

import { Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { CONFIG } from "@/lib/config";

export function QtyControl({ productId }: { productId: number }) {
  const { qtyFor, addItem, decrementItem } = useCart();
  const toast = useToast();
  const qty = qtyFor(productId);

  const handleAdd = () => {
    const ok = addItem(productId);
    if (!ok) {
      toast(
        `الحد الأقصى ${CONFIG.MAX_PIECES} قطع في الطلب الواحد. لطلب كمية أكبر تواصلي معنا مباشرة على واتساب.`,
        "error"
      );
    }
  };

  if (qty === 0) {
    return (
      <button
        onClick={handleAdd}
        className="rounded-full border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-ivory"
      >
        أضيفي للطلب
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full bg-ink px-2 py-1.5 text-ivory">
      <button
        onClick={() => decrementItem(productId)}
        aria-label="إنقاص الكمية"
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ivory/15"
      >
        <Minus size={14} />
      </button>
      <span className="w-4 text-center text-sm font-medium">{qty}</span>
      <button
        onClick={handleAdd}
        aria-label="زيادة الكمية"
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-ivory/15"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { CONFIG } from "@/lib/config";
import { PRODUCTS } from "@/lib/products";
import { getBundleDiscountAmount, getProductDiscountPercent } from "@/lib/discounts";
import { useDiscountRules } from "./useDiscountRules";
import type { CartItem, EngravingInfo } from "@/lib/types";

export interface CartLine extends CartItem {
  lineSubtotal: number;
  productDiscountPercent: number;
  productDiscountAmount: number;
  lineTotal: number;
  engravingFee: number;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  totalPieces: number;
  subtotal: number;
  productDiscountTotal: number;
  bundleAmountPerPiece: number;
  bundleDiscountAmount: number;
  engravingFeeTotal: number;
  totalDiscount: number;
  total: number;
  bundleLabel: string;
  addItem: (id: number) => boolean;
  decrementItem: (id: number) => void;
  clearCart: () => void;
  qtyFor: (id: number) => number;
  setEngraving: (id: number, engraving: EngravingInfo | undefined) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** بتضبط طول مصفوفة أسماء "نقش مختلف لكل قطعة" عشان يفضل مطابق للكمية
 * بالظبط — بتضيف خانة فاضية جديدة لما الكمية تزيد، وبتشيل آخر خانة لما
 * الكمية تقل، من غير ما تمسح النصوص اللي العميلة كتبتها بالفعل. */
function resyncEngravingWithQty(engraving: EngravingInfo | undefined, qty: number): EngravingInfo | undefined {
  if (!engraving || engraving.mode !== "perPiece") return engraving;
  const next = [...engraving.perPieceTexts];
  while (next.length < qty) next.push("");
  while (next.length > qty) next.pop();
  return { ...engraving, perPieceTexts: next };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { bundleRules, productRules } = useDiscountRules();

  const totalPieces = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  const addItem = (id: number): boolean => {
    if (totalPieces >= CONFIG.MAX_PIECES) return false;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        const newQty = existing.qty + 1;
        return prev.map((i) =>
          i.id === id ? { ...i, qty: newQty, engraving: resyncEngravingWithQty(i.engraving, newQty) } : i
        );
      }
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return prev;
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    return true;
  };

  const decrementItem = (id: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter((i) => i.id !== id);
      const newQty = existing.qty - 1;
      return prev.map((i) =>
        i.id === id ? { ...i, qty: newQty, engraving: resyncEngravingWithQty(i.engraving, newQty) } : i
      );
    });
  };

  const setEngraving = (id: number, engraving: EngravingInfo | undefined) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, engraving } : i)));
  };

  const clearCart = () => setItems([]);
  const qtyFor = (id: number) => items.find((i) => i.id === id)?.qty ?? 0;

  // كل منتج بياخد خصمه الخاص الأول (لو عنده عرض)، وبعدين خصم إجمالي القطع
  // بيتحسب على الإجمالي اللي فضل بعد خصومات المنتجات. رسوم النقش بتتحسب
  // لوحدها لكل سطر (بغض النظر عن نوع النقش، مصاريف الليزر بتتحسب للقطعة).
  const lines: CartLine[] = useMemo(
    () =>
      items.map((item) => {
        const lineSubtotal = item.price * item.qty;
        const productDiscountPercent = getProductDiscountPercent(productRules, item.name, item.qty);
        const productDiscountAmount = Math.round(lineSubtotal * (productDiscountPercent / 100));
        const engravingFee = item.engraving ? CONFIG.ENGRAVING_FEE_PER_PIECE * item.qty : 0;
        return {
          ...item,
          lineSubtotal,
          productDiscountPercent,
          productDiscountAmount,
          lineTotal: lineSubtotal - productDiscountAmount,
          engravingFee,
        };
      }),
    [items, productRules]
  );

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.lineSubtotal, 0), [lines]);
  const productDiscountTotal = useMemo(
    () => lines.reduce((s, l) => s + l.productDiscountAmount, 0),
    [lines]
  );
  const engravingFeeTotal = useMemo(() => lines.reduce((s, l) => s + l.engravingFee, 0), [lines]);
  const afterProductDiscount = subtotal - productDiscountTotal;
  // خصم الكمية دلوقتي قيمة ثابتة بالجنيه للقطعة الواحدة (مش نسبة %) — فبيفضل
  // نفس الخصم بالظبط سواء القطعة نحاس بيور أو نحاس مطلي فضة، أيًا كان سعرها.
  const bundleAmountPerPiece = getBundleDiscountAmount(bundleRules, totalPieces);
  const bundleDiscountAmount = Math.min(
    afterProductDiscount,
    Math.max(0, bundleAmountPerPiece) * totalPieces
  );
  const total = afterProductDiscount - bundleDiscountAmount;
  const totalDiscount = productDiscountTotal + bundleDiscountAmount;

  const bundleLabel =
    totalPieces === 0
      ? "لم يتم اختيار قطع بعد"
      : `${totalPieces} ${totalPieces === 1 ? "قطعة مختارة" : "قطع مختارة"}`;

  return (
    <CartContext.Provider
      value={{
        items,
        lines,
        totalPieces,
        subtotal,
        productDiscountTotal,
        bundleAmountPerPiece,
        bundleDiscountAmount,
        engravingFeeTotal,
        totalDiscount,
        total,
        bundleLabel,
        addItem,
        decrementItem,
        clearCart,
        qtyFor,
        setEngraving,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

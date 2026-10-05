import type { BundleDiscountRule, ProductDiscountRule, DiscountRules } from "./types";

// دي بس احتياطية تتستخدم قبل ما تجيب قواعد الخصم الحقيقية من جوجل شيت
// (أو لو الاتصال فشل) — القيم الفعلية دايمًا بتتقرأ من شيت الخصومات.
// من القطعة التانية فأكثر، كل قطعة في السلة (بيور أو مطلي فضة) بتاخد نفس
// خصم الـ50 جنيه بالظبط — قيمة ثابتة، مش نسبة %، عشان الخصم يفضل متسق
// بغض النظر عن سعر الخامة (199 → 149 للبيور، 299 → 249 للمطلي فضة).
export const DEFAULT_BUNDLE_RULES: BundleDiscountRule[] = [
  { pieces: 1, amount: 0 },
  { pieces: 2, amount: 50 },
];

export const DEFAULT_PRODUCT_RULES: ProductDiscountRule[] = [];

export const DEFAULT_DISCOUNT_RULES: DiscountRules = {
  bundle: DEFAULT_BUNDLE_RULES,
  product: DEFAULT_PRODUCT_RULES,
};

/**
 * أعلى قاعدة "من كذا قطعة فأكثر" تنطبق على إجمالي عدد القطع في السلة.
 * بترجع قيمة الخصم بالجنيه للقطعة الواحدة (0 لو مفيش قاعدة منطبقة).
 */
export function getBundleDiscountAmount(rules: BundleDiscountRule[], totalPieces: number): number {
  const applicable = rules
    .filter((r) => r.pieces <= totalPieces)
    .sort((a, b) => b.pieces - a.pieces);
  return applicable.length ? applicable[0].amount : 0;
}

/** أعلى قاعدة خصم تنطبق على منتج معين حسب الكمية المطلوبة منه في السلة. */
export function getProductDiscountPercent(
  rules: ProductDiscountRule[],
  productName: string,
  qty: number
): number {
  const applicable = rules
    .filter((r) => r.productName === productName && r.minQty <= qty)
    .sort((a, b) => b.minQty - a.minQty);
  return applicable.length ? applicable[0].percent : 0;
}

import type { Product } from "./types";

// كل تصميم بييجي بخامتين: نحاس بيور (تشطيب دهبي) ونحاس مطلي فضة (تشطيب فضي).
// 🔧 الأسعار هنا افتراضية — غيّريها زي ما تحبي، وكل حاجة (الكارت، الخصم،
// الملخص، الإيصال) هتحسب صح تلقائيًا:
//   - copperPrice / silverPrice = سعر القطعة الواحدة.
//   - خصم الكمية (من القطعة التانية فأكثر) بيتحسب تلقائيًا كنسبة % من
//     BundleDiscounts في lib/discounts.ts (حاليًا 25% ≈ 199 → 149 للبيور).
interface Design {
  id: number;
  name: string;
  copperPrice: number;
  silverPrice: number;
}

const DESIGNS: Design[] = [
  { id: 1, name: "قناع توت عنخ آمون", copperPrice: 199, silverPrice: 299 },
  { id: 2, name: "نفرتيتي", copperPrice: 199, silverPrice: 299 },
  { id: 3, name: "الملك رمسيس", copperPrice: 199, silverPrice: 299 },
  { id: 4, name: "أنوبيس", copperPrice: 199, silverPrice: 299 },
  { id: 5, name: "عين حورس", copperPrice: 199, silverPrice: 299 },
  { id: 6, name: "مفتاح الحياة", copperPrice: 199, silverPrice: 299 },
  { id: 7, name: "الأهرامات", copperPrice: 199, silverPrice: 299 },
  { id: 8, name: "جعران الحماية", copperPrice: 199, silverPrice: 299 },
  { id: 9, name: "أبو الهول", copperPrice: 199, silverPrice: 299 },
  { id: 10, name: "كليوباترا", copperPrice: 199, silverPrice: 299 },
  { id: 11, name: "زهرة اللوتس", copperPrice: 199, silverPrice: 299 },
];

const SLUGS: Record<number, string> = {
  1: "mask",
  2: "nefertiti",
  3: "ramses",
  4: "anubis",
  5: "eye_of_horus",
  6: "ankh",
  7: "pyramid",
  8: "scarab",
  9: "sphinx",
  10: "cleopatra",
  11: "lotus",
};

const CATEGORY = "مجموعة الفراعنة";

export const PRODUCTS: Product[] = DESIGNS.flatMap((d) => {
  const slug = SLUGS[d.id];
  return [
    {
      id: d.id * 10 + 1,
      name: `${d.name} (نحاس بيور)`,
      designName: d.name,
      finish: "copper" as const,
      finishLabel: "نحاس بيور",
      category: CATEGORY,
      price: d.copperPrice,
      image: `/products/${slug}-copper.jpg`,
    },
    {
      id: d.id * 10 + 2,
      name: `${d.name} (نحاس مطلي فضة)`,
      designName: d.name,
      finish: "silver" as const,
      finishLabel: "نحاس مطلي فضة",
      category: CATEGORY,
      price: d.silverPrice,
      image: `/products/${slug}-silver.jpg`,
    },
  ];
});

// المنتجات مجمّعة حسب التصميم (خامتين لكل تصميم) — لعرض كارت واحد لكل
// قطعة فيه تبديل الخامة، بدل ما يتكرر نفس التصميم مرتين في الصفحة.
export const PRODUCT_GROUPS: Product[][] = DESIGNS.map((d) =>
  PRODUCTS.filter((p) => p.designName === d.name)
);

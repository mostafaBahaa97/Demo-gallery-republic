"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/hooks/useCart";
import { useDiscountRules } from "@/hooks/useDiscountRules";
import { getBundleDiscountAmount } from "@/lib/discounts";
import { QtyControl } from "./QtyControl";
import { Reveal } from "./Reveal";
import { EngravingLineEditor } from "./EngravingLineEditor";
import { THEME_MODE } from "@/lib/config";

const fmt = (n: number) => n.toLocaleString("ar-EG") + " ج.م";

const corners = [
  "top-3 left-3 border-t border-l",
  "top-3 right-3 border-t border-r",
  "bottom-3 left-3 border-b border-l",
  "bottom-3 right-3 border-b border-r",
];

const cornerDots = ["top-2.5 left-2.5", "top-2.5 right-2.5", "bottom-2.5 left-2.5", "bottom-2.5 right-2.5"];

/** كارت قطعة واحدة بيها فاريانتين (نحاس بيور / نحاس مطلي فضة) — العميلة
 * تختار الخامة أولًا وبعدين تتحكم في الكمية على أساسها. */
export function ProductCard({ variants, index }: { variants: Product[]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [finish, setFinish] = useState<Product["finish"]>(variants[0].finish);
  const isReversed = index % 2 === 1;
  const isPharaonic = THEME_MODE === "pharaonic";

  const active = variants.find((v) => v.finish === finish) ?? variants[0];
  const isPlaceholder = !active.image;

  const { totalPieces, bundleAmountPerPiece, qtyFor, setEngraving, items } = useCart();
  const { bundleRules } = useDiscountRules();

  const activeQty = qtyFor(active.id);
  const activeEngraving = items.find((i) => i.id === active.id)?.engraving;

  // السعر الفعلي دلوقتي (بيتفعّل أوتوماتيك بمجرد ما إجمالي القطع في السلة يوصل 2)
  // خصم ثابت بالجنيه لكل قطعة، بغض النظر عن سعرها الأصلي (بيور أو مطلي فضة).
  const isBundleActive = bundleAmountPerPiece > 0;
  const bundleUnitPrice = Math.max(0, active.price - bundleAmountPerPiece);
  // نفس الخصم لو هتضيفي قطعة تانية دلوقتي (بيتعرض كإغراء قبل ما توصلي لـ2 قطع)
  const nextTierAmount = getBundleDiscountAmount(bundleRules, Math.max(totalPieces + 1, 2));

  return (
    <Reveal>
      <article
        className={`flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-ivorysoft md:flex-row ${
          isReversed ? "md:flex-row-reverse" : ""
        }`}
      >
        <div
          className="relative aspect-square overflow-hidden bg-[radial-gradient(ellipse_at_center,#2a2018_0%,#1c140d_100%)] md:w-2/5"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              {active.image && (
                <Image
                  src={active.image}
                  alt={active.name}
                  fill
                  unoptimized={isPlaceholder}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  // object-contain (مش cover) عشان الصورة كلها تبان دايمًا من غير قص —
                  // الزوم البسيط بيحصل بس عند الهوفر (overflow-hidden بيقص الزيادة وقتها فقط).
                  className={`object-contain transition-transform duration-700 ${hovered ? "scale-110" : "scale-100"}`}
                />
              )}
            </motion.div>
          </AnimatePresence>
          {corners.map((pos) => (
            <span
              key={pos}
              className={`absolute h-6 w-6 border-gold transition-all duration-500 ${pos} ${
                hovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            />
          ))}
          {isPharaonic &&
            cornerDots.map((pos) => (
              <span
                key={pos}
                className={`absolute h-1.5 w-1.5 rounded-full bg-gold transition-all duration-500 ${pos} ${
                  hovered ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              />
            ))}
        </div>

        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium tracking-[0.25em] text-gold">{active.category}</p>
            {!isBundleActive && nextTierAmount > 0 && (
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[18px] font-medium text-golddeep">
                من القطعة الثانية بـ{fmt(Math.max(0, active.price - nextTierAmount))}
              </span>
            )}
          </div>

          <h3 className="mb-3 font-display text-2xl text-ink">{active.designName}</h3>

          {/* اختيار الخامة */}
          <div className="mb-5 flex gap-2" role="radiogroup" aria-label="اختاري الخامة">
            {variants.map((v) => (
              <button
                key={v.finish}
                type="button"
                role="radio"
                aria-checked={v.finish === finish}
                onClick={() => setFinish(v.finish)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  v.finish === finish
                    ? "border-gold bg-gold text-ink"
                    : "border-[var(--line)] text-umber/70 hover:border-gold hover:text-ink"
                }`}
              >
                {v.finishLabel}
              </button>
            ))}
          </div>

          <p className="mb-5 flex items-center gap-1.5 text-xs text-umber/55">
            <PenLine size={13} className="text-golddeep" />
            متاح حفر اسمك أو لوجو بالليزر على القطعة
          </p>

          <div className="flex items-center justify-between gap-4">
            <AnimatePresence mode="wait">
              {isBundleActive ? (
                <motion.div
                  key={`discounted-${active.finish}`}
                  className="flex items-baseline gap-2"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="relative font-latin text-sm text-umber/50">
                    {fmt(active.price)}
                    <motion.span
                      className="absolute inset-y-1/2 left-0 h-[1.5px] -translate-y-1/2 bg-umber/60"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    />
                  </span>
                  <motion.span
                    className="font-latin text-xl font-semibold text-gold"
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    {fmt(bundleUnitPrice)}
                  </motion.span>
                </motion.div>
              ) : (
                <motion.span
                  key={`normal-${active.finish}`}
                  className="font-latin text-xl text-ink"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {fmt(active.price)}
                </motion.span>
              )}
            </AnimatePresence>
            <QtyControl productId={active.id} />
          </div>

          <EngravingLineEditor
            qty={activeQty}
            value={activeEngraving}
            onChange={(next) => setEngraving(active.id, next)}
          />
        </div>
      </article>
    </Reveal>
  );
}

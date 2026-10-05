"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CheckoutForm } from "./CheckoutForm";
import { OrderSummary } from "./OrderSummary";
import { Reveal } from "./Reveal";
import { WingedSunDivider } from "./pharaonic/WingedSunDivider";
import { THEME_MODE } from "@/lib/config";

interface SuccessInfo {
  orderId: string;
  firstName: string;
}

export function CheckoutSection() {
  const { items } = useCart();
  const [governorate, setGovernorate] = useState("");
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPharaonic = THEME_MODE === "pharaonic";

  const hasItems = items.length > 0;

  const handleSuccess = (orderId: string, firstName: string) => {
    setSuccessInfo({ orderId, firstName });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSuccessInfo(null), 6000);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <section
      id="checkout"
      className="papyrus-texture border-t border-[var(--line)] bg-ivorysoft py-24 md:py-32"
    >
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Reveal className="mb-14 text-center">
          {isPharaonic && <WingedSunDivider tone="dark" className="mb-8" />}
          <p className="mb-3 text-xs font-medium tracking-[0.3em] text-gold">الخطوة الأخيرة</p>
          <h2 className="mb-4 font-display text-3xl text-ink md:text-5xl">أكملي طلبك</h2>
          <p className="mx-auto max-w-xl leading-7 text-umber/80">
            اختاري قطعك من المجموعة أعلاه أولًا، وستظهر بيانات التوصيل تلقائيًا لإكمال الطلب.
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-5 md:gap-12">
          <div className="order-2 md:order-1 md:col-span-3">
            <AnimatePresence mode="wait">
              {successInfo ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-[var(--line)] bg-white p-10 text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check size={26} strokeWidth={2.4} />
                  </div>
                  <h3 className="mb-2 font-display text-2xl text-ink">
                    {successInfo.firstName
                      ? `شكرًا لك يا ${successInfo.firstName} `
                      : "تم استلام طلبك"}
                  </h3>
                  <p className="mb-1 text-umber/80">
                    رقم الطلب: <span className="font-semibold text-ink">{successInfo.orderId}</span>
                  </p>
                  <p className="text-sm text-umber/70">
                    هنتواصل معك على رقم الهاتف لتأكيد الطلب قبل الشحن.
                  </p>
                </motion.div>
              ) : hasItems ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <CheckoutForm
                    governorate={governorate}
                    onGovernorateChange={setGovernorate}
                    onSuccess={handleSuccess}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center"
                >
                  <p className="leading-7 text-umber/70">
                    لسه محددتيش أي قطعة. ارجعي لأعلى واضغطي &quot;أضيفي للطلب&quot; على القطعة
                    اللي عجبتك.
                  </p>
                  <a
                    href="#products"
                    className="mt-4 inline-block border-b border-gold pb-0.5 font-medium text-gold"
                  >
                    تصفّحي المجموعة ↑
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="order-1 md:order-2 md:col-span-2">
            <OrderSummary governorate={governorate} />
          </aside>
        </div>
      </div>
    </section>
  );
}

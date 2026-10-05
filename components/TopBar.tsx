"use client";

import { useEffect, useRef } from "react";
import { PromoBar } from "./PromoBar";
import { Header } from "./Header";

/**
 * بتجمع شريط العرض الترويجي (لو مفعّل) والهيدر جوه حاوية ثابتة واحدة فوق
 * الصفحة، وبتحسب ارتفاعهم الحقيقي (اللي بيتغيّر حسب طول رسالة العرض أو لو
 * الشريط مش ظاهر أصلًا) وتحطه في متغيّر CSS، عشان قسم الـ Hero يعرف يسيب
 * مساحة كافية تحتهم بالظبط من غير ما نثبّت رقم يدويًا ممكن يبقى غلط.
 */
export function TopBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setVar = () => {
      document.documentElement.style.setProperty("--top-stack-height", `${el.offsetHeight}px`);
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="fixed inset-x-0 top-0 z-40">
      <PromoBar />
      <Header />
    </div>
  );
}

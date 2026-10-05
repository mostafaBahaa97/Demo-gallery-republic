"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MIN_SCALE = 0.95;

export function FitBox({ children, className }: { children: ReactNode; className?: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = () => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // نقيس الحجم الطبيعي الأول (scale 1) قبل ما نقرر هل محتاجين نصغّر
    inner.style.transform = "scale(1)";
    const outerHeight = outer.clientHeight;
    const innerHeight = inner.scrollHeight;

    if (innerHeight > outerHeight && outerHeight > 0) {
      const next = Math.max(MIN_SCALE, outerHeight / innerHeight);
      setScale(next);
    } else {
      setScale(1);
    }
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  // مهم جدًا: مقاس الفاتورة على الشاشة (250px) مختلف عن مقاسها الحقيقي وقت
  // الطباعة الفعلية (95mm) — فلازم نعيد القياس تحديدًا وقت ما المتصفح يبدّل
  // لتنسيق الطباعة (@media print)، وإلا الـ scale المحسوب هيفضل مبني على
  // مقاس غلط ويقص العنوان أو يصغّر الخط من غير داعي.
  useEffect(() => {
    const remeasure = () => {
      // نستنى فريمين عشان نضمن إن تنسيق @media print اتطبق فعليًا على الصفحة
      requestAnimationFrame(() => requestAnimationFrame(measure));
    };

    window.addEventListener("beforeprint", remeasure);
    let mql: MediaQueryList | null = null;
    const mqlHandler = (e: MediaQueryListEvent) => {
      if (e.matches) remeasure();
    };
    if (typeof window.matchMedia === "function") {
      mql = window.matchMedia("print");
      mql.addEventListener?.("change", mqlHandler);
    }

    return () => {
      window.removeEventListener("beforeprint", remeasure);
      mql?.removeEventListener?.("change", mqlHandler);
    };
  }, []);

  return (
    <div ref={outerRef} className={className} style={{ overflow: "hidden" }}>
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        {children}
      </div>
    </div>
  );
}

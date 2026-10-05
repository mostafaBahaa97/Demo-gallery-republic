"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { THEME_MODE } from "@/lib/config";

const MIN_VISIBLE_MS = 700; // أقل مدة ظهور (عشان مايحصلش "فلاش" سريع مزعج على النت السريع)
const MAX_WAIT_MS = 3200; // أقصى مدة انتظار (عشان مين على نت بطيء ميستناش للأبد)

/**
 * شاشة تحميل أولية خفيفة (شعار + خط ذهبي بيترسم + بريق خفيف) بتظهر لحد ما
 * صور الصفحة تخلص تحميل، أو لحد ما توقيت أقصى معقول يعدي (أيهما أسرع).
 * مفيهاش أي صور تقيلة إضافية — بس الشعار الموجود بالفعل في الموقع.
 */
export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const mountedAt = Date.now();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      const elapsed = Date.now() - mountedAt;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => setVisible(false), 500); // مدة الفيد آوت
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }
    const maxTimer = setTimeout(finish, MAX_WAIT_MS);

    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(maxTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink transition-opacity duration-500 ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="جاري تحميل الموقع"
    >
      <div className="loader-shimmer relative flex flex-col items-center overflow-hidden px-10 py-6">
        <div className="relative mb-4 h-16 w-16 animate-[fadeUp_0.6s_ease-out_forwards] opacity-0 sm:h-20 sm:w-20">
          <Image src="/logo.png" alt="Gallery Republic" fill sizes="80px" priority />
        </div>
        <p
          className="mb-3 animate-[fadeUp_0.6s_0.15s_ease-out_forwards] whitespace-nowrap font-latin text-sm tracking-[0.4em] text-ivory opacity-0 sm:text-base"
        >
          GALLERY REPUBLIC
        </p>
        <span className="h-px w-0 bg-gold loader-line" />
        {THEME_MODE === "pharaonic" && (
          <p className="mt-3 animate-[fadeUp_0.6s_0.3s_ease-out_forwards] text-[11px] tracking-[0.3em] text-goldsoft opacity-0">
            مجموعة الفراعنة
          </p>
        )}
      </div>
    </div>
  );
}

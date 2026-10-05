"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { callApi } from "@/lib/api";
import type { PromoConfig } from "@/lib/types";

const STORAGE_KEY = "gr_promo_countdown";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * شريط إعلاني رفيع أعلى الموقع (فوق الهيدر) بيعرض رسالة العرض الحالي +
 * عدّاد تنازلي حي. العدّاد شخصي لكل عميلة ومخزّن في localStorage بحيث لو
 * قفلت المتصفح ورجعت بعد ساعة، يكمل من نفس المكان (مش يبدأ من الأول).
 *
 * لما العدّاد يوصل صفر عند عميلة معينة، بيبدأ دورة جديدة تلقائيًا ليها هي
 * بس (بتتعامل كأنها عميلة جديدة). أما لو الأدمن حفظ عرض جديد من لوحة
 * التحكم، كل العملاء (حتى اللي عدّادهم لسه شغال) بيتصفّروا ويبدأوا من
 * الأول، عن طريق "نسخة" (version) بتتغيّر مع كل حفظ.
 */
export function PromoBar() {
  const [config, setConfig] = useState<PromoConfig | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    callApi<{ promo: PromoConfig }>({ action: "getPromoConfig" })
      .then((result) => {
        if (cancelled) return;
        if (result.ok && result.promo) {
          setConfig(result.promo);
        } else if (!result.ok) {
          // مش هيبان للعميلة (الشريط ببساطة مش هيظهر)، بس بيسهّل تشخيص أي
          // مشكلة في الباك إند من أدوات المطور (Console) وقت الحاجة.
          console.warn("PromoBar: تعذّر تحميل إعدادات العرض —", result.error);
        }
      })
      .catch((err) => {
        console.warn("PromoBar: فشل الاتصال بالباك إند —", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config || !config.enabled) return;

    const durationMs = Math.max(0.1, config.durationHours) * 3600 * 1000;

    const readStored = (): { version: string; deadline: number } | null => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      } catch {
        return null;
      }
    };

    const persist = (deadline: number) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: config.version, deadline }));
      } catch {
        /* لو التخزين مش متاح (وضع خاص مثلًا)، العدّاد لسه بيشتغل، بس هيبدأ من
           جديد في كل تحميل صفحة — تدهور بسيط مقبول، مش خطأ يوقف الموقع */
      }
    };

    let deadline: number;
    const stored = readStored();
    const now = Date.now();
    if (stored && stored.version === config.version && stored.deadline > now) {
      deadline = stored.deadline;
    } else {
      deadline = now + durationMs;
      persist(deadline);
    }

    const tick = () => {
      const current = Date.now();
      let remaining = deadline - current;
      if (remaining <= 0) {
        // انتهت الدورة عند العميلة دي بس — تبدأ تانية تلقائيًا من غير أي تدخل
        deadline = current + durationMs;
        persist(deadline);
        remaining = deadline - current;
      }
      setRemainingMs(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (!config || !config.enabled || !config.message || remainingMs === null) return null;

  return (
    <div className="bg-ink px-4 py-2 text-center text-ivory">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="text-xs font-medium leading-snug sm:text-sm">{config.message}</span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 font-latin text-xs font-semibold tabular-nums text-gold sm:text-sm">
          <Clock size={13} />
          {formatRemaining(remainingMs)}
        </span>
      </div>
    </div>
  );
}
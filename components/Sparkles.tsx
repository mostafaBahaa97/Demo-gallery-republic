"use client";

import { useEffect, useState } from "react";

interface SparkleSpec {
  id: number;
  top: number;
  left: number;
  delay: number;
  duration: number;
  isStar: boolean;
  size: number;
}

function generateSparkles(count: number, starRatio: number): SparkleSpec[] {
  return Array.from({ length: count }, (_, i) => {
    const isStar = Math.random() < starRatio;
    return {
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 2.6 + Math.random() * 2.8,
      isStar,
      size: isStar ? 10 + Math.round(Math.random() * 8) : 2 + Math.round(Math.random() * 2),
    };
  });
}

export function Sparkles({ count = 24, starRatio = 0.18 }: { count?: number; starRatio?: number }) {
  const [sparkles, setSparkles] = useState<SparkleSpec[]>([]);

  // بنولّد المواقع بعد mount بس عشان نتجنب اختلاف السيرفر/العميل (hydration mismatch)
  useEffect(() => {
    setSparkles(generateSparkles(count, starRatio));
  }, [count, starRatio]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {sparkles.map((s) =>
        s.isStar ? (
          <svg
            key={s.id}
            className="sparkle-star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
            width={s.size}
            height={s.size}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
          </svg>
        ) : (
          <span
            key={s.id}
            className="sparkle-dot"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        )
      )}
    </div>
  );
}

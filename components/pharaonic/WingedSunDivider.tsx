import Image from "next/image";
import { PHARAONIC } from "./palette";

/**
 * العنصر التوقيعي للثيم الفرعوني — شعار الجعران المجنّح (نفس الشعار الموجود
 * في بوستر الحملة نفسه، مقصوص منه مباشرة). بيتكرر بنفس الشكل في كل نقطة
 * انتقال بين الأقسام (زي ختم واحد بيفتح كل قسم)، عشان يبقى العنصر اللي
 * الصفحة "تتفتكر" بيه من غير ما نكرر زخارف مختلفة في كل مكان.
 */
export function WingedSunDivider({
  tone = "gold",
  className = "",
}: {
  tone?: "gold" | "dark";
  className?: string;
}) {
  const stroke = tone === "gold" ? PHARAONIC.gold : PHARAONIC.golddeep;

  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-10 sm:w-20" style={{ background: stroke, opacity: 0.5 }} />
      <span className="relative h-6 w-16 shrink-0 sm:h-7 sm:w-20">
        <Image src="/pharaonic/scarab-emblem.png" alt="" fill className="object-contain" />
      </span>
      <span className="h-px w-10 sm:w-20" style={{ background: stroke, opacity: 0.5 }} />
    </div>
  );
}

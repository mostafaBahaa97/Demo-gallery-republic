"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "./Sparkles";
import { WingedSunDivider } from "./pharaonic/WingedSunDivider";
import { THEME_MODE } from "@/lib/config";

// أنيميشن الظهور من أسفل لأعلى
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

// أنيميشن طفو مستمر لشعار الشمس المجنحة
const float = {
  hidden: { y: 0 },
  visible: {
    y: [-4, 4, -4],
    transition: { duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as any },
  },
};

export function Hero() {
  const isPharaonic = THEME_MODE === "pharaonic";

  return (
    <section 
      id="top" 
      className="relative flex min-h-[95vh] items-center overflow-hidden bg-[#0a0e17]"
      style={{ paddingTop: "var(--top-stack-height, 5rem)" }}
      dir="rtl" // لضمان اتجاه النص من اليمين لليسار
    >
      {/* --- 1. طبقة الخلفية (Background) --- */}
      {isPharaonic && (
        <div className="absolute inset-0 z-0">
          <Image
            src="/pharaonic/pharaoh-bust.png" // تأكد من وضع الصورة بهذا الاسم
            alt="Pharaonic Background"
            fill
            className="object-cover object-left md:object-left"
            priority
            quality={90}
          />
          {/* تدرج لوني لحماية النص: داكن على اليمين وشفاف على اليسار */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#0a0e17] via-[#0a0e17]/80 to-transparent md:via-[#0a0e17]/60" />
        </div>
      )}

      {/* --- 2. طبقة اللمعان (Sparkles) --- */}
      <div className="absolute inset-0 z-0 opacity-70">
        <Sparkles count={40} starRatio={0.2} />
      </div>

      {/* --- 3. طبقة المحتوى (Content) --- */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 md:grid-cols-2 md:px-8">
        
        {/* القسم الأيمن: النصوص والأزرار */}
        <div className="flex flex-col items-start pt-10 md:pt-0">
          {isPharaonic && (
            <motion.div
              variants={float}
              initial="hidden"
              animate="visible"
              className="mb-8 w-full max-w-[240px]"
            >
              {/* تأكد من أن مكون WingedSunDivider يأخذ ألوان Tailwind */}
              <WingedSunDivider className="justify-start text-[#D4AF37]" />
            </motion.div>
          )}

          <motion.p
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-4 text-sm font-bold tracking-[0.2em] text-[#D4AF37]"
          >
            {isPharaonic ? "مجموعة الفراعنة — GALLERY REPUBLIC" : "معرض إكسسوارات مُنتقى — GALLERY REPUBLIC"}
          </motion.p>

          <motion.h1
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 font-display text-5xl font-bold leading-[1.3] text-white md:text-7xl"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
          >
            {isPharaonic ? (
              <>
                رموز القوة،
                <br />
                <span className="bg-gradient-to-r from-[#F9E596] to-[#D4AF37] bg-clip-text text-transparent">
                  من حضارة خالدة
                </span>
              </>
            ) : (
              <>
                قطعة تُختار بعناية،
                <br />
                لإطلالة تستحق الإطار
              </>
            )}
          </motion.h1>

          <motion.p
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-10 max-w-md text-lg leading-relaxed text-gray-300 md:text-xl"
          >
            {isPharaonic
              ? "أحد عشر رمزًا من مصر القديمة، بخامتين: نحاس بيور أو نحاس مطلي فضة. توصيل إلى جميع محافظات مصر، والدفع عند الاستلام."
              : "اثنتا عشرة قطعة من مجموعتنا الحالية، منتقاة كما تُنتقى الأعمال الفنية للعرض. توصيل إلى جميع محافظات مصر، والدفع عند الاستلام."}
          </motion.p>

          <motion.div
            custom={0.7}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-wrap items-center gap-5"
          >
            {/* الزر الرئيسي */}
            <a
              href="#products"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-8 py-4 font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]"
            >
              <span className="relative z-10">تصفّحي المجموعة</span>
              <div className="absolute inset-0 z-0 h-full w-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </a>
            
            {/* الزر الثانوي */}
            <a
              href="#checkout"
              className="group flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-transparent px-8 py-4 font-semibold text-[#D4AF37] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <span>اذهبي مباشرة للطلب</span>
              <span className="transition-transform duration-300 group-hover:-translate-x-2">←</span>
            </a>
          </motion.div>
        </div>

        {/* القسم الأيسر: تركناه فارغاً ليسمح بظهور خلفية الفرعون، وفي الثيم العادي يمكن وضع الـ SVG */}
        {!isPharaonic && (
          <div className="relative hidden md:flex items-center justify-center">
            {/* ضع هنا كود الـ SVG الخاص بالثيم العادي الذي كان في الكود القديم */}
          </div>
        )}
      </div>

      {/* --- 4. الشريط السفلي (Footer Text) --- */}
      <motion.div 
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute inset-x-0 bottom-6 text-center text-sm tracking-widest text-white/40"
      >
        التوصيل لكل محافظات مصر · الدفع عند الاستلام
      </motion.div>
    </section>
  );
}
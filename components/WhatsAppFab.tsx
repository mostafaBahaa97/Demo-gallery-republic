"use client";

import { CONFIG } from "@/lib/config";

function WhatsAppGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.46 1.29 4.9L2 22l5.31-1.39a9.87 9.87 0 0 0 4.73 1.2h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2Zm5.8 14.14c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.02.24-3.4-.71-2.9-1.16-4.77-4.06-4.92-4.25-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2 .9 2.15.07.15.12.32.02.51-.1.19-.15.31-.3.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2 1.11.99 2.04 1.3 2.33 1.44.29.15.46.13.63-.08.17-.2.71-.83.9-1.11.19-.29.38-.24.63-.14.26.1 1.63.77 1.91.91.29.15.48.22.55.34.07.13.07.72-.16 1.3Z" />
    </svg>
  );
}

/**
 * زرار عائم ثابت طول الوقت (بعكس FloatingCta اللي بيظهر بس لما السلة فيها
 * حاجة) — للتواصل المباشر مع العميلة. متسكّن على الجنب المقابل لـ FloatingCta
 * عشان الاتنين ميتصادموش على الموبايل.
 */
export function WhatsAppFab() {
  const href = `https://wa.me/${CONFIG.WHATSAPP_PHONE}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="تواصلي معنا على واتساب"
      className="fixed bottom-24 start-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl ring-2 ring-gold/70 transition-transform hover:scale-105 whatsapp-fab-bounce md:bottom-8 md:start-8 md:h-14 md:w-14"
    >
      <WhatsAppGlyph />
    </a>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";

export function FloatingCta() {
  const { totalPieces } = useCart();

  const handleClick = () => {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      document.getElementById("fldName")?.focus({ preventScroll: true });
    }, 500);
  };

  return (
    <AnimatePresence>
      {totalPieces > 0 && (
        <motion.button
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={handleClick}
          className="fixed inset-x-5 bottom-5 z-40 rounded-full bg-gold px-6 py-3.5 font-semibold text-ink shadow-xl md:inset-x-auto md:end-8"
        >
          أكملي طلبك ({totalPieces}) ←
        </motion.button>
      )}
    </AnimatePresence>
  );
}

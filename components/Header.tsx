"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function Header() {
  const [isSolid, setIsSolid] = useState(false);
  const { totalPieces } = useCart();

  useEffect(() => {
    const hero = document.getElementById("top");
    const header = document.getElementById("site-header");
    const threshold = () => {
      const heroHeight = hero?.offsetHeight ?? 600;
      const headerHeight = header?.offsetHeight ?? 80;
      return Math.max(heroHeight - headerHeight - 60, 120);
    };
    const onScroll = () => setIsSolid(window.scrollY > threshold());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="site-header"
      className={`inset-x-0 top-0 transition-all duration-500 ${
        isSolid
          ? "border-b border-[var(--line)] bg-ivory/90 shadow-[0_6px_24px_rgba(36,26,18,0.06)] backdrop-blur-md"
          : "border-b border-transparent  "
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Gallery Republic"
            width={256}
            height={256}
            className={`h-13 w-13 rounded-full md:h-14 md:w-14 ${isSolid ? "shadow-[0_6px_24px_rgba(36,26,18,0.06)] bg-black" : "shadow-[0_6px_24px_rgba(36,26,18,0.02)]"}`} 
          />
          <div className="flex flex-col leading-tight items-center">
          <span
            className={`font-latin text-xl italic tracking-wide transition-colors duration-500 md:text-2xl ${
              isSolid ? "text-ink" : "text-ivory"
            }`}
          >
            Gallery Republic
            <span className="sr-only"> - معرض إكسسوارات نسائية فاخرة</span>
          </span>
          <span className={`text-sm transition-colors duration-500 ${isSolid ? "text-ink/70" : "text-ivory/70"}`}>
            Ahmed Moustafa
          </span>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {[
            { href: "#products", label: "المجموعة" },
            { href: "#checkout", label: "أطلبي الآن" },
            { href: "#site-footer", label: "تواصلي معنا" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-medium transition-colors duration-500 hover:text-gold ${
                isSolid ? "text-umber" : "text-ivory"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#checkout"
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-500 ${
            isSolid ? "border-[var(--line)] text-ink" : "border-ivory/50 text-ivory"
          }`}
        >
          <ShoppingBag size={16} strokeWidth={1.8} />
          <span>طلبك ({totalPieces})</span>
        </a>
      </div>
    </header>
  );
}

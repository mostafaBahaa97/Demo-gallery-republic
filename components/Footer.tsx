import Image from "next/image";
import { Phone, MapPin } from "lucide-react";
import { SITE, THEME_MODE } from "@/lib/config";
import { Sparkles } from "./Sparkles";
import { WingedSunDivider } from "./pharaonic/WingedSunDivider";

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  );
}

export function Footer() {
  const isPharaonic = THEME_MODE === "pharaonic";

  return (
    <footer id="site-footer" className="relative overflow-hidden bg-ink pb-8 pt-14 text-ivory">
      <Sparkles count={16} starRatio={0.15} />

      {isPharaonic && <WingedSunDivider className="relative mb-10" />}

      <div className="relative mx-auto mb-14 grid max-w-6xl gap-12 px-5 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Image src="/logo.png" alt="Gallery Republic" width={256} height={256} className="h-16 w-16 rounded-full" />
            <span className="font-latin text-xl italic">Gallery Republic</span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-ivory/60">
            معرض إكسسوارات نسائية فاخرة — قطع مُنتقاة بعناية لإطلالة استثنائية. توصيل لكل
            محافظات مصر، والدفع عند الاستلام.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wide text-goldsoft">تواصلي معنا</h4>
          <ul className="space-y-3 text-sm text-ivory/70">
            <li>
              <a
                href={`tel:${SITE.phoneDisplay}`}
                className="flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Phone size={15} /> {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 transition-colors hover:text-gold"
              >
                <FacebookIcon /> فيسبوك
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 transition-colors hover:text-gold"
              >
                <InstagramIcon /> إنستجرام
              </a>
            </li>
            <li>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 transition-colors hover:text-gold"
              >
                <MapPin size={15} /> موقعنا على الخريطة
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wide text-goldsoft">روابط سريعة</h4>
          <ul className="space-y-3 text-sm text-ivory/70">
            <li>
              <a href="#products" className="transition-colors hover:text-gold">
                المجموعة
              </a>
            </li>
            <li>
              <a href="#checkout" className="transition-colors hover:text-gold">
                أطلبي الآن
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 border-t border-[var(--line-dark)] px-5 pt-6 text-xs text-ivory/40 md:flex-row md:px-8">
          <Image src="/mostafa.ico" alt="Gallery Republic" width={256} height={256} className="h-10 w-10" />
        <p>
          صُمم وبُرمج بواسطة{" "}
          <a
            href={SITE.portfolioUrl}
            target="_blank"
            rel="noopener"
            className="font-medium text-goldsoft transition-colors hover:text-gold"
          > 
            Mostafa Bahaa
          </a>
        </p>
      </div>
    </footer>
  );
}

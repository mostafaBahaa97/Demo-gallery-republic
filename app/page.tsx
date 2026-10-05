import { DiscountRulesProvider } from "@/hooks/useDiscountRules";
import { CartProvider } from "@/hooks/useCart";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { ProductsSection } from "@/components/ProductsSection";
import { CheckoutSection } from "@/components/CheckoutSection";
import { Footer } from "@/components/Footer";
import { FloatingCta } from "@/components/FloatingCta";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { LoadingScreen } from "@/components/LoadingScreen";
import { THEME_MODE } from "@/lib/config";

export default function Home() {
  // data-theme هنا هو المفتاح الوحيد اللي بيفعّل الثيم الفرعوني (شوفي
  // app/globals.css و lib/config.ts). لوحة التحكم /admin مش جواه، فبتفضل
  // بشكلها الأصلي دايمًا مهما كان THEME_MODE.
  return (
    <div data-theme={THEME_MODE === "pharaonic" ? "pharaonic" : undefined}>
      <LoadingScreen />
      <DiscountRulesProvider>
        <CartProvider>
          <TopBar />
          <Hero />
          <ProductsSection />
          <CheckoutSection />
          <Footer />
          <FloatingCta />
          <WhatsAppFab />
        </CartProvider>
      </DiscountRulesProvider>
    </div>
  );
}

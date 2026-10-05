import { PRODUCT_GROUPS } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { WingedSunDivider } from "./pharaonic/WingedSunDivider";
import { THEME_MODE } from "@/lib/config";

export function ProductsSection() {
  const isPharaonic = THEME_MODE === "pharaonic";

  return (
    <section id="products" className="papyrus-texture bg-ivory py-24 md:py-32">
      <Reveal className="mx-auto mb-16 max-w-3xl px-5 text-center md:px-8">
        {isPharaonic && <WingedSunDivider tone="dark" className="mb-8" />}
        <p className="mb-3 text-xs font-medium tracking-[0.3em] text-gold">مجموعة الفراعنة</p>
        <h2 className="mb-4 font-display text-3xl text-ink md:text-5xl">11 رمزًا، بلا تكرار</h2>
        <p className="leading-7 text-umber/80">
          كل قطعة متاحة بخامتين: نحاس بيور أو نحاس مطلي فضة. اختاري حتى عشر قطع لطلب واحد.
        </p>
      </Reveal>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 md:gap-10 md:px-8">
        {PRODUCT_GROUPS.map((variants, i) => (
          <ProductCard key={variants[0].designName} variants={variants} index={i} />
        ))}
      </div>
    </section>
  );
}

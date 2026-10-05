"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { callApi } from "@/lib/api";
import { DEFAULT_DISCOUNT_RULES } from "@/lib/discounts";
import type { BundleDiscountRule, ProductDiscountRule } from "@/lib/types";

interface DiscountRulesContextValue {
  bundleRules: BundleDiscountRule[];
  productRules: ProductDiscountRule[];
  loading: boolean;
  refetch: () => void;
}

const DiscountRulesContext = createContext<DiscountRulesContextValue | null>(null);

export function DiscountRulesProvider({ children }: { children: ReactNode }) {
  const [bundleRules, setBundleRules] = useState<BundleDiscountRule[]>(
    DEFAULT_DISCOUNT_RULES.bundle
  );
  const [productRules, setProductRules] = useState<ProductDiscountRule[]>(
    DEFAULT_DISCOUNT_RULES.product
  );
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    callApi<{ bundle: BundleDiscountRule[]; product: ProductDiscountRule[] }>({
      action: "getDiscountRules",
    })
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          if (Array.isArray(result.bundle) && result.bundle.length) setBundleRules(result.bundle);
          if (Array.isArray(result.product)) setProductRules(result.product);
        }
      })
      .catch(() => {
        // بنسيب القيم الاحتياطية زي ما هي لو فشل الاتصال
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <DiscountRulesContext.Provider
      value={{ bundleRules, productRules, loading, refetch: () => setRefreshKey((k) => k + 1) }}
    >
      {children}
    </DiscountRulesContext.Provider>
  );
}

export function useDiscountRules() {
  const ctx = useContext(DiscountRulesContext);
  if (!ctx) throw new Error("useDiscountRules must be used within a DiscountRulesProvider");
  return ctx;
}

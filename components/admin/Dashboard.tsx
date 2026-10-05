"use client";

import Image from "next/image";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { OrdersTab } from "./OrdersTab";
import { InventoryTab } from "./InventoryTab";
import { DiscountsTab } from "./DiscountsTab";
import { PromoTab } from "./PromoTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { PrintLabelsModal } from "./PrintLabelsModal";
import type { Order } from "@/lib/types";

export function Dashboard({ token, onLogout, onAuthError }: { token: string; onLogout: () => void; onAuthError: () => void }) {
  const [tab, setTab] = useState<"orders" | "inventory" | "discounts" | "promo" | "analytics">("orders");
  const [refreshKey, setRefreshKey] = useState(0);
  const [printOrders, setPrintOrders] = useState<Order[] | null>(null);

  return (
    <div>
      <header className="bg-ink text-ivory">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={256} height={256} className="h-14 w-14 rounded-full" />
            <span className="font-latin italic">Gallery Republic — الإدارة</span>
          </div>
          <button onClick={onLogout} className="text-sm text-ivory/70 transition-colors hover:text-gold">
            تسجيل الخروج
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTab("orders")}
            className={`rounded-full px-5 py-2.5 text-sm font-medium ${
              tab === "orders" ? "bg-ink text-ivory" : "border border-[var(--line)] bg-white"
            }`}
          >
            الطلبات
          </button>
          
          <button
            onClick={() => setTab("inventory")}
            className={`rounded-full px-5 py-2.5 text-sm font-medium ${
              tab === "inventory" ? "bg-ink text-ivory" : "border border-[var(--line)] bg-white"
            }`}
          >
            المخزون
          </button>
          <button
            onClick={() => setTab("discounts")}
            className={`rounded-full px-5 py-2.5 text-sm font-medium ${
              tab === "discounts" ? "bg-ink text-ivory" : "border border-[var(--line)] bg-white"
            }`}
          >
            الخصومات
          </button>
          <button
            onClick={() => setTab("promo")}
            className={`rounded-full px-5 py-2.5 text-sm font-medium ${
              tab === "promo" ? "bg-ink text-ivory" : "border border-[var(--line)] bg-white"
            }`}
          >
            العرض الترويجي
          </button>
          <button
            onClick={() => setTab("analytics")}
            className={`rounded-full px-5 py-2.5 text-sm font-medium ${
              tab === "analytics" ? "bg-ink text-ivory" : "border border-[var(--line)] bg-white"
            }`}
          >
            التقارير
          </button>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="ms-auto flex items-center gap-2 text-sm text-umber transition-colors hover:text-gold"
          >
            <RefreshCw size={15} /> تحديث
          </button>
        </div>

        {tab === "orders" && (
          <OrdersTab token={token} onAuthError={onAuthError} onPrint={setPrintOrders} refreshKey={refreshKey} />
        )}
        {tab === "analytics" && (
          <AnalyticsTab token={token} onAuthError={onAuthError} refreshKey={refreshKey} />
        )}
        {tab === "inventory" && (
          <InventoryTab token={token} onAuthError={onAuthError} refreshKey={refreshKey} />
        )}
        {tab === "discounts" && (
          <DiscountsTab token={token} onAuthError={onAuthError} refreshKey={refreshKey} />
        )}
        {tab === "promo" && (
          <PromoTab token={token} onAuthError={onAuthError} refreshKey={refreshKey} />
        )}
      </div>

      {printOrders && <PrintLabelsModal orders={printOrders} onClose={() => setPrintOrders(null)} />}
    </div>
  );
}

import { CONFIG } from "@/lib/config";

const RATE_KEY = "gr_orders_log";

function recentOrderTimestamps(): number[] {
  if (typeof window === "undefined") return [];
  let arr: number[] = [];
  try {
    arr = JSON.parse(localStorage.getItem(RATE_KEY) || "[]");
  } catch {
    arr = [];
  }
  const cutoff = Date.now() - CONFIG.RATE_LIMIT.windowMs;
  arr = arr.filter((ts) => ts > cutoff);
  localStorage.setItem(RATE_KEY, JSON.stringify(arr));
  return arr;
}

export function canPlaceOrder(): boolean {
  return recentOrderTimestamps().length < CONFIG.RATE_LIMIT.max;
}

export function recordOrderPlaced(): void {
  if (typeof window === "undefined") return;
  const arr = recentOrderTimestamps();
  arr.push(Date.now());
  localStorage.setItem(RATE_KEY, JSON.stringify(arr));
}

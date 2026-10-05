import { CONFIG } from "./config";
import type { ApiResult } from "./types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * يحمي Google Sheets من الضغط أثناء الأزمات: كل الطلبات بتتبعت واحدة ورا
 * التانية مع تأخير بسيط + إعادة محاولة تلقائية عند الفشل.
 */
class RequestQueue {
  private queue: {
    task: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }[] = [];
  private busy = false;

  constructor(private delayMs = 350) {}

  push<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task: task as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.process();
    });
  }

  private async process() {
    if (this.busy) return;
    this.busy = true;
    while (this.queue.length) {
      const { task, resolve, reject } = this.queue.shift()!;
      try {
        resolve(await this.withRetry(task));
      } catch (err) {
        reject(err);
      }
      await sleep(this.delayMs + Math.random() * 200);
    }
    this.busy = false;
  }

  private async withRetry<T>(task: () => Promise<T>, attempts = 3): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await task();
      } catch (err) {
        if (i === attempts - 1) throw err;
        await sleep(500 * 2 ** i);
      }
    }
    throw new Error("unreachable");
  }
}

const apiQueue = new RequestQueue();

export async function callApi<T = Record<string, never>>(
  payload: Record<string, unknown>
): Promise<ApiResult<T>> {
  return apiQueue.push(async () => {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      // text/plain يتجنب CORS preflight اللي بيرفضه Google Apps Script
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("network");
    return res.json();
  });
}

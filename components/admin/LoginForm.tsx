"use client";

import Image from "next/image";
import { useState } from "react";
import { callApi } from "@/lib/api";

export function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await callApi<{ token: string }>({
        action: "login",
        username: username.trim(),
        password,
      });
      if (result.ok && result.token) {
        onLogin(result.token);
      } else {
        setError(result.error || "بيانات الدخول غير صحيحة.");
      }
    } catch {
      setError("خطا فى الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex flex-col items-center">
          <Image src="/logo.png" alt="Gallery Republic" width={150} height={150} className="mb-3 rounded-full bg-ink" />
          <h1 className="font-latin text-xl italic">Gallery Republic</h1>
          <p className="mt-1 text-sm text-umber/60">لوحة التحكم الداخلية</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-umber">اسم المستخدم</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-umber">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink py-3 font-semibold text-ivory transition-colors hover:bg-umber disabled:opacity-70"
          >
            {loading ? "جاري الدخول…" : "دخول"}
          </button>
          {error && <p className="text-center text-sm text-rose-700">{error}</p>}
        </div>
      </form>
    </div>
  );
}

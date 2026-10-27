"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "رمز الدخول غير صحيح");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-gradient-to-b from-black via-slate-950 to-black px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-amber-400/20 bg-white/5 p-8 text-center shadow-2xl"
      >
        <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-amber-400/70">
          <Image src="/images/logo.png" alt="logo" fill className="object-cover" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-amber-400">لوحة تحكم المالك</h1>
        <p className="mt-1 text-sm text-slate-400">أدخل رمز الدخول الخاص بك</p>

        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="رمز الدخول"
          className="mt-6 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-center text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
        />

        {error && <p className="mt-3 text-sm font-semibold text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-amber-400 py-3 font-bold text-black hover:bg-amber-300 disabled:opacity-50"
        >
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </main>
  );
}

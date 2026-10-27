"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Settings = {
  siteName: string;
  logoUrl: string;
  whatsappNumber: string;
  baridimobNumber: string;
  welcomeMessage: string;
  priceResearch: number;
  priceSummary: number;
  pricePptPer5Slides: number;
  chatTimeoutMinutes: number;
  ownerPasscode: string;
};

export default function SettingsForm() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.ok) setSettings(data.settings);
      });
  }, [router]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessage({ type: "error", text: data.error ?? "فشل حفظ الإعدادات" });
      } else {
        setSettings(data.settings);
        setMessage({ type: "success", text: "تم حفظ الإعدادات بنجاح ✅" });
      }
    } catch {
      setMessage({ type: "error", text: "تعذر الاتصال بالخادم" });
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <main dir="rtl" className="grid min-h-screen place-items-center bg-black text-white">
        جارٍ التحميل...
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-amber-400">إعدادات الموقع</h1>
          <Link href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/5">
            → رجوع للوحة التحكم
          </Link>
        </div>

        <div className="space-y-6 rounded-3xl border border-amber-400/20 bg-white/5 p-6">
          <Section title="الهوية">
            <Field label="اسم الموقع" value={settings.siteName} onChange={(v) => update("siteName", v)} />
            <Field label="رابط الشعار (Logo URL)" value={settings.logoUrl} onChange={(v) => update("logoUrl", v)} />
          </Section>

          <Section title="التواصل والدفع">
            <Field label="رقم الواتساب" value={settings.whatsappNumber} onChange={(v) => update("whatsappNumber", v)} dir="ltr" />
            <Field label="رقم حساب بريدي موب (BaridiMob)" value={settings.baridimobNumber} onChange={(v) => update("baridimobNumber", v)} dir="ltr" />
            <TextArea label="رسالة الترحيب" value={settings.welcomeMessage} onChange={(v) => update("welcomeMessage", v)} />
          </Section>

          <Section title="الأسعار (بالدينار الجزائري)">
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="سعر البحث" value={settings.priceResearch} onChange={(v) => update("priceResearch", v)} />
              <NumberField label="سعر الملخص" value={settings.priceSummary} onChange={(v) => update("priceSummary", v)} />
              <NumberField label="سعر 5 شرائح" value={settings.pricePptPer5Slides} onChange={(v) => update("pricePptPer5Slides", v)} />
            </div>
          </Section>

          <Section title="الوقت والأمان">
            <NumberField
              label="مدة صفحة الدفع (بالدقائق)"
              value={settings.chatTimeoutMinutes}
              onChange={(v) => update("chatTimeoutMinutes", v)}
            />
            <Field label="رمز دخول لوحة التحكم" value={settings.ownerPasscode} onChange={(v) => update("ownerPasscode", v)} dir="ltr" />
          </Section>

          {message && (
            <p className={`text-sm font-semibold ${message.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {message.text}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-amber-400 py-3 text-lg font-bold text-black hover:bg-amber-300 disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-amber-300">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-300">{label}</span>
      <input
        type="text"
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-300">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
      />
    </label>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { calculateTotalPrice, WORD_STYLE_OPTIONS } from "@/lib/pricing";
import type { PublicSettings } from "@/lib/settings";

type Props = {
  settings: PublicSettings;
};

export default function OrderWizard({ settings }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 - service selection
  const [wantWord, setWantWord] = useState(false);
  const [wordStyle, setWordStyle] = useState<string>(WORD_STYLE_OPTIONS[0]);
  const [wantPpt, setWantPpt] = useState(false);
  const [pptSlides, setPptSlides] = useState(5);
  const [wantSummary, setWantSummary] = useState(false);

  // Step 2 - order details
  const [researchTitle, setResearchTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [year, setYear] = useState("");
  const [batch, setBatch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const totalPrice = useMemo(
    () =>
      calculateTotalPrice(
        { wantWord, wordStyle, wantPpt, pptSlides, wantSummary },
        settings
      ),
    [wantWord, wordStyle, wantPpt, pptSlides, wantSummary, settings]
  );

  const canGoToStep2 = wantWord || wantPpt || wantSummary;

  async function handleSubmit() {
    setError(null);

    if (!researchTitle.trim() || !fullName.trim() || !phone.trim()) {
      setError("يرجى تعبئة عنوان البحث والاسم ورقم الهاتف على الأقل");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wantWord,
          wordStyle: wantWord ? wordStyle : null,
          wantPpt,
          pptSlides: wantPpt ? pptSlides : 0,
          wantSummary,
          researchTitle,
          fullName,
          teamMembers,
          phone,
          specialty,
          year,
          batch,
          groupName,
          teacherName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "حدث خطأ أثناء إنشاء الطلب");
        setSubmitting(false);
        return;
      }
      router.push(`/order/${data.order.orderCode}`);
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
      setSubmitting(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-400">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-amber-400/70">
              <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-cover" />
            </div>
            <span className="font-bold">{settings.siteName}</span>
          </Link>
          <div className="text-sm text-slate-400">الخطوة {step} من 2</div>
        </div>

        <div className="rounded-3xl border border-amber-400/20 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-extrabold text-amber-400">ما هي الخدمة التي تحتاجها؟</h1>
              <p className="mt-1 text-sm text-slate-400">يمكنك اختيار أكثر من خدمة في نفس الطلب</p>

              <div className="mt-6 space-y-5">
                {/* Word research */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="font-bold">📄 بحث بصيغة Word — {settings.priceResearch} دج</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-amber-400"
                      checked={wantWord}
                      onChange={(e) => setWantWord(e.target.checked)}
                    />
                  </label>
                  {wantWord && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-slate-300">كيف يكون بحثك؟</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {WORD_STYLE_OPTIONS.map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setWordStyle(opt)}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              wordStyle === opt
                                ? "border-amber-400 bg-amber-400 text-black"
                                : "border-white/15 bg-white/5 text-slate-200 hover:border-amber-400/60"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PowerPoint */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="font-bold">🖥️ عرض Power Point — {settings.pricePptPer5Slides} دج / 5 شرائح</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-amber-400"
                      checked={wantPpt}
                      onChange={(e) => setWantPpt(e.target.checked)}
                    />
                  </label>
                  {wantPpt && (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-300">عدد الشرائح</p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPptSlides((s) => Math.max(5, s - 5))}
                          className="h-9 w-9 rounded-full border border-amber-400/50 text-lg font-bold text-amber-400 hover:bg-amber-400/10"
                        >
                          −
                        </button>
                        <span className="w-16 text-center text-lg font-extrabold text-white">{pptSlides}</span>
                        <button
                          type="button"
                          onClick={() => setPptSlides((s) => s + 5)}
                          className="h-9 w-9 rounded-full border border-amber-400/50 text-lg font-bold text-amber-400 hover:bg-amber-400/10"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-bold text-amber-400">
                        {(pptSlides / 5) * settings.pricePptPer5Slides} دج
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="font-bold">🧾 طلب ملخص — {settings.priceSummary} دج</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-amber-400"
                      checked={wantSummary}
                      onChange={(e) => setWantSummary(e.target.checked)}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between rounded-2xl bg-amber-400/10 p-4">
                <span className="font-bold text-slate-200">السعر الإجمالي</span>
                <span className="text-2xl font-extrabold text-amber-400">{totalPrice} دج</span>
              </div>

              <button
                type="button"
                disabled={!canGoToStep2}
                onClick={() => setStep(2)}
                className="mt-6 w-full rounded-full bg-amber-400 py-3 text-lg font-bold text-black transition enabled:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                التالي ←
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-amber-400">معلومات الطلب</h1>
              <p className="mt-1 text-sm text-slate-400">أدخل معلوماتك ومعلومات فريقك</p>

              <div className="mt-6 grid gap-4">
                <Field label="عنوان البحث *" value={researchTitle} onChange={setResearchTitle} placeholder="مثال: الذكاء الاصطناعي في التعليم" />
                <Field label="الاسم واللقب *" value={fullName} onChange={setFullName} placeholder="اسمك ولقبك" />
                <TextArea label="أسماء أعضاء الفريق (اختياري)" value={teamMembers} onChange={setTeamMembers} placeholder="اكتب أسماء أعضاء الفريق كل اسم في سطر" />
                <Field label="رقم الهاتف *" value={phone} onChange={setPhone} placeholder="05XXXXXXXX" type="tel" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="التخصص" value={specialty} onChange={setSpecialty} placeholder="مثال: إعلام آلي" />
                  <Field label="السنة الجامعية" value={year} onChange={setYear} placeholder="مثال: السنة الثانية" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الفوج" value={batch} onChange={setBatch} placeholder="مثال: فوج 03" />
                  <Field label="المجموعة" value={groupName} onChange={setGroupName} placeholder="مثال: مجموعة 02" />
                </div>
                <Field label="اسم الأستاذ" value={teacherName} onChange={setTeacherName} placeholder="اسم الأستاذ المشرف" />
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm font-semibold text-red-400">{error}</p>
              )}

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-amber-400/10 p-4">
                <span className="font-bold text-slate-200">المبلغ المطلوب دفعه</span>
                <span className="text-2xl font-extrabold text-amber-400">{totalPrice} دج</span>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 rounded-full border border-white/20 py-3 font-bold text-slate-200 hover:bg-white/5"
                >
                  → رجوع
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="w-2/3 rounded-full bg-amber-400 py-3 text-lg font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {submitting ? "جارٍ الإنشاء..." : "إنشاء الطلب"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
      />
    </label>
  );
}

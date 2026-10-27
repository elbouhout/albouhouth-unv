@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-cairo), system-ui, sans-serif;
}

::selection {
  background-color: #d4af37;
  color: #0a0a0a;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(212, 175, 55, 0.5);
  border-radius: 999px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background-color: transparent;
}
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "albouhouth unv | إنشاء البحوث الجامعية",
  description:
    "منصة albouhouth unv لإنشاء البحوث الجامعية والعروض التقديمية والملخصات بسرعة واحترافية.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-slate-950 text-slate-100 antialiased font-[var(--font-cairo)]">
        {children}
      </body>
    </html>
  );
}
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center">
        <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-amber-400/70 shadow-[0_0_40px_rgba(212,175,55,0.35)]">
          <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-cover" priority />
        </div>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-amber-400 sm:text-5xl">
          {settings.siteName}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-slate-300">
          منصّتك لإنشاء البحوث الجامعية، عروض البوربوينت والملخصات باحترافية وسرعة.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
          <PriceCard title="بحث (Word)" subtitle="فهرس / فصول / مباحث / غير ذلك" price={`${settings.priceResearch} دج`} />
          <PriceCard title="عرض Power Point" subtitle="لكل 5 شرائح" price={`${settings.pricePptPer5Slides} دج`} />
          <PriceCard title="ملخص" subtitle="تلخيص بحث جاهز" price={`${settings.priceSummary} دج`} />
        </div>

        <Link
          href="/order/new"
          className="mt-12 rounded-full bg-amber-400 px-10 py-4 text-lg font-bold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 active:scale-95"
        >
          ابدأ طلبك الآن 📝
        </Link>

        <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
          <span>تواصل معنا مباشرة عبر واتساب:</span>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/^0/, "213")}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-emerald-400 hover:underline"
            dir="ltr"
          >
            {settings.whatsappNumber}
          </a>
        </div>

        <div className="mt-20 w-full rounded-2xl border border-amber-400/20 bg-white/5 p-6 text-right">
          <h2 className="mb-3 text-xl font-bold text-amber-300">كيف تتم العملية؟</h2>
          <ol className="list-decimal space-y-2 pr-5 text-slate-300">
            <li>تملأ معلومات بحثك واختيار الخدمة المطلوبة (وورد / باوربوينت / ملخص).</li>
            <li>تضيف معلوماتك الشخصية ومعلومات فريقك.</li>
            <li>تنتقل إلى صفحة الدفع حيث نرسل لك رقم حساب بريدي موب لتحويل المبلغ.</li>
            <li>ترسل صورة إثبات التحويل خلال {settings.chatTimeoutMinutes} دقائق.</li>
            <li>نتواصل معك مباشرة على واتساب لإكمال طلبك.</li>
          </ol>
        </div>

        <footer className="mt-16 text-xs text-slate-500">
          <Link href="/admin" className="hover:text-amber-400">
            لوحة تحكم المالك
          </Link>
        </footer>
      </div>
    </main>
  );
}

function PriceCard({ title, subtitle, price }: { title: string; subtitle: string; price: string }) {
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-white/5 p-5 text-right shadow-lg backdrop-blur">
      <p className="text-base font-bold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      <p className="mt-3 text-2xl font-extrabold text-amber-400">{price}</p>
    </div>
  );
}

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

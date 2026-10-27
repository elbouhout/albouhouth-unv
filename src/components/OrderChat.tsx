"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
import type { PublicSettings } from "@/lib/settings";

type OrderStatus =
  | "pending_payment"
  | "payment_submitted"
  | "confirmed"
  | "expired"
  | "cancelled";

type OrderData = {
  id: number;
  orderCode: string;
  researchTitle: string;
  fullName: string;
  phone: string;
  wantWord: boolean;
  wordStyle: string | null;
  wantPpt: boolean;
  pptSlides: number;
  wantSummary: boolean;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  expiresAt: string;
};

type Props = {
  code: string;
  settings: PublicSettings;
};

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function OrderChat({ code, settings }: Props) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const whatsappOpenedRef = useRef(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${code}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setOrder(data.order);
      }
    } catch {
      // ignore transient network errors, next poll will retry
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  useEffect(() => {
    if (!order) return;
    const tick = () => {
      const remaining = new Date(order.expiresAt).getTime() - Date.now();
      setRemainingMs(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const whatsappHref = order
    ? whatsappLink(
        settings.whatsappNumber,
        `مرحبا، لقد أرسلت إثبات التحويل الخاص بطلب "${order.researchTitle}" (رقم الطلب: ${order.orderCode})، المبلغ: ${order.totalPrice} دج. بانتظار تأكيدكم.`
      )
    : "#";

  useEffect(() => {
    if (order?.status === "payment_submitted" && !whatsappOpenedRef.current) {
      whatsappOpenedRef.current = true;
      const t = setTimeout(() => {
        window.open(whatsappHref, "_blank");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [order?.status, whatsappHref]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("يرجى اختيار ملف صورة فقط");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("حجم الصورة يجب ألا يتجاوز 5 ميغابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSendConfirmation() {
    if (!preview) {
      setUploadError("يرجى إرفاق صورة إثبات التحويل أولاً");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch(`/api/orders/${code}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: preview }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setUploadError(data.error ?? "تعذر إرسال الصورة");
        setUploading(false);
        return;
      }
      setOrder(data.order);
    } catch {
      setUploadError("تعذر الاتصال بالخادم");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <CenteredShell settings={settings}>جارٍ التحميل...</CenteredShell>;
  }

  if (notFound || !order) {
    return (
      <CenteredShell settings={settings}>
        <p className="text-lg font-bold text-red-400">⚠️ الطلب غير موجود</p>
        <Link href="/order/new" className="mt-4 inline-block rounded-full bg-amber-400 px-6 py-2 font-bold text-black">
          إنشاء طلب جديد
        </Link>
      </CenteredShell>
    );
  }

  const isExpired = order.status === "expired" || (remainingMs !== null && remainingMs <= 0 && order.status === "pending_payment");
  const isCancelled = order.status === "cancelled";

  if (isExpired || isCancelled) {
    return (
      <CenteredShell settings={settings}>
        <div className="text-5xl">⏰</div>
        <p className="mt-4 text-xl font-extrabold text-red-400">
          {isCancelled ? "تم إلغاء هذا الطلب" : "انتهت المهلة المحددة لإتمام التحويل"}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {isCancelled
            ? "يرجى التواصل معنا أو إنشاء طلب جديد."
            : "تم إغلاق صفحة الدفع تلقائيًا. يمكنك إنشاء طلب جديد والمحاولة مجددًا."}
        </p>
        <Link href="/order/new" className="mt-6 inline-block rounded-full bg-amber-400 px-6 py-2 font-bold text-black">
          إنشاء طلب جديد
        </Link>
      </CenteredShell>
    );
  }

  return (
    <main dir="rtl" className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-amber-400">
          → رجوع للرئيسية
        </Link>
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-amber-400/70">
            <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-cover" />
          </div>
          <span className="text-sm font-bold text-amber-400">{settings.siteName}</span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 rounded-2xl border border-amber-400/20 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">
              طلب: <span className="font-bold text-white">{order.researchTitle}</span>
            </p>
            <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-400">
              #{order.orderCode}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-slate-400">المبلغ المطلوب</p>
            <p className="text-lg font-extrabold text-amber-400">{order.totalPrice} دج</p>
          </div>
          {order.status === "pending_payment" && remainingMs !== null && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-black/40 px-3 py-2">
              <span className="text-sm text-slate-300">الوقت المتبقي للتحويل</span>
              <span
                className={`font-mono text-lg font-extrabold ${
                  remainingMs < 60000 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {formatTime(remainingMs)}
              </span>
            </div>
          )}
        </div>

        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4">
          {/* Owner/system welcome message */}
          <ChatBubble fromOwner>
            <p className="whitespace-pre-line">{settings.welcomeMessage}</p>
            <div className="mt-2 rounded-lg bg-black/30 px-3 py-2 font-mono text-sm tracking-wider" dir="ltr">
              {settings.baridimobNumber}
            </div>
          </ChatBubble>

          {order.status === "pending_payment" && (
            <ChatBubble fromOwner>
              <p>بانتظار إرسال صورة إثبات التحويل منك لتأكيد الطلب 👇</p>
            </ChatBubble>
          )}

          {preview && (
            <ChatBubble fromOwner={false}>
              <div className="h-40 w-40 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="إثبات الدفع" className="h-full w-full object-cover" />
              </div>
            </ChatBubble>
          )}

          {(order.status === "payment_submitted" || order.status === "confirmed") && (
            <ChatBubble fromOwner>
              <p className="font-bold text-emerald-400">✅ تم استلام إثبات التحويل بنجاح</p>
              <p className="mt-1">يرجى الضغط على الزر أدناه لإكمال المحادثة معنا عبر واتساب.</p>
            </ChatBubble>
          )}
        </div>

        <div className="mt-4">
          {order.status === "pending_payment" && (
            <div className="rounded-2xl border border-amber-400/20 bg-white/5 p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!preview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-full border-2 border-dashed border-amber-400/50 py-3 text-sm font-bold text-amber-300 hover:bg-amber-400/5"
                >
                  📎 إرفاق صورة إثبات التحويل
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-slate-200"
                  >
                    تغيير الصورة
                  </button>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={handleSendConfirmation}
                    className="flex-1 rounded-full bg-amber-400 py-2.5 text-sm font-bold text-black hover:bg-amber-300 disabled:opacity-50"
                  >
                    {uploading ? "جارٍ الإرسال..." : "إرسال إثبات الدفع ✅"}
                  </button>
                </div>
              )}
              {uploadError && <p className="mt-2 text-xs font-semibold text-red-400">{uploadError}</p>}
              <p className="mt-2 text-center text-[11px] text-slate-500">
                لا يمكن متابعة المحادثة قبل إرسال صورة إثبات التحويل
              </p>
            </div>
          )}

          {(order.status === "payment_submitted" || order.status === "confirmed") && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 font-bold text-black hover:bg-emerald-400"
            >
              💬 متابعة المحادثة عبر واتساب
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

function ChatBubble({ fromOwner, children }: { fromOwner: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex ${fromOwner ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          fromOwner
            ? "rounded-tl-none bg-white/10 text-slate-100"
            : "rounded-tr-none bg-amber-400 text-black"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function CenteredShell({ children, settings }: { children: React.ReactNode; settings: PublicSettings }) {
  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-gradient-to-b from-black via-slate-950 to-black px-4 text-center text-white">
      <div className="max-w-sm rounded-3xl border border-amber-400/20 bg-white/5 p-8">
        <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full ring-2 ring-amber-400/70">
          <Image src={settings.logoUrl} alt={settings.siteName} fill className="object-cover" />
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}

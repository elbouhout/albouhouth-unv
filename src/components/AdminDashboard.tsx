"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { whatsappLink } from "@/lib/whatsapp";

type OrderStatus = "pending_payment" | "payment_submitted" | "confirmed" | "expired" | "cancelled";

type OrderRow = {
  id: number;
  orderCode: string;
  researchTitle: string;
  fullName: string;
  teamMembers: string | null;
  phone: string;
  specialty: string | null;
  year: string | null;
  batch: string | null;
  groupName: string | null;
  teacherName: string | null;
  wantWord: boolean;
  wordStyle: string | null;
  wantPpt: boolean;
  pptSlides: number;
  wantSummary: boolean;
  totalPrice: number;
  status: OrderStatus;
  confirmationImageData: string | null;
  createdAt: string;
  expiresAt: string;
};

const STATUS_LABELS: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: { label: "بانتظار الدفع", className: "bg-blue-500/20 text-blue-300" },
  payment_submitted: { label: "بانتظار المراجعة", className: "bg-purple-500/20 text-purple-300" },
  confirmed: { label: "مؤكد ✅", className: "bg-emerald-500/20 text-emerald-300" },
  expired: { label: "منتهي الصلاحية", className: "bg-slate-500/20 text-slate-300" },
  cancelled: { label: "ملغى", className: "bg-red-500/20 text-red-300" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    if (data.ok) {
      setOrders(data.orders);
      setSelected((prev) => (prev ? data.orders.find((o: OrderRow) => o.id === prev.id) ?? null : null));
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const publicLink = useMemo(() => {
    if (typeof window === "undefined") return "/order/new";
    return `${window.location.origin}/order/new`;
  }, []);

  async function updateStatus(code: string, status: "confirmed" | "cancelled") {
    const res = await fetch(`/api/admin/orders/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOrders();
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function copyLink() {
    navigator.clipboard.writeText(publicLink).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    });
  }

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending_payment").length;
    const review = orders.filter((o) => o.status === "payment_submitted").length;
    const confirmed = orders.filter((o) => o.status === "confirmed");
    const revenue = confirmed.reduce((sum, o) => sum + o.totalPrice, 0);
    return { total, pending, review, confirmed: confirmed.length, revenue };
  }, [orders]);

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-amber-400/70">
            <Image src="/images/logo.png" alt="logo" fill className="object-cover" />
          </div>
          <div>
            <p className="font-extrabold text-amber-400">لوحة تحكم المالك</p>
            <p className="text-xs text-slate-400">albouhouth unv</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/settings" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/5">
            ⚙️ الإعدادات
          </Link>
          <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/5">
            الموقع الرئيسي
          </Link>
          <button onClick={handleLogout} className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/30">
            تسجيل الخروج
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-white/5 p-4">
          <div>
            <p className="text-sm font-bold text-slate-200">رابط التطبيق الخاص بالعملاء</p>
            <p dir="ltr" className="text-xs text-amber-300">{publicLink}</p>
          </div>
          <button onClick={copyLink} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-black hover:bg-amber-300">
            {copyFeedback ? "تم النسخ ✅" : "نسخ الرابط 🔗"}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="إجمالي الطلبات" value={stats.total} />
          <StatCard label="بانتظار الدفع" value={stats.pending} />
          <StatCard label="بانتظار المراجعة" value={stats.review} />
          <StatCard label="مؤكدة" value={stats.confirmed} />
          <StatCard label="الإيرادات" value={`${stats.revenue} دج`} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "pending_payment", "payment_submitted", "confirmed", "expired", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === f ? "bg-amber-400 text-black" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "الكل" : STATUS_LABELS[f].label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-slate-400">جارٍ التحميل...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">لا توجد طلبات بعد</p>
        ) : (
          <div className="grid gap-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={selected?.id === order.id}
                onToggle={() => setSelected((prev) => (prev?.id === order.id ? null : order))}
                onConfirm={() => updateStatus(order.orderCode, "confirmed")}
                onCancel={() => updateStatus(order.orderCode, "cancelled")}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-lg font-extrabold text-amber-400">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onConfirm,
  onCancel,
}: {
  order: OrderRow;
  expanded: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const statusMeta = STATUS_LABELS[order.status];
  const whatsapp = whatsappLink(
    order.phone,
    `مرحبا ${order.fullName}، بخصوص طلبك "${order.researchTitle}" (${order.orderCode}).`
  );

  const services: string[] = [];
  if (order.wantWord) services.push(`وورد (${order.wordStyle ?? "-"})`);
  if (order.wantPpt) services.push(`باوربوينت (${order.pptSlides} شريحة)`);
  if (order.wantSummary) services.push("ملخص");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <button onClick={onToggle} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-right">
        <div>
          <p className="font-bold text-white">{order.researchTitle}</p>
          <p className="text-xs text-slate-400">
            {order.fullName} · {order.phone} · {services.join(" / ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-amber-400">{order.totalPrice} دج</span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusMeta.className}`}>{statusMeta.label}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/10 bg-black/30 p-4">
          <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <p><span className="text-slate-500">رقم الطلب:</span> {order.orderCode}</p>
            <p><span className="text-slate-500">التخصص:</span> {order.specialty ?? "-"}</p>
            <p><span className="text-slate-500">السنة:</span> {order.year ?? "-"}</p>
            <p><span className="text-slate-500">الفوج:</span> {order.batch ?? "-"}</p>
            <p><span className="text-slate-500">المجموعة:</span> {order.groupName ?? "-"}</p>
            <p><span className="text-slate-500">الأستاذ:</span> {order.teacherName ?? "-"}</p>
            <p className="sm:col-span-2"><span className="text-slate-500">أعضاء الفريق:</span> {order.teamMembers ?? "-"}</p>
            <p><span className="text-slate-500">أُنشئ في:</span> {new Date(order.createdAt).toLocaleString("ar-DZ")}</p>
            <p><span className="text-slate-500">ينتهي في:</span> {new Date(order.expiresAt).toLocaleString("ar-DZ")}</p>
          </div>

          {order.confirmationImageData && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-slate-300">صورة إثبات التحويل</p>
              <a href={order.confirmationImageData} target="_blank" rel="noreferrer">
                <div className="h-56 w-full max-w-xs overflow-hidden rounded-xl border border-amber-400/30 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.confirmationImageData} alt="إثبات الدفع" className="h-full w-full object-contain" />
                </div>
              </a>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400"
            >
              💬 مراسلة العميل عبر واتساب
            </a>
            {order.status === "payment_submitted" && (
              <>
                <button onClick={onConfirm} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-black hover:bg-amber-300">
                  ✅ تأكيد الطلب
                </button>
                <button onClick={onCancel} className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/30">
                  ❌ إلغاء الطلب
                </button>
              </>
            )}
            {order.status === "pending_payment" && (
              <button onClick={onCancel} className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/30">
                ❌ إلغاء الطلب
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

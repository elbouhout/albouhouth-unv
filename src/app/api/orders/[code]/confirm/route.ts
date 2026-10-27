import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const imageData = typeof body?.imageData === "string" ? body.imageData : null;

  if (!imageData || !imageData.startsWith("data:image/")) {
    return Response.json(
      { ok: false, error: "يرجى إرفاق صورة صحيحة لإثبات التحويل" },
      { status: 400 }
    );
  }

  const approxBytes = Math.ceil((imageData.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return Response.json(
      { ok: false, error: "حجم الصورة كبير جدًا، الرجاء إرسال صورة أصغر" },
      { status: 400 }
    );
  }

  const rows = await db.select().from(orders).where(eq(orders.orderCode, code)).limit(1);
  if (rows.length === 0) {
    return Response.json({ ok: false, error: "الطلب غير موجود" }, { status: 404 });
  }

  const order = rows[0];

  if (order.status === "expired" || (order.status === "pending_payment" && order.expiresAt.getTime() < Date.now())) {
    await db.update(orders).set({ status: "expired" }).where(eq(orders.id, order.id));
    return Response.json(
      { ok: false, error: "انتهت المهلة المحددة لهذا الطلب" },
      { status: 410 }
    );
  }

  if (order.status !== "pending_payment") {
    return Response.json(
      { ok: false, error: "تم إرسال إثبات الدفع مسبقًا لهذا الطلب" },
      { status: 409 }
    );
  }

  const updated = await db
    .update(orders)
    .set({
      status: "payment_submitted",
      confirmationImageData: imageData,
      paymentSubmittedAt: new Date(),
      whatsappNotified: true,
    })
    .where(eq(orders.id, order.id))
    .returning();

  return Response.json({ ok: true, order: updated[0] });
}

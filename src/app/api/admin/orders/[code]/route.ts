import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["confirmed", "cancelled", "pending_payment"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return Response.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const { code } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!ALLOWED_STATUSES.includes(status)) {
    return Response.json({ ok: false, error: "حالة غير صالحة" }, { status: 400 });
  }

  const rows = await db.select().from(orders).where(eq(orders.orderCode, code)).limit(1);
  if (rows.length === 0) {
    return Response.json({ ok: false, error: "الطلب غير موجود" }, { status: 404 });
  }

  const updated = await db
    .update(orders)
    .set({
      status,
      confirmedAt: status === "confirmed" ? new Date() : rows[0].confirmedAt,
    })
    .where(eq(orders.id, rows[0].id))
    .returning();

  return Response.json({ ok: true, order: updated[0] });
}

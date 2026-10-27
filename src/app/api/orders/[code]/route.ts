import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function findOrder(code: string) {
  const rows = await db.select().from(orders).where(eq(orders.orderCode, code)).limit(1);
  if (rows.length === 0) return null;

  let order = rows[0];

  // Auto-expire orders whose payment window has elapsed.
  if (order.status === "pending_payment" && order.expiresAt.getTime() < Date.now()) {
    const updated = await db
      .update(orders)
      .set({ status: "expired" })
      .where(eq(orders.id, order.id))
      .returning();
    order = updated[0];
  }

  return order;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const order = await findOrder(code);

  if (!order) {
    return Response.json({ ok: false, error: "الطلب غير موجود" }, { status: 404 });
  }

  return Response.json({ ok: true, order });
}

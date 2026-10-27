import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return Response.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));

  const now = Date.now();
  const expiredIds = rows
    .filter((o) => o.status === "pending_payment" && o.expiresAt.getTime() < now)
    .map((o) => o.id);

  if (expiredIds.length > 0) {
    for (const id of expiredIds) {
      await db.update(orders).set({ status: "expired" }).where(eq(orders.id, id));
    }
    for (const row of rows) {
      if (expiredIds.includes(row.id)) {
        row.status = "expired";
      }
    }
  }

  return Response.json({ ok: true, orders: rows });
}

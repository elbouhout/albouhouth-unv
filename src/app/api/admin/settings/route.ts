import { db } from "@/db";
import { settings } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return Response.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const current = await getSettings();
  return Response.json({ ok: true, settings: current });
}

export async function PUT(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return Response.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  await getSettings(); // ensure row exists

  const updatePayload: Partial<typeof settings.$inferInsert> = {
    updatedAt: new Date(),
  };

  const stringFields = [
    "siteName",
    "logoUrl",
    "whatsappNumber",
    "baridimobNumber",
    "welcomeMessage",
    "ownerPasscode",
  ] as const;

  const numberFields = [
    "priceResearch",
    "priceSummary",
    "pricePptPer5Slides",
    "chatTimeoutMinutes",
  ] as const;

  for (const field of stringFields) {
    if (typeof body[field] === "string" && body[field].trim() !== "") {
      updatePayload[field] = body[field].trim();
    }
  }

  for (const field of numberFields) {
    const value = Number(body[field]);
    if (!Number.isNaN(value) && value >= 0) {
      updatePayload[field] = Math.round(value);
    }
  }

  const updated = await db
    .update(settings)
    .set(updatePayload)
    .where(eq(settings.id, 1))
    .returning();

  return Response.json({ ok: true, settings: updated[0] });
}

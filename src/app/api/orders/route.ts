import { db } from "@/db";
import { orders } from "@/db/schema";
import { calculateTotalPrice, WORD_STYLE_OPTIONS } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

export const dynamic = "force-dynamic";

const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 7);

function sanitizeText(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  const researchTitle = sanitizeText(body.researchTitle, 300);
  const fullName = sanitizeText(body.fullName, 200);
  const phone = sanitizeText(body.phone, 50);

  if (!researchTitle || !fullName || !phone) {
    return Response.json(
      { ok: false, error: "يرجى تعبئة عنوان البحث والاسم ورقم الهاتف" },
      { status: 400 }
    );
  }

  const wantWord = Boolean(body.wantWord);
  const wantPpt = Boolean(body.wantPpt);
  const wantSummary = Boolean(body.wantSummary);

  let wordStyle: string | null = null;
  if (wantWord) {
    const style = sanitizeText(body.wordStyle, 50);
    wordStyle = style && (WORD_STYLE_OPTIONS as readonly string[]).includes(style) ? style : WORD_STYLE_OPTIONS[0];
  }

  let pptSlides = 0;
  if (wantPpt) {
    const slides = Number(body.pptSlides);
    pptSlides = Number.isFinite(slides) && slides > 0 ? Math.ceil(slides / 5) * 5 : 5;
  }

  if (!wantWord && !wantPpt && !wantSummary) {
    return Response.json(
      { ok: false, error: "يرجى اختيار خدمة واحدة على الأقل (بحث وورد أو باوربوينت أو ملخص)" },
      { status: 400 }
    );
  }

  const settings = await getSettings();
  const totalPrice = calculateTotalPrice(
    { wantWord, wordStyle, wantPpt, pptSlides, wantSummary },
    settings
  );

  const now = new Date();
  const expiresAt = new Date(now.getTime() + settings.chatTimeoutMinutes * 60 * 1000);

  let orderCode = nanoid();
  // Extremely unlikely collision, but guard anyway.
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.orderCode, orderCode))
      .limit(1)
      .catch(() => []);
    if (!existing || existing.length === 0) break;
    orderCode = nanoid();
  }

  const inserted = await db
    .insert(orders)
    .values({
      orderCode,
      researchTitle,
      fullName,
      teamMembers: sanitizeText(body.teamMembers, 1000),
      phone,
      specialty: sanitizeText(body.specialty, 200),
      year: sanitizeText(body.year, 100),
      batch: sanitizeText(body.batch, 100),
      groupName: sanitizeText(body.groupName, 100),
      teacherName: sanitizeText(body.teacherName, 200),
      wantWord,
      wordStyle,
      wantPpt,
      pptSlides,
      wantSummary,
      totalPrice,
      status: "pending_payment",
      createdAt: now,
      expiresAt,
    })
    .returning();

  return Response.json({ ok: true, order: inserted[0] });
}

import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SiteSettings = typeof settings.$inferSelect;

/**
 * Settings is a singleton table - there is always exactly one row (id = 1).
 * This helper makes sure that row exists and returns it.
 */
export async function getSettings(): Promise<SiteSettings> {
  const existing = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const created = await db.insert(settings).values({ id: 1 }).returning();
  return created[0];
}

export type PublicSettings = Pick<
  SiteSettings,
  | "siteName"
  | "logoUrl"
  | "whatsappNumber"
  | "baridimobNumber"
  | "welcomeMessage"
  | "priceResearch"
  | "priceSummary"
  | "pricePptPer5Slides"
  | "chatTimeoutMinutes"
>;

export function toPublicSettings(s: SiteSettings): PublicSettings {
  return {
    siteName: s.siteName,
    logoUrl: s.logoUrl,
    whatsappNumber: s.whatsappNumber,
    baridimobNumber: s.baridimobNumber,
    welcomeMessage: s.welcomeMessage,
    priceResearch: s.priceResearch,
    priceSummary: s.priceSummary,
    pricePptPer5Slides: s.pricePptPer5Slides,
    chatTimeoutMinutes: s.chatTimeoutMinutes,
  };
}

export { whatsappLink } from "./whatsapp";

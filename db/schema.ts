import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Singleton table (always a single row) holding the owner-configurable
// settings for the site: branding, contact info, prices and chat timeout.
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("albouhouth unv"),
  logoUrl: text("logo_url").notNull().default("/images/logo.png"),
  whatsappNumber: text("whatsapp_number").notNull().default("0773150164"),
  baridimobNumber: text("baridimob_number")
    .notNull()
    .default("00799999004278464857"),
  welcomeMessage: text("welcome_message")
    .notNull()
    .default(
      "مرحبا بك 👋 يرجى إرسال المال عبر حساب بريدي موب (BaridiMob) إلى الرقم التالي: 00799999004278464857\nوعند الانتهاء من التحويل يرجى مراسلتنا على واتساب للدردشة معنا."
    ),
  priceResearch: integer("price_research").notNull().default(800),
  priceSummary: integer("price_summary").notNull().default(100),
  pricePptPer5Slides: integer("price_ppt_per5_slides").notNull().default(800),
  chatTimeoutMinutes: integer("chat_timeout_minutes").notNull().default(5),
  ownerPasscode: text("owner_passcode").notNull().default("admin123"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderStatusValues = [
  "pending_payment",
  "payment_submitted",
  "confirmed",
  "expired",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatusValues)[number];

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),

  // Research / service selection
  researchTitle: text("research_title").notNull(),
  wantWord: boolean("want_word").notNull().default(false),
  wordStyle: text("word_style"),
  wantPpt: boolean("want_ppt").notNull().default(false),
  pptSlides: integer("ppt_slides").notNull().default(0),
  wantSummary: boolean("want_summary").notNull().default(false),
  totalPrice: integer("total_price").notNull().default(0),

  // Student / team info
  fullName: text("full_name").notNull(),
  teamMembers: text("team_members"),
  phone: text("phone").notNull(),
  specialty: text("specialty"),
  year: text("year"),
  batch: text("batch"),
  groupName: text("group_name"),
  teacherName: text("teacher_name"),

  // Payment / chat workflow
  status: text("status").$type<OrderStatus>().notNull().default("pending_payment"),
  confirmationImageData: text("confirmation_image_data"),
  whatsappNotified: boolean("whatsapp_notified").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  paymentSubmittedAt: timestamp("payment_submitted_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

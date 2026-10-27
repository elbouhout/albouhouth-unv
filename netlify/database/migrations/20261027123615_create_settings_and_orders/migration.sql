CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"order_code" text NOT NULL UNIQUE,
	"research_title" text NOT NULL,
	"want_word" boolean DEFAULT false NOT NULL,
	"word_style" text,
	"want_ppt" boolean DEFAULT false NOT NULL,
	"ppt_slides" integer DEFAULT 0 NOT NULL,
	"want_summary" boolean DEFAULT false NOT NULL,
	"total_price" integer DEFAULT 0 NOT NULL,
	"full_name" text NOT NULL,
	"team_members" text,
	"phone" text NOT NULL,
	"specialty" text,
	"year" text,
	"batch" text,
	"group_name" text,
	"teacher_name" text,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"confirmation_image_data" text,
	"whatsapp_notified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"payment_submitted_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY,
	"site_name" text DEFAULT 'albouhouth unv' NOT NULL,
	"logo_url" text DEFAULT '/images/logo.png' NOT NULL,
	"whatsapp_number" text DEFAULT '0773150164' NOT NULL,
	"baridimob_number" text DEFAULT '00799999004278464857' NOT NULL,
	"welcome_message" text DEFAULT 'مرحبا بك 👋 يرجى إرسال المال عبر حساب بريدي موب (BaridiMob) إلى الرقم التالي: 00799999004278464857
وعند الانتهاء من التحويل يرجى مراسلتنا على واتساب للدردشة معنا.' NOT NULL,
	"price_research" integer DEFAULT 800 NOT NULL,
	"price_summary" integer DEFAULT 100 NOT NULL,
	"price_ppt_per5_slides" integer DEFAULT 800 NOT NULL,
	"chat_timeout_minutes" integer DEFAULT 5 NOT NULL,
	"owner_passcode" text DEFAULT 'admin123' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

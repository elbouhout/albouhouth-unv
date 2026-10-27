import { ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  const settings = await getSettings();

  if (!passcode || passcode !== settings.ownerPasscode) {
    return Response.json({ ok: false, error: "رمز الدخول غير صحيح" }, { status: 401 });
  }

  const token = createAdminToken(passcode);
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ ok: true });
}

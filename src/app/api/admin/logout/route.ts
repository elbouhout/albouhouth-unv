import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
  return Response.json({ ok: true });
}

import { cookies } from "next/headers";
import crypto from "node:crypto";
import { getSettings } from "./settings";

export const ADMIN_COOKIE_NAME = "albouhouth_admin_session";
const SECRET = process.env.ADMIN_SESSION_SECRET ?? "albouhouth-unv-secret-key";

function signToken(passcode: string) {
  return crypto.createHmac("sha256", SECRET).update(passcode).digest("hex");
}

export function createAdminToken(passcode: string) {
  return signToken(passcode);
}

export async function isValidAdminToken(token: string | undefined | null) {
  if (!token) return false;
  const settings = await getSettings();
  const expected = signToken(settings.ownerPasscode);
  return token === expected;
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return isValidAdminToken(token);
}

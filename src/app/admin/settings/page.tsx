import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  return <SettingsForm />;
}

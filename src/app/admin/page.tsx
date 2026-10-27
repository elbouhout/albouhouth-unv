import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}

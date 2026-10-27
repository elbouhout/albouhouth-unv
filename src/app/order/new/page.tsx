import { getSettings, toPublicSettings } from "@/lib/settings";
import OrderWizard from "@/components/OrderWizard";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const settings = await getSettings();

  return <OrderWizard settings={toPublicSettings(settings)} />;
}

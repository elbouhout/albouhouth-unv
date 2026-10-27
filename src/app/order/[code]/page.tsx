import OrderChat from "@/components/OrderChat";
import { getSettings, toPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function OrderChatPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const settings = await getSettings();

  return <OrderChat code={code} settings={toPublicSettings(settings)} />;
}

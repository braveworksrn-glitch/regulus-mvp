import { notFound } from "next/navigation";
import OrderFlow from "@/components/game/OrderFlow";
import { IMPROVEMENT_ACTIONS, LOTS, getLot } from "@/lib/game";

export function generateStaticParams() {
  return LOTS.flatMap((l) =>
    IMPROVEMENT_ACTIONS.map((a) => ({ id: l.slug, actionId: a.id }))
  );
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string; actionId: string }>;
}) {
  const { id, actionId } = await params;
  const lot = getLot(id);
  const action = IMPROVEMENT_ACTIONS.find((a) => a.id === actionId);
  if (!lot || !action) notFound();
  return <OrderFlow lot={lot} action={action} />;
}

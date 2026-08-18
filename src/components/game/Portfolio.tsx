"use client";

import Link from "next/link";
import { IMPROVEMENT_ACTIONS, QUESTS, fmt, rankForXp } from "@/lib/game";
import { useGameState } from "@/lib/store";
import { SimBadge, StatePill, Tile } from "./ui";

export default function Portfolio() {
  const { state, ready, tickOrder } = useGameState();
  const rank = rankForXp(state.xp);

  if (!ready) return <main className="max-w-4xl mx-auto px-4 py-16" />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">My Land</h1>
          <p className="text-sm text-stone-600">
            Score is what you built — completed, verified real-world actions. Never dollars.
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm">
          Rank <strong>{rank.label}</strong> · {state.xp} XP ·{" "}
          {state.completedQuests.length}/{QUESTS.length} quests
        </div>
      </div>

      <section className="mb-8">
        <h2 className="font-semibold text-stone-900 mb-3">Lots</h2>
        {state.sandboxClaimed ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 flex items-center gap-4">
            <Tile state={state.sandboxTileState} />
            <div>
              <div className="font-semibold text-stone-900">Sandbox Lot</div>
              <div className="flex items-center gap-2 mt-0.5">
                <StatePill state={state.sandboxTileState} />
                <SimBadge label="Sandbox — simulated" />
              </div>
            </div>
            <Link href="/sandbox" className="ml-auto text-sm text-emerald-700 underline">Open →</Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500 text-sm">
            No lots yet. <Link href="/sandbox" className="text-emerald-700 underline">Claim your free sandbox lot</Link>{" "}
            or <Link href="/board" className="text-emerald-700 underline">browse the board</Link>.
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-stone-900 mb-3">Service orders</h2>
        {state.orders.length === 0 ? (
          <p className="text-sm text-stone-500">
            No orders yet — open any lot and pick an improvement to see the (simulated) flow.
          </p>
        ) : (
          <ul className="space-y-3">
            {state.orders.map((o) => {
              const action = IMPROVEMENT_ACTIONS.find((a) => a.id === o.actionId);
              const done = o.status === "verified";
              return (
                <li key={o.id} className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-stone-900">{action?.title}</span>
                    <span className="text-stone-500">· {o.lotName}</span>
                    <span className={`ml-auto text-xs rounded-full px-2 py-0.5 ${done ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
                      {done ? "✓ Verified" : o.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div className="h-full bg-emerald-600 transition-all" style={{ width: `${Math.min(100, (o.ticks / o.ticksNeeded) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-stone-500">wk {o.ticks}/{o.ticksNeeded} · {fmt(o.totalCents)}</span>
                    {!done && (
                      <button onClick={() => tickOrder(o.id)} className="text-xs rounded border border-stone-300 px-2 py-1 hover:bg-stone-100">
                        ⏩ tick
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

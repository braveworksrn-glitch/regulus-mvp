"use client";

// The free 90-second demo loop: claim a sandbox lot, dispatch a simulated crew,
// advance accelerated "weekly ticks", watch the tile transform, earn XP.

import Link from "next/link";
import {
  IMPROVEMENT_ACTIONS,
  QUESTS,
  TILE_STATE_ORDER,
  fmt,
  actionTotalCents,
  rankForXp,
} from "@/lib/game";
import { useGameState } from "@/lib/store";
import { SimBadge, StatePill, Tile } from "./ui";

const QUEST_FOR_STATE: Record<string, string> = {
  cleared: "tame",
  surveyed: "borders",
  access_unlocked: "access",
  build_ready: "seal",
};

export default function Sandbox() {
  const { state, ready, claimSandbox, placeOrder, tickOrder, completeQuest, reset } = useGameState();
  const rank = rankForXp(state.xp);
  const sandboxOrders = state.orders.filter((o) => o.lotSlug === "sandbox");
  const active = sandboxOrders.find((o) => o.status !== "verified");
  const stateIdx = TILE_STATE_ORDER.indexOf(state.sandboxTileState);
  const nextAction = IMPROVEMENT_ACTIONS.find(
    (a) => TILE_STATE_ORDER.indexOf(a.resultingTileState) === stateIdx + 1
  );

  if (!ready) return <main className="max-w-3xl mx-auto px-4 py-16" />;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Your free sandbox lot</h1>
        <p className="text-stone-600 text-sm mt-2 max-w-xl mx-auto">
          Feel the whole loop in 90 seconds before any real lot exists for you to buy.
          Weekly ticks are accelerated here — in the live product they arrive at honest
          real-world cadence.
        </p>
        <div className="mt-2"><SimBadge label="Sandbox — everything here is simulated" /></div>
      </div>

      <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="flex flex-col items-center gap-3 mx-auto">
          <Tile state={state.sandboxTileState} size="lg" />
          <StatePill state={state.sandboxTileState} />
          <div className="text-xs text-stone-600 text-center">
            Rank: <strong>{rank.label}</strong> · {state.xp} XP
          </div>
        </div>

        <div className="space-y-4">
          {!state.sandboxClaimed && (
            <button
              onClick={claimSandbox}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              🚩 Stake Your Claim — claim the sandbox lot (free)
            </button>
          )}

          {state.sandboxClaimed && !active && nextAction && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h3 className="font-semibold text-stone-900">{nextAction.title}</h3>
              <p className="text-sm text-stone-600 mt-1">{nextAction.description}</p>
              <p className="text-xs text-emerald-800 italic mt-1">{nextAction.boardEffect}</p>
              <div className="text-sm mt-2">
                Simulated cost: <strong>{fmt(actionTotalCents(nextAction))}</strong>{" "}
                <span className="text-xs text-stone-500">(vendor cost + disclosed 22% fee — nothing charged)</span>
              </div>
              <button
                onClick={() => placeOrder("sandbox", "Sandbox Lot", nextAction.id, actionTotalCents(nextAction))}
                className="mt-3 w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
              >
                Dispatch the crew (simulated)
              </button>
            </div>
          )}

          {state.sandboxClaimed && !active && !nextAction && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-center">
              <div className="text-3xl">🏕</div>
              <h3 className="font-bold text-amber-900 mt-1">Build-Ready. You beat the sandbox.</h3>
              <p className="text-sm text-amber-800 mt-1">
                That&apos;s the entire v1 loop — on a real lot, every one of those ticks is a
                real crew, a real county document, a real geotagged photo.
              </p>
              <div className="flex justify-center gap-3 mt-3">
                <Link href="/board" className="rounded-lg bg-emerald-700 text-white px-4 py-2 text-sm font-semibold">Browse the board</Link>
                <Link href="/founding" className="rounded-lg border border-emerald-700 text-emerald-800 px-4 py-2 text-sm font-semibold">Join founding waitlist</Link>
              </div>
              <button onClick={reset} className="mt-3 text-xs text-stone-500 underline">Reset sandbox</button>
            </div>
          )}

          {active && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">
                  {IMPROVEMENT_ACTIONS.find((a) => a.id === active.actionId)?.title}
                </h3>
                <span className="text-xs text-stone-500">week {active.ticks} of ~{active.ticksNeeded}</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, (active.ticks / active.ticksNeeded) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Real cadence is weekly. Here, one click = one week.
              </p>
              <button
                onClick={() => {
                  tickOrder(active.id);
                  if (active.ticks + 1 >= active.ticksNeeded) {
                    const action = IMPROVEMENT_ACTIONS.find((a) => a.id === active.actionId);
                    const q = action && QUEST_FOR_STATE[action.resultingTileState];
                    if (q) completeQuest(q);
                  }
                }}
                className="mt-3 w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-700 text-white font-semibold"
              >
                ⏩ Advance one week
              </button>
            </div>
          )}

          {/* Quest chain */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold text-stone-900 mb-2">Quest chain</h3>
            <ul className="space-y-1.5 text-sm">
              {QUESTS.map((q) => {
                const done = state.completedQuests.includes(q.id);
                return (
                  <li key={q.id} className={`flex items-center gap-2 ${done ? "text-emerald-700" : "text-stone-500"}`}>
                    <span>{done ? "✅" : "◻️"}</span>
                    <span className={done ? "font-medium" : ""}>{q.title}</span>
                    <span className="ml-auto text-xs">{q.xp} XP</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

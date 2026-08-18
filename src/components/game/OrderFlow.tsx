"use client";

// Simulated service-order checkout. Ends with an explicit "no money collected"
// step; writes a demo order to local game state so /portfolio shows it.

import Link from "next/link";
import { useState } from "react";
import {
  ImprovementAction,
  Lot,
  actionTotalCents,
  fmt,
} from "@/lib/game";
import { useGameState } from "@/lib/store";
import { SimBadge, StatePill } from "./ui";

export default function OrderFlow({ lot, action }: { lot: Lot; action: ImprovementAction }) {
  const { placeOrder } = useGameState();
  const [step, setStep] = useState<"review" | "done">("review");
  const fee = Math.round(action.vendorCostCents * (action.platformFeeBps / 10000));

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-4"><SimBadge label="Simulated checkout — no money is collected" /></div>
      <h1 className="text-2xl font-bold text-stone-900">
        {action.title} — {lot.name}
      </h1>

      {step === "review" && (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <p className="text-sm text-stone-600">{action.description}</p>
          <p className="text-sm text-emerald-800 italic">{action.boardEffect}</p>

          <div className="text-sm space-y-1 border-t border-stone-200 pt-4">
            <div className="flex justify-between"><span>Vendor cost (licensed local crew)</span><span>{fmt(action.vendorCostCents)}</span></div>
            <div className="flex justify-between"><span>Regulus service fee (22%, disclosed)</span><span>{fmt(fee)}</span></div>
            <div className="flex justify-between font-bold border-t border-stone-200 pt-2"><span>Total</span><span>{fmt(actionTotalCents(action))}</span></div>
          </div>

          <ul className="text-xs text-stone-600 space-y-1.5 border-t border-stone-200 pt-4">
            <li>· ETA quoted honestly: <strong>{action.etaWeeksMin}–{action.etaWeeksMax} weeks</strong>. Automatic refund if the window blows out.</li>
            <li>· Vendor deposit capped at 50%; balance releases only on geotagged photo verification.</li>
            <li>· You initiate and approve this order — you are the manager of your lot&apos;s series.</li>
            <li>· Resulting tile state: <StatePill state={action.resultingTileState} /></li>
          </ul>

          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3">
            Improvements may cost more than they add to resale value — owners do them for
            access, build-readiness, and use.
          </div>

          <div className="rounded-lg bg-stone-100 text-stone-700 text-xs p-3">
            In the live product, funds go to a licensed escrow partner at this step.
            <strong> No money is collected in this demo.</strong>
          </div>

          <button
            onClick={() => {
              placeOrder(lot.slug, lot.name, action.id, actionTotalCents(action));
              setStep("done");
            }}
            className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
          >
            Approve simulated order
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center space-y-3">
          <div className="text-4xl">🚜</div>
          <h2 className="text-xl font-bold text-emerald-900">Order scheduled (simulated)</h2>
          <p className="text-sm text-emerald-800">
            A crew would now be dispatched, and your tile would update only when verified
            photos land. Track it — with accelerated demo weekly ticks — in your portfolio.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/portfolio" className="rounded-lg bg-emerald-700 text-white px-4 py-2 text-sm font-semibold">Go to My Land</Link>
            <Link href={`/lots/${lot.slug}`} className="rounded-lg border border-emerald-700 text-emerald-800 px-4 py-2 text-sm font-semibold">Back to lot</Link>
          </div>
        </div>
      )}
    </main>
  );
}

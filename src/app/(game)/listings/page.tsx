import Link from "next/link";
import { SimBadge, StatePill } from "@/components/game/ui";
import { LOTS } from "@/lib/game";

export const metadata = { title: "Owner-to-owner assignments — Regulus" };

export default function ListingsPage() {
  const examples = LOTS.filter((l) => l.status === "owned").slice(0, 4);
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Owner-to-owner assignments</h1>
      <p className="text-stone-600 text-sm mt-2 max-w-2xl">
        There is no marketplace here — deliberately. When you and a buyer make your own
        deal, anywhere, at any price you two agree on, Regulus processes the
        series-interest assignment for a <strong>flat documentation fee</strong>. We
        suggest no prices, take no percentage, and do no matchmaking. Your other exit is
        always the $500 deed-out.
      </p>

      <div className="mt-3"><SimBadge label="Example listings — simulated" /></div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {examples.map((l) => (
          <div key={l.id} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">{l.name}</h2>
              <StatePill state={l.tileState} />
            </div>
            <p className="text-sm text-stone-600 mt-1">
              {l.acreage} ac · {l.county}, {l.state}
            </p>
            <p className="text-xs text-stone-500 mt-2 italic">
              &ldquo;Owner seeking a buyer — contact directly. Price is between you two.&rdquo;
            </p>
            <Link href={`/lots/${l.slug}`} className="inline-block mt-3 text-sm text-emerald-700 underline">
              View lot record →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-stone-300 bg-stone-100 p-5 text-sm text-stone-700">
        <strong>Why no marketplace?</strong> A platform that prices, matches, and takes a
        cut of resales starts acting like a financial exchange — and we built Regulus to
        never be one. A true marketplace is a post-v1 decision, gated on 150+ cured lots,
        written brokerage analysis, and demonstrated off-platform resales at real prices.
      </div>
    </main>
  );
}

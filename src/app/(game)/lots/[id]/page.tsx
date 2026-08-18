import Link from "next/link";
import { notFound } from "next/navigation";
import BeforeAfterScrubber from "@/components/game/BeforeAfterScrubber";
import {
  ActionCard,
  PriceCard,
  SimBadge,
  StatePill,
  Tile,
} from "@/components/game/ui";
import {
  IMPROVEMENT_ACTIONS,
  LOTS,
  TILE_STATE_LABELS,
  getLot,
  timelineFor,
} from "@/lib/game";

export function generateStaticParams() {
  return LOTS.map((l) => ({ id: l.slug }));
}

const KIND_ICON: Record<string, string> = {
  photo: "📷",
  county_doc: "📄",
  crew_dispatch: "🚜",
  weekly_tick: "🕰",
  purchase: "🤝",
};

export default async function LotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lot = getLot(id);
  if (!lot) notFound();
  const events = timelineFor(lot);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm px-4 py-3 mb-6">
        <strong>Demo lot.</strong> This parcel, its pricing, photos, and documents are
        simulated to show how the live product works. No money is collected here.
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Tile state={lot.tileState} size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{lot.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-stone-600">
            <span>{lot.acreage} ac · {lot.county}, {lot.state}</span>
            <StatePill state={lot.tileState} />
            <a href={lot.countyRecordUrl} target="_blank" rel="noreferrer" className="underline text-emerald-700">
              County recorder search ↗
            </a>
            <span className="text-xs text-stone-400">(parcel {lot.parcelId} — simulated)</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <BeforeAfterScrubber />
            <p className="text-xs text-stone-500 mt-2">
              Verified 4-corner before/after imagery is the state oracle — the board only
              changes when the land does.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-1">Improvement menu</h2>
            <p className="text-sm text-stone-600 mb-4">
              Path to Build-Ready: roughly $12–15k all-in including the lot. Every action
              is a real service order you initiate and approve; crews are
              retainer-contracted before any lot sells.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {IMPROVEMENT_ACTIONS.map((a) => (
                <ActionCard key={a.id} action={a} href={`/lots/${lot.slug}/order/${a.id}`} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <PriceCard lot={lot} />

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-stone-900">Timeline</h3>
              <SimBadge label="Simulated events" />
            </div>
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>{KIND_ICON[e.kind] ?? "•"}</span>
                    <span className="font-medium text-stone-900">{e.title}</span>
                    <span className="text-xs text-stone-400 ml-auto">{e.occurredAt}</span>
                  </div>
                  <p className="text-stone-600 text-xs mt-0.5 pl-6">{e.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-xs text-stone-500">
            Current state: <strong>{TILE_STATE_LABELS[lot.tileState]}</strong>. In the
            live product, purchase funds go to a licensed title/escrow partner — Regulus
            never holds buyer funds. Exit any day: deed-out for $500 flat.{" "}
            <Link href="/trust" className="underline">How ownership works →</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

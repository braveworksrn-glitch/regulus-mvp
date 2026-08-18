import Board from "@/components/game/Board";
import { SimBadge } from "@/components/game/ui";

export const metadata = { title: "The Living Board — Regulus" };

export default function BoardPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Demo County, MI — the living board</h1>
        <p className="text-stone-600 mt-2 text-sm max-w-2xl mx-auto">
          Every tile is one real lot in one real county cluster. Tile states are literal,
          verified real-world states — a tile only changes when geotagged photos and
          county documents prove the work happened.
        </p>
        <div className="mt-3"><SimBadge label="Simulated — 40 demo lots, no real inventory yet" /></div>
      </div>
      <Board />
    </main>
  );
}

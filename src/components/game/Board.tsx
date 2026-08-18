"use client";

import Link from "next/link";
import { useState } from "react";
import { LOTS, Lot, TILE_STATE_LABELS, fmt, lotTotalCents } from "@/lib/game";
import { TILE_COLORS, TILE_ICONS } from "./ui";

export default function Board() {
  const [hover, setHover] = useState<Lot | null>(null);
  return (
    <div>
      <div
        className="grid gap-1.5 sm:gap-2 max-w-3xl mx-auto"
        style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}
      >
        {LOTS.map((lot) => (
          <Link
            key={lot.id}
            href={`/lots/${lot.slug}`}
            onMouseEnter={() => setHover(lot)}
            onMouseLeave={() => setHover(null)}
            className={`aspect-square ${TILE_COLORS[lot.tileState]} border-2 rounded-md sm:rounded-lg flex items-center justify-center text-base sm:text-2xl shadow-sm hover:scale-105 hover:z-10 transition-transform`}
            aria-label={`${lot.name} — ${TILE_STATE_LABELS[lot.tileState]}`}
          >
            {TILE_ICONS[lot.tileState]}
          </Link>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-4 min-h-16">
        {hover ? (
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span className="font-semibold text-stone-900">{hover.name}</span>
            <span className="text-stone-600">{hover.acreage} ac · {hover.county}, {hover.state}</span>
            <span className="text-stone-600">{TILE_STATE_LABELS[hover.tileState]}</span>
            <span className="font-medium text-stone-900">{fmt(lotTotalCents(hover))} itemized</span>
            <span className="text-xs text-amber-700">simulated demo lot</span>
          </div>
        ) : (
          <p className="text-center text-sm text-stone-500">
            Hover a tile for details · click to open the lot
          </p>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-6 flex flex-wrap justify-center gap-3 text-xs text-stone-600">
        {(Object.keys(TILE_STATE_LABELS) as (keyof typeof TILE_STATE_LABELS)[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded ${TILE_COLORS[s].split(" ")[0]}`} />
            {TILE_STATE_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

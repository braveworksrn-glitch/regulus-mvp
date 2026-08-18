import Link from "next/link";
import {
  ImprovementAction,
  Lot,
  TILE_STATE_LABELS,
  TileState,
  actionTotalCents,
  fmt,
  lotTotalCents,
} from "@/lib/game";

/* Amber pill required on every simulated datum (spec §1.1) */
export function SimBadge({ label = "Simulated — demo inventory" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-medium px-2 py-0.5">
      ⚠ {label}
    </span>
  );
}

export function TrustStrip() {
  const items = [
    "Deed-out to your own name, $500 flat",
    "Title insured before listing",
    "Funds via licensed escrow — never held by Regulus",
    "3-lot cap / first 90 days · cooling-off period",
  ];
  return (
    <div className="bg-emerald-950 text-emerald-100 text-xs">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 justify-center">
        {items.map((t) => (
          <span key={t} className="whitespace-nowrap">✓ {t}</span>
        ))}
      </div>
    </div>
  );
}

const NAV = [
  { href: "/board", label: "The Board" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/portfolio", label: "My Land" },
  { href: "/listings", label: "Listings" },
  { href: "/trust", label: "Trust" },
  { href: "/founding", label: "Founding" },
];

export function SiteHeader() {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600 rotate-45" />
          <span className="font-bold tracking-tight text-stone-900">Regulus</span>
          <span className="text-[11px] text-stone-500 border border-stone-300 rounded px-1">demo</span>
        </Link>
        <nav className="flex gap-4 text-sm text-stone-600 overflow-x-auto">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-emerald-700 whitespace-nowrap">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-xs text-stone-500 space-y-3">
        <p>
          <strong>This is a product demo with simulated inventory.</strong> No money is
          collected, no land is sold, and nothing here is an offer. In the live product,
          all funds flow through a licensed title/escrow partner — Regulus never holds
          buyer funds.
        </p>
        <p>
          Regulus is about owning, building, and land — it is not a financial product.
          We publish no valuations and make no promises about resale. Improvements may
          cost more than they add to resale value; owners do them for access,
          build-readiness, and use. See{" "}
          <Link href="/trust" className="underline">what this is — and is not</Link>.
        </p>
        <p>
          © 2026 Regulus (demo) · <Link href="/rfp" className="underline">RFP Quick Reader (legacy tool)</Link>
        </p>
      </div>
    </footer>
  );
}

/* ---------------- board tile ---------------- */

export const TILE_COLORS: Record<TileState, string> = {
  overgrown: "bg-lime-900/80 border-lime-950",
  cleared: "bg-lime-500 border-lime-700",
  surveyed: "bg-emerald-400 border-emerald-600",
  access_unlocked: "bg-teal-400 border-teal-600",
  build_ready: "bg-amber-300 border-amber-500",
};

export const TILE_ICONS: Record<TileState, string> = {
  overgrown: "🌿",
  cleared: "🟩",
  surveyed: "📐",
  access_unlocked: "🛤",
  build_ready: "🏕",
};

export function Tile({ state, size = "md" }: { state: TileState; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-24 w-24 text-3xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-14 w-14 text-xl";
  return (
    <div
      className={`${sz} ${TILE_COLORS[state]} border-2 rounded-lg flex items-center justify-center shadow-sm transition-colors duration-500`}
      title={TILE_STATE_LABELS[state]}
    >
      <span>{TILE_ICONS[state]}</span>
    </div>
  );
}

export function StatePill({ state }: { state: TileState }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-xs px-2 py-0.5">
      {TILE_ICONS[state]} {TILE_STATE_LABELS[state]}
    </span>
  );
}

/* ---------------- itemized price card (spec §1.3) ---------------- */

export function PriceCard({ lot }: { lot: Lot }) {
  const lines = [
    ["County acquisition price", lot.countyPriceCents, "What the county actually charged — look it up."],
    ["Title cure + insurance bind", lot.titleCureCents, "Quiet-title certification; the deed is real because of this."],
    ["Series LLC + registered agent", lot.entityCents, "Your lot's own legal container. You own 100% of it."],
    ["Insurance + 24 mo taxes & servicing prepaid", lot.insuranceCents, "No surprise bills for two years."],
    ["Regulus curation fee (flat)", lot.curationFeeCents, "Sourcing, cure management, entity admin — itemized, not a markup."],
  ] as const;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-stone-900">Itemized price</h3>
        <SimBadge label="Simulated pricing" />
      </div>
      <ul className="space-y-2 text-sm">
        {lines.map(([label, cents, note]) => (
          <li key={label} className="flex justify-between gap-4">
            <div>
              <div className="text-stone-800">{label}</div>
              <div className="text-[11px] text-stone-500">{note}</div>
            </div>
            <div className="font-medium text-stone-900 whitespace-nowrap">{fmt(cents)}</div>
          </li>
        ))}
      </ul>
      <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between font-bold text-stone-900">
        <span>Total</span>
        <span>{fmt(lotTotalCents(lot))}</span>
      </div>
      <Link href="/trust/pricing" className="block mt-3 text-xs text-emerald-700 underline">
        Why this costs what it does — vs. doing it yourself →
      </Link>
    </div>
  );
}

/* ---------------- improvement action card ---------------- */

export function ActionCard({
  action,
  href,
}: {
  action: ImprovementAction;
  href?: string;
}) {
  const fee = Math.round(action.vendorCostCents * (action.platformFeeBps / 10000));
  const body = (
    <div className="rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-400 transition-colors h-full flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-stone-900">{action.title}</h4>
        <StatePill state={action.resultingTileState} />
      </div>
      <p className="text-sm text-stone-600 mt-1">{action.description}</p>
      <p className="text-xs text-emerald-800 mt-1 italic">{action.boardEffect}</p>
      <div className="mt-auto pt-3 text-sm text-stone-800 space-y-0.5">
        <div className="flex justify-between"><span>Vendor cost</span><span>{fmt(action.vendorCostCents)}</span></div>
        <div className="flex justify-between text-stone-500 text-xs">
          <span>Regulus service fee (22%, disclosed)</span><span>{fmt(fee)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span><span>{fmt(actionTotalCents(action))}</span>
        </div>
        <div className="text-xs text-stone-500">ETA: {action.etaWeeksMin}–{action.etaWeeksMax} weeks · verified by geotagged photos</div>
      </div>
      <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
        Improvements may cost more than they add to resale value — owners do them for
        access, build-readiness, and use.
      </p>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}

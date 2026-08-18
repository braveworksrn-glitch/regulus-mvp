// Regulus demo game data + local (browser) game state.
// All inventory here is SIMULATED demo data — is_simulated is true on every
// record, and the UI must render <SimBadge/> wherever this data appears.
// The matching Supabase schema lives in supabase/migrations/001_regulus_game.sql;
// this module stands in for it so the demo runs with zero backend config.

export type TileState =
  | "overgrown"
  | "cleared"
  | "surveyed"
  | "access_unlocked"
  | "build_ready";

export type LotStatus = "coming_soon" | "listed" | "owned" | "sandbox";

export interface Lot {
  id: string;
  slug: string;
  name: string;
  county: string;
  state: string;
  parcelId: string;
  acreage: number;
  gridX: number;
  gridY: number;
  tileState: TileState;
  status: LotStatus;
  countyPriceCents: number;
  titleCureCents: number;
  entityCents: number;
  insuranceCents: number;
  curationFeeCents: number;
  countyRecordUrl: string;
  isSimulated: true;
}

export interface ImprovementAction {
  id: string;
  title: string;
  boardEffect: string;
  description: string;
  vendorCostCents: number;
  platformFeeBps: number; // 2200 = 22%, always disclosed
  etaWeeksMin: number;
  etaWeeksMax: number;
  resultingTileState: TileState;
}

export interface TimelineEvent {
  id: string;
  lotId: string;
  kind: "photo" | "county_doc" | "crew_dispatch" | "weekly_tick" | "purchase";
  title: string;
  body: string;
  occurredAt: string;
  isSimulated: true;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  orderIndex: number;
}

export const TILE_STATE_LABELS: Record<TileState, string> = {
  overgrown: "Overgrown",
  cleared: "Cleared",
  surveyed: "Surveyed",
  access_unlocked: "Access Unlocked",
  build_ready: "Build-Ready",
};

export const TILE_STATE_ORDER: TileState[] = [
  "overgrown",
  "cleared",
  "surveyed",
  "access_unlocked",
  "build_ready",
];

export const RANKS = [
  { id: "thimble", label: "Thimble", minXp: 0 },
  { id: "boot", label: "Boot", minXp: 100 },
  { id: "wheelbarrow", label: "Wheelbarrow", minXp: 300 },
  { id: "top_hat", label: "Top Hat", minXp: 700 },
];

export function rankForXp(xp: number) {
  return [...RANKS].reverse().find((r) => xp >= r.minXp) ?? RANKS[0];
}

export const IMPROVEMENT_ACTIONS: ImprovementAction[] = [
  {
    id: "clearing",
    title: "Brush clearing",
    boardEffect: "Overgrown tile turns green — the hero before/after",
    description:
      "A licensed local crew brush-hogs the lot and hauls debris. Verified by geotagged 4-corner before/after photos.",
    vendorCostCents: 145000,
    platformFeeBps: 2200,
    etaWeeksMin: 2,
    etaWeeksMax: 5,
    resultingTileState: "cleared",
  },
  {
    id: "survey",
    title: "Boundary survey + corner pins",
    boardEffect: "“Borders Revealed” — your tile gets crisp surveyed edges",
    description:
      "A licensed surveyor stakes all four corners and records the survey with the county.",
    vendorCostCents: 87500,
    platformFeeBps: 2200,
    etaWeeksMin: 3,
    etaWeeksMax: 6,
    resultingTileState: "surveyed",
  },
  {
    id: "perc",
    title: "Perc / soil test",
    boardEffect: "“Septic Approved” badge — a build-ready seal on your tile",
    description:
      "County-recognized percolation and soil evaluation, the paperwork every future build needs.",
    vendorCostCents: 62500,
    platformFeeBps: 2200,
    etaWeeksMin: 2,
    etaWeeksMax: 4,
    resultingTileState: "surveyed",
  },
  {
    id: "driveway",
    title: "Culvert + gravel driveway",
    boardEffect: "“Access Unlocked” — a road connects to your tile",
    description:
      "Permit pre-validated for this county: culvert set, gravel drive cut from the road to your lot.",
    vendorCostCents: 385000,
    platformFeeBps: 2200,
    etaWeeksMin: 4,
    etaWeeksMax: 8,
    resultingTileState: "access_unlocked",
  },
  {
    id: "title_milestone",
    title: "Build-ready certification",
    boardEffect: "Tile earns the Build-Ready seal — the end state of v1",
    description:
      "Final document pass: survey, perc, access and tax status compiled into one recorded build-ready packet.",
    vendorCostCents: 45000,
    platformFeeBps: 2200,
    etaWeeksMin: 1,
    etaWeeksMax: 3,
    resultingTileState: "build_ready",
  },
];

export function actionTotalCents(a: ImprovementAction) {
  return Math.round(a.vendorCostCents * (1 + a.platformFeeBps / 10000));
}

export function lotTotalCents(l: Lot) {
  return (
    l.countyPriceCents +
    l.titleCureCents +
    l.entityCents +
    l.insuranceCents +
    l.curationFeeCents
  );
}

export function fmt(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export const QUESTS: Quest[] = [
  { id: "stake", title: "Stake Your Claim", description: "Claim your free sandbox lot.", xp: 25, orderIndex: 1 },
  { id: "boots", title: "First Boots on Ground", description: "Dispatch your first (simulated) crew.", xp: 50, orderIndex: 2 },
  { id: "tame", title: "Tame the Wild", description: "Watch your overgrown tile turn green.", xp: 100, orderIndex: 3 },
  { id: "borders", title: "Borders Revealed", description: "Complete a boundary survey.", xp: 100, orderIndex: 4 },
  { id: "access", title: "Access Unlocked", description: "Connect a driveway to your tile.", xp: 150, orderIndex: 5 },
  { id: "seal", title: "The Build-Ready Seal", description: "Reach the Build-Ready end state.", xp: 250, orderIndex: 6 },
];

/* ---------------- deterministic demo lot inventory ---------------- */

const FIRST = ["Birch", "Cedar", "Maple", "Aspen", "Willow", "Tamarack", "Juniper", "Alder"];
const SECOND = ["Hollow", "Ridge", "Bend", "Meadow", "Crossing"];

function seeded(n: number) {
  // small deterministic pseudo-random so the demo board is stable
  const x = Math.sin(n * 999) * 10000;
  return x - Math.floor(x);
}

export const LOTS: Lot[] = Array.from({ length: 40 }, (_, i) => {
  const gx = i % 8;
  const gy = Math.floor(i / 8);
  const r = seeded(i + 1);
  const states: TileState[] = ["overgrown", "overgrown", "overgrown", "cleared", "cleared", "surveyed", "access_unlocked", "build_ready"];
  const tileState = states[Math.floor(r * states.length)];
  const statusPool: LotStatus[] = ["listed", "listed", "listed", "owned", "coming_soon"];
  const status = statusPool[Math.floor(seeded(i + 41) * statusPool.length)];
  const county = 120000 + Math.floor(seeded(i + 81) * 200000); // $1,200–$3,200
  const name = `${FIRST[gx]} ${SECOND[gy % SECOND.length]} ${String(i + 1).padStart(2, "0")}`;
  return {
    id: `lot-${i + 1}`,
    slug: `lot-${i + 1}`,
    name,
    county: "Demo County",
    state: "MI",
    parcelId: `SIM-${(1000 + i).toString()}-DEMO`,
    acreage: Math.round((0.12 + seeded(i + 7) * 0.9) * 100) / 100,
    gridX: gx,
    gridY: gy,
    tileState,
    status,
    countyPriceCents: county,
    titleCureCents: 165000 + Math.floor(seeded(i + 13) * 60000),
    entityCents: 45000,
    insuranceCents: 38000,
    curationFeeCents: 95000,
    countyRecordUrl: "https://www.mideeds.com/",
    isSimulated: true,
  };
});

export function getLot(slug: string) {
  return LOTS.find((l) => l.slug === slug);
}

export function timelineFor(lot: Lot): TimelineEvent[] {
  const base: TimelineEvent[] = [
    {
      id: `${lot.id}-t1`,
      lotId: lot.id,
      kind: "county_doc",
      title: "Title cured & insured",
      body: "Quiet-title certification recorded; title insurance bound. The digital Deed exists only because this happened.",
      occurredAt: "2026-05-04",
      isSimulated: true,
    },
    {
      id: `${lot.id}-t2`,
      lotId: lot.id,
      kind: "county_doc",
      title: "Series LLC formed",
      body: `Series for ${lot.name} registered; 24 months of taxes and servicing prepaid.`,
      occurredAt: "2026-05-18",
      isSimulated: true,
    },
  ];
  const idx = TILE_STATE_ORDER.indexOf(lot.tileState);
  if (idx >= 1)
    base.push({
      id: `${lot.id}-t3`, lotId: lot.id, kind: "photo",
      title: "Brush clearing verified",
      body: "Geotagged 4-corner before/after photos uploaded by crew. Tile state: Cleared.",
      occurredAt: "2026-06-12", isSimulated: true,
    });
  if (idx >= 2)
    base.push({
      id: `${lot.id}-t4`, lotId: lot.id, kind: "county_doc",
      title: "Boundary survey recorded",
      body: "Corner pins set; survey on file with the county. Tile state: Surveyed.",
      occurredAt: "2026-07-02", isSimulated: true,
    });
  if (idx >= 3)
    base.push({
      id: `${lot.id}-t5`, lotId: lot.id, kind: "crew_dispatch",
      title: "Driveway crew mobilized",
      body: "Culvert set and gravel drive cut. Tile state: Access Unlocked.",
      occurredAt: "2026-07-28", isSimulated: true,
    });
  if (idx >= 4)
    base.push({
      id: `${lot.id}-t6`, lotId: lot.id, kind: "county_doc",
      title: "Build-Ready packet recorded",
      body: "Survey + perc + access compiled and recorded. Tile state: Build-Ready.",
      occurredAt: "2026-08-11", isSimulated: true,
    });
  return base.reverse();
}

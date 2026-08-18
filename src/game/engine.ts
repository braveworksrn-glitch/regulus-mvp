// Game-layer logic: grounds, route readings, verdicts, Captain Marks,
// Mending Tide (review-gated cooldowns), behavior flags, persistence.

import { SimulatedTidesAdapter } from "./adapter";
import type {
  Ground,
  LedgerEntry,
  PlayerState,
  Position,
  ReadingQuestion,
  Verdict,
  Voyage,
} from "./types";

export const GROUNDS: Ground[] = [
  {
    id: "glasswater",
    assetId: "SIM:GLASSWATER",
    name: "Glasswater Shoals",
    blurb: "Shallow, patient water. The catch is modest but the sea rarely turns.",
    temperament: "placid",
  },
  {
    id: "moontrench",
    assetId: "SIM:MOONTRENCH",
    name: "Moon Trench",
    blurb: "Deep tidal swings with the seasons. Reward for those who read the moon.",
    temperament: "seasonal",
  },
  {
    id: "emberdeep",
    assetId: "SIM:EMBERDEEP",
    name: "Emberdeep",
    blurb: "Glowing, violent water. Storm glyphs fly here more nights than not.",
    temperament: "stormprone",
  },
];

export const PANTRY_START = 100;
export const MAX_CASKS_PER_VOYAGE = 10; // harbormaster rule
export const READING_VALID_TICKS = 24;
export const SPYGLASS_COST = 0.5;
export const REVENGE_WINDOW_TICKS = 12;

export const RECALL_CHIPS = [
  "My reading was wrong — thesis invalidated",
  "Storm risk changed since I sailed",
  "I found a better use for these casks",
  "I'm anxious and want the boat home",
];

export const HYPOTHESIS_CHIPS = [
  "The current has been rising and should hold",
  "The water is calm enough for my anchor depth",
  "Price sits near a level the tide has respected",
  "Storm season looks to be passing",
  "I'm honestly not sure — small casks only",
];

export function groundById(id: string): Ground {
  const g = GROUNDS.find((g) => g.id === id);
  if (!g) throw new Error(`unknown ground ${id}`);
  return g;
}

// --- Route Reading: questions generated from the actual sim series, machine-checked ---
export function generateReading(
  adapter: SimulatedTidesAdapter,
  ground: Ground,
  casks: number
): ReadingQuestion[] {
  const hist = adapter.getHistory(ground.assetId, 60).map((q) => q.price);
  const rv = adapter.realizedVol(ground.assetId);
  const temperament = rv < 0.006 ? "placid" : rv < 0.016 ? "seasonal" : "storm-prone";
  const trend = hist[hist.length - 1] >= hist[0] ? "rising" : "falling";

  const tempOptions = ["placid", "seasonal", "storm-prone"];
  const q1: ReadingQuestion = {
    id: "temperament",
    prompt: "How does this water read right now?",
    options: tempOptions,
    correctIndex: tempOptions.indexOf(temperament),
  };
  const q2: ReadingQuestion = {
    id: "trend",
    prompt: "Which way has the current run over the last stretch?",
    options: ["rising", "falling"],
    correctIndex: trend === "rising" ? 0 : 1,
  };
  const worst = Math.round(casks * 10) / 10;
  const opts = [
    `about ${worst} casks, plus tithe — and more if the anchor drags`,
    "nothing — the anchor guarantees my casks",
    "only the harbor tithe",
  ];
  const q3: ReadingQuestion = {
    id: "worstcase",
    prompt: `If this voyage goes badly, what is truly at risk on ${casks} casks?`,
    options: opts,
    correctIndex: 0,
  };
  return [q1, q2, q3];
}

// --- Verdict: decision quality vs outcome, computed algorithmically ---
export function computeVerdict(voyage: Voyage, pos: Position): Verdict {
  const won = (pos.realizedCasks ?? 0) >= 0;
  // "good read" = plan honored: no impulsive recall shortly after a bad postcard,
  // stop never needed widening (impossible anyway), reading passed (always true to sail),
  // and if manually recalled, a non-anxiety reason or an honest anxiety admission counts
  // against plan quality only when it fought the plan.
  const impulsiveRecall =
    pos.status === "closed_manual" &&
    voyage.recallReason === RECALL_CHIPS[3] &&
    voyage.postcards.length > 0 &&
    voyage.postcards[voyage.postcards.length - 1].unrealizedCasks < 0;
  const overWatched = voyage.spyglassUses.length >= 4;
  const goodRead = !impulsiveRecall && !overWatched;
  if (goodRead && won) return "good_read_good_sea";
  if (goodRead && !won) return "good_read_rough_sea";
  if (!goodRead && won) return "poor_read_lucky_tide";
  return "poor_read_rough_sea";
}

export function marksFor(verdict: Verdict, pos: Position): { reason: string; amount: number }[] {
  const marks: { reason: string; amount: number }[] = [];
  if (verdict === "good_read_good_sea" || verdict === "good_read_rough_sea") {
    marks.push({ reason: "Sailed the plan you committed to", amount: 2 });
  }
  if (pos.status === "closed_stop") {
    marks.push({ reason: "Let the anchor do its job", amount: 1 });
  }
  if (pos.status === "closed_tp") {
    marks.push({ reason: "Held to your hold limit", amount: 1 });
  }
  // wins that violated the plan earn nothing — process over outcome
  return marks;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  good_read_good_sea: "Good reading, kind sea",
  good_read_rough_sea: "Good reading, rough weather",
  poor_read_lucky_tide: "Poor reading, lucky tide",
  poor_read_rough_sea: "Poor reading, rough sea",
};

export function postcardLine(unreal: number, temperament: string): string {
  if (unreal > 1) return "Nets filling well — the crew is singing.";
  if (unreal > 0) return "Nets a little heavy, current steady.";
  if (unreal > -1) return `Quiet water so far${temperament === "stormprone" ? ", clouds on the horizon" : ""}.`;
  return "The sea is taking more than it gives tonight.";
}

// --- Persistence (versioned; a wiped or altered save is logged, not prevented) ---
const SAVE_KEY = "lanternwake-save-v1";

export interface SaveShape {
  player: PlayerState;
  ledger: LedgerEntry[];
  voyages: Voyage[];
  seenOnboarding: boolean;
}

export function freshPlayer(): PlayerState {
  return {
    pantryCasks: PANTRY_START,
    captainMarks: 0,
    anchorsHonoredStreak: 0,
    reviewsCompleted: 0,
    behaviorFlags: [],
    mendingTide: [],
    lastLossTickByGround: {},
  };
}

export function loadSave(): SaveShape | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as SaveShape) : null;
  } catch {
    return null;
  }
}

export function persistSave(s: SaveShape) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    // storage full/blocked — play continues unsaved
  }
}

export function clearSave() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_KEY);
}

// Lanternwake — finance-truth layer + game layer types.
// The game UI never renders finance vocabulary; only this layer speaks it.

export type AssetId = string; // "SIM:EMBERDEEP" -> later "BINANCE:SOLUSDT"

export interface Quote {
  assetId: AssetId;
  price: number;
  ts: number;
}

export type EntrySpec =
  | { type: "market" }
  | { type: "limit"; price: number; expiresAtTick: number };

export interface BracketOrderSpec {
  assetId: AssetId;
  riskCasks: number; // casks committed (position size)
  entry: EntrySpec;
  stopPrice: number; // anchor line — required, a price LEVEL
  takeProfitPrice: number; // hold limit — required
}

export interface Fill {
  price: number;
  requestedPrice: number;
  slippage: number;
  feeCasks: number;
  tick: number;
}

export type PositionStatus =
  | "pending"
  | "open"
  | "closed_stop"
  | "closed_tp"
  | "closed_manual"
  | "entry_expired";

export interface Position {
  id: string;
  spec: BracketOrderSpec;
  status: PositionStatus;
  entryFill?: Fill;
  exitFill?: Fill;
  stopHistory: { price: number; tick: number }[]; // tighten-only, audited
  unrealizedCasks: number;
  realizedCasks?: number; // net of fees
  anchorDragCasks?: number; // gap-through-stop cost
}

export type Temperament = "placid" | "seasonal" | "stormprone";

export interface Ground {
  id: string;
  assetId: AssetId;
  name: string;
  blurb: string;
  temperament: Temperament;
}

export interface ReadingQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface RouteReading {
  groundId: string;
  passed: boolean;
  tick: number;
  validUntilTick: number;
}

export interface VoyageCard {
  id: string;
  groundId: string;
  positionSpec: BracketOrderSpec;
  cadenceTicks: number; // postcard cadence
  hypothesisChips: string[];
  createdTick: number;
}

export interface Postcard {
  tick: number;
  qualitative: string;
  unrealizedCasks: number;
}

export interface Voyage {
  id: string;
  cardId: string;
  positionId: string;
  groundId: string;
  postcards: Postcard[];
  spyglassUses: number[];
  recallReason?: string;
  reviewed: boolean;
}

export type Verdict =
  | "good_read_rough_sea"
  | "good_read_good_sea"
  | "poor_read_lucky_tide"
  | "poor_read_rough_sea";

export interface LedgerEntry {
  voyageId: string;
  groundName: string;
  verdict: Verdict;
  rMultiple: number;
  resultCasks: number;
  feeCasks: number;
  dragCasks: number;
  marksAwarded: { reason: string; amount: number }[];
  planHonored: boolean;
  closedTick: number;
}

export type BehaviorFlagType =
  | "revenge_attempt"
  | "spyglass_burst"
  | "storage_reset";

export interface PlayerState {
  pantryCasks: number;
  captainMarks: number;
  anchorsHonoredStreak: number;
  reviewsCompleted: number;
  behaviorFlags: { type: BehaviorFlagType; tick: number }[];
  mendingTide: { groundId: string; requiresReviewOf: string }[]; // voyageId
  lastLossTickByGround: Record<string, number>;
}

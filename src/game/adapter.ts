// SimulatedTidesAdapter — the MarketAdapter seam.
// Everything finance lives here: seeded GBM with jump-diffusion and regime-switching
// volatility, honest fees (harbor tithe), slippage, and gap-through-stop (anchor drag).
// A future ExchangeAdapter implements this same interface over a real API — but only
// behind the Graduation Path (real denominations shown before real money moves).

import type {
  AssetId,
  BracketOrderSpec,
  Position,
  Quote,
  Temperament,
} from "./types";

export interface AssetMeta {
  assetId: AssetId;
  temperament: Temperament;
}

export interface MarketAdapter {
  listAssets(): AssetMeta[];
  getQuote(assetId: AssetId): Quote;
  getHistory(assetId: AssetId, lookbackTicks: number): Quote[];
  placeBracket(spec: BracketOrderSpec): Position;
  cancelPendingEntry(positionId: string): Position;
  tightenStop(positionId: string, newStopPrice: number): Position; // rejects widening
  closePosition(positionId: string): Position; // recall flare — immediate, never delayed
  advanceTick(): void;
  poll(positionIds: string[]): Position[];
  currentTick(): number;
}

// Deterministic seeded RNG (mulberry32) so A/B runs replay the same seas.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number) {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface SimAsset {
  assetId: AssetId;
  baseVol: number; // per-tick sigma in calm regime
  stormVol: number;
  jumpProb: number;
  drift: number;
  price: number;
  inStorm: boolean;
  stormFlip: number; // prob of regime flip per tick
  series: number[];
}

export const TITHE_RATE = 0.003; // fee per fill, fraction of casks at play
const HISTORY = 240;

export class SimulatedTidesAdapter implements MarketAdapter {
  private rng: () => number;
  private tick = 0;
  private assets = new Map<AssetId, SimAsset>();
  private positions = new Map<string, Position>();
  private nextId = 1;

  constructor(seed = 1337) {
    this.rng = mulberry32(seed);
    const defs: Omit<SimAsset, "price" | "inStorm" | "series">[] = [
      { assetId: "SIM:GLASSWATER", baseVol: 0.004, stormVol: 0.012, jumpProb: 0.002, drift: 0.0002, stormFlip: 0.01 },
      { assetId: "SIM:EMBERDEEP", baseVol: 0.012, stormVol: 0.045, jumpProb: 0.012, drift: 0.0004, stormFlip: 0.03 },
      { assetId: "SIM:MOONTRENCH", baseVol: 0.008, stormVol: 0.025, jumpProb: 0.006, drift: 0.0001, stormFlip: 0.02 },
    ];
    for (const d of defs) {
      const a: SimAsset = { ...d, price: 100, inStorm: false, series: [] };
      this.assets.set(a.assetId, a);
      for (let i = 0; i < HISTORY; i++) this.step(a);
    }
  }

  private step(a: SimAsset) {
    if (this.rng() < a.stormFlip) a.inStorm = !a.inStorm;
    const vol = a.inStorm ? a.stormVol : a.baseVol;
    let ret = a.drift + vol * gaussian(this.rng);
    if (this.rng() < a.jumpProb) {
      // jump-diffusion: gaps that can blow through anchors
      ret += (this.rng() < 0.5 ? -1 : 1) * vol * (4 + 8 * this.rng());
    }
    a.price = Math.max(1, a.price * Math.exp(ret));
    a.series.push(a.price);
    if (a.series.length > HISTORY * 4) a.series.shift();
  }

  currentTick() {
    return this.tick;
  }

  listAssets(): AssetMeta[] {
    return [...this.assets.values()].map((a) => ({
      assetId: a.assetId,
      temperament: this.temperamentOf(a),
    }));
  }

  temperamentOf(a: SimAsset): Temperament {
    // honest: computed from realized vol of the recent series, not hardcoded flavor
    const s = a.series.slice(-120);
    let sum = 0;
    for (let i = 1; i < s.length; i++) {
      const r = Math.log(s[i] / s[i - 1]);
      sum += r * r;
    }
    const rv = Math.sqrt(sum / Math.max(1, s.length - 1));
    if (rv < 0.006) return "placid";
    if (rv < 0.016) return "seasonal";
    return "stormprone";
  }

  getQuote(assetId: AssetId): Quote {
    const a = this.mustAsset(assetId);
    return { assetId, price: a.price, ts: this.tick };
  }

  getHistory(assetId: AssetId, lookbackTicks: number): Quote[] {
    const a = this.mustAsset(assetId);
    return a.series
      .slice(-lookbackTicks)
      .map((price, i, arr) => ({ assetId, price, ts: this.tick - (arr.length - 1 - i) }));
  }

  realizedVol(assetId: AssetId, lookback = 120): number {
    const s = this.mustAsset(assetId).series.slice(-lookback);
    let sum = 0;
    for (let i = 1; i < s.length; i++) {
      const r = Math.log(s[i] / s[i - 1]);
      sum += r * r;
    }
    return Math.sqrt(sum / Math.max(1, s.length - 1));
  }

  private mustAsset(id: AssetId): SimAsset {
    const a = this.assets.get(id);
    if (!a) throw new Error(`unknown asset ${id}`);
    return a;
  }

  placeBracket(spec: BracketOrderSpec): Position {
    if (!(spec.stopPrice > 0) || !(spec.takeProfitPrice > 0)) {
      throw new Error("bracket rejected: anchor line and hold limit are required");
    }
    const a = this.mustAsset(spec.assetId);
    const pos: Position = {
      id: `pos-${this.nextId++}`,
      spec,
      status: "pending",
      stopHistory: [{ price: spec.stopPrice, tick: this.tick }],
      unrealizedCasks: 0,
    };
    if (spec.entry.type === "market") this.fillEntry(pos, a.price);
    this.positions.set(pos.id, pos);
    return { ...pos };
  }

  private slip(a: SimAsset): number {
    const vol = a.inStorm ? a.stormVol : a.baseVol;
    return vol * this.rng() * (a.inStorm ? 2 : 0.5); // squall surcharge
  }

  private fillEntry(pos: Position, requested: number) {
    const a = this.mustAsset(pos.spec.assetId);
    const slip = this.slip(a);
    const price = requested * (1 + slip);
    pos.entryFill = {
      price,
      requestedPrice: requested,
      slippage: slip,
      feeCasks: pos.spec.riskCasks * TITHE_RATE,
      tick: this.tick,
    };
    pos.status = "open";
  }

  private settle(pos: Position, exitPrice: number, status: Position["status"]) {
    const entry = pos.entryFill!;
    const grossFrac = exitPrice / entry.price - 1;
    const fee = pos.spec.riskCasks * TITHE_RATE;
    pos.exitFill = {
      price: exitPrice,
      requestedPrice: exitPrice,
      slippage: 0,
      feeCasks: fee,
      tick: this.tick,
    };
    pos.realizedCasks = pos.spec.riskCasks * grossFrac - fee - entry.feeCasks;
    pos.status = status;
    pos.unrealizedCasks = 0;
  }

  cancelPendingEntry(positionId: string): Position {
    const pos = this.mustPos(positionId);
    if (pos.status !== "pending") throw new Error("boat already at sea");
    pos.status = "entry_expired";
    return { ...pos };
  }

  tightenStop(positionId: string, newStopPrice: number): Position {
    const pos = this.mustPos(positionId);
    const current = pos.stopHistory[pos.stopHistory.length - 1].price;
    if (newStopPrice <= current) {
      throw new Error("anchor lines only shorten — widening rejected");
    }
    if (pos.status !== "open") throw new Error("no boat to re-anchor");
    pos.stopHistory.push({ price: newStopPrice, tick: this.tick });
    pos.spec = { ...pos.spec, stopPrice: newStopPrice };
    return { ...pos };
  }

  closePosition(positionId: string): Position {
    const pos = this.mustPos(positionId);
    if (pos.status === "pending") {
      pos.status = "entry_expired";
      return { ...pos };
    }
    if (pos.status !== "open") return { ...pos };
    const a = this.mustAsset(pos.spec.assetId);
    const slip = this.slip(a);
    this.settle(pos, a.price * (1 - slip), "closed_manual");
    return { ...pos };
  }

  private mustPos(id: string): Position {
    const p = this.positions.get(id);
    if (!p) throw new Error(`unknown position ${id}`);
    return p;
  }

  advanceTick() {
    this.tick++;
    for (const a of this.assets.values()) this.step(a);
    for (const pos of this.positions.values()) {
      const a = this.mustAsset(pos.spec.assetId);
      if (pos.status === "pending" && pos.spec.entry.type === "limit") {
        if (this.tick >= pos.spec.entry.expiresAtTick) {
          pos.status = "entry_expired"; // "the tide never turned"
        } else if (a.price <= pos.spec.entry.price) {
          this.fillEntry(pos, pos.spec.entry.price);
        }
      }
      if (pos.status === "open") {
        const stop = pos.spec.stopPrice;
        if (a.price <= stop) {
          // gap-through-stop: fill at the gapped price, not the promised level
          const fillPrice = Math.min(a.price, stop);
          const entry = pos.entryFill!;
          const promised = pos.spec.riskCasks * (stop / entry.price - 1);
          this.settle(pos, fillPrice, "closed_stop");
          pos.anchorDragCasks = Math.max(
            0,
            promised - (pos.realizedCasks ?? 0) - 2 * pos.spec.riskCasks * TITHE_RATE
          );
        } else if (a.price >= pos.spec.takeProfitPrice) {
          this.settle(pos, pos.spec.takeProfitPrice, "closed_tp");
        } else {
          pos.unrealizedCasks =
            pos.spec.riskCasks * (a.price / pos.entryFill!.price - 1);
        }
      }
    }
  }

  poll(positionIds: string[]): Position[] {
    return positionIds.map((id) => ({ ...this.mustPos(id) }));
  }
}

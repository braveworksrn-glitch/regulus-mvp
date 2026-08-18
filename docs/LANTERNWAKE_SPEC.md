# LANTERNWAKE — Final MVP Specification

**Version:** 1.0 (build-ready) · **Stack:** Next.js 15 (App Router) + Tailwind 4, client-heavy, TypeScript · **Date:** 2026-08-18

---

## 1. Product Definition & Positioning

**Name:** Lanternwake
**Theme:** A cozy night-fishing village on a bioluminescent sea. You are the harbor captain of a small lantern-boat fleet. You study tides, provision boats, set anchor lines and hold limits, send boats out, and review every voyage at the dockside ledger. The village grows as your *discipline* grows.

**What it is (final positioning):** A **trading-discipline trainer** running on simulated market data. Every gesture maps 1:1 to a trading primitive, but the product is sold and built as a simulator that trains pre-commitment habits — **not** as a disguised live-trading front end.

This is the single most important synthesis decision, unanimous across all three judges, all four panelists, and every sentiment channel: the "zero UI change to live trading" promise is killed. The architecture keeps the adapter seam so a live API *can* be wired later, but any live mode is explicitly out of MVP scope and, if ever built, ships with a **Graduation Path** (see §6.8) that progressively *un-disguises* the interface — real denominations appear before real money does. The disguise hides hype; it never hides material facts.

**Hypothesis being tested (measurable):** Removing the visual/emotional vocabulary of trading (tickers, candles, dollars, live P&L) plus structural commitment devices reduces the three killer behaviors — FOMO entries, panic exits, revenge re-entries — versus an identical sim with a plain trading UI. The MVP instruments exactly this (see §9).

**Target user (primary):** The burned beginner — traded 6–24 months, lost money to emotion, *knows it*, wants a wall between impulse and action. (Panelist 1: "I would download that today.")
**Target user (secondary):** Crypto-curious cozy gamers — served safely because the MVP is sim-only forever until graduation gates exist.

**Scope declaration:** **Long-only spot, v1.** No shorts, no leverage. Declared honestly in-game ("your boats catch fish; they do not profit from empty seas"). This resolves the losslessness critique by narrowing the claim rather than faking the mapping.

---

## 2. Trading Primitive → Game Mechanic Map

Every mechanic below is a *structural* implementation, not a reskin. Grafts from the losing concepts are marked.

| # | Trading Primitive | Game Mechanic | Implementation Notes |
|---|---|---|---|
| 1 | **Study / research** | **Tide Almanac + Route Reading.** Price history rendered as flowing current-ribbons (SVG); volatility = water choppiness; trend = current direction; volume = ribbon thickness. To unlock the dock you must pass the **Route Reading**: 2–3 tap-to-answer questions *derived from the actual data* ("Is Emberdeep placid or storm-prone right now?", "What is your worst case in casks if the anchor holds?"). Wrong answers re-show the relevant almanac panel. | **Comprehension gate, not a timer** (graft: fixes Rootbound's 90s ritual; demanded by panel + judges). Questions generated from the sim series, machine-checked. |
| 2 | **Asset selection** | **Fishing Grounds.** 3 named seas at launch (Emberdeep, Glasswater Shoals, Moon Trench), each one simulated asset with a temperament class (placid / seasonal / storm-prone) derived from its volatility parameter. Storm-prone grounds show **storm-warning glyphs** — volatility framed as danger, not opportunity. | Temperament is honest: computed from realized vol of the sim series, not hardcoded flavor. |
| 3 | **Position size** | **Cask loading + the Pantry.** Village pantry of lantern-oil = capital. Casks loaded on a boat = % at risk. Two hard caps: (a) **harbormaster rule** — max casks per voyage (default 2% risk-per-trade equivalent); (b) **the pantry is physically finite across all concurrent voyages** — total exposure capped because the oil literally runs out. | Graft: Rootbound's soil-tile cap → portfolio-level limit, spatially enforced. Slider shows casks leaving the pantry shelf (embodied sizing). |
| 4 | **Entry (market + limit)** | **The Voyage Card.** One atomic paper card: ground, casks, entry (sail now = market, or moor at the tide-gate buoy = **limit at a price level**), anchor line, hold limit, report cadence. The departure bell is **locked until every field is set** — a stop-less or target-less order is unrepresentable. Unfilled limits are honest: "the tide never turned — your boat never launched" (order expires/cancellable from the dock). | Graft: Rootbound's atomic Planting Card. The card *is* the bracket-order payload — see §5. Tide-gate buoy is a **price level**, not a distance (fixes Caravan's category error). |
| 5 | **Stop-loss** | **The Anchor Line.** Drag-the-rope interaction sets a stop **price level** rendered as anchor depth. Rules: mandatory; can only be **shortened** (tightened toward price), never lengthened; and it is **honest about gaps** — in rough seas "the anchor drags": the sim models gap-through-stop and slippage, so the boat can return with *less* than the anchor promised, and the ledger says so plainly. | Tighten-only rule enforced in the adapter, not just UI. Gap modeling from day 1 (unanimous critique fix). No "guaranteed worst case" language anywhere. |
| 6 | **Take-profit** | **The Hold Limit.** Marked waterline on the fish-hold = TP price level; hold fills → crew turns home automatically, harbor bell rings. Optional **half-hold dinghy**: partial take-profit / scale-out at a nearer line. | Half-hold is a stretch goal (cut line 1) but the data model supports it from day 1 — it's the only scale-out mapping in the dossier. |
| 7 | **Monitor / hold** | **Lantern postcards.** No live feed, ever. Boats flash reports at the cadence chosen on the Voyage Card (e.g., every 4 sim-hours). Postcards show qualitative state ("nets half full, current steady") **plus the honest cask-equivalent of unrealized P&L** — direction *and* magnitude in casks, because hiding magnitude is anesthesia (judge 1, panelist 3). A **Spyglass** peek between postcards is allowed but costs 1 lantern-oil splash and **auto-logs itself in the ledger**. | Graft: Driftlight's priced-and-journaled peek. Over-monitoring becomes visible, costed, reviewable data instead of an invisible habit. |
| 8 | **Exit (discretionary)** | **The Recall Flare.** Available any time (not just at postcards). Ritual: pick a recall reason from a structured chip list ("thesis invalidated", "storm risk changed", "I'm anxious" is an honest option) → flare lights → **executes immediately** at current sim price. Friction lives *before* the decision; a decided exit is never delayed. | The one-tide delay is deleted (unanimous: panel, judges, sentiment, regulator persona). Ritual retained; execution instant. |
| 9 | **Evaluate (P&L review)** | **The Dockside Ledger.** Mandatory unloading scene on every return: catch vs. casks spent (P&L in casks, with an R-multiple shown as "growth ratio" fish-per-cask), your original Voyage Card beside what actually happened, fees/slippage itemized ("harbor tithe: 0.3 cask", "anchor dragged 2 fathoms"), and a decision-vs-outcome verdict: **"good reading, rough weather" / "poor reading, lucky tide"** — computed algorithmically, not self-graded. Losses that honored the anchor still earn Captain Marks; wins that violated the plan earn none. | Graft: Caravan's decision-vs-outcome ceremony + algorithmic scoring (judge 1's winning mechanic, made non-gameable per its own critique). |
| 10 | **Fees / slippage / fills** | **Harbor tithe** (fee per voyage, % of casks), **anchor drag** (slippage/gaps), **the tide never turned** (unfilled limit), **squall surcharge** (worse fills in high-vol regimes). All modeled in the sim engine from day 1. | The fiction has vocabulary for every real execution failure *before* any API exists. Non-negotiable per all critiques. |

---

## 3. Emotional-Regulation Feature List (designed mechanics, not theming)

Each destructive pattern gets a structural counter **and** an instrumented metric.

1. **FOMO → the locked bell.** No entry without a passed Route Reading + complete Voyage Card. No live prices anywhere, no other players' catches, no surging-asset feed. Storm glyphs reframe volatility as danger. *Metric: time-from-open-app-to-launch; Route Reading first-try pass rate.*
2. **Panic selling → magnitude-honest postcards + instant-but-ritualized flare.** Drawdown is visible in casks (you practice *tolerating* it — the swing trader's point that hidden drawdown prevents learning the actual skill) but never as a flashing red live tick. The flare's chip-reason step inserts one deliberate breath; execution is immediate. The anchor means panic has little to protect you from — and the game says exactly what the anchor does *and doesn't* guarantee. *Metric: flare rate within N minutes of a negative postcard; "I'm anxious" chip frequency.*
3. **Revenge trading → Mending Tide, gated on behavior.** After a losing voyage, that ground reopens only after the ledger review is **completed** (review-gated, not time-gated — graft from judge 1's fix list). Escalated clamps (reduced max casks next day) trigger on **behavioral flags** — attempted same-ground relaunch within one tide of a loss, reason-less flare attempts, repeated spyglass bursts — **never on raw losing streaks**, so honored anchors on a normal variance run are not punished (fixes the variance-punishment critique in three of four concepts). *Metric: post-loss re-entry latency; same-asset revenge replant rate.*
4. **Overleverage → finite pantry.** Physically impossible to exceed portfolio risk cap; the oil runs out. Per-voyage harbormaster cap on top.
5. **Stop-widening → tighten-only anchors**, enforced at the adapter layer.
6. **Overwatching → priced, logged spyglass** + chosen postcard cadence, both reviewed in the weekly recap.
7. **Outcome fixation → Captain Marks & the Discipline Score.** Progression currency flows only from machine-checked process quality: anchors honored, plans complete, reviews finished, no behavioral flags. A shareable **Discipline Card** ("14 anchors honored in a row") gives ego a destination that isn't P&L (panelist 1's explicit request). The village visibly grows from Marks — bigger boats, garden, harbor cat, new grounds charted — so *disciplined losing voyages advance you and impulsive winning ones do not*.
8. **Loss trivialization → designed loss salience.** The unloading scene after a loss is deliberately somber: pantry shelf visibly emptier, a villager mentions rationing, the ledger shows the exact cask cost including tithe and drag. Abstraction removes *hype*; consequence weight is re-added on purpose (graft from all three critiques + swing-trader panelist).
9. **Pattern mirror → Harbormaster's Notes.** Weekly, the ledger surfaces algorithmically detected patterns as gentle observations: "Your storm-ground voyages launched within one tide of a loss return 40% lighter." (Graft: Rootbound's Almanac pattern-flagging — "a mirror is worth more than a mask.")
10. **Empty-waiting → productive downtime.** Between postcards the harbor offers *non-market* micro-loops: study almanacs of other grounds (feeds the next trade), mend nets, tend the Mark-grown garden, greet the cat. Waiting is pleasant, not anxious — the retention answer to friction-heavy design (judge 3's decisive point; kept deliberately lightweight in MVP, see §7).

---

## 4. Screen-by-Screen MVP Flow

Six screens + onboarding. Fundamentally "a forms-and-cards app wearing a fishing-village skin" — static illustration + CSS/SVG animation, no game engine.

### 4.1 Onboarding — "First Lantern"
Guided first voyage on a training ground with compressed time. Teaches: read almanac → pass Route Reading → fill Voyage Card → launch → receive postcard → boat returns (scripted small loss with anchor drag!) → ledger review earns first Captain Mark for an *honored anchor on a loss*. The first lesson the game teaches is that a well-run losing voyage advances you, and that anchors can drag.

### 4.2 Harbor (home)
Night village panorama. Shows: pantry level (shelf of casks), moored/at-sea boats, Mending Tide banners, Captain Mark progress, garden/cat, entry points to all screens. **No prices, no positions ticker.** If a boat is at sea, the sea is fog past the harbor mouth.

### 4.3 Tide Almanac (study)
Per-ground page: current-ribbon history (SVG path from sim series, multiple zoom windows — "last tide / last week / last season"), temperament badge with storm glyphs, recent voyage annotations from your own ledger. CTA: "Read this route" → Route Reading quiz (2–3 generated questions) → unlocks the Dock for that ground for a limited window (e.g., 2 sim-hours), so study is fresh at entry.

### 4.4 The Dock (Voyage Card)
One card, five commitments, one bell:
1. Ground (pre-selected from passed reading)
2. Casks — slider capped by harbormaster rule + remaining pantry; shows worst-case loss in casks *including estimated tithe and typical drag*
3. Entry — "sail on this tide" (market) or drag the tide-gate buoy to a level (limit; shows "may never fill")
4. Anchor line — drag rope to a level below entry; card displays risk in casks and R-ratio to hold limit
5. Hold limit — drag waterline above entry; card warns if R < 1 ("long row for a small catch")
6. Postcard cadence picker
Bell is greyed until all set; striking it plays the departure ritual and calls `adapter.placeBracket()`.

### 4.5 At Sea
Fogged sea, boat lantern glow. Postcard stack (newest on top) with qualitative line + cask-honest unrealized delta. Buttons: **Spyglass** (costs oil, logs itself, shows current state), **Recall Flare** (chip-reason → immediate close), **Tighten Anchor** (drag, one direction only), **Return to Harbor** (leave the screen — the game encourages this). Downtime CTA: "Study another sea while you wait."

### 4.6 Dockside Ledger (review)
Unloading scene → ledger entry: plan card vs. outcome timeline (static side-by-side, no replay animation — cut per Caravan critique), itemized tithe/drag, R-multiple as fish-per-cask, algorithmic verdict badge, Captain Marks awarded with reasons, Harbormaster's Note if a pattern fired. Completing review lifts Mending Tide. Weekly recap card: expectancy ("yield per cask"), discipline streaks, spyglass/flare counts, shareable Discipline Card export (canvas → PNG).

### 4.7 Settings / Demo Time
Time-compression toggle (real cadence vs. demo cadence where 1 sim-day ≈ 6 min) — clearly labeled "Harbor Festival (demo) time," visually distinct so compressed play is never mistaken for the training cadence. Also: reset world, export event log (JSON).

---

## 5. Data Model (TypeScript, client-side)

```ts
// ---- Finance-truth layer (adapter vocabulary; game never renders these words) ----
type AssetId = string;                       // "SIM:EMBERDEEP" -> later "BINANCE:SOLUSDT"

interface Quote { assetId: AssetId; price: number; ts: number; }

interface BracketOrderSpec {
  assetId: AssetId;
  riskFraction: number;        // casks / pantry, e.g. 0.02
  entry: { type: 'market' } | { type: 'limit'; price: number; expiresAt: number };
  stopPrice: number;           // anchor — REQUIRED, level not distance
  takeProfitPrice: number;     // hold limit — REQUIRED
  partialTp?: { price: number; fraction: number };   // half-hold dinghy (v1.1)
}

interface Fill { price: number; requestedPrice: number; slippage: number; fee: number; ts: number; }

type PositionStatus = 'pending' | 'open' | 'closed_stop' | 'closed_tp'
                    | 'closed_manual' | 'entry_expired';

interface Position {
  id: string; spec: BracketOrderSpec; status: PositionStatus;
  entryFill?: Fill; exitFill?: Fill;
  stopHistory: { price: number; ts: number }[];      // tighten-only, audited
  realizedPnlFraction?: number;                       // of bankroll, incl. fees
}

// ---- Game layer ----
interface Ground {
  id: string; assetId: AssetId; name: string;
  temperament: 'placid' | 'seasonal' | 'stormprone';  // computed from realized vol
}

interface RouteReading {                // comprehension gate result
  groundId: string; questions: { id: string; answer: string; correct: boolean }[];
  passed: boolean; ts: number; validUntil: number;
}

interface VoyageCard {                  // atomic pre-commitment artifact == BracketOrderSpec + meta
  id: string; groundId: string; positionSpec: BracketOrderSpec;
  cadenceMinutes: number; readingId: string;
  hypothesisChips: string[];            // structured, machine-checkable (no free text)
  createdAt: number;
}

interface Voyage {
  id: string; cardId: string; positionId: string;
  postcards: { ts: number; qualitative: string; unrealizedCasks: number }[];
  spyglassUses: { ts: number }[];
  recall?: { reasonChip: string; ts: number };
}

interface LedgerEntry {
  voyageId: string; verdict: 'good_read_rough_sea' | 'good_read_good_sea'
    | 'poor_read_lucky_tide' | 'poor_read_rough_sea';
  rMultiple: number; feesCasks: number; slippageCasks: number;
  marksAwarded: { reason: string; amount: number }[];
  reviewCompletedAt?: number;           // gates Mending Tide lift
}

interface PlayerState {
  pantryCasks: number;                  // bankroll
  captainMarks: number;
  disciplineStreaks: { anchorsHonored: number; reviewsCompleted: number };
  behaviorFlags: { type: 'revenge_attempt' | 'spyglass_burst' | 'flare_no_reason'
                 | 'clock_skew' | 'storage_reset'; ts: number }[];
  mendingTide: { groundId: string; requiresReviewOf: string }[];
  settings: { demoTime: boolean; plainUiMode: boolean };  // plainUiMode = A/B harness
}

interface EventLog { events: { type: string; ts: number; payload: unknown }[]; } // append-only, exportable
```

**Persistence:** Zustand + `localStorage` (versioned, migration-safe). All guardrail state is *also* checksummed and clock-anchored: tampering isn't prevented (impossible client-side) but **detected and logged** as `clock_skew` / `storage_reset` flags — bypass rate is itself a primary experiment metric (graft: Rootbound fix list; endorsed by judge 2).

---

## 6. MarketAdapter Interface (the seam)

One module owns every finance concept. Game code imports only the adapter and game-layer types.

```ts
interface MarketAdapter {
  listAssets(): Promise<AssetMeta[]>;                          // id, volatilityClass
  getQuote(assetId: AssetId): Promise<Quote>;
  getHistory(assetId: AssetId, from: number, to: number, res: Resolution): Promise<Quote[]>;

  placeBracket(spec: BracketOrderSpec): Promise<Position>;     // atomic; rejects stop-less specs
  cancelPendingEntry(positionId: string): Promise<Position>;   // "un-moor the boat"
  tightenStop(positionId: string, newStopPrice: number): Promise<Position>; // REJECTS widening
  closePosition(positionId: string): Promise<Position>;        // recall flare — immediate

  poll(positionIds: string[]): Promise<Position[]>;            // drives postcards & auto-resolution
  getFeeModel(): FeeModel;                                     // so UI can show worst-case honestly
}
```

**MVP implementation — `SimulatedTidesAdapter`:**
- Seeded GBM per asset with **jump-diffusion** (occasional gaps) and regime-switching volatility (placid ↔ storm), ticking on a client interval; deterministic per seed for A/B replay.
- **Honest execution model:** taker fee (harbor tithe) on every fill; slippage as f(volatility regime, size); stops fill at *simulated gap price* when a jump crosses the level (anchor drag); limit entries can expire unfilled.
- Runs in demo-time or real-time cadence off the same series.

**Future `ExchangeAdapter` (out of scope, designed-for):** same interface over a real API. Hard preconditions documented in code comments: Graduation Path complete (see below), real denominations shown at planning and unloading, plain-language disclosure at every launch, instant exits, compliance review. The seam exists; the promise does not.

### 6.8 Graduation Path (designed now, built later)
Stage 0 (MVP): pure fiction, casks only. Stage 1: casks gain unit labels ("1 cask = $10 sim"). Stage 2: same UI, plain numbers alongside fiction. Stage 3: plain paper-trading UI (which is also the A/B control mode, `plainUiMode`). Transfer-of-learning test between stages: same decision shown as a price chart, measure behavior retention. Only past Stage 3 does any live-money conversation begin.

---

## 7. Build Plan (7 days, one dev)

- **Day 1–2:** Sim engine (GBM + jumps + regimes + fee/slippage model), `MarketAdapter` types + `SimulatedTidesAdapter` with unit tests (tighten-only rejection, gap-through-stop, unfilled limits). Zustand store, event log, persistence.
- **Day 3:** Almanac screen (current-ribbon SVG from series), Route Reading question generator (template questions parameterized by real series stats), temperament computation.
- **Day 4:** Dock / Voyage Card (cask slider + caps, drag-anchor, drag-hold-line, tide-gate buoy, locked bell), `placeBracket` wiring.
- **Day 5:** At Sea (postcard scheduler from cadence, spyglass with cost+log, recall flare with chip reasons + instant close, tighten-anchor), Harbor home.
- **Day 6:** Ledger (unloading scene, itemized tithe/drag, algorithmic verdict + Captain Marks, Mending Tide review-gating, behavioral flag detectors, Harbormaster's Notes v0 = 3 rule-based patterns), weekly recap + Discipline Card PNG export.
- **Day 7:** Onboarding "First Lantern," demo-time toggle, `plainUiMode` control-UI shell, bypass telemetry, cozy micro-layer *minimum viable warmth* (cat, garden tied to Marks — static art states, zero logic beyond Mark thresholds), polish, deploy to Vercel.

**Cut lines (in order, if tight):** half-hold dinghy → Harbormaster's Notes (keep flags, defer prose) → Discipline Card export → garden/cat states → third ground.

---

## 8. Aesthetic & Content Notes
Hand-illustrated flat night palette (deep indigo sea, warm lantern ambers, paper-cream cards); Tailwind 4 design tokens; CSS keyframe water shimmer; SVG ribbons/ropes with drag handles (pointer events). No dollar signs, tickers, candles, or percentage badges anywhere in game-layer UI. Copy voice: quiet, concrete, never coy about risk ("Anchors slow a fall; in a squall they can drag").

---

## 9. Success Metrics & Experiment Design (week 2)
A/B on identical seeded sim series: **Lanternwake UI vs. plainUiMode**. Primary: entry-without-full-plan attempts (control only), stop-widen attempts, panic-exit rate within N min of adverse move, post-loss re-entry latency, position-size escalation after losses. Secondary: D2/D7 return rate, review-completion rate, spyglass frequency trend, **bypass/tamper rate**. Kill criterion stated up front: if the disguise moves no behavioral metric vs. control, the disguise dies and the pre-commitment tooling ships as a plain trainer — the mechanics stand on their own (unanimous panel view).

---

## 10. Explicitly OUT of Scope (MVP)
1. **Live trading / real money / exchange API connection** — seam only; hard-gated behind Graduation Path + compliance review. The words "zero UI change" are banned from all materials.
2. **Short selling & leverage** — v1 is declared long-only spot, in-fiction and in docs.
3. Backend, auth, accounts, multiplayer/guilds, social feeds, leaderboards (leaderboards likely never — they are a FOMO vector).
4. Gull rumors / sentiment feed (a designed FOMO channel; deferred until it can be built as a skepticism-training mechanic with reliability scoring).
5. Free-text journaling (chips only; free text optional and never scored).
6. Delayed exits of any kind, anywhere, ever.
7. Villager questlines, seasonal festivals, trailing hold-lines (trailing stops), replay animations, mobile apps, sound.
8. Server-side guardrail enforcement (client-side + tamper telemetry for MVP; server KV noted as first post-MVP infra item since the anti-tilt system's integrity is the product).
9. NLP evaluation of anything.
10. Real market data feeds (sim only; keeps the honest-physics model fully controllable for the A/B test).

---

*Core loop in one line: Read the tide → pass the reading → commit the whole card → strike the bell → live your life between postcards → answer the flare's one question or let the anchor do its job → weigh the catch honestly → grow the village on discipline, not luck.*

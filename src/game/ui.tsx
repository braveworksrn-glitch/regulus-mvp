"use client";

// Lanternwake — the whole harbor in one client app.
// No dollar signs, tickers, candles, or percentages appear anywhere in this file's UI copy.

import { useEffect, useMemo, useRef, useState } from "react";
import { SimulatedTidesAdapter, TITHE_RATE } from "./adapter";
import {
  GROUNDS,
  HYPOTHESIS_CHIPS,
  MAX_CASKS_PER_VOYAGE,
  READING_VALID_TICKS,
  RECALL_CHIPS,
  REVENGE_WINDOW_TICKS,
  SPYGLASS_COST,
  VERDICT_LABEL,
  clearSave,
  computeVerdict,
  freshPlayer,
  generateReading,
  groundById,
  loadSave,
  marksFor,
  persistSave,
  postcardLine,
} from "./engine";
import type {
  Ground,
  LedgerEntry,
  PlayerState,
  Position,
  ReadingQuestion,
  Voyage,
  VoyageCard,
} from "./types";

type Screen = "harbor" | "almanac" | "dock" | "atsea" | "ledger";

const TICK_MS = 4000; // one sim-hour every 4s ("Harbor Festival time" for the MVP)

function fmtCasks(n: number) {
  const r = Math.round(n * 10) / 10;
  return `${r > 0 ? "+" : ""}${r} cask${Math.abs(r) === 1 ? "" : "s"}`;
}

function TemperamentBadge({ t }: { t: Ground["temperament"] }) {
  const style =
    t === "placid"
      ? "bg-teal-900/60 text-teal-200"
      : t === "seasonal"
        ? "bg-indigo-800/60 text-indigo-200"
        : "bg-rose-950/70 text-rose-300";
  const label = t === "stormprone" ? "⚡ storm-prone" : t;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${style}`}>{label}</span>
  );
}

function Ribbon({ prices, width = 560, height = 120 }: { prices: number[]; width?: number; height?: number }) {
  // price history as a flowing current-ribbon; thickness follows local choppiness
  const path = useMemo(() => {
    if (prices.length < 2) return { top: "", bottom: "" };
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = Math.max(1e-9, max - min);
    const pts = prices.map((p, i) => ({
      x: (i / (prices.length - 1)) * width,
      y: height - 14 - ((p - min) / span) * (height - 28),
    }));
    const chop = prices.map((p, i) =>
      i === 0 ? 0 : Math.abs(Math.log(prices[i] / prices[i - 1]))
    );
    const maxChop = Math.max(...chop, 1e-9);
    const top = pts
      .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${(pt.y - 2 - (chop[i] / maxChop) * 7).toFixed(1)}`)
      .join(" ");
    const bottom = [...pts]
      .reverse()
      .map((pt, ri) => {
        const i = pts.length - 1 - ri;
        return `L${pt.x.toFixed(1)},${(pt.y + 2 + (chop[i] / maxChop) * 7).toFixed(1)}`;
      })
      .join(" ");
    return { top, bottom };
  }, [prices, width, height]);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <path d={`${path.top} ${path.bottom} Z`} fill="url(#ribbon)" opacity="0.9" />
      <defs>
        <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.25" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0.75" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LanternwakeApp() {
  const adapterRef = useRef<SimulatedTidesAdapter | null>(null);
  if (!adapterRef.current) adapterRef.current = new SimulatedTidesAdapter();
  const adapter = adapterRef.current;

  const [screen, setScreen] = useState<Screen>("harbor");
  const [tick, setTick] = useState(0);
  const [player, setPlayer] = useState<PlayerState>(freshPlayer);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [card, setCard] = useState<VoyageCard | null>(null);
  const [selectedGround, setSelectedGround] = useState<Ground>(GROUNDS[0]);
  const [reading, setReading] = useState<{ groundId: string; validUntil: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [seenIntro, setSeenIntro] = useState(true);
  const loaded = useRef(false);

  // load save once
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const s = loadSave();
    if (s) {
      const p = { ...s.player };
      // boats from a past session came home while you slept — refund unreviewed exposure
      for (const v of s.voyages) {
        if (!s.ledger.find((l) => l.voyageId === v.id)) {
          // exposure was held out of pantry; return it untouched
        }
      }
      setPlayer(p);
      setLedger(s.ledger);
      setSeenIntro(s.seenOnboarding);
    } else {
      setSeenIntro(false);
    }
  }, []);

  // persist on change
  useEffect(() => {
    if (!loaded.current) return;
    persistSave({ player, ledger, voyages: [], seenOnboarding: seenIntro });
  }, [player, ledger, seenIntro]);

  // the tide: advance sim, deliver postcards, resolve boats
  useEffect(() => {
    const h = setInterval(() => {
      adapter.advanceTick();
      const t = adapter.currentTick();
      setTick(t);
      setPosition((prev) => {
        if (!prev) return prev;
        const [p] = adapter.poll([prev.id]);
        return p;
      });
    }, TICK_MS);
    return () => clearInterval(h);
  }, [adapter]);

  // postcards + voyage resolution follow position state
  useEffect(() => {
    if (!position || !voyage || !card) return;
    if (position.status === "open") {
      const due =
        voyage.postcards.length === 0 ||
        tick - voyage.postcards[voyage.postcards.length - 1].tick >= card.cadenceTicks;
      const startTick = position.entryFill?.tick ?? card.createdTick;
      if (due && tick > startTick) {
        const g = groundById(voyage.groundId);
        setVoyage({
          ...voyage,
          postcards: [
            ...voyage.postcards,
            {
              tick,
              qualitative: postcardLine(position.unrealizedCasks, g.temperament),
              unrealizedCasks: Math.round(position.unrealizedCasks * 10) / 10,
            },
          ],
        });
      }
    } else if (
      position.status === "closed_stop" ||
      position.status === "closed_tp" ||
      position.status === "closed_manual" ||
      position.status === "entry_expired"
    ) {
      settleVoyage(position);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, position?.status]);

  function say(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function settleVoyage(pos: Position) {
    if (!voyage || !card) return;
    const g = groundById(voyage.groundId);
    if (pos.status === "entry_expired") {
      setPlayer((p) => ({ ...p, pantryCasks: p.pantryCasks + card.positionSpec.riskCasks }));
      say(`The tide never turned at ${g.name} — your boat never launched. Casks returned.`);
      setVoyage(null);
      setPosition(null);
      setCard(null);
      setScreen("harbor");
      return;
    }
    const result = pos.realizedCasks ?? 0;
    const verdict = computeVerdict(voyage, pos);
    const marks = marksFor(verdict, pos);
    const risk = card.positionSpec.riskCasks;
    const stopDist = 1 - card.positionSpec.stopPrice / (pos.entryFill?.price ?? 1);
    const plannedRisk = Math.max(0.001, risk * Math.abs(stopDist));
    const entry: LedgerEntry = {
      voyageId: voyage.id,
      groundName: g.name,
      verdict,
      rMultiple: Math.round((result / plannedRisk) * 100) / 100,
      resultCasks: Math.round(result * 10) / 10,
      feeCasks: Math.round(risk * TITHE_RATE * 2 * 100) / 100,
      dragCasks: Math.round((pos.anchorDragCasks ?? 0) * 100) / 100,
      marksAwarded: marks,
      planHonored: verdict.startsWith("good_read"),
      closedTick: tick,
    };
    setLedger((l) => [entry, ...l]);
    setPlayer((p) => {
      const next = { ...p };
      next.pantryCasks = Math.max(0, p.pantryCasks + risk + result);
      next.captainMarks = p.captainMarks + marks.reduce((s, m) => s + m.amount, 0);
      next.anchorsHonoredStreak =
        pos.status === "closed_stop" || entry.planHonored ? p.anchorsHonoredStreak + 1 : 0;
      if (result < 0) {
        next.lastLossTickByGround = { ...p.lastLossTickByGround, [g.id]: tick };
        next.mendingTide = [...p.mendingTide, { groundId: g.id, requiresReviewOf: voyage.id }];
      }
      return next;
    });
    setVoyage({ ...voyage, reviewed: false });
    setScreen("ledger");
    say(
      pos.status === "closed_stop"
        ? "Your anchor line went taut. The boat is home — weigh the catch at the ledger."
        : pos.status === "closed_tp"
          ? "The hold filled to its limit — the harbor bell is ringing."
          : "Your boat is home. Weigh the catch at the ledger."
    );
    setPosition(null);
    setCard(null);
  }

  function completeReview() {
    if (!voyage) return;
    setPlayer((p) => ({
      ...p,
      reviewsCompleted: p.reviewsCompleted + 1,
      mendingTide: p.mendingTide.filter((m) => m.requiresReviewOf !== voyage.id),
    }));
    setVoyage(null);
    say("Ledger closed. The nets are mended — the sea will be there tomorrow.");
    setScreen("harbor");
  }

  const activeGroundBlocked = (g: Ground) =>
    player.mendingTide.some((m) => m.groundId === g.id);

  function tryOpenDock(g: Ground) {
    if (voyage && !voyage.reviewed && position) {
      say("Your boat is still at sea.");
      return;
    }
    if (activeGroundBlocked(g)) {
      say("The Mending Tide holds this ground — finish your ledger review first.");
      setScreen("ledger");
      return;
    }
    const lastLoss = player.lastLossTickByGround[g.id];
    if (lastLoss !== undefined && tick - lastLoss < REVENGE_WINDOW_TICKS) {
      setPlayer((p) => ({
        ...p,
        behaviorFlags: [...p.behaviorFlags, { type: "revenge_attempt", tick }],
      }));
      say(
        "The harbormaster raises an eyebrow: back to the same water so soon after a loss? The dock opens, but it goes in your book."
      );
    }
    setSelectedGround(g);
    setScreen("almanac");
  }

  // ---------- screens ----------
  const pantry = Math.round(player.pantryCasks * 10) / 10;

  return (
    <div className="min-h-screen bg-[#0b1026] text-[#e8e3d3]" style={{ fontFamily: "Georgia, serif" }}>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <button onClick={() => setScreen("harbor")} className="text-left">
            <h1 className="text-2xl tracking-wide text-amber-200">🏮 Lanternwake</h1>
            <p className="text-xs text-slate-400">a night-fishing village on a glowing sea · training waters, no real coin</p>
          </button>
          <div className="text-right text-sm">
            <div className="text-amber-300">🛢 {pantry} casks in the pantry</div>
            <div className="text-teal-300">✦ {player.captainMarks} Captain Marks</div>
            <div className="text-slate-400 text-xs">tide {tick} · anchors honored streak: {player.anchorsHonoredStreak}</div>
          </div>
        </header>

        {toast && (
          <div className="mb-4 rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-2 text-sm text-amber-200">
            {toast}
          </div>
        )}

        {!seenIntro && <Intro onDone={() => setSeenIntro(true)} />}

        {seenIntro && screen === "harbor" && (
          <Harbor
            player={player}
            voyage={voyage}
            position={position}
            ledger={ledger}
            onGround={tryOpenDock}
            blocked={activeGroundBlocked}
            goSea={() => setScreen("atsea")}
            goLedger={() => setScreen("ledger")}
            onReset={() => {
              clearSave();
              window.location.reload();
            }}
          />
        )}

        {seenIntro && screen === "almanac" && (
          <Almanac
            adapter={adapter}
            ground={selectedGround}
            tick={tick}
            onPassed={() => {
              setReading({ groundId: selectedGround.id, validUntil: tick + READING_VALID_TICKS });
              setScreen("dock");
            }}
            onBack={() => setScreen("harbor")}
          />
        )}

        {seenIntro && screen === "dock" && reading?.groundId === selectedGround.id && (
          <Dock
            adapter={adapter}
            ground={selectedGround}
            pantry={player.pantryCasks}
            tick={tick}
            onLaunch={(c) => {
              try {
                const pos = adapter.placeBracket(c.positionSpec);
                setPlayer((p) => ({ ...p, pantryCasks: p.pantryCasks - c.positionSpec.riskCasks }));
                setCard(c);
                setPosition(pos);
                setVoyage({
                  id: `voy-${Date.now()}`,
                  cardId: c.id,
                  positionId: pos.id,
                  groundId: selectedGround.id,
                  postcards: [],
                  spyglassUses: [],
                  reviewed: false,
                });
                setScreen("atsea");
                say(
                  c.positionSpec.entry.type === "market"
                    ? "The departure bell rings. Your boat slips past the harbor mouth into the fog."
                    : "Your boat moors at the tide-gate buoy, waiting for the water to reach it."
                );
              } catch (e) {
                say(e instanceof Error ? e.message : "The harbormaster shakes her head.");
              }
            }}
            onBack={() => setScreen("harbor")}
          />
        )}

        {seenIntro && screen === "atsea" && (
          <AtSea
            voyage={voyage}
            position={position}
            player={player}
            adapter={adapter}
            onSpyglass={() => {
              if (!voyage || !position || position.status !== "open") return;
              if (player.pantryCasks < SPYGLASS_COST) {
                say("Not enough oil for the spyglass lantern.");
                return;
              }
              const burst = voyage.spyglassUses.filter((t) => tick - t < 6).length >= 2;
              setPlayer((p) => ({
                ...p,
                pantryCasks: p.pantryCasks - SPYGLASS_COST,
                behaviorFlags: burst
                  ? [...p.behaviorFlags, { type: "spyglass_burst", tick }]
                  : p.behaviorFlags,
              }));
              setVoyage({ ...voyage, spyglassUses: [...voyage.spyglassUses, tick] });
              say(
                `You burn ${SPYGLASS_COST} cask of oil for a long look: nets holding ${fmtCasks(position.unrealizedCasks)}. This peek goes in the ledger.`
              );
            }}
            onTighten={(price) => {
              if (!position) return;
              try {
                setPosition(adapter.tightenStop(position.id, price));
                say("You haul the anchor line shorter. It will never be let out again.");
              } catch (e) {
                say(e instanceof Error ? e.message : "The rope refuses.");
              }
            }}
            onRecall={(reason) => {
              if (!position || !voyage) return;
              setVoyage({ ...voyage, recallReason: reason });
              const closed = adapter.closePosition(position.id);
              setPosition(closed); // settles via effect
              say("The recall flare climbs. The boat turns for home at once — no tide delays a decided exit.");
            }}
            onHome={() => setScreen("harbor")}
          />
        )}

        {seenIntro && screen === "ledger" && (
          <Ledger
            ledger={ledger}
            voyage={voyage}
            player={player}
            onCompleteReview={completeReview}
            onHome={() => setScreen("harbor")}
          />
        )}
      </div>
    </div>
  );
}

// ---------- Intro / onboarding ----------
function Intro({ onDone }: { onDone: () => void }) {
  return (
    <div className="rounded-xl border border-indigo-800/60 bg-[#101636] p-6 leading-relaxed">
      <h2 className="mb-3 text-xl text-amber-200">First Lantern</h2>
      <p className="mb-2 text-sm text-slate-300">
        You are the new harbor captain of a small lantern-boat fleet. Your pantry of oil casks is your
        whole fortune. The rules of this harbor are old and strict:
      </p>
      <ul className="mb-3 list-disc pl-5 text-sm text-slate-300 space-y-1">
        <li>No boat leaves the dock without a <b>full voyage card</b>: where, how many casks, an <b>anchor line</b> below, a <b>hold limit</b> above.</li>
        <li>You must <b>read the route</b> before you may sail it. The reading goes stale with the tide.</li>
        <li>At sea, boats send <b>postcards</b> — there is no watching the water live. A spyglass peek costs oil and is written down.</li>
        <li>Anchor lines slow a fall; <b>in a squall they can drag</b>. The harbor takes its tithe on every voyage. The sea is honest about neither.</li>
        <li>Every returned boat is weighed at the <b>dockside ledger</b>. Captain Marks flow from how well you sailed the plan — a disciplined loss earns them, a lucky reckless catch does not.</li>
        <li>After a losing voyage, the <b>Mending Tide</b> holds that water until your ledger review is done.</li>
      </ul>
      <p className="mb-4 text-xs text-slate-500">
        These are training waters: the sea is simulated and no real coin is at stake. Everything you
        practice here — committing a full plan, sizing small, letting anchors work, reviewing honestly —
        is the discipline that survives real water.
      </p>
      <button onClick={onDone} className="rounded-lg bg-amber-700 px-4 py-2 text-sm text-amber-50 hover:bg-amber-600">
        Light the lantern
      </button>
    </div>
  );
}

// ---------- Harbor ----------
function Harbor(props: {
  player: PlayerState;
  voyage: Voyage | null;
  position: Position | null;
  ledger: LedgerEntry[];
  onGround: (g: Ground) => void;
  blocked: (g: Ground) => boolean;
  goSea: () => void;
  goLedger: () => void;
  onReset: () => void;
}) {
  const { player, voyage, position, ledger } = props;
  const atSea = position && (position.status === "open" || position.status === "pending");
  const needsReview = voyage && !voyage.reviewed && !position;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-800/60 bg-[#101636] p-5">
        <h2 className="mb-1 text-lg text-amber-200">The Harbor at Night</h2>
        <p className="mb-4 text-sm text-slate-400">
          Lanterns sway on the docks. The cat is asleep on a coil of rope.{" "}
          {player.captainMarks >= 10
            ? "Your garden by the harbor wall is blooming — the village notices a steady hand."
            : "Earn Captain Marks and the village will grow with you."}
        </p>
        {atSea ? (
          <button onClick={props.goSea} className="mb-3 w-full rounded-lg border border-teal-700 bg-teal-950/40 px-4 py-3 text-left text-sm text-teal-200 hover:bg-teal-900/40">
            ⛵ A boat is out past the fog — walk to the sea wall
          </button>
        ) : needsReview ? (
          <button onClick={props.goLedger} className="mb-3 w-full rounded-lg border border-amber-700 bg-amber-950/40 px-4 py-3 text-left text-sm text-amber-200 hover:bg-amber-900/40">
            📖 A returned boat waits to be weighed — open the dockside ledger
          </button>
        ) : (
          <p className="mb-3 text-sm text-slate-400">The fleet is moored. Choose a fishing ground to study.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          {GROUNDS.map((g) => {
            const held = props.blocked(g);
            return (
              <button
                key={g.id}
                onClick={() => props.onGround(g)}
                disabled={!!atSea}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  held
                    ? "border-rose-900 bg-rose-950/30 text-rose-300"
                    : "border-indigo-800/70 bg-[#0d1330] hover:border-teal-700"
                } ${atSea ? "opacity-40" : ""}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-amber-100">{g.name}</span>
                  <TemperamentBadge t={g.temperament} />
                </div>
                <p className="text-xs text-slate-400">{held ? "Held by the Mending Tide until your review is done." : g.blurb}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <button onClick={props.goLedger} className="underline hover:text-slate-300">
          Dockside ledger ({ledger.length} voyages)
        </button>
        <button onClick={props.onReset} className="underline hover:text-rose-300">
          Abandon this harbor (reset)
        </button>
      </div>
    </div>
  );
}

// ---------- Almanac + Route Reading ----------
function Almanac(props: {
  adapter: SimulatedTidesAdapter;
  ground: Ground;
  tick: number;
  onPassed: () => void;
  onBack: () => void;
}) {
  const { adapter, ground } = props;
  const [quiz, setQuiz] = useState<ReadingQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [wrong, setWrong] = useState<string[]>([]);
  const prices = useMemo(
    () => adapter.getHistory(ground.assetId, 120).map((q) => q.price),
    // re-read the water each tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adapter, ground, props.tick]
  );
  const meta = adapter.listAssets().find((a) => a.assetId === ground.assetId)!;

  return (
    <div className="rounded-xl border border-indigo-800/60 bg-[#101636] p-5">
      <button onClick={props.onBack} className="mb-3 text-xs text-slate-500 underline">← back to harbor</button>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg text-amber-200">Tide Almanac — {ground.name}</h2>
        <TemperamentBadge t={meta.temperament} />
      </div>
      <p className="mb-2 text-xs text-slate-400">
        The current, drawn from the last hundred-odd tides. Thick, ragged ribbon means chopped, dangerous
        water; a smooth ribbon means patient water.
      </p>
      <div className="mb-4 rounded-lg bg-[#0a0f24] p-2">
        <Ribbon prices={prices} />
      </div>
      {!quiz ? (
        <button
          onClick={() => setQuiz(generateReading(adapter, ground, MAX_CASKS_PER_VOYAGE))}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm text-teal-50 hover:bg-teal-700"
        >
          Read this route
        </button>
      ) : (
        <div className="space-y-4">
          {quiz.map((q) => (
            <div key={q.id}>
              <p className="mb-1 text-sm text-slate-200">{q.prompt}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((o, i) => (
                  <button
                    key={o}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      answers[q.id] === i
                        ? "border-amber-500 bg-amber-900/50 text-amber-100"
                        : "border-indigo-800 text-slate-300 hover:border-slate-500"
                    } ${wrong.includes(q.id) && answers[q.id] === i ? "border-rose-600" : ""}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {wrong.includes(q.id) && (
                <p className="mt-1 text-xs text-rose-300">Look at the water again — the almanac disagrees.</p>
              )}
            </div>
          ))}
          <button
            onClick={() => {
              const missed = quiz.filter((q) => answers[q.id] !== q.correctIndex).map((q) => q.id);
              if (missed.length) setWrong(missed);
              else props.onPassed();
            }}
            disabled={Object.keys(answers).length < quiz.length}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm text-amber-50 hover:bg-amber-600 disabled:opacity-40"
          >
            Present your reading to the harbormaster
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Dock / Voyage Card ----------
function Dock(props: {
  adapter: SimulatedTidesAdapter;
  ground: Ground;
  pantry: number;
  tick: number;
  onLaunch: (c: VoyageCard) => void;
  onBack: () => void;
}) {
  const { adapter, ground, pantry } = props;
  const quote = adapter.getQuote(ground.assetId);
  const [casks, setCasks] = useState(Math.min(2, pantry));
  const [entryMode, setEntryMode] = useState<"market" | "limit">("market");
  const [limitDepth, setLimitDepth] = useState(3); // how far below current water the buoy sits
  const [anchorDepth, setAnchorDepth] = useState(8); // stop distance below entry
  const [holdHeight, setHoldHeight] = useState(12); // TP distance above entry
  const [chips, setChips] = useState<string[]>([]);
  const [cadence, setCadence] = useState(4);

  const entryPrice = entryMode === "market" ? quote.price : quote.price * (1 - limitDepth / 100);
  const stopPrice = entryPrice * (1 - anchorDepth / 100);
  const tpPrice = entryPrice * (1 + holdHeight / 100);
  const worstCasks = (casks * anchorDepth) / 100 + casks * TITHE_RATE * 2;
  const bestCasks = (casks * holdHeight) / 100;
  const rRatio = holdHeight / anchorDepth;
  const maxCasks = Math.min(MAX_CASKS_PER_VOYAGE, Math.floor(pantry));
  const ready = casks >= 1 && chips.length >= 1;

  return (
    <div className="rounded-xl border border-indigo-800/60 bg-[#101636] p-5">
      <button onClick={props.onBack} className="mb-3 text-xs text-slate-500 underline">← back to harbor</button>
      <h2 className="mb-1 text-lg text-amber-200">The Dock — {ground.name}</h2>
      <p className="mb-4 text-xs text-slate-400">
        One card, every commitment. The departure bell stays locked until the whole card is written.
      </p>

      <div className="space-y-5 text-sm">
        <div>
          <label className="mb-1 block text-slate-300">Casks aboard — <b>{casks}</b> of {maxCasks} the harbormaster allows (pantry holds {Math.round(pantry * 10) / 10})</label>
          <input type="range" min={1} max={Math.max(1, maxCasks)} value={casks} onChange={(e) => setCasks(+e.target.value)} className="w-full accent-amber-500" />
        </div>

        <div>
          <p className="mb-1 text-slate-300">Departure</p>
          <div className="flex gap-2">
            <button onClick={() => setEntryMode("market")} className={`rounded-full border px-3 py-1 text-xs ${entryMode === "market" ? "border-amber-500 bg-amber-900/50" : "border-indigo-800"}`}>
              Sail on this tide
            </button>
            <button onClick={() => setEntryMode("limit")} className={`rounded-full border px-3 py-1 text-xs ${entryMode === "limit" ? "border-amber-500 bg-amber-900/50" : "border-indigo-800"}`}>
              Moor at the tide-gate buoy
            </button>
          </div>
          {entryMode === "limit" && (
            <div className="mt-2">
              <label className="mb-1 block text-xs text-slate-400">
                Buoy set {limitDepth} fathoms below today&apos;s water — the tide may never turn to reach it, and the boat comes home unlaunched.
              </label>
              <input type="range" min={1} max={10} value={limitDepth} onChange={(e) => setLimitDepth(+e.target.value)} className="w-full accent-teal-500" />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-slate-300">
            ⚓ Anchor line — {anchorDepth} fathoms below departure. Worst case near <b className="text-rose-300">{Math.round(worstCasks * 10) / 10} casks</b> including the harbor tithe — <i>more if the anchor drags in a squall</i>.
          </label>
          <input type="range" min={2} max={20} value={anchorDepth} onChange={(e) => setAnchorDepth(+e.target.value)} className="w-full accent-rose-500" />
        </div>

        <div>
          <label className="mb-1 block text-slate-300">
            🐟 Hold limit — {holdHeight} fathoms above departure, near <b className="text-teal-300">{Math.round(bestCasks * 10) / 10} casks</b> if it fills.
            {rRatio < 1 && <span className="ml-2 text-amber-400">A long row for a small catch — sure?</span>}
          </label>
          <input type="range" min={2} max={40} value={holdHeight} onChange={(e) => setHoldHeight(+e.target.value)} className="w-full accent-teal-500" />
        </div>

        <div>
          <p className="mb-1 text-slate-300">Why this voyage? (the ledger will hold you to it)</p>
          <div className="flex flex-wrap gap-2">
            {HYPOTHESIS_CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setChips((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]))}
                className={`rounded-full border px-3 py-1 text-xs ${chips.includes(c) ? "border-amber-500 bg-amber-900/50 text-amber-100" : "border-indigo-800 text-slate-300"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-slate-300">Postcard cadence — a lantern flash every {cadence} tides</label>
          <input type="range" min={2} max={12} value={cadence} onChange={(e) => setCadence(+e.target.value)} className="w-full accent-indigo-400" />
        </div>

        <button
          disabled={!ready}
          onClick={() =>
            props.onLaunch({
              id: `card-${Date.now()}`,
              groundId: ground.id,
              positionSpec: {
                assetId: ground.assetId,
                riskCasks: casks,
                entry:
                  entryMode === "market"
                    ? { type: "market" }
                    : { type: "limit", price: entryPrice, expiresAtTick: props.tick + 48 },
                stopPrice,
                takeProfitPrice: tpPrice,
              },
              cadenceTicks: cadence,
              hypothesisChips: chips,
              createdTick: props.tick,
            })
          }
          className="w-full rounded-lg bg-amber-700 px-4 py-3 text-amber-50 hover:bg-amber-600 disabled:opacity-40"
        >
          🔔 {ready ? "Strike the departure bell" : "The bell is locked — finish the card (pick at least one reason)"}
        </button>
      </div>
    </div>
  );
}

// ---------- At Sea ----------
function AtSea(props: {
  voyage: Voyage | null;
  position: Position | null;
  player: PlayerState;
  adapter: SimulatedTidesAdapter;
  onSpyglass: () => void;
  onTighten: (price: number) => void;
  onRecall: (reason: string) => void;
  onHome: () => void;
}) {
  const { voyage, position } = props;
  const [flareOpen, setFlareOpen] = useState(false);
  if (!voyage || !position) {
    return (
      <div className="rounded-xl border border-indigo-800/60 bg-[#101636] p-5 text-sm text-slate-400">
        The sea past the harbor mouth is dark and empty tonight.{" "}
        <button onClick={props.onHome} className="underline">Walk home.</button>
      </div>
    );
  }
  const g = groundById(voyage.groundId);
  const pending = position.status === "pending";
  const currentStop = position.stopHistory[position.stopHistory.length - 1].price;
  return (
    <div className="rounded-xl border border-indigo-800/60 bg-[#101636] p-5">
      <button onClick={props.onHome} className="mb-3 text-xs text-slate-500 underline">← leave the sea wall (the boat sails on)</button>
      <h2 className="mb-1 text-lg text-amber-200">At Sea — {g.name}</h2>
      <div className="mb-4 h-24 rounded-lg bg-gradient-to-b from-[#0a0f24] to-[#122040] p-3 text-sm text-slate-400">
        {pending
          ? "🪢 Your boat waits at the tide-gate buoy, lantern low. If the tide never turns, it comes home unlaunched."
          : "🌫 Fog past the harbor mouth. Somewhere out there, a lantern. Postcards will come at the cadence you chose."}
      </div>

      <div className="mb-4 space-y-2">
        {voyage.postcards.length === 0 && !pending && (
          <p className="text-xs text-slate-500">No postcards yet. Go mend a net; the sea keeps its own time.</p>
        )}
        {[...voyage.postcards].reverse().map((p) => (
          <div key={p.tick} className="rounded-lg border border-indigo-900 bg-[#0d1330] px-3 py-2 text-sm">
            <span className="mr-2 text-xs text-slate-500">tide {p.tick}</span>
            {p.qualitative}{" "}
            <span className={p.unrealizedCasks >= 0 ? "text-teal-300" : "text-rose-300"}>
              ({fmtCasks(p.unrealizedCasks)})
            </span>
          </div>
        ))}
      </div>

      {!pending && (
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={props.onSpyglass} className="rounded-lg border border-indigo-700 px-3 py-2 hover:border-teal-600">
            🔭 Spyglass peek (burns {SPYGLASS_COST} cask, goes in the ledger)
          </button>
          <button
            onClick={() => props.onTighten(currentStop * 1.03)}
            className="rounded-lg border border-indigo-700 px-3 py-2 hover:border-teal-600"
          >
            ⚓ Haul the anchor line shorter
          </button>
          <button onClick={() => setFlareOpen(true)} className="rounded-lg border border-rose-800 px-3 py-2 text-rose-200 hover:border-rose-600">
            🧨 Recall flare
          </button>
        </div>
      )}
      {pending && (
        <button
          onClick={() => props.onRecall("Un-moored the boat before launch")}
          className="rounded-lg border border-indigo-700 px-3 py-2 text-sm hover:border-teal-600"
        >
          🪢 Un-moor the boat (cancel the wait)
        </button>
      )}

      {flareOpen && (
        <div className="mt-4 rounded-lg border border-rose-900 bg-rose-950/30 p-4">
          <p className="mb-2 text-sm text-rose-200">
            One honest breath before the flare: why is the boat coming home? It sails home the moment you answer — nothing delays a decided exit.
          </p>
          <div className="flex flex-wrap gap-2">
            {RECALL_CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setFlareOpen(false);
                  props.onRecall(c);
                }}
                className="rounded-full border border-rose-800 px-3 py-1 text-xs text-rose-100 hover:bg-rose-900/40"
              >
                {c}
              </button>
            ))}
            <button onClick={() => setFlareOpen(false)} className="rounded-full border border-indigo-800 px-3 py-1 text-xs text-slate-300">
              Never mind — let it sail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Ledger ----------
function Ledger(props: {
  ledger: LedgerEntry[];
  voyage: Voyage | null;
  player: PlayerState;
  onCompleteReview: () => void;
  onHome: () => void;
}) {
  const { ledger, voyage, player } = props;
  const pendingEntry = voyage && !voyage.reviewed ? ledger.find((l) => l.voyageId === voyage.id) : null;
  const flags = player.behaviorFlags.slice(-5);
  return (
    <div className="rounded-xl border border-indigo-800/60 bg-[#101636] p-5">
      <button onClick={props.onHome} className="mb-3 text-xs text-slate-500 underline">← back to harbor</button>
      <h2 className="mb-3 text-lg text-amber-200">The Dockside Ledger</h2>

      {pendingEntry && (
        <div className={`mb-5 rounded-lg border p-4 ${pendingEntry.resultCasks >= 0 ? "border-teal-800 bg-teal-950/20" : "border-rose-900 bg-rose-950/20"}`}>
          <p className="mb-1 text-sm text-slate-300">
            {pendingEntry.resultCasks >= 0
              ? "The crew unloads a decent catch under lantern light."
              : "The unloading is quiet tonight. The pantry shelf looks a little emptier, and the cook says nothing."}
          </p>
          <div className="mb-2 text-sm">
            <span className="mr-3">Catch: <b className={pendingEntry.resultCasks >= 0 ? "text-teal-300" : "text-rose-300"}>{fmtCasks(pendingEntry.resultCasks)}</b></span>
            <span className="mr-3 text-slate-400">harbor tithe {pendingEntry.feeCasks} casks</span>
            {pendingEntry.dragCasks > 0 && (
              <span className="text-amber-400">the anchor dragged {pendingEntry.dragCasks} casks in the squall</span>
            )}
          </div>
          <p className="mb-1 text-sm text-amber-200">Verdict: {VERDICT_LABEL[pendingEntry.verdict]} · yield {pendingEntry.rMultiple} fish-per-cask-risked</p>
          {pendingEntry.marksAwarded.length > 0 ? (
            <ul className="mb-2 text-xs text-teal-300">
              {pendingEntry.marksAwarded.map((m) => (
                <li key={m.reason}>✦ +{m.amount} — {m.reason}</li>
              ))}
            </ul>
          ) : (
            <p className="mb-2 text-xs text-slate-400">No Captain Marks — the catch does not excuse the sailing.</p>
          )}
          <button onClick={props.onCompleteReview} className="rounded-lg bg-amber-700 px-4 py-2 text-sm text-amber-50 hover:bg-amber-600">
            Close the ledger {pendingEntry.resultCasks < 0 && "(lifts the Mending Tide)"}
          </button>
        </div>
      )}

      {flags.length > 0 && (
        <div className="mb-4 rounded-lg border border-indigo-900 bg-[#0d1330] p-3 text-xs text-slate-400">
          <p className="mb-1 text-slate-300">Harbormaster&apos;s notes:</p>
          {flags.map((f, i) => (
            <p key={i}>
              {f.type === "revenge_attempt" && `· tide ${f.tick}: back to the same water within a tide of a loss.`}
              {f.type === "spyglass_burst" && `· tide ${f.tick}: three peeks in quick succession — the sea does not move faster for being watched.`}
              {f.type === "storage_reset" && `· tide ${f.tick}: the harbor records were disturbed.`}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {ledger.length === 0 && <p className="text-sm text-slate-500">No voyages weighed yet.</p>}
        {ledger.map((l) => (
          <div key={l.voyageId} className="flex items-center justify-between rounded-lg border border-indigo-900 bg-[#0d1330] px-3 py-2 text-sm">
            <div>
              <span className="mr-2 text-slate-300">{l.groundName}</span>
              <span className="text-xs text-slate-500">{VERDICT_LABEL[l.verdict]}</span>
            </div>
            <div className="text-right">
              <span className={l.resultCasks >= 0 ? "text-teal-300" : "text-rose-300"}>{fmtCasks(l.resultCasks)}</span>
              <span className="ml-2 text-xs text-teal-400">✦ {l.marksAwarded.reduce((s, m) => s + m.amount, 0)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

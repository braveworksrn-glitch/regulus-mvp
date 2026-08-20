"use client";

/**
 * Explicit operator controls for one opportunity.
 * Manual-control invariant: nothing here runs on its own — every state
 * change is a button click, and the page refreshes only after an action.
 *
 *  - Advance (one step, optional note)  -> POST /api/pipeline/advance
 *  - Record decision (submitted only)   -> POST /api/pipeline/decision
 *  - Park / Restore                     -> POST /api/pipeline/park
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  canAdvance,
  canPark,
  canRecordDecision,
  isParked,
  nextStatus,
  statusLabel,
} from "../_lib/pipeline-ui";

const OUTCOMES = [
  ["awarded", "Awarded"],
  ["declined", "Declined"],
  ["withdrawn", "Withdrawn"],
];

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON error body */
  }
  if (res.status === 401) {
    throw new Error("Session expired — sign in again via /admin.");
  }
  if (!res.ok) {
    const msg = data && (data.error || data.message);
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data;
}

const btnBase =
  "inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50";
const btnQuiet = `${btnBase} border border-line bg-bg text-muted hover:border-accent hover:text-ink`;
const btnOutline = `${btnBase} border border-line bg-bg text-ink hover:border-accent`;
const btnPrimary = `${btnBase} bg-accent text-bg hover:opacity-90`;

export default function OpportunityActions({ opportunityId, status }) {
  const router = useRouter();
  const [mode, setMode] = useState(null); // null | "advance" | "decision"
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const target = nextStatus(status);

  function reset() {
    setMode(null);
    setNote("");
    setOutcome(null);
    setError(null);
  }

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const confirmAdvance = () =>
    run(() =>
      post("/api/pipeline/advance", {
        opportunityId,
        ...(note.trim() ? { note: note.trim() } : {}),
      })
    );

  const confirmDecision = () =>
    run(() =>
      post("/api/pipeline/decision", {
        opportunityId,
        outcome,
        ...(note.trim() ? { note: note.trim() } : {}),
      })
    );

  const togglePark = () => run(() => post("/api/pipeline/park", { opportunityId }));

  if (status === "decision_recorded") {
    return (
      <span className="text-xs text-muted">Closed — decision recorded.</span>
    );
  }

  return (
    <div className="flex min-w-[13rem] flex-col items-start gap-2">
      {mode === null && (
        <div className="flex flex-wrap items-center gap-2">
          {canAdvance(status) && target && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMode("advance");
                setError(null);
              }}
              className={btnOutline}
            >
              Advance &rarr; {statusLabel(target)}
            </button>
          )}
          {canRecordDecision(status) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMode("decision");
                setError(null);
              }}
              className={btnOutline}
            >
              Record decision
            </button>
          )}
          {canPark(status) && (
            <button
              type="button"
              disabled={busy}
              onClick={togglePark}
              className={btnQuiet}
            >
              {busy ? "Working…" : "Park"}
            </button>
          )}
          {isParked(status) && (
            <button
              type="button"
              disabled={busy}
              onClick={togglePark}
              className={btnOutline}
            >
              {busy ? "Working…" : "Restore"}
            </button>
          )}
        </div>
      )}

      {mode === "advance" && (
        <div className="w-full rounded-lg border border-line bg-bg p-3">
          <label className="block text-[11px] font-medium uppercase tracking-widest text-muted">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Why this step is done…"
            className="mt-1.5 w-full rounded-md border border-line bg-card px-2.5 py-1.5 text-sm text-ink focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={confirmAdvance}
              className={btnPrimary}
            >
              {busy ? "Advancing…" : `Confirm advance to ${statusLabel(target)}`}
            </button>
            <button type="button" disabled={busy} onClick={reset} className={btnQuiet}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "decision" && (
        <div className="w-full rounded-lg border border-line bg-bg p-3">
          <span className="block text-[11px] font-medium uppercase tracking-widest text-muted">
            Funder decision
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Outcome">
            {OUTCOMES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={outcome === value}
                disabled={busy}
                onClick={() => setOutcome(value)}
                className={`${btnBase} border ${
                  outcome === value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line bg-card text-muted hover:border-accent hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-[11px] font-medium uppercase tracking-widest text-muted">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Award amount, feedback, next cycle…"
            className="mt-1.5 w-full rounded-md border border-line bg-card px-2.5 py-1.5 text-sm text-ink focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || !outcome}
              onClick={confirmDecision}
              className={btnPrimary}
            >
              {busy ? "Recording…" : "Confirm decision"}
            </button>
            <button type="button" disabled={busy} onClick={reset} className={btnQuiet}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs leading-relaxed text-muted">
          {error}
        </p>
      )}
    </div>
  );
}

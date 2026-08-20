/**
 * Pipeline storage — grant-pipeline clients + opportunities.
 *
 * JSON file store at .data/pipeline.json using the same atomic-write pattern
 * as waitlistStore (tmp file + rename, per-process write lock). Auto-seeds
 * from src/lib/seed/trial-client.js on first read if the file is missing.
 *
 * MANUAL-CONTROL INVARIANT (GRANTLINE control-deck spec): nothing in this
 * module runs on a schedule or advances state on its own. Every state change
 * is a function call made by an operator-clicked API route — advance moves
 * exactly ONE step per call.
 *
 * Opportunity status machine (advance only, one step per call):
 *   identified -> vetting -> go_decision -> drafting -> review
 *     -> ready_to_submit -> submitted -> decision_recorded
 *   - recordDecision(): only from "submitted"; sets outcome
 *     ("awarded" | "declined" | "withdrawn") and status "decision_recorded".
 *   - park(): from any pre-submitted state sets status "parked" (stores the
 *     prior status in parkedFrom); calling park() on a parked opportunity
 *     reverses it back to that prior state.
 *
 * "Needs you" = opportunities whose current status implies operator action
 * (go_decision, review, ready_to_submit, submitted awaiting decision),
 * sorted oldest-first with age.
 *
 * Server-only module — never import from client components.
 * Test override: set PIPELINE_DATA_DIR to point the store at a temp dir.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { buildSeedState } from "./seed/trial-client.js";

export const STATUS_ORDER = [
  "identified",
  "vetting",
  "go_decision",
  "drafting",
  "review",
  "ready_to_submit",
  "submitted",
  "decision_recorded",
];

export const NEEDS_YOU_STATUSES = [
  "go_decision",
  "review",
  "ready_to_submit",
  "submitted",
];

export const OUTCOMES = ["awarded", "declined", "withdrawn"];
const CLIENT_STATUSES = ["active", "paused", "closed"];
const LETTER_VALUES = ["yes", "no", "unclear"];

/* ------------------------------------------------------------------ */
/* File plumbing (atomic write + per-process write lock)               */
/* ------------------------------------------------------------------ */

function dataDir() {
  return process.env.PIPELINE_DATA_DIR || path.join(process.cwd(), ".data");
}

function dataFile() {
  return path.join(dataDir(), "pipeline.json");
}

function emptyState() {
  return { version: 1, clients: [], opportunities: [] };
}

async function fileWrite(state) {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(
    dir,
    `.pipeline.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`
  );
  await fs.writeFile(tmp, JSON.stringify(state, null, 2) + "\n", "utf8");
  await fs.rename(tmp, dataFile()); // atomic on the same filesystem
}

// Serialize writes within this process so concurrent mutations don't clobber.
let _writeChain = Promise.resolve();
function withWriteLock(fn) {
  const next = _writeChain.then(fn, fn);
  _writeChain = next.catch(() => {});
  return next;
}

async function readState() {
  let raw;
  try {
    raw = await fs.readFile(dataFile(), "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") {
      // First read: seed with the trial client. This is a lazy one-time
      // initialization triggered by an operator request, not a scheduled job.
      // Lock-free (readState is called while the write lock is held): write a
      // tmp file, then hard-link it into place — link() fails with EEXIST if a
      // concurrent request seeded first, so nothing is ever clobbered.
      const seeded = buildSeedState();
      const dir = dataDir();
      await fs.mkdir(dir, { recursive: true });
      const tmp = path.join(
        dir,
        `.pipeline.seed.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`
      );
      await fs.writeFile(tmp, JSON.stringify(seeded, null, 2) + "\n", "utf8");
      try {
        await fs.link(tmp, dataFile());
      } catch (linkErr) {
        if (!linkErr || linkErr.code !== "EEXIST") throw linkErr;
      } finally {
        await fs.unlink(tmp).catch(() => {});
      }
      return readState();
    }
    throw err;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyState(); // corrupt file: fail soft rather than crash the API
  }
  if (!parsed || typeof parsed !== "object") return emptyState();
  return {
    version: parsed.version || 1,
    seededAt: parsed.seededAt,
    clients: Array.isArray(parsed.clients) ? parsed.clients : [],
    opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
  };
}

/* ------------------------------------------------------------------ */
/* Normalizers                                                         */
/* ------------------------------------------------------------------ */

function str(v, max = 4000) {
  return String(v ?? "").trim().slice(0, max);
}

function strArray(v, max = 40) {
  if (!Array.isArray(v)) return [];
  return v.map((s) => str(s)).filter(Boolean).slice(0, max);
}

function normalizeNotes(v) {
  if (!Array.isArray(v)) return [];
  return v
    .map((n) => {
      if (typeof n === "string") {
        const text = str(n);
        return text ? { at: new Date().toISOString(), text } : null;
      }
      if (n && typeof n === "object") {
        const text = str(n.text);
        return text ? { at: str(n.at) || new Date().toISOString(), text } : null;
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 200);
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function getAll() {
  const state = await readState();
  return {
    clients: state.clients,
    opportunities: state.opportunities,
    needsYou: computeNeedsYou(state.opportunities),
  };
}

export async function getClient(id) {
  const state = await readState();
  return state.clients.find((c) => c.id === id) || null;
}

export async function getOpportunity(id) {
  const state = await readState();
  return state.opportunities.find((o) => o.id === id) || null;
}

/**
 * "Needs you" list: opportunities sitting in a status that implies operator
 * action, oldest-first, with age computed from when the current status was
 * entered (falling back to the seed/creation time).
 */
export function computeNeedsYou(opportunities, now = Date.now()) {
  const ACTION_LABEL = {
    go_decision: "Make the go / no-go call",
    review: "Review the draft",
    ready_to_submit: "Submit (the organization submits its own application)",
    submitted: "Record the funder's decision when it arrives",
  };
  return (opportunities || [])
    .filter((o) => NEEDS_YOU_STATUSES.includes(o.status))
    .map((o) => {
      const hist = Array.isArray(o.statusHistory) ? o.statusHistory : [];
      const entered = hist.length ? hist[hist.length - 1].at : undefined;
      const since = entered || o.createdAt || new Date(now).toISOString();
      const parsed = Date.parse(since);
      const ageDays = Number.isFinite(parsed)
        ? Math.max(0, Math.floor((now - parsed) / 86_400_000))
        : 0;
      return {
        opportunityId: o.id,
        clientId: o.clientId,
        name: o.name,
        status: o.status,
        action: ACTION_LABEL[o.status] || "Operator action needed",
        since,
        ageDays,
      };
    })
    .sort((a, b) => String(a.since).localeCompare(String(b.since)));
}

/* ------------------------------------------------------------------ */
/* Creates                                                             */
/* ------------------------------------------------------------------ */

export async function createClient(input = {}) {
  const name = str(input.name, 200);
  if (!name) throw new PipelineError("Client name is required", 400);
  const status = CLIENT_STATUSES.includes(input.status) ? input.status : "active";
  const client = {
    id: crypto.randomUUID(),
    name,
    location: str(input.location, 400),
    entityType: str(input.entityType, 200),
    missionSummary: str(input.missionSummary),
    contacts: strArray(input.contacts),
    createdAt: new Date().toISOString(),
    status,
    notes: normalizeNotes(input.notes),
  };
  return withWriteLock(async () => {
    const state = await readState();
    state.clients.push(client);
    await fileWrite(state);
    return client;
  });
}

export async function createOpportunity(input = {}) {
  const name = str(input.name, 300);
  if (!name) throw new PipelineError("Opportunity name is required", 400);
  const clientId = str(input.clientId, 100);
  if (!clientId) throw new PipelineError("clientId is required", 400);

  const at = new Date().toISOString();
  const opportunity = {
    id: crypto.randomUUID(),
    clientId,
    name,
    funder: str(input.funder, 300),
    funderType: str(input.funderType, 100),
    awardBand: str(input.awardBand, 300),
    fitRationale: str(input.fitRationale),
    eligibilityNotes: str(input.eligibilityNotes),
    requires501c3Letter: LETTER_VALUES.includes(input.requires501c3Letter)
      ? input.requires501c3Letter
      : "unclear",
    cadenceOrDeadline: str(input.cadenceOrDeadline, 400),
    sources: strArray(input.sources),
    status: "identified",
    statusHistory: [{ status: "identified", at, note: "Created" }],
    nextAction: str(input.nextAction, 1000),
  };

  return withWriteLock(async () => {
    const state = await readState();
    if (!state.clients.some((c) => c.id === clientId)) {
      throw new PipelineError(`Unknown clientId: ${clientId}`, 400);
    }
    state.opportunities.push(opportunity);
    await fileWrite(state);
    return opportunity;
  });
}

/* ------------------------------------------------------------------ */
/* State machine (operator-clicked transitions only)                   */
/* ------------------------------------------------------------------ */

export class PipelineError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "PipelineError";
    this.status = status;
  }
}

function mustFindOpportunity(state, opportunityId) {
  const opp = state.opportunities.find((o) => o.id === opportunityId);
  if (!opp) throw new PipelineError(`Unknown opportunityId: ${opportunityId}`, 404);
  if (!Array.isArray(opp.statusHistory)) opp.statusHistory = [];
  return opp;
}

/** Advance exactly one step in the status machine. */
export async function advance(opportunityId, note) {
  return withWriteLock(async () => {
    const state = await readState();
    const opp = mustFindOpportunity(state, opportunityId);

    if (opp.status === "parked") {
      throw new PipelineError(
        "Opportunity is parked — use the park action again to restore it first",
        409
      );
    }
    if (opp.status === "submitted") {
      throw new PipelineError(
        "Opportunity is submitted — use the record-decision action to set the outcome",
        409
      );
    }
    if (opp.status === "decision_recorded") {
      throw new PipelineError("Opportunity already has a recorded decision", 409);
    }
    const idx = STATUS_ORDER.indexOf(opp.status);
    if (idx < 0) {
      throw new PipelineError(`Opportunity has unknown status: ${opp.status}`, 409);
    }
    const nextStatus = STATUS_ORDER[idx + 1];
    opp.status = nextStatus;
    opp.statusHistory.push({
      status: nextStatus,
      at: new Date().toISOString(),
      note: str(note, 2000) || null,
    });
    await fileWrite(state);
    return opp;
  });
}

/** Record the funder's decision on a submitted opportunity. */
export async function recordDecision(opportunityId, outcome, note) {
  if (!OUTCOMES.includes(outcome)) {
    throw new PipelineError(
      `Invalid outcome — expected one of: ${OUTCOMES.join(", ")}`,
      400
    );
  }
  return withWriteLock(async () => {
    const state = await readState();
    const opp = mustFindOpportunity(state, opportunityId);
    if (opp.status !== "submitted") {
      throw new PipelineError(
        `Decisions can only be recorded on submitted opportunities (current status: ${opp.status})`,
        409
      );
    }
    opp.status = "decision_recorded";
    opp.outcome = outcome;
    opp.statusHistory.push({
      status: "decision_recorded",
      at: new Date().toISOString(),
      note: str(note, 2000) || `Outcome: ${outcome}`,
    });
    await fileWrite(state);
    return opp;
  });
}

/**
 * Park (or un-park) an opportunity.
 *  - From any pre-submitted state: status -> "parked", prior status saved.
 *  - From "parked": restore the saved prior status.
 */
export async function park(opportunityId, note) {
  return withWriteLock(async () => {
    const state = await readState();
    const opp = mustFindOpportunity(state, opportunityId);

    if (opp.status === "parked") {
      const restoreTo = STATUS_ORDER.includes(opp.parkedFrom)
        ? opp.parkedFrom
        : "identified";
      opp.status = restoreTo;
      delete opp.parkedFrom;
      opp.statusHistory.push({
        status: restoreTo,
        at: new Date().toISOString(),
        note: str(note, 2000) || "Un-parked — restored to prior status",
      });
      await fileWrite(state);
      return opp;
    }

    const idx = STATUS_ORDER.indexOf(opp.status);
    const preSubmitted = idx >= 0 && idx < STATUS_ORDER.indexOf("submitted");
    if (!preSubmitted) {
      throw new PipelineError(
        `Only pre-submitted opportunities can be parked (current status: ${opp.status})`,
        409
      );
    }
    opp.parkedFrom = opp.status;
    opp.status = "parked";
    opp.statusHistory.push({
      status: "parked",
      at: new Date().toISOString(),
      note: str(note, 2000) || `Parked from ${opp.parkedFrom}`,
    });
    await fileWrite(state);
    return opp;
  });
}

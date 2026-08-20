/**
 * Pure pipeline vocabulary shared by dashboard server pages and client
 * components. No imports, no side effects — safe on either side.
 *
 * Status machine (shared contract): advance only, one step per click:
 *   identified -> vetting -> go_decision -> drafting -> review
 *   -> ready_to_submit -> submitted -> decision_recorded
 * "record decision" (on submitted) sets outcome awarded|declined|withdrawn.
 * "park" (from any pre-submitted state) sets status "parked", reversible.
 */

export const STATUS_FLOW = [
  "identified",
  "vetting",
  "go_decision",
  "drafting",
  "review",
  "ready_to_submit",
  "submitted",
  "decision_recorded",
];

export const STATUS_LABELS = {
  identified: "Identified",
  vetting: "Vetting",
  go_decision: "Go decision",
  drafting: "Drafting",
  review: "Review",
  ready_to_submit: "Ready to submit",
  submitted: "Submitted",
  decision_recorded: "Decision recorded",
  parked: "Parked",
};

export const OUTCOME_LABELS = {
  awarded: "Awarded",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export const CLIENT_STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  closed: "Closed",
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || String(status || "—");
}

/** The status one explicit Advance click moves to, or null. */
export function nextStatus(status) {
  const i = STATUS_FLOW.indexOf(status);
  if (i < 0 || i >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

/** Advance applies up to ready_to_submit (submitted uses Record decision). */
export function canAdvance(status) {
  const i = STATUS_FLOW.indexOf(status);
  return i >= 0 && i < STATUS_FLOW.indexOf("submitted");
}

/** Park is allowed from any pre-submitted state. */
export function canPark(status) {
  const i = STATUS_FLOW.indexOf(status);
  return i >= 0 && i < STATUS_FLOW.indexOf("submitted");
}

export function canRecordDecision(status) {
  return status === "submitted";
}

export function isParked(status) {
  return status === "parked";
}

/* ------------------------------------------------------------------ */
/* "Needs you" — statuses whose current state implies operator action  */
/* ------------------------------------------------------------------ */

export const NEEDS_YOU_STATUSES = [
  "go_decision",
  "review",
  "ready_to_submit",
  "submitted",
];

export function needsAttention(opp) {
  return Boolean(opp && NEEDS_YOU_STATUSES.includes(opp.status));
}

export function needsYouReason(status) {
  switch (status) {
    case "go_decision":
      return "Go / no-go call needed";
    case "review":
      return "Draft awaiting your review";
    case "ready_to_submit":
      return "Ready for the client to submit";
    case "submitted":
      return "Awaiting funder decision — record it when known";
    default:
      return "Operator action needed";
  }
}

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

/** When the opportunity entered its current status (latest history entry). */
export function statusEnteredAt(opp) {
  const history = Array.isArray(opp && opp.statusHistory) ? opp.statusHistory : [];
  let latest = null;
  for (const entry of history) {
    const t = entry && entry.at ? Date.parse(entry.at) : NaN;
    if (!Number.isNaN(t) && (latest === null || t > latest)) latest = t;
  }
  if (latest !== null) return new Date(latest).toISOString();
  return opp && opp.createdAt ? opp.createdAt : null;
}

export function formatAge(iso, now = Date.now()) {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const mins = Math.max(0, Math.floor((now - t) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(d);
}

/** Detects a 508(c)(1)(A) entity type (auto-exempt church-type org). */
export function is508c1a(entityType) {
  return /508\s*\(?c\)?\s*\(?1\)?\s*\(?a\)?/i.test(String(entityType || ""));
}

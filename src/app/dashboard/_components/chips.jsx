import {
  CLIENT_STATUS_LABELS,
  OUTCOME_LABELS,
  statusLabel,
} from "../_lib/pipeline-ui";

/**
 * Small presentational chips (server-safe, no state).
 */

export function StageChip({ status }) {
  const parked = status === "parked";
  const decided = status === "decision_recorded";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${
        parked
          ? "border-line bg-bg text-muted"
          : decided
            ? "border-line bg-card text-muted"
            : "border-line bg-card text-ink"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function OutcomeChip({ outcome }) {
  if (!outcome || !OUTCOME_LABELS[outcome]) return null;
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent">
      {OUTCOME_LABELS[outcome]}
    </span>
  );
}

/** Shown when an opportunity's funder asks for a 501(c)(3) letter. */
export function LetterChip({ value }) {
  if (value === "yes") {
    return (
      <span
        title="This funder asks for an IRS 501(c)(3) determination letter."
        className="inline-flex items-center whitespace-nowrap rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent"
      >
        501(c)(3) letter
      </span>
    );
  }
  if (value === "unclear") {
    return (
      <span
        title="Whether this funder asks for a 501(c)(3) letter is unclear — verify with the funder."
        className="inline-flex items-center whitespace-nowrap rounded-full border border-line bg-bg px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted"
      >
        Letter: unclear
      </span>
    );
  }
  return null;
}

export function ClientStatusChip({ status }) {
  const label = CLIENT_STATUS_LABELS[status] || String(status || "—");
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${
        status === "active"
          ? "border-line bg-card text-ink"
          : "border-line bg-bg text-muted"
      }`}
    >
      {label}
    </span>
  );
}

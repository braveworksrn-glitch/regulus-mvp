import Link from "next/link";
import Shell from "../../_components/Shell";
import Gate from "../../_components/Gate";
import OpportunityActions from "../../_components/OpportunityActions";
import { LetterChip, OutcomeChip, StageChip } from "../../_components/chips";
import { getOpportunityWithClient } from "../../_lib/data";
import { operatorAuthState } from "../../_lib/session";
import {
  formatAge,
  formatDateTime,
  needsAttention,
  needsYouReason,
  statusEnteredAt,
  statusLabel,
} from "../../_lib/pipeline-ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Opportunity — Regulus console",
  robots: { index: false, follow: false },
};

/* ------------------------------------------------------------------ */
/* Defensive source rendering: string URL, or { url, label/title }     */
/* ------------------------------------------------------------------ */

function normalizeSources(sources) {
  const list = Array.isArray(sources) ? sources : [];
  return list
    .map((s) => {
      if (typeof s === "string") return { url: s, label: s };
      if (s && typeof s === "object" && (s.url || s.href)) {
        const url = s.url || s.href;
        return { url, label: s.label || s.title || s.name || url };
      }
      if (s && typeof s === "object" && (s.label || s.title || s.name)) {
        return { url: null, label: s.label || s.title || s.name };
      }
      return null;
    })
    .filter(Boolean);
}

function isHttpUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function OpportunityPage({ params }) {
  const auth = await operatorAuthState();
  if (auth !== "ok") return <Gate state={auth} />;

  const { id } = await params;
  const { opportunity: opp, client } = await getOpportunityWithClient(id);

  if (!opp) {
    return (
      <Shell crumbs={[{ href: "/dashboard", label: "Console" }, { label: "Opportunity" }]}>
        <section className="mx-auto max-w-md rounded-xl border border-line bg-card p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Opportunity not found
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            No opportunity with this id exists in the pipeline store.{" "}
            <Link href="/dashboard" className="text-accent underline underline-offset-2">
              Back to the console
            </Link>
            .
          </p>
        </section>
      </Shell>
    );
  }

  const now = Date.now();
  const sources = normalizeSources(opp.sources);
  const history = Array.isArray(opp.statusHistory) ? opp.statusHistory : [];
  const enteredAt = statusEnteredAt(opp);

  return (
    <Shell
      crumbs={[
        { href: "/dashboard", label: "Console" },
        ...(client
          ? [{ href: `/dashboard/client/${encodeURIComponent(client.id)}`, label: client.name || "Client" }]
          : []),
        { label: opp.name || "Opportunity" },
      ]}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {opp.name || "Untitled opportunity"}
        </h1>
        <StageChip status={opp.status} />
        <OutcomeChip outcome={opp.outcome} />
        <LetterChip value={opp.requires501c3Letter} />
      </div>

      {needsAttention(opp) && (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border-l-2 border-accent bg-accent/5 px-4 py-3">
          <span className="text-sm font-medium text-ink">
            {needsYouReason(opp.status)}
          </span>
          <span className="text-xs tabular-nums text-accent">
            in this stage {formatAge(enteredAt, now)}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Actions */}
        <section className="rounded-xl border border-line bg-card px-6 py-5">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-muted">
            Operator actions
          </h2>
          <div className="mt-3">
            <OpportunityActions opportunityId={opp.id} status={opp.status} />
          </div>
        </section>

        {/* Details */}
        <section className="rounded-xl border border-line bg-card px-6 py-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Details</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Client">
              {client ? (
                <Link
                  href={`/dashboard/client/${encodeURIComponent(client.id)}`}
                  className="text-accent underline-offset-2 hover:underline"
                >
                  {client.name || "Unnamed client"}
                </Link>
              ) : (
                "Unknown client"
              )}
            </Field>
            <Field label="Funder">{opp.funder || "—"}</Field>
            <Field label="Funder type">{opp.funderType || "—"}</Field>
            <Field label="Award band">
              <span className="tabular-nums">{opp.awardBand || "—"}</span>
            </Field>
            <Field label="Cadence / deadline">{opp.cadenceOrDeadline || "—"}</Field>
            <Field label="501(c)(3) letter">
              {opp.requires501c3Letter === "yes"
                ? "Required by funder"
                : opp.requires501c3Letter === "no"
                  ? "Not required"
                  : "Unclear — verify with the funder"}
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Fit rationale">
                {opp.fitRationale || "No fit rationale on file."}
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Eligibility notes">
                {opp.eligibilityNotes ||
                  "No eligibility notes on file. Program requirements come from the program's own materials — verify before a go decision."}
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Next action">{opp.nextAction || "—"}</Field>
            </div>
          </dl>
        </section>

        {/* Sources */}
        <section className="rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-semibold tracking-tight">Sources</h2>
            <span className="text-xs tabular-nums text-muted">{sources.length}</span>
          </div>
          {sources.length === 0 ? (
            <p className="px-6 py-8 text-sm leading-relaxed text-muted">
              No sources on file. Every eligibility or program claim should
              trace to a source before this opportunity advances.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {sources.map((source, i) => (
                <li key={i} className="px-6 py-3">
                  {source.url && isHttpUrl(source.url) ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-accent underline-offset-2 hover:underline"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span className="break-all text-sm text-ink">{source.label}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Status history */}
        <section className="rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Status history
            </h2>
            <span className="text-xs tabular-nums text-muted">{history.length}</span>
          </div>
          {history.length === 0 ? (
            <p className="px-6 py-8 text-sm leading-relaxed text-muted">
              No history recorded yet.
            </p>
          ) : (
            <ol className="px-6 py-5">
              {history.map((entry, i) => (
                <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Rail */}
                  <span className="flex flex-col items-center">
                    <span
                      aria-hidden="true"
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        i === history.length - 1 ? "bg-accent" : "bg-line"
                      }`}
                    />
                    {i < history.length - 1 && (
                      <span aria-hidden="true" className="mt-1 w-px flex-1 bg-line" />
                    )}
                  </span>
                  <div className="min-w-0 pb-1">
                    <p className="text-sm font-medium text-ink">
                      {statusLabel(entry && entry.status)}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted">
                      {formatDateTime(entry && entry.at)}
                    </p>
                    {entry && entry.note && (
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </Shell>
  );
}

import Link from "next/link";
import Shell from "./_components/Shell";
import Gate from "./_components/Gate";
import {
  ClientStatusChip,
  LetterChip,
  OutcomeChip,
  StageChip,
} from "./_components/chips";
import { readPipeline } from "./_lib/data";
import { operatorAuthState } from "./_lib/session";
import {
  STATUS_FLOW,
  formatAge,
  needsAttention,
  needsYouReason,
  statusEnteredAt,
  statusLabel,
} from "./_lib/pipeline-ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Console — Regulus",
  robots: { index: false, follow: false },
};

/* ------------------------------------------------------------------ */
/* Needs you                                                           */
/* ------------------------------------------------------------------ */

function NeedsYou({ items, now }) {
  return (
    <section aria-labelledby="needs-you-heading" className="rounded-xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h2 id="needs-you-heading" className="font-display text-lg font-semibold tracking-tight">
            Needs you
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Opportunities waiting on an operator action, oldest first.
          </p>
        </div>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold tabular-nums text-accent">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="px-6 py-8 text-sm leading-relaxed text-muted">
          Nothing is waiting on you. New items appear here when an opportunity
          reaches go decision, review, ready to submit, or is submitted and
          awaiting a recorded decision.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map(({ opp, clientName, enteredAt }) => (
            <li key={opp.id}>
              <Link
                href={`/dashboard/opportunity/${encodeURIComponent(opp.id)}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-l-2 border-accent bg-accent/5 px-6 py-3 transition-colors hover:bg-accent/10"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {opp.name || "Untitled opportunity"}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {clientName} &middot; {needsYouReason(opp.status)}
                  </span>
                </span>
                <StageChip status={opp.status} />
                <span
                  className="w-14 text-right text-sm font-medium tabular-nums text-accent"
                  title={enteredAt ? `In this stage since ${enteredAt}` : undefined}
                >
                  {formatAge(enteredAt, now)}
                </span>
                <span aria-hidden="true" className="text-muted">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pipeline board                                                      */
/* ------------------------------------------------------------------ */

function OppCard({ opp, clientName }) {
  return (
    <Link
      href={`/dashboard/opportunity/${encodeURIComponent(opp.id)}`}
      className="block rounded-lg border border-line bg-card p-3 transition-colors hover:border-accent"
    >
      <span className="block text-sm font-medium leading-snug text-ink">
        {opp.name || "Untitled opportunity"}
      </span>
      <span className="mt-0.5 block truncate text-xs text-muted">
        {opp.funder || "Funder TBD"}
      </span>
      <span className="mt-0.5 block truncate text-xs text-muted">{clientName}</span>
      <span className="mt-2 flex flex-wrap items-center gap-1.5">
        {opp.awardBand && (
          <span className="text-xs font-medium tabular-nums text-ink">
            {opp.awardBand}
          </span>
        )}
        <LetterChip value={opp.requires501c3Letter === "yes" ? "yes" : null} />
        {opp.status === "parked" && <StageChip status="parked" />}
        {opp.status === "decision_recorded" && <OutcomeChip outcome={opp.outcome} />}
      </span>
    </Link>
  );
}

function Board({ opportunities, clientNames }) {
  const activeColumns = STATUS_FLOW.filter((s) => s !== "decision_recorded");
  const closed = opportunities.filter(
    (o) => o.status === "decision_recorded" || o.status === "parked"
  );

  const columns = [
    ...activeColumns.map((status) => ({
      key: status,
      label: statusLabel(status),
      opps: opportunities.filter((o) => o.status === status),
    })),
    { key: "closed", label: "Decided / Parked", opps: closed },
  ];

  return (
    <section aria-labelledby="board-heading">
      <h2 id="board-heading" className="font-display text-lg font-semibold tracking-tight">
        Pipeline
      </h2>
      <p className="mt-0.5 text-xs text-muted">
        Each card moves one stage at a time, only when you advance it.
      </p>
      <div className="mt-3 overflow-x-auto pb-2">
        <div className="grid auto-cols-[14.5rem] grid-flow-col gap-3">
          {columns.map((col) => (
            <div key={col.key} className="rounded-xl border border-line bg-bg">
              <div className="flex items-center justify-between border-b border-line px-3 py-2">
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted">
                  {col.label}
                </span>
                <span className="text-xs font-semibold tabular-nums text-muted">
                  {col.opps.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-2">
                {col.opps.length === 0 ? (
                  <p className="px-1 py-3 text-center text-xs text-muted">None</p>
                ) : (
                  col.opps.map((opp) => (
                    <OppCard
                      key={opp.id}
                      opp={opp}
                      clientName={clientNames.get(opp.clientId) || "Unknown client"}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Client rail                                                         */
/* ------------------------------------------------------------------ */

function ClientRail({ clients, openCounts }) {
  return (
    <section aria-labelledby="clients-heading" className="rounded-xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 id="clients-heading" className="font-display text-lg font-semibold tracking-tight">
          Clients
        </h2>
        <span className="text-xs tabular-nums text-muted">{clients.length}</span>
      </div>
      {clients.length === 0 ? (
        <p className="px-6 py-8 text-sm leading-relaxed text-muted">
          No clients yet. Clients are added through intake (POST{" "}
          <code className="rounded bg-bg px-1 py-0.5 text-xs">/api/pipeline</code>
          ) and will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/dashboard/client/${encodeURIComponent(client.id)}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 transition-colors hover:bg-bg"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {client.name || "Unnamed client"}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {[client.entityType, client.location].filter(Boolean).join(" · ") || "—"}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-muted">
                  {openCounts.get(client.id) || 0} open
                </span>
                <ClientStatusChip status={client.status} />
                <span aria-hidden="true" className="text-muted">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function DashboardPage() {
  const auth = await operatorAuthState();
  if (auth !== "ok") return <Gate state={auth} />;

  let clients = [];
  let opportunities = [];
  let loadError = false;
  try {
    ({ clients, opportunities } = await readPipeline());
  } catch (err) {
    console.error("dashboard read error:", err);
    loadError = true;
  }

  if (loadError) {
    return (
      <Shell crumbs={[{ label: "Console" }]}>
        <section className="mx-auto max-w-md rounded-xl border border-line bg-card p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Couldn&rsquo;t load the pipeline
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            The pipeline store returned an error. Check the server logs, then{" "}
            <Link href="/dashboard" className="text-accent underline underline-offset-2">
              refresh
            </Link>
            .
          </p>
        </section>
      </Shell>
    );
  }

  const now = Date.now();
  const clientNames = new Map(clients.map((c) => [c.id, c.name || "Unnamed client"]));

  const needsYou = opportunities
    .filter(needsAttention)
    .map((opp) => ({
      opp,
      clientName: clientNames.get(opp.clientId) || "Unknown client",
      enteredAt: statusEnteredAt(opp),
    }))
    .sort((a, b) => {
      const ta = a.enteredAt ? Date.parse(a.enteredAt) : Infinity;
      const tb = b.enteredAt ? Date.parse(b.enteredAt) : Infinity;
      return ta - tb; // oldest first
    });

  const openCounts = new Map();
  for (const opp of opportunities) {
    if (opp.status === "decision_recorded") continue;
    openCounts.set(opp.clientId, (openCounts.get(opp.clientId) || 0) + 1);
  }

  const openCount = opportunities.filter((o) => o.status !== "decision_recorded").length;

  return (
    <Shell crumbs={[{ label: "Console" }]}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Operator console
          </h1>
          <p className="mt-1 text-sm text-muted">
            {clients.length} {clients.length === 1 ? "client" : "clients"} &middot;{" "}
            {openCount} open {openCount === 1 ? "opportunity" : "opportunities"}{" "}
            &middot; {needsYou.length} waiting on you
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink transition-colors hover:border-accent"
        >
          Refresh
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <NeedsYou items={needsYou} now={now} />
        <Board opportunities={opportunities} clientNames={clientNames} />
        <ClientRail clients={clients} openCounts={openCounts} />
      </div>
    </Shell>
  );
}

import Link from "next/link";
import Shell from "../../_components/Shell";
import Gate from "../../_components/Gate";
import OpportunityActions from "../../_components/OpportunityActions";
import ReadPanel from "../../_components/ReadPanel";
import { ClientStatusChip, LetterChip, OutcomeChip, StageChip } from "../../_components/chips";
import { getClientWithOpportunities } from "../../_lib/data";
import { operatorAuthState } from "../../_lib/session";
import {
  STATUS_FLOW,
  formatAge,
  formatDate,
  formatDateTime,
  is508c1a,
  statusEnteredAt,
} from "../../_lib/pipeline-ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Client — Regulus console",
  robots: { index: false, follow: false },
};

/* ------------------------------------------------------------------ */
/* Defensive renderers for loosely-shaped fields                       */
/* ------------------------------------------------------------------ */

function contactLines(contacts) {
  const list = Array.isArray(contacts) ? contacts : contacts ? [contacts] : [];
  return list
    .map((c) => {
      if (typeof c === "string") return c;
      if (c && typeof c === "object") {
        return [c.name, c.role, c.email, c.phone].filter(Boolean).join(" · ");
      }
      return null;
    })
    .filter(Boolean);
}

function noteEntries(notes) {
  const list = Array.isArray(notes) ? notes : [];
  return list
    .map((n) => {
      if (typeof n === "string") return { text: n, at: null };
      if (n && typeof n === "object") {
        return { text: n.text || n.note || n.body || "", at: n.at || n.createdAt || null };
      }
      return null;
    })
    .filter((n) => n && n.text);
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
/* Opportunity ordering: pipeline stage order, then oldest-in-stage    */
/* ------------------------------------------------------------------ */

function stageRank(status) {
  const i = STATUS_FLOW.indexOf(status);
  if (i >= 0) return i;
  return status === "parked" ? STATUS_FLOW.length : STATUS_FLOW.length + 1;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function ClientPage({ params }) {
  const auth = await operatorAuthState();
  if (auth !== "ok") return <Gate state={auth} />;

  const { id } = await params;
  const { client, opportunities } = await getClientWithOpportunities(id);

  if (!client) {
    return (
      <Shell crumbs={[{ href: "/dashboard", label: "Console" }, { label: "Client" }]}>
        <section className="mx-auto max-w-md rounded-xl border border-line bg-card p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Client not found
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            No client with this id exists in the pipeline store.{" "}
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
  const flag508 = is508c1a(client.entityType);
  const contacts = contactLines(client.contacts);
  const notes = noteEntries(client.notes);
  const sorted = [...opportunities].sort((a, b) => {
    const r = stageRank(a.status) - stageRank(b.status);
    if (r !== 0) return r;
    const ta = Date.parse(statusEnteredAt(a) || "") || 0;
    const tb = Date.parse(statusEnteredAt(b) || "") || 0;
    return ta - tb;
  });
  const lettersNeeded = opportunities.filter((o) => o.requires501c3Letter === "yes").length;

  return (
    <Shell
      crumbs={[
        { href: "/dashboard", label: "Console" },
        { label: client.name || "Client" },
      ]}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {client.name || "Unnamed client"}
        </h1>
        <ClientStatusChip status={client.status} />
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <section className="rounded-xl border border-line bg-card px-6 py-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">Profile</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Location">{client.location || "—"}</Field>
            <Field label="Entity type">{client.entityType || "—"}</Field>
            <Field label="Client since">{formatDate(client.createdAt)}</Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Mission">
                {client.missionSummary || "No mission summary on file."}
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Contacts">
                {contacts.length === 0 ? (
                  "No contacts on file."
                ) : (
                  <ul className="space-y-0.5">
                    {contacts.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </Field>
            </div>
          </dl>

          {flag508 && (
            <div className="mt-5 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-widest text-accent">
                508(c)(1)(A) constraint
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">
                This organization is tax-exempt under IRC 508(c)(1)(A)
                (church-type auto-exemption), so it may not hold an IRS
                501(c)(3) determination letter. Funders that ask for a
                determination letter may not accept the application without
                one — resolve documentation (funder confirmation, IRS letter,
                or another arrangement the client approves) before a go
                decision on any opportunity marked &ldquo;501(c)(3)
                letter.&rdquo;
                {lettersNeeded > 0 && (
                  <>
                    {" "}
                    Currently {lettersNeeded}{" "}
                    {lettersNeeded === 1 ? "opportunity" : "opportunities"} in
                    this pipeline {lettersNeeded === 1 ? "asks" : "ask"} for the
                    letter.
                  </>
                )}{" "}
                Verify requirements with each funder — this note is not legal
                or tax advice.
              </p>
            </div>
          )}
        </section>

        {/* Opportunities */}
        <section className="rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Opportunities
            </h2>
            <span className="text-xs tabular-nums text-muted">{sorted.length}</span>
          </div>
          {sorted.length === 0 ? (
            <p className="px-6 py-8 text-sm leading-relaxed text-muted">
              No opportunities yet for this client. Opportunities are added
              through intake (POST{" "}
              <code className="rounded bg-bg px-1 py-0.5 text-xs">/api/pipeline</code>
              ) and will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] font-medium uppercase tracking-widest text-muted">
                    <th scope="col" className="px-6 py-3">Opportunity</th>
                    <th scope="col" className="px-3 py-3">Stage</th>
                    <th scope="col" className="px-3 py-3">Award band</th>
                    <th scope="col" className="px-3 py-3">In stage</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((opp) => (
                    <tr key={opp.id} className="border-b border-line align-top last:border-b-0">
                      <td className="max-w-[18rem] px-6 py-3.5">
                        <Link
                          href={`/dashboard/opportunity/${encodeURIComponent(opp.id)}`}
                          className="font-medium text-ink underline-offset-2 hover:text-accent hover:underline"
                        >
                          {opp.name || "Untitled opportunity"}
                        </Link>
                        <span className="mt-0.5 block text-xs text-muted">
                          {opp.funder || "Funder TBD"}
                        </span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          <LetterChip value={opp.requires501c3Letter} />
                          <OutcomeChip outcome={opp.outcome} />
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <StageChip status={opp.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-muted">
                        {opp.awardBand || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-muted">
                        {formatAge(statusEnteredAt(opp), now)}
                      </td>
                      <td className="px-6 py-3.5">
                        <OpportunityActions opportunityId={opp.id} status={opp.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Fundability read */}
        <ReadPanel clientId={client.id} />

        {/* Notes */}
        <section className="rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-semibold tracking-tight">Notes</h2>
            <span className="text-xs tabular-nums text-muted">{notes.length}</span>
          </div>
          {notes.length === 0 ? (
            <p className="px-6 py-8 text-sm leading-relaxed text-muted">
              No notes on file for this client.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {notes.map((note, i) => (
                <li key={i} className="px-6 py-3.5">
                  <p className="text-sm leading-relaxed text-ink">{note.text}</p>
                  {note.at && (
                    <p className="mt-1 text-xs tabular-nums text-muted">
                      {formatDateTime(note.at)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}

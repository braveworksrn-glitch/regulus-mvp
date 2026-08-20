"use client";

/**
 * "Draft fundability read" — explicit-click only, never auto-runs.
 * POST /api/pipeline/read { clientId } -> { read: { source, text, generatedAt } }
 * Renders the returned read with its source badge (ai vs template).
 */

import { useState } from "react";

export default function ReadPanel({ clientId }) {
  const [busy, setBusy] = useState(false);
  const [read, setRead] = useState(null);
  const [error, setError] = useState(null);

  async function draft() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pipeline/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
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
      if (!res.ok || !data || !data.read) {
        throw new Error(
          (data && (data.error || data.message)) || `Request failed (${res.status})`
        );
      }
      setRead(data.read);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Fundability read
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Internal working draft, generated only when you ask for it.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={draft}
          className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Drafting…" : read ? "Redraft" : "Draft fundability read"}
        </button>
      </div>

      <div className="px-6 py-5">
        {error && (
          <p role="alert" className="text-sm leading-relaxed text-muted">
            {error}
          </p>
        )}

        {!error && !read && (
          <p className="text-sm leading-relaxed text-muted">
            No read drafted yet. Click the button to draft one from this
            client&rsquo;s profile and pipeline. Nothing is generated
            automatically.
          </p>
        )}

        {!error && read && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              {read.source === "ai" ? (
                <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent">
                  AI-assisted draft
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                  Template draft
                </span>
              )}
              {read.generatedAt && (
                <span className="text-xs text-muted">
                  drafted {new Date(read.generatedAt).toUTCString()}
                </span>
              )}
            </div>
            <div className="whitespace-pre-wrap rounded-lg border border-line bg-bg px-4 py-3 text-sm leading-relaxed text-ink">
              {read.text}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Draft for operator review only. It is built from the profile and
              public-filing signals on record, which may lag or miss the
              client&rsquo;s books — verify with the client and with each
              funder&rsquo;s current guidelines before any external use. No
              outcome is implied.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

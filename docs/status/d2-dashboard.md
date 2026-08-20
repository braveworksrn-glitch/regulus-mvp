# Stream D2 — dashboard UI

*2026-08-20. Operator console for the grant pipeline. Owns `src/app/dashboard/**` and `src/app/api/pipeline/read/`.*

## What was built

- **`/dashboard`** — operator console: "Needs you" queue (amber-accented rows: opportunity, client, stage-specific reason, age, one-click jump to the opportunity; oldest first), pipeline board (columns identified → submitted plus a combined Decided/Parked column; cards show name, funder, client, award band, 501(c)(3)-letter chip when "yes", outcome/parked chips), and a client rail (name, entity type, location, open-opportunity count, status). Header counts + explicit Refresh link. Honest empty states throughout.
- **`/dashboard/client/[id]`** — profile (mission, location, entity type; an explicit 508(c)(1)(A) constraint callout when the entity type matches, including a live count of pipeline opportunities that ask for a determination letter), notes, opportunities table with per-row Advance (inline optional-note confirm), Record decision on submitted rows (outcome radio + optional note), Park/Restore, and a "Draft fundability read" panel (explicit click → POST `/api/pipeline/read` → styled panel with `ai` vs `template` source badge, timestamp, and a hedged verify-before-use caveat).
- **`/dashboard/opportunity/[id]`** — all fields, needs-you banner with stage age, operator action bar, sources as external links (defensive against non-URL entries), status-history timeline with notes (current entry accent-dotted).
- **`/api/pipeline/read`** — POST `{clientId}` → `{ok, read:{source, text, generatedAt}}`, calls `draftFundabilityRead(client, opportunities)` from `src/lib/readDrafter.js`. Same admin-cookie gate as the other pipeline routes; 401/400/404/500 JSON errors; `Cache-Control: no-store`.
- Shared pieces: `_lib/pipeline-ui.js` (pure status-machine vocabulary, needs-you rules, age/date formatting, 508 detection), `_lib/data.js` (server reads via `pipelineStore.getAll()` — read-only import), `_lib/session.js` (gate via read-only import of `src/app/admin/_lib/auth.js`; unauthenticated → panel linking to `/admin` sign-in, per spec), `_components/` (Shell, Gate, chips, OpportunityActions, ReadPanel).

## Manual-control invariant

No polling, no intervals, no auto-advancing. Every mutation is an explicit button click (advance is one step per click; decision requires an explicit outcome selection + confirm; park/restore is one click and reversible). Pages refresh only via `router.refresh()` after a completed action or the explicit Refresh link. The fundability read is generated only on click. The footer states this.

## Self-verification

- `node --check` on all non-JSX modules; all JSX files parse-checked with the TypeScript compiler (0 diagnostics).
- `npm run build` passes clean with all streams integrated.
- Unit smoke of `pipeline-ui` helpers (status machine gating, needs-you, age, 508 regex, edge cases).
- Live round-trip against `next start` with a fictional, labeled sample client: create client + 2 opportunities via `/api/pipeline`, advance identified→…→submitted, record decision (awarded), park + restore — all via the real routes; pages re-rendered correctly at each step. Unauthenticated `/dashboard` shows the gate; `/api/pipeline/read` returns 401 unauthenticated and a `template`-source read authenticated (no `ANTHROPIC_API_KEY` in test env).
- Playwright click-through (system chromium): signed in via `/admin`, clicked Advance (with note) and Park from the client page — row updated after `router.refresh()`, note landed in the opportunity timeline, zero console/page errors. Screenshots in the session scratchpad.
- Banned-language + placeholder scan over `src/app/dashboard` and the read route: clean. Token audit: no raw hex/palette classes — only `bg-bg/text-ink/text-muted/text-accent/bg-card/border-line` (+ accent opacity variants).
- Test records were removed from `.data/pipeline.json` afterward (atomic rewrite); the seed client and placeholder opportunities from the data stream are untouched.

## Known gaps / notes for the orchestrator

- **Advance on `submitted` is hidden in the UI**: the console offers only "Record decision" there (the store would also accept an advance). Deliberate — recording an outcome should be explicit.
- **Park in the UI sends no note** (contract lists `{opportunityId}` only); the store writes its own default note ("Parked from …"). Restore = second click on the same route, matching the store's toggle semantics.
- The store coerces `contacts` and `sources` entries to strings (`strArray`); objects posted at create time become `"[object Object]"` in the data. The UI renders whatever strings are stored and defensively handles object shapes too — worth aligning at intake if richer contact/source objects are wanted.
- No create/edit UI for clients/opportunities (not in this stream's scope); empty states say records arrive via `POST /api/pipeline`.
- Needs-you age is computed from the latest `statusHistory.at` (falls back to `createdAt`), displayed as m/h/d.

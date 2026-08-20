# Stream D1 — data layer + seed + read drafter

*2026-08-20. Owner of: `src/lib/pipelineStore.js`, `src/lib/seed/trial-client.js`, `src/app/api/pipeline/**`, `src/lib/readDrafter.js`.*

## What built

- **`src/lib/pipelineStore.js`** — JSON file store at `.data/pipeline.json` (same atomic-write pattern as waitlistStore: tmp file + rename, per-process write-lock chain). Auto-seeds on first read from the seed module when the file is missing, via an exclusive hard-link create so concurrent first reads can't clobber each other (and so seeding is safe while the write lock is held). Exports: `getAll`, `getClient`, `getOpportunity`, `createClient`, `createOpportunity`, `advance`, `recordDecision`, `park`, `computeNeedsYou`, `STATUS_ORDER`, `NEEDS_YOU_STATUSES`, `OUTCOMES`, `PipelineError` (carries an HTTP-ish `status` the routes map straight through). Status machine per contract: advance is exactly one step per call; decision only from `submitted` (sets `outcome` + `decision_recorded`); park only from pre-submitted states (stores `parkedFrom`; calling park again restores it). Manual-control invariant holds: nothing is scheduled, nothing self-advances — every transition is a function call from an operator-clicked route.
- **`src/lib/seed/trial-client.js`** — the real trial client: Home Is the Foundation Restoration, 508(c)(1)(A) faith-based, West Liberty, Morgan County, Eastern Kentucky (ARC county); dry-in critical home repair mission, reclaimed-materials supply chain, volunteer + sweat-equity labor, trades mentorship; startup, no grant history. The missing determination letter is flagged prominently in client notes as the key eligibility constraint, plus notes on the planned 501(c)(3) CDC and ARC-county context. Three PLACEHOLDER opportunities at `identified` (USDA HPG Sec 533, ARC, Home Depot Foundation Community Impact), all with `eligibilityNotes: "pending research fleet results — placeholder"`, `requires501c3Letter: "unclear"`, names suffixed "— PLACEHOLDER", sources labeled unverified.
- **`src/app/api/pipeline/route.js`** (GET all incl. computed `needsYou`; POST create `{type: "client"|"opportunity", ...fields}`), **`/advance`**, **`/decision`**, **`/park`** — all POST `{opportunityId, ...}`, all gated by the same admin cookie as `/admin` via read-only import of `src/app/admin/_lib/auth.js`, all `runtime nodejs` + `force-dynamic` + `Cache-Control: no-store`.
- **`src/lib/readDrafter.js`** — `draftFundabilityRead(client, opportunities)` → `{source: "ai"|"template", text}`. With `ANTHROPIC_API_KEY`: `@anthropic-ai/sdk`, `messages.create` with `model: ANTHROPIC_MODEL || "claude-opus-5"`, `max_tokens: 16000`, `thinking: {type: "adaptive"}`, compliance-railed system prompt (no odds/outcomes, program facts cite the program, hedge every inference, cite which facts came from the client profile, placeholders stay labeled unverified); text blocks narrowed by `.type === "text"`. No key or any error → deterministic template read from the same data, headed "(template draft — connect ANTHROPIC_API_KEY for AI-drafted reads)". Also exports `buildTemplateRead` for direct use.

## How self-verified

- **Node script** (scratchpad `verify-d1/test.mjs`) against a temp `PIPELINE_DATA_DIR`: 29 checks, all passing — auto-seed shape (1 client, 3 placeholder opps), client/opportunity CRUD + validation errors, full advance chain one-step-per-call with history + notes, advance blocked on submitted/decision_recorded/parked, decision validation (bad outcome 400, wrong state 409, not repeatable), needs-you membership/oldest-first/age (excludes identified and decision_recorded), park/un-park round-trips from `identified` and `review`, park blocked post-submission, 404s on unknown ids, persisted-file shape, no stray tmp files, drafter template path (marker + profile facts + disclaimer), template determinism, and AI-path fallback to template on API error (unreachable endpoint).
- **`npm run build`** passes; all four routes register as dynamic.
- **Live smoke test** against `next start` with `ADMIN_PASSWORD` set: unauthenticated POST/GET → 401 on all routes; login → seeded GET (1 client / 3 opps); advance ×2 → `go_decision`, history 3; needsYou shows it with age; park stores `parkedFrom: "go_decision"`, park again restores; create client + opportunity via POST; decision on non-submitted → 409; `Cache-Control: no-store` confirmed.
- **Banned-language scan** over all D1 files: zero hits.
- No `.data/pipeline.json` is created at build time (seeding is lazy, on first authed API read).

## Contract deviations / notes

1. **Advance from `submitted` is rejected (409)** with a message pointing at the record-decision action — the contract's separate decision action is the only path to `decision_recorded`, so an operator can't skip recording an outcome by clicking advance.
2. **Un-park is the park action again** on a parked opportunity (contract said "reversible" without specifying a mechanism); park/advance/decision routes also accept an optional `note`.
3. **`PIPELINE_DATA_DIR` env override** added (defaults to `.data/`) so tests can point the store at a temp dir; production behavior unchanged.
4. **`src/app/api/pipeline/read/route.js` was added by another stream** inside D1-owned `src/app/api/pipeline/**`. Reviewed, not modified: it consumes `draftFundabilityRead` per the export contract and is gated + no-store like the rest; it depends on `@/app/dashboard/_lib/data` (dashboard stream's file).
5. `GET /api/pipeline` returns `needsYou` (computed server-side per the shared definition) alongside `clients` and `opportunities`; `computeNeedsYou` is also exported for the dashboard stream.
6. Transient false-negative during smoke testing traced to another stream rebuilding `.next` under my running server — re-verified clean against the settled build; not a code defect.

## Known gaps

- Placeholder opportunities carry unverified program details by design — the research deliverable must replace them before any real vetting.
- File store is single-instance (same as waitlist file backend); fine for V1 on one box, not for serverless multi-instance.
- `contacts` is a free-string array; no structured contact schema yet.

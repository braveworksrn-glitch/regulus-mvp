# Combined findings: GRANTLINE (account A) × Regulus gauntlet (this repo)

*2026-08-20. Companion to docs/GRANT-PIPELINE-PLAN.md and the GRANTLINE doc set on account A (START-HERE / DECISIONS / attorney brief / control-deck spec / gate scoring / copy bank / risk register / build phases).*

## Convergence (independent double-verification — treat as settled)
- Client's own AOR reviews, signs, submits every application; agency never holds credentials (18 USC 1001 / FCA).
- Fees never charged to, budgeted in, or recouped from any award (2 CFR 200.459(a), 200.460).
- Consumer individuals: automatic truthful no-fee decline (FTC Grant Bae / Grant Connect / Premium Grants pattern).
- Nonprofits excluded from percentage/contingent fees (solicitor reclassification in ~27 states; GPA/AFP codes).
- NIH is a no-go/resubmission-only lane (NOT-OD-25-132, 6-app PI cap by council round).
- Cold B2B email only; no SMS/calls (TCPA); CAN-SPAM mechanics on every send.
- The gate is the business: vet clients before contact, vet grants on expected value before drafting.

## Adopt from GRANTLINE (it is further along)
- Control Deck architecture: deck-owned sends, Arm→Confirm, send ledger before SMTP, idempotency, banned-language block, heartbeats disabled. Duplicate sends structurally impossible.
- Attorney engagement brief + term sheet + exclusions list (send week of Aug 24; $5–10k budget).
- Kill criteria with numbers (win-rate <5%/30 apps; collections <50%/5 fees/120 days; same-day stop on regulatory contact).
- Entity separation (O-6) + separate Stripe (O-7): debarment under 2 CFR 180 is government-wide and the existing CAGE/4-yr contract outvalues year-1 net. Highest-priority open items.
- Domain warmup as second critical path (3–4 weeks; starts week 1).
- NIH EV finding (~$128/hr vs $250 threshold) → first-timers route NSF/DoD/USDA/DOE.

## Regulus contributions to carry forward
1. **Nonprofit track, year-two ready (the E-hybrid):** $0 at signing; first application free unconditionally; then $1,000 flat per submitted application, vested at submission, owed win-or-lose; 3× $333 installments net-60; ACH at signing; 60-day exit. Survives CA Gov. Code §12599.1, NY Exec. Law §171-a, GPA/AFP (fee on work performed, not outcome). Attach to the attorney brief as the draft answer to its "nonprofits in year two" note. Proof-of-non-contingency discipline: actually invoice and collect from losers.
2. **Funder-side detection risk:** correlated application templates get fingerprinted by program officers within ~2 cycles; whole portfolio discounted. Existential for any single-state nonprofit launch; per-client voice + volume caps (≤2–3 clients per funder per cycle) + disclosure are the controls.
3. **Persona findings:** SBIR buyers demand fee fixed at signing, resubmit included, and evidence of SBIR-specific (not foundation) writing experience; twice-burned buyers who require pay-only-on-win are an accepted loss — the lawful ceiling is free-first-deliverable + deferred billing.
4. **Fee-structure cross-check:** percentages are lawful for for-profit clients, but add a stated maximum dollar fee (unconscionability mitigation on Phase II ~$43k) and hold flat tiered fees as the pre-approved fallback if counsel flinches.

## Resolution of the one conflict
Regulus rule "never a percentage" applies to nonprofit/charitable clients (solicitor + ethics bright line). GRANTLINE's 4%/2%/5% applies to for-profit clients only and stands, with the fee-cap addition above.

## Combined decision stack
1. GO on GRANTLINE O-1 (rebuilt, gated model).
2. Form the separate LLC + Stripe account before the first retainer (O-6/O-7).
3. Attorney brief out this week, with (a) fee-cap question sharpened, (b) the Regulus E-hybrid attached as the year-two nonprofit note.
4. Domain warmup + Control Deck phases 0–3 in parallel, per GRANTLINE build phases.
5. Regulus repo (Next.js/Supabase) reserved for any future web surface; not needed for GRANTLINE v1.

# Regulus Grant Pipeline — Vetted Plan (v1)

*Date: 2026-08-18. Status: researched, issues identified and fixed, ready to build.*

## 0. The original idea, vetted

Proposed model: agents find grant-hungry small businesses and nonprofits, do outreach, and offer: (1) no upfront cost, (2) a pre-agreed **flat fee due only when a grant is won**, (3) repeat indefinitely. AI agents find grants and draft applications; a human grant writer reviews and submits.

**Verdict: viable, but not as stated.** The core service (AI-drafted, human-reviewed grant applications at a flat, non-percentage fee) is sound and there is a real market gap — every competitor is self-serve software; nobody sells done-for-you AI+human at outcome-linked pricing. But four parts of the original model are broken and must change: the pure pay-on-win pricing, the "nonprofits and small businesses treated the same" framing, who submits the application, and how the fee gets paid. All four have clean fixes below.

## 1. Issues found → fixes applied

### Issue 1 — Pure contingency pricing is an ethics/regulatory landmine (nonprofit side) and a cash-flow trap (both sides)
- The GPA and AFP codes of ethics prohibit contingent compensation for grant work — a **flat** fee due only on award still counts as contingent. These are professional norms, not law, but they mean: credentialed grant writers refuse such work (recruiting risk for your human reviewer), funders view it negatively, and nonprofit boards/auditors flag it (GAAP expenses fundraising services when rendered, not when awards land).
- Worse, in ~25–28 states a paid grant consultant to a **charity** must register as "fundraising counsel" — and in strict states (CA, NY, MA, IL, FL) compensation contingent on funds received can reclassify you as a **professional fundraiser/solicitor**: heavier registration, contract filings, and bonds of $10k–$50k per state.
- Cash flow: foundation decisions take 3–9 months, federal 8–20 months, with 15–30% win rates. Pure pay-on-win means ~9–18 months of negative cash flow while fronting all labor/AI/data costs (~5 applications fronted per fee collected).

**Fix — two-tier pricing, contingency only where it's clean:**
- **For-profit clients (SBIR/STTR and state economic-development grants): keep the pay-on-award flat fee.** Charitable-solicitation law doesn't apply to raising money for a for-profit's own benefit, and GPA/AFP codes have no force here. Competitors already do this ("Pay Upon Award™" — Blue Haven; Grant Engine's success-fee tiers), so it's a proven, marketable structure.
- **Nonprofit clients: hybrid — small monthly subscription + flat "success completion fee."** E.g., $199–$399/mo (covers discovery, matching, drafting) + a pre-agreed flat fee per funded award, both payable from the org's unrestricted funds. The subscription makes you compensable-regardless-of-outcome, which (a) keeps you in the lighter "fundraising counsel" category in most states, (b) defuses the ethics objection ("we are paid for services rendered; the completion fee is a deferred balance, not a commission"), and (c) fixes the cash-flow hole. Register as fundraising counsel in client states before signing nonprofit clients (start with your home state + CA/NY/FL/IL/MA as clients appear; Harbor Compliance or Labyrinth can run registrations).
- Never a percentage. Ever. Percentage pay is the bright line that triggers solicitor status and the harshest ethics language.

### Issue 2 — "Small businesses" is mostly a mirage; the niches must be picked, not assumed
For-profits have almost no general-purpose grants. What exists: **SBIR/STTR** (R&D firms <500 employees; Phase I ~$323k, win rates 15–24% by agency, reauthorized through 2031), sporadic state/local economic development money, and lottery-odds corporate contests (FedEx, Amber) that can't support an agency.

**Fix — two named beachheads:**
1. **Small nonprofits** (<$1M budget, no development staff) in human services and education, chasing **local/community foundation grants of $5k–$50k** — where win rates run 35–60% and repeat-grantee median awards jump from ~$15k to $150k+. This is the volume engine; the "desperate for grant money" org you described lives here.
2. **SBIR-eligible R&D small businesses** — lower volume, larger flat fees ($5k–$15k on award is market-normal), pure contingency legally clean. This is the margin engine.

### Issue 3 — Who submits, and AI-drafting liability
Federal applications are submitted under certifications (18 U.S.C. §1001 false statements: 5 yrs/$250k; civil False Claims Act reaches grant applications). NIH's 2025 policy (NOT-OD-25-132) rules applications "substantially developed by AI" ineligible; research funders are flooded with AI text and foundations increasingly flag generic AI-sounding proposals. Also: the Authorized Organization Representative (AOR) on Grants.gov/SAM.gov must be the **client's** person — an agency holding client credentials is a compliance red flag.

**Fix — the human and the client are structurally in the loop, not decoratively:**
- AI drafts from **client-supplied source material** (intake interview, financials, program data) — the system's job is assembly and tailoring, never invention. Every factual claim in a draft carries a provenance link to an intake source; unverifiable claims are flagged and blocked from the final draft.
- Your human grant writer reviews **every** application (already your plan — this is also the legal control), rewrites for voice, and signs off.
- The **client** gives written approval of the final text and, for federal grants, the client's AOR submits. The agency never holds SAM.gov/Grants.gov credentials. For foundation portals, client-approved submission by the agency is fine.
- Position AI as "drafting assistance under professional review" and disclose when a funder asks. Skip NIH entirely for now; SBIR agencies with AI-tolerant postures (NSF, DoD, USDA) are fair game with heavy human rewrite.

### Issue 4 — The fee can never touch the grant money
2 CFR 200.460 makes proposal-preparation costs indirect costs of the current period — **not chargeable to the award won**; FAR 31.205-33 principles make contingent fees for winning government awards expressly unallowable; SBIR guidance warns paying success fees from award funds risks audit and repayment.

**Fix:** the engagement contract states the fee is a services fee payable from the client's **general/unrestricted funds**, is never a line item in any grant budget, and is never paid from federal award funds. This clause is non-negotiable and is also your defense to the "you're taking the charity's grant money" optics.

### Issue 5 — Outreach compliance
TCPA makes cold texts and autodialed calls to cell numbers (which most "business" numbers are) a $500–$1,500-per-message liability with no cap; state mini-TCPAs (FL, OK, WA, MD) are stricter.

**Fix:** outreach is **cold email (CAN-SPAM compliant: accurate headers, physical address, honored opt-out within 10 days) + LinkedIn only**. No texting, no autodialing. For nonprofits, target orgs whose 990s show program revenue but near-zero grant revenue — that's the "desperate and underserved" signal, and it's derivable from free public data.

### Issue 6 — Data licensing
Candid/Foundation Directory licenses prohibit reselling or redistributing their data; Instrumentl ($299–$999/mo) has no API.

**Fix:** build the moat on **free, public-domain data**: Grants.gov API (federal opportunities), IRS 990/990-PF bulk e-file data + ProPublica Nonprofit Explorer API (990-PF Part XV = who funds whom, which also powers *client prospecting*). Keep one Instrumentl or FDO seat for internal research only — compliant when delivering services, not redistributing data.

## 2. The fixed business model

| | Nonprofit track | For-profit (SBIR) track |
|---|---|---|
| Client profile | <$1M budget, human services/education, no development staff | R&D small business, <500 employees |
| Grants targeted | Local/community/family foundations, $5k–$50k | SBIR/STTR Phase I/II (NSF, DoD, USDA; skip NIH), state econ-dev |
| Pricing | $199–$399/mo subscription + flat completion fee per award ($1k–$3k, scaled to award band, pre-agreed) | $0 upfront, flat fee on award ($5k–$15k, pre-agreed) |
| Fee source | Client's unrestricted funds — never the award | Client's general funds — never the award |
| Compliance | Fundraising-counsel registration in client states | 2 CFR 200 / FAR clauses in contract; client AOR submits |
| Rinse & repeat | Month-to-month; cancel anytime; repeat-funder cultivation is the compounding asset | Per-solicitation engagements |

Unit economics sanity check: one human grant writer + AI drafting supports ~8–15 foundation applications/month (~15–25 active nonprofit clients) plus 1–2 federal apps/month. At 25 nonprofit clients × $299/mo + ~2 completion fees/mo + occasional SBIR wins, the practice covers the writer's cost before contingency revenue matures. The human — plus intake interviews — is the bottleneck; the pipeline's job is to maximize the writer's throughput, not replace them.

## 3. Agent pipeline architecture

Five agents, one human gate, one client gate:

1. **Prospector** — pulls IRS 990/ProPublica data to find target orgs (revenue present, grant revenue absent, right NTEE codes, right geography); for SBIR track, scrapes SBIR.gov awardee/solicitation data for eligible firms. Outputs scored lead list.
2. **Outreach** — generates personalized CAN-SPAM-compliant email sequences (cites the org's actual 990 profile and 2–3 real matched grants as the hook). Human approves templates; system personalizes and sends; replies land with a human.
3. **Matcher** — for each signed client, continuously scores opportunities from Grants.gov API + the 990-PF-derived foundation index against the client's profile (mission, geography, budget size, program areas, deadlines). Emits a ranked queue with fit rationale.
4. **Drafter** — runs the structured intake (interview transcript, financials, program outcomes, prior proposals), then assembles funder-specific drafts with per-claim provenance. Flags gaps ("no outcome data for program X") instead of inventing.
5. **Compliance checker** — pre-review lint: eligibility rules met, required attachments listed, word/character limits, certifications identified, no unverifiable claims, fee-source clause acknowledged in engagement record.
6. **Human gate (your grant writer)** — reviews, rewrites voice, approves or bounces to Drafter with notes. Nothing leaves without sign-off.
7. **Client gate** — client approves final text in the portal; federal submissions go out under the client's own AOR credentials with a guided checklist; foundation submissions the agency files after approval.
8. **Tracker** — deadlines, submission status, award/decline outcomes, invoicing triggers (completion fee fires on documented award notice), and win-rate feedback into the Matcher's scoring.

### Build phases (on the existing Next.js/Supabase MVP)
- **Phase 1 (weeks 1–4): Prospector + Matcher.** 990/ProPublica ingestion, Grants.gov API sync, org scoring, opportunity matching. This alone powers outreach ("here are 3 grants you're missing") and validates demand via the existing waitlist.
- **Phase 2 (weeks 4–8): Intake + Drafter + review UI.** Client portal, structured intake, draft generation with provenance, the grant writer's review/approve queue.
- **Phase 3 (weeks 8–12): Outreach automation, Tracker, invoicing, e-sign engagement contracts** (with the fee-source and AOR clauses baked into the template).
- **Before first nonprofit client:** engagement-contract template reviewed by a lawyer (one-time cost), fundraising-counsel registration in launch state(s).

## 4. Pre-launch legal checklist
- [ ] Attorney review of the two engagement-contract templates (nonprofit hybrid; SBIR contingency) — clauses: flat fee schedule, fee payable from unrestricted/general funds only, never from award funds or listed in grant budgets, client owns and certifies all submissions, client AOR submits federal applications, AI-assisted drafting under professional review disclosed, month-to-month cancellation.
- [ ] Fundraising-counsel registration in home state; add states as nonprofit clients sign (CA/NY/FL/IL/MA are the strict ones; budget ~$100–$500 + filings each).
- [ ] CAN-SPAM footer, postal address, and suppression list in the outreach system; no SMS/autodial anywhere.
- [ ] Written internal policy: no percentage fees, no NIH, no holding client SAM.gov/Grants.gov credentials, human sign-off on every submission.
- [ ] E&O/professional liability insurance quote for the agency.

## 5. Key sources
- GPA Code of Ethics; AFP Ethical Standards 21 & 24 (contingent-fee prohibitions)
- 2 CFR 200.458 / 200.460 (pre-award and proposal costs); FAR 31.205-33 (contingent fees); 18 U.S.C. §1001; False Claims Act application to grants
- State fundraising-counsel/professional-solicitor regimes: CA AG Registry, NY Exec. Law Art. 7-A, MA, IL Solicitation for Charity Act, FL Ch. 496 (Harbor Compliance / Labyrinth summaries)
- NIH NOT-OD-25-132 (AI-developed applications ineligible)
- Market data: Giving USA 2026; GrantWatch/Instrumentl/Submittable win-rate and award-size stats; SBIR.gov agency success rates; Blue Haven "Pay Upon Award" and Grant Engine fee structures
- Data sources: Grants.gov API (free, rate-limited), IRS 990 bulk data + ProPublica Nonprofit Explorer API (public domain), Candid API license (no resale)

## 6. Locked decisions (v1.1)

- **Business type:** small human-services nonprofits ($250k–$1M budget) — youth, food security, housing, re-entry — in one launch state, selected by 990 signal: program revenue present, grant revenue absent. SBIR track deferred to phase 2.
- **Offer stack:**
  1. Free "Grant Gap Report" (auto-generated from 990 + matcher; the outreach hook)
  2. $299/mo Grant Pipeline subscription: funder calendar + 2 human-reviewed, client-approved foundation applications/month, month-to-month
  3. Flat completion fee on award: $1,500 (<$25k awards) / $2,500 (≥$25k), pre-agreed, invoiced on award letter, payable from unrestricted funds only
- **Deliverable:** monthly client-approved application packets (narrative, budget, attachments checklist, per-claim provenance), writer sign-off + client one-click approval before submission; live pipeline view.
- **Scope guard:** foundation grants only for first 6–12 months — no federal applications (eliminates §1001/FCA certification exposure, AOR credential issues, and NIH AI-eligibility rules; 2–6 month decision cycles).
- **Pre-launch:** fundraising-counsel registration in launch state; attorney review of the subscription+completion-fee contract; cold email/LinkedIn outreach only.

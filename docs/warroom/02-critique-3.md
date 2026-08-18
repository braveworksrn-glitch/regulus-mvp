# Regulus War-Room Teardown — Operational Feasibility Attack

## Ranked Fatal Flaws

### 1. The core dopamine loop is economically upside-down (LETHAL)
The ops expert already admitted it and the product expert ignored it: on sub-$5k dirt, everything visual (tiny house, fence, shed) destroys value, and everything that adds value (perc test, quiet title, survey) is invisible paperwork. The game sells "watch your clicks change the physical world"; the profitable clicks change a PDF. Players who follow the fun path lose money; players who follow the money path get a boring app. Meanwhile the platform's revenue model *depends* on selling those margin-rich, value-destroying improvements (25% markup on a fence that returns $0). You are structurally incentivized to sell customers losses.
**Fixable?** Partially. Minimal fix: rip vertical improvements out of MVP entirely; gamify the paper stack ("Septic Approved" badge, "Access Unlocked" tile states, title-cure progress bar), and show honest "expected value impact incl. negative" on every action card. Accept a smaller, slower dopamine loop.

### 2. Vendor reliability in rural counties breaks the product promise (LETHAL)
"Under Construction (animated crane synced to actual job status)" collides with 30–50% vendor ghost rates, 3x quote variance, 6-week surveyor backlogs, weather, and one brush-hog guy per county who answers texts on Sundays. The UI promises Domino's pizza tracker; reality is "the guy said maybe Thursday." First hundred customers will watch a 10-day ETA become 7 weeks, and the "verified real-world consequence" brand becomes "verified real-world no-show." Escrowed money sitting against unstarted jobs also creates refund/chargeback exposure and possibly construction-fund-handling issues in some states.
**Fixable?** Yes, barely, with brutal scope discipline. Minimal fix: launch in ONE county with 2 pre-contracted, retainer-paid crews before selling a single action; quote ETAs in ranges of weeks with penalty-free auto-refund on blowout; cap concurrent open jobs to crew capacity; no synced animations — show verified milestones only.

### 3. Title-cure timeline vs. "impulse-buyable" promise (LETHAL, sequencing)
2–9 months of quiet title per lot before honest sale means inventory costs (~$2k cure + carry) are front-loaded a year before revenue, and Florida's practical 4-year challenge window means even "cured" tax titles carry residual voidability (missed lienholder notice, IRS 120-day redemption, surviving municipal liens). One voided sale to a paying customer = company-ending trust event. Also: the $99–$499 "Starter Lot" the product deck promises cannot exist — $2,500 acquisition + $2,000 cure + overhead makes the honest floor ~$5k+. The two ideation docs contradict each other on entry price by 10x and nobody reconciled it.
**Fixable?** Yes. Minimal fix: only mint after cure completes + title insurance bound; kill the $99 price point publicly; raise seed capital sized for a 12-month inventory pipeline before first sale; buy from land banks (Michigan) where foreclosure judgment gives cleaner title to compress the cycle.

### 4. Securities recharacterization via your own marketing (LETHAL, legal)
The legal memo's structure (buyer-directed series LLC) only survives if marketing never sells profit-from-our-efforts. The product deck violates this on nearly every line: "Est. Value ticker," "Appreciate → Trade → Reinvest," "typically +$900–1,400 est. value," district appreciation events, bank buyback floors, "flip a lot every 2–6 months." SEC Release 33-5347 makes marketing emphasis dispositive. The economics doc's explicit buyback guarantee is exactly the "resale program" the legal doc says converts land into a security. The three experts wrote three incompatible companies.
**Fixable?** Yes, painfully. Minimal fix: legal doc wins, full stop. Delete value tickers, appreciation projections on action cards, buyback guarantees, and all flip framing; market ownership/building/recreation only; get a Howey opinion letter before first sale. Accept that this guts ~half the retention mechanics.

### 5. Permit and zoning failure on the hero feature (SEVERE)
"Erect a tiny house" — the marquee action — is frequently illegal (minimum dwelling size, THOW bans, septic prerequisite, floodplain rules), takes 2–6 months, and never pencils on cheap dirt. A customer who prepays $50k for a tiny house that the county then denies is a lawsuit and a viral horror story. Driveway permits, culvert specs, and burn permits for clearing also vary per county and will trip an automated action menu.
**Fixable?** Yes. Minimal fix: remove tiny houses from MVP; every action menu is county-specific and pre-validated with the actual permit office; "permit pending" is an explicit, refundable game state.

### 6. Delinquency, liability, and the absentee-owner boomerang (SEVERE)
Gamified $200 owners will churn, stop paying $15–$30/mo servicing and taxes, and the "contractual reversion" clause is untested legally against an LLC member who owns 100% of the series. Dumping, code liens, and attractive-nuisance claims accrue on lots whose owners uninstalled the app. Platform name is on every county's radar.
**Fixable?** Yes. Minimal fix: prepay 2 years of taxes+servicing into the purchase price; reversion mechanics drafted and stress-tested by counsel pre-launch; mandatory GL insurance baked in; cap portfolio per county to what one field manager can physically inspect quarterly.

### 7. Cold-start liquidity mirage (SEVERE)
The trade loop needs buyers; with 50–100 users in one county, the marketplace is dead, and the promised buyback floor is now (a) a security-flavored guarantee you can't legally make and (b) a balance-sheet time bomb (you become the bagholder for every mispriced lot at 60–70% of *your own inflated* primary price). "Est. Value" with no real comps is a made-up number that will get you sued when it's wrong.
**Fixable?** Yes. Minimal fix: no marketplace and no buyback at launch (economics doc already half-concedes this); exit = deed-out to owner's name or off-platform sale; "Est. Value" replaced by raw comp records with no synthesis.

### 8. Unit economics don't survive honest accounting (SEVERE)
Ops doc's own sketch: $10,500 all-in, $12–18k exit, minus CAC, refunds (7-day buyback guarantee!), vendor re-dos, the 80–90% underwriting reject funnel, and dead inventory. Margin is thin, slow, and capital-hungry; the "$6–8k LTV vs. <$500 CAC" fantasy assumes the improvement-margin revenue that Flaw #1 shows is sold against customers' interests. This is a real estate operating company needing patient capital, wearing a venture-SaaS costume.
**Fixable?** Yes. Minimal fix: model it as a land-flipping ops business with software leverage; raise accordingly; drop the 7-day buyback or reserve for it explicitly.

## Non-fatal but real
- Redemption periods (TX, GA) quietly poison inventory sourcing outside FL/MI — geography constraint, already flagged.
- Drone photography per update is a per-lot recurring cost nobody budgeted; Part 107 pilots are scarce in exactly the counties with cheap land.
- County officials will not love a gamified out-of-state entity hoovering tax deeds; expect friction, bid competition from local flippers, and picked-over OTC lists.
- "Districts / assemblage bonuses" require buying contiguity at auction, which you cannot control — you buy what comes up.

## Verdict

**PROCEED WITH CHANGES** — required, non-negotiable:

1. **Legal memo is the constitution.** Whole lots, buyer-directed series LLC, USD-only, one state (FL or MI land bank), Howey opinion letter, zero appreciation/flip/buyback marketing. Product and economics docs must be rewritten to comply.
2. **No mint before cured, insured title.** Kill the $99 starter-lot promise; honest floor pricing.
3. **Gut the improvement menu to what appreciates:** survey, perc, clearing, culvert/driveway, title milestones. No tiny houses, fences, wells in MVP. Gamify paperwork, not structures.
4. **No marketplace, no buyback, no value ticker at launch.** Exit = deed-out. Comps shown raw.
5. **One county, retainer-contracted crews before first sale, job caps at crew capacity, week-granularity ETAs with auto-refund on blowout.**
6. **Prepaid taxes/servicing (24 months) in purchase price; lawyered reversion mechanics; mandatory insurance.**
7. **Capitalize as a slow real-estate ops business:** 12+ months of inventory carry before revenue, refund reserves, field manager headcount in the model.

What survives is smaller and less fun than the pitch: a title-cured land shop with a delightful dashboard and verified photo updates. That business can exist. The one described in the product deck cannot.
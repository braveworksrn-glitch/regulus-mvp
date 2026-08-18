# Regulus — War-Room Teardown

## Ranked Fatal Flaws

### 1. The core value proposition is economically false (LETHAL)
The game promises "clicks appreciate your lot." The ops expert's own table admits the truth: on sub-$5k dirt, almost every visible, dopamine-generating improvement (fence, shed, tiny house, clearing beyond cosmetic) is **value-destructive**. The improvements that do pencil (survey, perc test, title cure) are paperwork — invisible on a game board. So the product must either (a) sell actions that lose the player money at 25–40% markup, which is a churn-and-lawsuit machine once players try to exit, or (b) restrict the menu to boring paper actions and lose the game. The "Est. Value ticker" makes this worse: Regulus marks its own homework, then makes a market in the asset. When realized resale prices undercut the ticker, trust collapses platform-wide simultaneously.
**Fixable?** Partially. Minimal fix: sell only positive-ROI actions (survey, perc, access, cosmetic clear), publish third-party comps not proprietary "est. value," and never show expected-value ranges on action cards ("typically +$900–1,400" is a written appreciation promise — also a securities exhibit).

### 2. Closed-loop marketplace = Ponzi-shaped liquidity (LETHAL)
Primary lots sell at **1.8–2.5x** all-in cost. The only exit at that price is *another Regulus player* — the outside market values the lot at roughly cost. Every buyer is underwater vs. real-world value on day one; the marketplace clears only while new-player inflow grows. The moment inflow slows, listings pile up, the ticker is exposed as fiction, and the "bank buyback at 60–70% of last platform price" either gets hit en masse (capital run on the company — 5%-of-GMV cap means the floor is a mirage exactly when needed) or gets withdrawn (trust death). This is Beanie Babies with property tax.
**Fixable?** Only by killing the markup. Sell at all-in cost + modest curation fee (~20–30%), make money on services/servicing, and drop the buyback promise (also a Howey aggravator).

### 3. Unit-economics arithmetic doesn't survive contact with its own numbers (LETHAL)
Ops expert: all-in ≈ **$10,500**, exit $12–18k, cycle **6–12 months**, and 50–100 parcels underwritten per 5–10 bought. Economist: "$6–8k lifetime gross profit per player, CAC <$500." These can't coexist. Underwriting funnel cost, quiet title ($1.5–3k/lot), vendor flake (30–50%), and 6–12 month capital lock mean each lot ties up ~$10k for a year to earn maybe $2–4k gross before ops overhead. This is a capital-intensive, low-turn land-flipping business (real-world land flippers survive on *seller financing spread*, which the legal memo largely forbids you at MVP). Meanwhile the CAC claim is fantasy: you're selling a $3,500–$25,000 illiquid, unfamiliar asset to consumers — that's a considered purchase with real CAC of $1–3k+, not an impulse buy, and the "$50–$2,000 impulse" tier from the product doc doesn't even exist in the economist's price table (cheapest Common: $3,500). The two decks are selling different companies.
**Fixable?** Yes, by shrinking ambition: tiny inventory, one county, content-led organic acquisition (land-flip YouTube niche), and accept it's a lifestyle-scale ops business until proven.

### 4. Inventory float / working capital death spiral (LETHAL at scale)
Mint-to-sale is 8–14 months (auction → deed → quiet title → improvements). To sell 100 lots/quarter you carry ~400 lots ≈ **$3–4M inventory** plus buyback reserves plus tax carry, funded by equity because banks don't lend on tax-title rural slivers. Growth consumes cash quadratically; any demand hiccup strands inventory you must mow, insure, and pay taxes on forever.
**Fixable?** Only via pre-sale of cured-title pipeline (raises consumer-protection issues) or staying deliberately small. No good fix at venture scale.

### 5. Securities recharacterization (LETHAL, probabilistic)
The legal memo's mitigation stack (member-managed series LLC, buyer-directed development) is undone by the *other three documents*: value tickers, appreciation events, expected-value ranges, "flip a lot every 2–6 months," bank buyback, platform-run marketplace, "Appreciate → Trade" in the literal core loop. Howey looks at the marketing, and the marketing is an investment contract in a Monopoly hat. One state AG complaint from an underwater player (see Flaw 2 — there will be many) triggers it.
**Fixable?** Yes: gut the appreciation UI entirely (no ticker, no value deltas, no flip framing), get a Howey opinion, and market use/ownership/building only. Note this amputates half the stated retention mechanics.

### 6. Ops density vs. game cadence mismatch (SEVERE)
Rural vendors ghost 30–50%, surveys take 6 weeks, utilities 12. A "construction crane animation synced to real crews" is a promise the supply chain cannot keep; the slot-machine notification cadence becomes a complaint cadence. Also each new county is a cold-start of the whole vendor/title/legal stack — the moat is real but it means growth is linear in founder pain.
**Fixable?** Yes: one county for 18+ months, UI built around weekly ticks and honest ETAs, SLAs with penalty clauses.

### 7. Title latency vs. product promise (SEVERE)
Quiet title = 3–12 months per lot before you can honestly mint. Either you carry that cost/time (worsens Flaw 4) or ship voidable tax deeds (fraud-adjacent). No third option.
**Fixable?** Yes: land-bank sourcing (Michigan) and certification services; only mint cured lots. Non-negotiable COGS.

### 8. Servicing subscription is churn-hostile (MODERATE)
$15–30/lot/month on a $3,500 lot is 5–10%/yr negative carry on top of taxes — worse than the worst HOA. Players will resent it; delinquency then creates the exact tax-forfeiture reputational bomb the plan fears.
**Fixable?** Yes: fold true costs (tax + insurance + mow) into a thin at-cost pass-through, ~$5–8/mo.

## Non-lethal but noted
- District "collective quests funded by the platform" = platform improving members' lots to raise value = "efforts of others," again.
- 7-day buyback guarantee + 60–70% floor + refund-for-bad-title = stacked contingent liabilities nobody has reserved for.
- "Beat Zillow friction" is moot — nobody sells $4k lots through closings anyway; the real competitor is Facebook Marketplace at ~$0 fees and honest prices.

## Verdict

**PROCEED WITH CHANGES** — but understand the changes kill the venture-scale story. Required changes:

1. **Kill the primary markup.** Sell lots at all-in cost + flat curation fee. Revenue = services, servicing, resale fee, and (with counsel) financing spread — the one model proven in this asset class.
2. **Kill the value ticker, expected-value action cards, appreciation events, and bank buyback.** Show third-party comps only. Market building/ownership, never returns. Howey opinion letter before first sale.
3. **Restrict the action menu to positive-ROI items** (survey, perc, cosmetic clear, culvert/driveway, title milestones); gate everything vertical behind market-specific viability checks.
4. **One county, cured-title-only minting, ≤50 lots, founder-operated for 12–18 months**; expansion only after demonstrated organic resale at real (off-platform-validated) prices.
5. **Re-underwrite CAC honestly at $1,500–3,000** with content-led acquisition in the land/homestead niche; if payback doesn't clear at that CAC with markup-free lots, revert to KILL.
6. **Servicing at cost-plus-thin**, taxes auto-escrowed, contractual reversion terms lawyered.
7. **Raise for inventory as a fund/credit line separate from opco equity**, or cap inventory to what founder capital can eat — never let growth targets set inventory levels.

Failing changes 1, 2, or 5: **KILL** — it's an unregistered securities offering of overpriced swampland with a subscription attached.
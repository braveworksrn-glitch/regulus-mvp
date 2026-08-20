# Regulus V1 build plan — Grant Gap Report

*2026-08-20. Method: 6-P sprint (pain → promise → product → plumbing → packaging → proof). Orchestrator delegates; workers own disjoint files; every stream verifies before reporting done.*

## Pain (done — see docs/GRANT-PIPELINE-PLAN.md and docs/COMBINED-FINDINGS-GRANTLINE-REGULUS.md)
Small nonprofits ($250k–$1M budget, no development staff) leave local grant money unclaimed. Detectable signal: public 990 shows program/contribution revenue but no grant strategy. Two multi-agent research fleets validated the niche and the compliance rails.

## Promise (the one sentence on the landing page)
**"See the grants your nonprofit may be missing — a free report built from your own public IRS 990."**
Hedged, truthful, no odds. The report is the top of the funnel for the done-for-you service (waitlist).

## Product V1 (this build)
1. **Landing page** (`/`): promise, how-it-works (3 steps), EIN/name search box → `/report/[ein]`, demo report link, waitlist form, compliance-clean copy, footer with disclaimer.
2. **Grant Gap Report** (`/report/[ein]`): org header (name, city, state, NTEE), latest-filing financial profile (total revenue, contributions, program revenue, grant revenue if derivable), the **grant-gap read** (hedged: "your public filings suggest… does this match your books?"), what-similar-orgs-tap categories, and CTA → waitlist. Visual: stat tiles + simple CSS bar comparisons using brand tokens (no chart libs).
3. **Waitlist + admin**: POST `/api/waitlist` stores email+source+ein; `/admin` (env-password gate) lists signups, CSV export.

## Plumbing
- **Data**: `src/lib/propublica.js` — live fetch of ProPublica Nonprofit Explorer v2 (search + org + filings) with 8s timeout; on failure or `DEMO_MODE=1`, fall back to bundled fixtures in `src/lib/fixtures/` (6 clearly-FICTIONAL sample orgs labeled "Sample data — demo organization"; never real EINs with invented numbers).
- **Storage**: Supabase (`waitlist` table) when `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set; else JSON file store `.data/waitlist.json` (gitignore `.data/`). One interface: `src/lib/waitlistStore.js`.
- **Admin auth**: `ADMIN_PASSWORD` env; unset → admin returns "admin disabled — set ADMIN_PASSWORD".
- **Deploy target**: Vercel from GitHub. Envs documented in `.env.example`.
- Auth + Stripe: deferred to V2 (waitlist-first, per method). Do NOT scaffold them now.

## Packaging
- Company/product: **Regulus — Grant Gap Report**. Wordmark + simple geometric star-point logo as inline SVG component. 
- Feel: premium consultancy, modern, clean, NOT ai-slop. No red. Design tokens in `globals.css` (Tailwind v4): deep navy/ink primary, warm paper background, one restrained accent (amber-gold), system font stack + one Google font max. Light/dark aware.

## Proof (the gate for "done")
- `npm run build` passes clean.
- Playwright (playwright-core + system chromium at `/opt/pw-browsers/chromium`) click-through: landing renders; EIN search navigates; demo report renders all sections; waitlist submit → success message AND row lands in store; admin login shows the row; CSV downloads. Screenshots of every page.
- **Banned-language scan** (grep built output + source): `guarantee(d)`, `pre-qualified`, `you qualify`, `you're approved`, `win rate`, `success rate`, `high likelihood`, `your odds`, `free money`, `no win no fee`, `risk-free`, `we'll get you funded`, `we secure funding`. Any hit = defect.
- No `[TOKEN]`-style unfilled placeholders anywhere user-visible.

## File ownership (workers must not touch files outside their stream)
| Stream | Owns |
|---|---|
| A: brand + landing | `docs/BRAND.md`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.js` (full replacement — old GovCon summarizer is deleted), `src/components/**`, `public/*.svg`, delete `src/app/api/summarize/` |
| B: report engine | `src/lib/propublica.js`, `src/lib/gap.js`, `src/lib/fixtures/**`, `src/app/api/report/`, `src/app/report/**` |
| C: waitlist + admin | `src/lib/waitlistStore.js`, `src/app/api/waitlist/route.js`, `src/app/admin/**`, `.env.example`, `.gitignore` (.data entry) |
| Shared contract | Landing search form does GET nav to `/report/{ein}`; report CTA posts `/api/waitlist` with `{email, source:"report", ein}`; landing form posts `{email, source:"landing"}`. Brand tokens = CSS variables `--bg --ink --muted --accent --card --line` defined by A; B and C consume them. |
| Status files | each stream writes `docs/status/<stream>.md` when done: what built, how self-verified, known gaps |

## Compliance rails (every user-visible sentence)
- Never state or imply odds, approval, or outcomes. Program facts cite the program, never "you".
- 990-derived statements are hedged: "your public filings suggest… grants booked under contributions may not appear here."
- Footer on landing + report: "Regulus prepares research and drafts; your organization reviews and submits its own applications. Nothing here is legal, tax, or accounting advice, and no outcome is promised."
- Sample orgs are fictional and labeled.

## Status
- [ ] A: brand + landing
- [ ] B: report engine
- [ ] C: waitlist + admin
- [ ] Verify pass 1
- [ ] Fixes + re-verify
- [ ] Commit + push

# Stream B — report engine — DONE

## What was built

- **`src/lib/propublica.js`** — ProPublica Nonprofit Explorer v2 client. `searchOrgs(q)` → `/search.json?q=`, `getOrg(ein)` → `/organizations/{ein}.json`. 8s AbortController timeout, `cache: "no-store"`, never throws: returns `{ok,...}`, `{notFound:true}`, `{invalid:true,error}`, or `{unavailable:true,error}`. Normalizes orgs/filings to a shape shared with the fixtures (`totrevenue, contributions, programRevenue, governmentGrants, foundationGrants`). Grant lines are null for live data (the v2 API does not break 990 line 1e out of contributions) — gap.js hedges on that.
- **`src/lib/fixtures/orgs.js`** — 6 fully fictional sample orgs (`demo-riverbend` food pantry, `demo-lanternhill` youth mentoring, `demo-harborstep` transitional housing, `demo-seconddoor` re-entry, `demo-prairierose` rural health clinic, `demo-brightloom` arts education). Each: `demo:true`, demo-prefixed id (can never collide with a real EIN), name/city/state, NTEE-ish category, 3 years of internally consistent financials (foundation grants ≈ 0 for most — that is the gap), and 3–5 hedged funding categories with award bands + funder types. Helpers: `getFixtureOrg`, `searchFixtures`, `isDemoId`, `DEFAULT_DEMO_ID`.
- **`src/lib/gap.js`** — `computeGapRead(orgData)` → `{headline, observations[], mix[], categories[], caveats[], grantStatus, latestYear, name}`. Revenue mix derived from the latest filing; grant status classified none / low (<10%) / present / unknown (live data) / no-data; every observation carries the number it is based on; caveats always include the "Grants booked under contributions may not appear here — does this match your books?" hedge. Generic default funding categories for live orgs without fixture data. Exports `formatMoney`.
- **`src/app/api/report/route.js`** — GET `?ein=` or `?q=`. Demo ids and `DEMO_MODE=1` serve fixtures and never call the live API; live failure returns `{unavailable:true, demoSuggestion:"demo-riverbend"}` (search failures also include `fixtureResults`). All responses `Cache-Control: no-store` + `force-dynamic`.
- **`src/app/report/[ein]/page.js`** — server component fetching through the libs directly (not its own API). Org header with "Sample data — demo organization" badge for fixtures; 4 stat tiles; accessible revenue-mix bars (values/percentages always in text, bars `aria-hidden`, two token colors only: `--ink` for components, `--accent` for the grants row); the gap read (headline, numbered observations, visibly styled caveat box); funding-category cards (bands framed as program facts, never "you could get $X"); waitlist CTA (client component `waitlist-cta.js` posting `/api/waitlist` `{email, source:"report", ein}` per contract); footer disclaimer per BUILD-PLAN. Unknown EIN → friendly not-found page; live unreachable → "we could not reach public filing data right now" page linking to the demo report.
- **`src/app/report/search/page.js`** — GET-form search. EIN-shaped queries get a direct report link; live results via `searchOrgs`; when live is unavailable, fixture name-matches plus a friendly notice; a labeled sample-org section always present.
- **`src/app/report/report-ui.js`** — shared chrome: injected CSS, top bar, demo badge, footer disclaimer.

## Contract compliance

- Consumes Stream A tokens `--bg --ink --muted --accent --card --line` everywhere; every `var()` carries a same-family fallback (warm paper / deep navy / amber-gold) so pages render sensibly until A's globals.css lands, and follow A's light/dark automatically after.
- CTA posts exactly `{email, source:"report", ein}` to `/api/waitlist`.
- All user-visible copy hedged; footer disclaimer verbatim from BUILD-PLAN.

## Self-verification

- `node --input-type=module --check` clean on all 4 lib/route files.
- Scratchpad test script (`test-gap.mjs`) ran `computeGapRead` over all 6 fixtures plus a live-shaped org, null input, and empty filings: shape asserts (headline, ≥4 numbered observations, emphasized grants mix row, categories, books-hedge caveat), fixture financial consistency (components ≤ totrevenue), grant-status classification (riverbend=low, lanternhill=none, harborstep=present), formatMoney, and per-fixture banned-language regex — ALL CHECKS PASSED.
- Live client exercised against the blocked network: `getOrg`/`searchOrgs` return `{unavailable:true}` gracefully (proxy 403), non-numeric EIN → `{invalid:true}`.
- `npx next lint` on all 8 Stream B files: no warnings or errors.
- Banned-language grep (BUILD-PLAN list) over all Stream B files: clean.
- `npm run build`: passes; `/report/[ein]`, `/report/search`, `/api/report` registered as dynamic routes.

## Known gaps

- The live ProPublica path could not be integration-tested from this container (host blocked, proxy 403); the code path follows the documented v2 API shapes but has not seen real payloads.
- Live 990 data cannot break grants out of contributions (v2 API limitation), so live reports show grant revenue as "not separately identified" with hedged copy — by design, but worth knowing for QA.
- Rendered pages were verified by build + code review only (no server runs allowed for workers); the Playwright click-through in the proof gate should exercise `/report/demo-riverbend` and `/report/search?q=pantry`.
- Bar/badge colors resolve from Stream A's tokens at runtime; a contrast pass after A lands is recommended (labels are always plain text ink, so readability never depends on the bar colors).

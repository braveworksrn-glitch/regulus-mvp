# Regulus MVP — Final Buildable Spec
**Stack:** Next.js 15 (App Router, `/src/app`), Tailwind 4, Supabase (`@supabase/supabase-js`, client in `src/lib/supabaseClient.js`). One engineer, no paid services beyond Supabase. Existing `/api/waitlist` route is reused.

**MVP goal:** A demo-able, honest simulation of the product loop — living board → lot detail → improvement ordering → portfolio → funnel — with **every simulated element explicitly labeled**. Real: waitlist, accounts, sandbox game state, XP. Mocked: lots, photos, crews, escrow, payments, county docs.

---

## 1. Global rules (from panels — non-negotiable)

1. **`<SimBadge />` on every simulated datum.** Amber pill: "Simulated — demo inventory". Journalist/HN panels punish anything that looks like fake inventory sold as real.
2. **No dollars as score.** No est.-value, no appreciation, no ticker anywhere. Score = XP / tile states only.
3. **Itemized pricing everywhere a price appears** (county price + title cure + entity + insurance + curation fee, each a line).
4. **The word "invest/return/flip/appreciate" never appears in copy.** Lint it: a `scripts/copy-lint.mjs` grep in CI over `src/`.
5. **No countdowns, streaks, scarcity timers.** Weekly cadence language only ("ETA: 3–5 weeks").
6. Trust page content (deed-out, wind-down covenant, fee-vs-DIY table) ships in v1 as static pages — panels ranked these above features.

---

## 2. Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Landing: land-dream hero (Rob/Angela psychographic, not gamer), before/after scrubber demo, itemized-pricing explainer, waitlist CTA | public |
| `/board` | The living board: isometric/SVG grid of the demo county cluster (~40 tiles), tile states, click → lot | public |
| `/lots/[id]` | Lot detail: photos scrubber, itemized price card, improvement menu, timeline feed, county-record links, "Simulated" banner for demo lots | public |
| `/lots/[id]/order/[actionId]` | Service-order flow (simulated checkout: review vendor cost + 22% platform fee + disclosures → confirm) | auth |
| `/sandbox` | Free 90-sec demo: user "claims" a sandbox lot, runs an accelerated clear-brush loop with fake weekly ticks, earns XP | auth (or anon localStorage → prompt to save) |
| `/portfolio` | Owner dashboard: my lots, tile states, open service orders, XP/rank, quest chain | auth |
| `/listings` | "Owner-to-owner assignments" classifieds board — flat-fee doc processing framing, **no prices suggested, no matchmaking**; v1 shows simulated example listings + explainer | public |
| `/trust` | Hub: how ownership works (Series LLC, member-manager), $500 deed-out, wind-down covenant, escrow flow diagram | public |
| `/trust/pricing` | Fee-vs-DIY comparison table (quiet title $2–4k DIY vs itemized ours); curation-fee breakdown | public |
| `/trust/deed-outs` | Deed-out ledger (empty-state honest: "0 completed — Lot Zero in progress", founder Lot Zero timeline) | public |
| `/founding` | Founding-member funnel: perks (early access, site-visit day invite), extended waitlist form | public |
| `/login` | Supabase email magic-link auth | public |

**API routes** (App Router route handlers):
- `POST /api/waitlist` — exists; extend with `segment` + `budget_band` fields.
- `POST /api/orders` — create simulated service order (auth).
- `POST /api/sandbox/claim`, `POST /api/sandbox/tick` — sandbox loop.
- `GET /api/lots`, `GET /api/lots/[id]` — read from Supabase (or serve seed).

---

## 3. Data model (Supabase)

```sql
-- lots: real schema, simulated rows (is_simulated=true for all v1 seed)
create table lots (
  id uuid primary key default gen_random_uuid(),
  slug text unique, name text, county text, state text,
  parcel_id text, acreage numeric, lat numeric, lng numeric,
  grid_x int, grid_y int,                      -- board position
  tile_state text check (tile_state in ('overgrown','cleared','surveyed','access_unlocked','build_ready')),
  status text check (status in ('coming_soon','listed','owned','sandbox')),
  county_price_cents int, title_cure_cents int, entity_cents int,
  insurance_cents int, curation_fee_cents int,  -- itemized, summed in UI
  county_record_url text, is_simulated boolean default true,
  owner_id uuid references auth.users, created_at timestamptz default now()
);

create table improvement_actions (      -- the 5-row menu, global
  id text primary key,                  -- 'survey','perc','clearing','driveway','title_milestone'
  title text, board_effect text, description text,
  vendor_cost_cents int, platform_fee_bps int default 2200,
  eta_weeks_min int, eta_weeks_max int, resulting_tile_state text
);

create table service_orders (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references lots, action_id text references improvement_actions,
  user_id uuid references auth.users,
  status text check (status in ('proposed','approved','scheduled','in_progress','verified','refunded')),
  total_cents int, is_simulated boolean default true, created_at timestamptz default now()
);

create table timeline_events (          -- lot feed: docs, photos, ticks
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references lots, order_id uuid references service_orders,
  kind text,                            -- 'photo','county_doc','crew_dispatch','weekly_tick','purchase'
  title text, body text, image_url text, occurred_at timestamptz default now(),
  is_simulated boolean default true
);

create table profiles (
  id uuid primary key references auth.users,
  display_name text, xp int default 0,
  rank text default 'thimble',          -- thimble|boot|wheelbarrow|top_hat
  created_at timestamptz default now()
);

create table quests (id text primary key, title text, description text, xp int, order_index int);
create table quest_progress (user_id uuid references auth.users, quest_id text references quests,
  completed_at timestamptz, primary key (user_id, quest_id));

create table listings (                 -- classifieds explainer examples
  id uuid primary key default gen_random_uuid(), lot_id uuid references lots,
  contact_note text, is_simulated boolean default true, created_at timestamptz default now()
);

-- waitlist: extend existing table
alter table waitlist add column if not exists segment text;      -- 'land_dream','builder','curious'
alter table waitlist add column if not exists budget_band text;  -- '<2500','2500_5000','5000_plus'
alter table waitlist add column if not exists founding_member boolean default false;
```

RLS: public read on `lots`, `improvement_actions`, `timeline_events`, `quests`, `listings`; user-scoped write/read on `service_orders`, `profiles`, `quest_progress`; waitlist insert-only.

**Seed** (`supabase/seed.sql` + `scripts/seed.mjs`): 40 lots on an 8×5 grid, one Michigan-flavored demo county ("Demo County, MI — simulated"), mixed tile states, realistic itemized prices ($4,200–$6,400 totals), 5 improvement actions, ~120 timeline events, 6 quests, 4 example listings. Photos: local SVG/AI-free placeholder pairs in `/public/tiles/` (overgrown/cleared variants per state).

---

## 4. Mocked vs real

| Real | Mocked (labeled) |
|---|---|
| Waitlist + founding signup (Supabase) | All lot inventory (`is_simulated`) |
| Auth, profiles, XP, ranks, quest progress | Payments/escrow — order flow ends at "In the live product, funds go to a licensed escrow partner. No money is collected in this demo." |
| Sandbox game state + weekly-tick simulation (accelerated: 1 tick per click/10s) | Crew dispatch, photos, county docs, deed-out ledger entries |
| Service-order records (as demo orders) | County recorder links (link to real county recorder *search* page + "parcel simulated" note) |

---

## 5. Components (`src/components/`)

- `Board.tsx` — SVG isometric grid; tiles colored by `tile_state`; hover card (name, acreage, state, price total); click → route. CSS transforms, no game engine.
- `Tile.tsx` — 5 visual states; simple CSS transition on state change.
- `BeforeAfterScrubber.tsx` — two images + draggable divider (pointer events). The hero component; used on landing + lot pages.
- `PriceCard.tsx` — itemized lines + total + "why this costs what it does" link to `/trust/pricing`.
- `ImprovementMenu.tsx` — action cards: vendor cost, platform fee (22%, shown), ETA week-range, board effect, **paired disclosure**: "Improvements may cost more than they add to resale value — owners do them for access, build-readiness, and use." (panel change #5 reframe).
- `Timeline.tsx` — feed of `timeline_events`, doc/photo/tick icons.
- `SimBadge.tsx`, `TrustStrip.tsx` (deed-out $500 · title insured before listing · funds via escrow · 3-lot/90-day cap · cooling-off), `XpRankBadge.tsx`, `QuestChain.tsx`, `WaitlistForm.tsx` (segment + budget band selects — captures the sub-$2.5k demand signal the panel demands), `WindDownCovenant.tsx` (static content), `FeeVsDiyTable.tsx`.

---

## 6. Copy/trust elements required (from panels)

1. Landing hero: land-dream framing ("Own a real lot. Direct real crews. Watch it become build-ready.") — not gamer framing.
2. `/trust/pricing`: DIY-vs-Regulus table with quiet-title $2,500–4,500 figure; curation fee broken into sub-lines (sourcing, cure management, entity admin).
3. Wind-down covenant page: auto deed-out at cost, exportable photo/doc archive, escrowed prepaid taxes, successor servicer.
4. Deed-out page: honest empty state + "Lot Zero" founder-lot plan.
5. Everywhere money appears: "Regulus never holds buyer funds — licensed escrow partner" note.
6. Budget-band waitlist question + "interested in a future sub-$2,500 tier?" checkbox (validates panel change #1 without shipping it).
7. Journey framing: lot page shows "Path to Build-Ready: ~$12–15k all-in" stepper instead of defending lot markup.
8. Footer: no-investment disclaimer; the words NFT/token/crypto appear only in a "What this is NOT" trust section.

---

## 7. Build order (each step demo-able)

1. **Foundation (day 1):** TS conversion of `page.js`→`page.tsx`, Tailwind theme tokens, layout/nav/footer with TrustStrip, `SimBadge`. Migrations + seed script.
2. **Board + lot detail (days 2–4):** `/board`, `Tile`, `/lots/[id]` with PriceCard, Timeline, BeforeAfterScrubber (static seed photos). This is the demo's wow moment — build first.
3. **Trust pages (day 5):** `/trust`, `/trust/pricing`, `/trust/deed-outs` — static, high copy value, cheap.
4. **Waitlist/founding funnel (day 5):** extend existing API + forms on `/` and `/founding`.
5. **Auth + sandbox (days 6–7):** Supabase magic link, `/sandbox` claim + accelerated tick loop, XP writes, quest chain.
6. **Improvement ordering + portfolio (days 8–9):** `/lots/[id]/order/[actionId]` simulated checkout, `service_orders`, `/portfolio`.
7. **Listings explainer (day 10):** `/listings` static examples + assignment-fee explainer.
8. **Polish (days 10–12):** copy-lint script, empty states, mobile board, OG images of before/after pairs (shareability), Vercel-ready build.

**Definition of done:** a visitor can feel the loop (sandbox), inspect a lot with honest itemized pricing, order a simulated improvement, watch the tile change, read every trust answer the panels demanded, and join the waitlist with a budget-band signal — with zero simulated data passing as real.
# Regulus — gamified real-lot land platform (MVP demo)

**Own a real lot. Direct real crews. Watch it become build-ready.**

Regulus is a title-cured land shop with a board-game soul: whole real lots in one
county, sold at transparent itemized prices, improved by real crews you dispatch
from a dashboard — every tile-state change verified by geotagged photos and county
documents. No token, no ticker, no valuations, no financial promises.

This repo contains the **demo MVP**: the full product loop with clearly-labeled
simulated inventory and zero money collected.

## The concept was war-roomed first

A 12-agent fleet ideated, adversarially critiqued, converged, and market-tested the
concept before a line of product code was written. The full record is in
[`docs/warroom/`](docs/warroom/):

1. `01-consensus-concept.md` — the unified concept (legal structure, fiat-only, one
   county, ROI-positive improvement menu, no marketplace at launch)
2. `02-critique-*.md` — three war-room teardowns (regulatory, unit economics, ops)
3. `03-panel-*.md` — virtual market panels (retail, land pros, skeptical public)
4. `04-mvp-spec.md` — the buildable spec this app implements

## App map

- `/` landing (land-dream framing) + waitlist with segment/budget signals
- `/board` the living board — 40 demo lots, tile states are literal real-world states
- `/lots/[id]` lot detail: before/after scrubber, itemized price, improvement menu, timeline
- `/lots/[id]/order/[actionId]` simulated service-order checkout (no money collected)
- `/sandbox` free 90-second loop: claim → dispatch crew → weekly ticks → Build-Ready
- `/portfolio` my land, orders, XP/rank, quest chain (browser-local demo state)
- `/listings` owner-to-owner assignment explainer (deliberately not a marketplace)
- `/trust`, `/trust/pricing`, `/trust/deed-outs` — the trust pages the panels demanded
- `/rfp` — the previous Regulus RFP Quick Reader, preserved

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run copy-lint  # bans invest/return/flip/appreciate from game copy
```

Demo data is served from `src/lib/game.ts`; the production-shaped Supabase schema is
in `supabase/migrations/001_regulus_game.sql`. The waitlist API uses Supabase
(`SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).

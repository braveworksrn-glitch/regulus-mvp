# Stream A status — brand + landing

**Done. 2026-08-20.**

## What was built

- `docs/BRAND.md` — name rationale (Regulus = navigation star / "little king"; Grant Gap Report = deliberately literal artifact name), token table for light+dark, logo spec, 8 voice rules including the verbatim footer disclaimer and the banned-phrase list.
- `src/app/globals.css` — Tailwind v4 (`@import "tailwindcss"`); tokens `--bg --ink --muted --accent --card --line` on `:root`, switched by `prefers-color-scheme` (warm paper + deep navy ink + amber-gold accent; no red anywhere). Tokens are mapped via `@theme inline` so B/C can use `bg-bg text-ink text-muted text-accent bg-card border-line font-display` as Tailwind utilities *or* raw `var(--*)`. Also: body base styles, selection/focus-visible styling, `.rule` hairline class.
- `src/app/layout.tsx` — metadata `title: "Regulus — Grant Gap Report"` + hedged description; **one** Google font (Fraunces, display serif, `--font-fraunces` variable, serif fallback); body uses token utilities. Removed the old GA script (not in the V1 plan).
- `src/components/Logo.jsx` — inline SVG four-point star + companion dot (Regulus is a multiple-star system) + Fraunces wordmark; fills with `currentColor`; `withWordmark`/`size`/class props. Standalone copy at `public/regulus-mark.svg`.
- `src/components/EinSearch.jsx` — client component; 9-digit EIN (hyphens/spaces tolerated) → `router.push("/report/<ein>")`, anything else → `/report/search?q=<query>`. Pure GET navigation, per contract.
- `src/components/WaitlistForm.jsx` — client component; POST `/api/waitlist` `{email, source}` (+ optional `ein`). Landing uses `source:"landing"`; exported so stream B can reuse with `source:"report"` + `ein`.
- `src/app/page.js` — full replacement of the GovCon summarizer. Sections: nav (Logo + "Join waitlist" anchor), hero with the exact promise sentence + EIN/name search, "See a sample report" → `/report/demo-riverbend` (labeled fictional), How-it-works (3 steps per plan), "What this is / what this is not" honesty block (990 lag + contributions-classification caveat stated plainly), waitlist section, footer with the verbatim disclaimer.
- Deleted: `src/app/api/summarize/` (old product) and the unused Next.js template SVGs in `public/`.

## Self-verification

- `npx next lint` → no warnings or errors (fixed two `react/no-unescaped-entities` on first pass).
- `npx tsc --noEmit` → clean (covers `layout.tsx`).
- Banned-language grep (`guarantee|pre-qualified|you qualify|approved|win rate|success rate|high likelihood|your odds|free money|no win no fee|risk-free|get you funded|secure funding`) over all Stream A files → **zero hits in user-visible files**. The only hit is `docs/BRAND.md`'s own banned-phrase list (documentation, same list BUILD-PLAN.md contains; not user-visible, not in build output).
- Re-read every user-visible sentence against the compliance rails: all 990 statements hedged ("may be missing", "can show whether that pattern fits you", "commonly pursue"); footer disclaimer verbatim; demo org labeled fictional; no odds/outcome language; no `[TOKEN]` placeholders.
- `npx next build` intentionally NOT run (other streams incomplete, per instructions).

## Known gaps / notes for other streams

- Fraunces is fetched by `next/font` at build time — the orchestrator's `npm run build` needs network (through the proxy) or the font download will fail.
- `WaitlistForm` assumes `/api/waitlist` returns non-2xx on failure (stream C contract); it shows a generic retry message otherwise.
- The old GA/analytics wiring was removed with the old layout; re-add in V2 if wanted.
- `src/app/favicon.ico` is still the Next.js default (not in Stream A's ownership list); `public/regulus-mark.svg` is available if whoever owns it wants to swap.
- Nav includes a "How it works" anchor link beyond the spec'd logo + waitlist anchor (deliberate, hidden on mobile).

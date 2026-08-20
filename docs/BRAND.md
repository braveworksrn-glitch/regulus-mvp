# Regulus — brand guide

*Stream A, 2026-08-20. Source of truth for name, tokens, and voice. Streams B and C consume the tokens and follow the voice rules for every user-visible sentence.*

## Name

**Regulus** is the brightest star in Leo — historically a navigation star, from the Latin for "little king." The metaphor: a fixed, public point of reference you can steer by. The product reads a nonprofit's *public* IRS 990 — data any funder can already see — and turns it into a bearing. Regulus is also a multiple-star system, which the logo nods to with a small companion point beside the main star.

**Grant Gap Report** is the product artifact. It is deliberately literal: it names the gap, not the outcome. We do not call it a "funding finder," "grant winner," or anything that implies results. The report is the top of the funnel; the service behind the waitlist is done-*with*-you research and drafting — the organization always reviews and submits its own applications.

## Logo

`src/components/Logo.jsx` — inline SVG, no image assets required at runtime.

- Mark: four-point navigation star + small companion dot (Regulus the multiple-star system).
- Wordmark: "Regulus" in the display serif, semibold, tight tracking.
- Fills with `currentColor` so it themes automatically; default composition is accent-gold mark + ink wordmark.
- A standalone copy lives at `public/regulus-mark.svg` for favicons/social embeds.

## Design tokens

Defined in `src/app/globals.css` as CSS custom properties, switched by `prefers-color-scheme`, and mapped into the Tailwind v4 theme (`bg-bg`, `text-ink`, `text-muted`, `text-accent`, `bg-card`, `border-line`, `font-display`).

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f7f4ee` | `#0e1524` | Page ground — warm paper / deep navy night |
| `--ink` | `#17233b` | `#ece8dd` | Primary text — deep navy / warm paper |
| `--muted` | `#5b6474` | `#97a0b2` | Secondary text |
| `--accent` | `#9c7420` | `#d2a84e` | Amber-gold. Restrained: star mark, eyebrows, step numerals, one CTA. Never body text blocks. |
| `--card` | `#fffdf8` | `#151f33` | Raised surfaces |
| `--line` | `#e4ddce` | `#263149` | Hairline borders and rules |

Rules:

- **No red anywhere.** Weakness or absence is stated in words, not alarm colors. A "gap" renders in muted/ink, never in a warning hue.
- One Google font maximum: **Fraunces** (display serif) for headings and numerals, exposed as `--font-fraunces` → `font-display`, with Georgia/serif fallback. Body text is the system sans stack.
- Surfaces are flat paper: hairline `--line` borders, generous whitespace, no heavy shadows, no gradients.
- Buttons: primary = ink on bg (or accent on bg for the single conversion CTA); everything else is bordered card.

## Voice

Premium consultancy: calm, specific, hedged, and honest to the point of stating our own limitations unprompted.

1. **Never state or imply odds, approval, or outcomes.** Banned outright: "guarantee(d)", "pre-qualified", "you qualify", "you're approved", "win rate", "success rate", "high likelihood", "your odds", "free money", "no win no fee", "risk-free", "we'll get you funded", "we secure funding".
2. **Program facts cite the program, never "you."** Write "this program funds youth arts organizations in Ohio," not "you're eligible."
3. **Hedge every 990-derived statement.** The filing is a lagging, lossy proxy: "your public filings suggest…", "grants booked under contributions may not appear here", "does this match your books?"
4. **State weaknesses plainly.** The landing page carries a "what this is / what this is not" block; the report invites correction. Admitting the data's limits *is* the premium positioning.
5. **The org owns the outcome.** Every surface repeats: Regulus prepares research and drafts; the organization reviews and submits its own applications.
6. **Footer disclaimer, verbatim, on landing and report:** "Regulus prepares research and drafts; your organization reviews and submits its own applications. Nothing here is legal, tax, or accounting advice, and no outcome is promised."
7. Plain English over grant-industry jargon. Short sentences. No exclamation points, no urgency mechanics, no fake scarcity.
8. Sample organizations are fictional and always labeled as such.

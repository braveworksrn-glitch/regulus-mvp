import Link from "next/link";

/**
 * Shared chrome for the report pages (Stream B).
 *
 * Consumes the brand tokens defined in globals.css by Stream A
 * (--bg --ink --muted --accent --card --line); every var() carries a
 * fallback in the same family (warm paper / deep navy / amber-gold) so the
 * pages render sensibly even before the tokens land. All colors are
 * token-derived, so light/dark theming follows the tokens automatically.
 */

export const REPORT_CSS = `
  .rg-wrap {
    min-height: 100vh;
    background: var(--bg, #f7f4ee);
    color: var(--ink, #172335);
  }
  .rg-main {
    max-width: 920px;
    margin: 0 auto;
    padding: 28px 24px 72px;
  }
  .rg-topbar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 20px;
    margin-bottom: 36px;
    border-bottom: 1px solid var(--line, #e4ded2);
  }
  .rg-topbar a {
    color: var(--ink, #172335);
    text-decoration: none;
  }
  .rg-wordmark {
    font-weight: 700;
    letter-spacing: 0.02em;
    font-size: 17px;
  }
  .rg-topbar-links {
    display: flex;
    gap: 20px;
    font-size: 14px;
  }
  .rg-topbar-links a { color: var(--muted, #5b6472); }
  .rg-topbar-links a:hover { color: var(--ink, #172335); }

  .rg-eyebrow {
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent, #b3831d);
    font-weight: 650;
  }
  .rg-h1 {
    font-size: clamp(28px, 4.5vw, 40px);
    line-height: 1.12;
    letter-spacing: -0.015em;
    font-weight: 700;
    margin: 10px 0 10px;
  }
  .rg-meta {
    color: var(--muted, #5b6472);
    font-size: 14.5px;
    line-height: 1.6;
  }
  .rg-badge-demo {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin: 2px 0 12px;
    padding: 5px 12px;
    border: 1px solid var(--accent, #b3831d);
    border-radius: 999px;
    color: var(--accent, #b3831d);
    background: color-mix(in srgb, var(--accent, #b3831d) 9%, transparent);
    font-size: 12.5px;
    font-weight: 650;
    letter-spacing: 0.02em;
  }
  .rg-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent, #b3831d);
  }

  .rg-tiles {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 28px;
  }
  @media (max-width: 780px) { .rg-tiles { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 420px) { .rg-tiles { grid-template-columns: 1fr; } }
  .rg-tile {
    background: var(--card, #fffdf9);
    border: 1px solid var(--line, #e4ded2);
    border-radius: 14px;
    padding: 18px 18px 16px;
  }
  .rg-tile-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted, #5b6472);
    font-weight: 650;
  }
  .rg-tile-value {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-top: 7px;
    font-variant-numeric: tabular-nums;
  }
  .rg-tile-sub {
    font-size: 12.5px;
    color: var(--muted, #5b6472);
    margin-top: 5px;
    line-height: 1.45;
  }

  .rg-section { margin-top: 48px; }
  .rg-h2 {
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 4px;
  }
  .rg-section-sub {
    color: var(--muted, #5b6472);
    font-size: 14px;
    margin: 0 0 18px;
    line-height: 1.6;
  }

  .rg-mixrow { padding: 13px 0; border-bottom: 1px solid var(--line, #e4ded2); }
  .rg-mixrow:last-child { border-bottom: none; }
  .rg-mixrow-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    font-size: 14.5px;
  }
  .rg-mixrow-label { font-weight: 600; }
  .rg-mixrow-value {
    font-variant-numeric: tabular-nums;
    color: var(--muted, #5b6472);
    white-space: nowrap;
  }
  .rg-mixrow-value strong {
    color: var(--ink, #172335);
    font-weight: 700;
  }
  .rg-bar-track {
    height: 10px;
    border-radius: 5px;
    background: color-mix(in srgb, var(--line, #e4ded2) 65%, transparent);
    margin-top: 9px;
    overflow: hidden;
  }
  .rg-bar-fill {
    height: 100%;
    border-radius: 5px;
    background: var(--ink, #172335);
    min-width: 2px;
  }
  .rg-bar-fill--accent { background: var(--accent, #b3831d); }
  .rg-bar-none {
    margin-top: 9px;
    font-size: 12.5px;
    color: var(--muted, #5b6472);
    font-style: italic;
  }

  .rg-headline {
    font-size: clamp(19px, 2.6vw, 24px);
    line-height: 1.4;
    font-weight: 650;
    letter-spacing: -0.01em;
    margin: 0 0 8px;
    max-width: 46em;
  }
  .rg-obs {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;
    padding: 15px 0;
    border-top: 1px solid var(--line, #e4ded2);
    align-items: baseline;
  }
  @media (max-width: 480px) { .rg-obs { grid-template-columns: 1fr; gap: 4px; } }
  .rg-obs-number {
    font-weight: 700;
    font-size: 17px;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
  }
  .rg-obs-label { font-weight: 650; font-size: 14.5px; }
  .rg-obs-detail {
    color: var(--muted, #5b6472);
    font-size: 13.5px;
    line-height: 1.55;
    margin-top: 2px;
  }

  .rg-caveats {
    margin-top: 26px;
    background: var(--card, #fffdf9);
    border: 1px solid var(--line, #e4ded2);
    border-left: 3px solid var(--accent, #b3831d);
    border-radius: 12px;
    padding: 18px 22px;
  }
  .rg-caveats-title {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--accent, #b3831d);
    margin: 0 0 10px;
  }
  .rg-caveats ul { margin: 0; padding-left: 18px; }
  .rg-caveats li {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--ink, #172335);
    margin: 6px 0;
  }

  .rg-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
  .rg-card {
    background: var(--card, #fffdf9);
    border: 1px solid var(--line, #e4ded2);
    border-radius: 14px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .rg-card-title { font-weight: 650; font-size: 15px; line-height: 1.35; }
  .rg-card-band {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    font-size: 14px;
  }
  .rg-card-band span {
    font-weight: 500;
    color: var(--muted, #5b6472);
    font-size: 12.5px;
  }
  .rg-chip {
    align-self: flex-start;
    font-size: 11.5px;
    border: 1px solid var(--line, #e4ded2);
    border-radius: 999px;
    padding: 3px 10px;
    color: var(--muted, #5b6472);
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .rg-card-note {
    font-size: 13px;
    line-height: 1.55;
    color: var(--muted, #5b6472);
    margin: 0;
  }

  .rg-cta {
    margin-top: 60px;
    background: var(--ink, #172335);
    color: var(--bg, #f7f4ee);
    border-radius: 18px;
    padding: clamp(26px, 5vw, 40px);
  }
  .rg-cta h2 {
    font-size: clamp(21px, 3vw, 26px);
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 8px;
  }
  .rg-cta p {
    margin: 0 0 20px;
    font-size: 14.5px;
    line-height: 1.65;
    color: color-mix(in srgb, var(--bg, #f7f4ee) 82%, transparent);
    max-width: 42em;
  }
  .rg-cta-form { display: flex; gap: 10px; flex-wrap: wrap; }
  .rg-cta-input {
    flex: 1 1 240px;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--bg, #f7f4ee) 30%, transparent);
    background: color-mix(in srgb, var(--bg, #f7f4ee) 10%, transparent);
    color: var(--bg, #f7f4ee);
    font-size: 15px;
    outline: none;
  }
  .rg-cta-input::placeholder { color: color-mix(in srgb, var(--bg, #f7f4ee) 55%, transparent); }
  .rg-cta-input:focus { border-color: var(--accent, #b3831d); }
  .rg-cta-btn {
    padding: 12px 22px;
    border-radius: 10px;
    border: none;
    background: var(--accent, #b3831d);
    color: var(--ink, #172335);
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
  }
  .rg-cta-btn:hover { filter: brightness(1.06); }
  .rg-cta-btn:disabled { opacity: 0.6; cursor: default; }
  .rg-cta-status { margin-top: 12px; font-size: 14px; line-height: 1.5; }
  .rg-cta-fineprint {
    margin-top: 16px;
    font-size: 12.5px;
    color: color-mix(in srgb, var(--bg, #f7f4ee) 60%, transparent);
  }

  .rg-footer {
    margin-top: 64px;
    padding-top: 24px;
    border-top: 1px solid var(--line, #e4ded2);
    color: var(--muted, #5b6472);
    font-size: 13px;
    line-height: 1.65;
  }
  .rg-footer a { color: var(--muted, #5b6472); }

  .rg-notice {
    background: var(--card, #fffdf9);
    border: 1px solid var(--line, #e4ded2);
    border-radius: 16px;
    padding: clamp(26px, 5vw, 40px);
    max-width: 620px;
    margin: 40px auto 0;
  }
  .rg-notice h1 {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 10px;
  }
  .rg-notice p {
    color: var(--muted, #5b6472);
    font-size: 14.5px;
    line-height: 1.65;
    margin: 0 0 14px;
  }
  .rg-btn-solid {
    display: inline-block;
    background: var(--ink, #172335);
    color: var(--bg, #f7f4ee) !important;
    border-radius: 10px;
    padding: 11px 20px;
    font-weight: 650;
    font-size: 14.5px;
    text-decoration: none;
  }
  .rg-btn-ghost {
    display: inline-block;
    color: var(--ink, #172335) !important;
    border: 1px solid var(--line, #e4ded2);
    border-radius: 10px;
    padding: 11px 20px;
    font-weight: 650;
    font-size: 14.5px;
    text-decoration: none;
    background: var(--card, #fffdf9);
  }
  .rg-btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }

  .rg-search-form { display: flex; gap: 10px; flex-wrap: wrap; margin: 22px 0 8px; }
  .rg-search-input {
    flex: 1 1 260px;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--line, #e4ded2);
    background: var(--card, #fffdf9);
    color: var(--ink, #172335);
    font-size: 15px;
    outline: none;
  }
  .rg-search-input:focus { border-color: var(--accent, #b3831d); }
  .rg-result {
    display: block;
    background: var(--card, #fffdf9);
    border: 1px solid var(--line, #e4ded2);
    border-radius: 12px;
    padding: 16px 18px;
    margin-top: 10px;
    text-decoration: none;
    color: var(--ink, #172335);
  }
  .rg-result:hover { border-color: var(--accent, #b3831d); }
  .rg-result-name { font-weight: 650; font-size: 15.5px; }
  .rg-result-meta {
    color: var(--muted, #5b6472);
    font-size: 13px;
    margin-top: 3px;
  }
  .rg-inline-note {
    border: 1px solid var(--line, #e4ded2);
    border-left: 3px solid var(--accent, #b3831d);
    background: var(--card, #fffdf9);
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--ink, #172335);
    margin: 18px 0;
  }
`;

export function ReportStyles() {
  return <style dangerouslySetInnerHTML={{ __html: REPORT_CSS }} />;
}

export function TopBar() {
  return (
    <header className="rg-topbar">
      <Link href="/" className="rg-wordmark">
        Regulus
      </Link>
      <nav className="rg-topbar-links" aria-label="Report navigation">
        <Link href="/report/search">Search filings</Link>
        <Link href="/report/demo-riverbend">Sample report</Link>
      </nav>
    </header>
  );
}

export function DemoBadge() {
  return (
    <span className="rg-badge-demo">
      <span className="rg-badge-dot" aria-hidden="true" />
      Sample data — demo organization
    </span>
  );
}

export function FooterDisclaimer() {
  return (
    <footer className="rg-footer">
      <p>
        Regulus prepares research and drafts; your organization reviews and
        submits its own applications. Nothing here is legal, tax, or accounting
        advice, and no outcome is promised.
      </p>
      <p>
        Live figures are drawn from public IRS Form 990 data via the ProPublica
        Nonprofit Explorer. Sample organizations are fictional and clearly
        labeled.
      </p>
    </footer>
  );
}

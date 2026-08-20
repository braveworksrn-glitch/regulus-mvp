import Link from "next/link";
import { getOrg } from "@/lib/propublica";
import {
  getFixtureOrg,
  isDemoId,
  DEFAULT_DEMO_ID,
} from "@/lib/fixtures/orgs";
import { computeGapRead, formatMoney } from "@/lib/gap";
import {
  ReportStyles,
  TopBar,
  DemoBadge,
  FooterDisclaimer,
} from "../report-ui";
import WaitlistCta from "./waitlist-cta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { ein } = await params;
  const id = decodeURIComponent(ein || "");
  const fixture = isDemoId(id) ? getFixtureOrg(id) : null;
  return {
    title: fixture
      ? `${fixture.name} (sample) — Grant Gap Report | Regulus`
      : "Grant Gap Report | Regulus",
    description:
      "A hedged read of a nonprofit's public IRS 990 revenue mix and the grant funding categories similar organizations tap.",
  };
}

function Shell({ children }) {
  return (
    <div className="rg-wrap">
      <ReportStyles />
      <main className="rg-main">
        <TopBar />
        {children}
        <FooterDisclaimer />
      </main>
    </div>
  );
}

function UnavailableNotice({ ein }) {
  return (
    <Shell>
      <div className="rg-notice">
        <h1>We could not reach public filing data right now</h1>
        <p>
          The public IRS 990 source we read from isn't responding at the
          moment{ein ? <> for EIN <strong>{ein}</strong></> : null}. Nothing is
          wrong on your end — please try again in a few minutes.
        </p>
        <p>
          In the meantime, you can explore a sample Grant Gap Report built on a
          fictional demo organization to see exactly what the report covers.
        </p>
        <div className="rg-btn-row">
          <Link href={`/report/${DEFAULT_DEMO_ID}`} className="rg-btn-solid">
            View the sample report
          </Link>
          <Link href="/" className="rg-btn-ghost">
            Back to home
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function NotFoundNotice({ ein }) {
  return (
    <Shell>
      <div className="rg-notice">
        <h1>We couldn't find a filing for that organization</h1>
        <p>
          No public IRS 990 data came back for <strong>{ein}</strong>. EINs are
          nine digits — it may be worth double-checking the number, or searching
          by the organization's name instead.
        </p>
        <div className="rg-btn-row">
          <Link href="/report/search" className="rg-btn-solid">
            Search by name
          </Link>
          <Link href={`/report/${DEFAULT_DEMO_ID}`} className="rg-btn-ghost">
            View a sample report
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function StatTiles({ latest, gap }) {
  const grantsRow = gap.mix.find((m) => m.key === "grants");
  const tiles = [
    {
      label: "Total revenue",
      value: formatMoney(latest.totrevenue),
      sub: `FY${latest.year} filing`,
    },
    {
      label: "Contributions & gifts",
      value: formatMoney(latest.contributions),
      sub:
        gap.mix.find((m) => m.key === "contributions")?.pct != null
          ? `≈${gap.mix.find((m) => m.key === "contributions").pct}% of revenue`
          : "From the most recent filing",
    },
    {
      label: "Program revenue",
      value: formatMoney(latest.programRevenue),
      sub:
        gap.mix.find((m) => m.key === "program")?.pct != null
          ? `≈${gap.mix.find((m) => m.key === "program").pct}% of revenue`
          : "From the most recent filing",
    },
    {
      label: "Grant revenue",
      value: grantsRow && grantsRow.value != null ? formatMoney(grantsRow.value) : "—",
      sub:
        grantsRow && grantsRow.value != null
          ? grantsRow.pct != null
            ? `≈${grantsRow.pct}% of revenue`
            : "Identified grant lines"
          : "Not separately identified",
    },
  ];
  return (
    <div className="rg-tiles">
      {tiles.map((t) => (
        <div className="rg-tile" key={t.label}>
          <div className="rg-tile-label">{t.label}</div>
          <div className="rg-tile-value">{t.value}</div>
          <div className="rg-tile-sub">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

function RevenueMix({ gap }) {
  if (!gap.mix.length) return null;
  const maxPct = Math.max(...gap.mix.map((m) => m.pct ?? 0), 1);
  return (
    <section className="rg-section" aria-labelledby="rg-mix-heading">
      <h2 className="rg-h2" id="rg-mix-heading">
        Revenue mix, FY{gap.latestYear}
      </h2>
      <p className="rg-section-sub">
        Where the money came from on the most recent public filing. Bars are
        scaled to the largest component; exact figures are in the text.
      </p>
      <div>
        {gap.mix.map((m) => (
          <div className="rg-mixrow" key={m.key}>
            <div className="rg-mixrow-head">
              <span className="rg-mixrow-label">{m.label}</span>
              <span className="rg-mixrow-value">
                <strong>{m.value != null ? formatMoney(m.value) : "—"}</strong>
                {m.pct != null ? ` · ${m.pct}%` : " · not separately identified"}
              </span>
            </div>
            {m.value != null ? (
              <div className="rg-bar-track" aria-hidden="true">
                <div
                  className={
                    m.emphasis ? "rg-bar-fill rg-bar-fill--accent" : "rg-bar-fill"
                  }
                  style={{
                    width: `${Math.max(((m.pct ?? 0) / maxPct) * 100, m.value > 0 ? 2 : 0)}%`,
                  }}
                />
              </div>
            ) : (
              <div className="rg-bar-none">
                Grant lines are not broken out in this public data — they may be
                folded into contributions.
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function GapRead({ gap }) {
  return (
    <section className="rg-section" aria-labelledby="rg-gap-heading">
      <h2 className="rg-h2" id="rg-gap-heading">
        The grant-gap read
      </h2>
      <p className="rg-headline">{gap.headline}</p>
      <div>
        {gap.observations.map((o) => (
          <div className="rg-obs" key={o.label}>
            <div className="rg-obs-number">{o.number}</div>
            <div>
              <div className="rg-obs-label">{o.label}</div>
              <div className="rg-obs-detail">{o.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rg-caveats">
        <p className="rg-caveats-title">Before you read too much into this</p>
        <ul>
          {gap.caveats.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FundingCategories({ gap }) {
  if (!gap.categories.length) return null;
  return (
    <section className="rg-section" aria-labelledby="rg-cats-heading">
      <h2 className="rg-h2" id="rg-cats-heading">
        Funding categories similar organizations tap
      </h2>
      <p className="rg-section-sub">
        Award bands describe the funding programs themselves — typical ranges
        published or reported for these categories — not any amount for a
        specific organization. Fit and eligibility always depend on the funder's
        own criteria.
      </p>
      <div className="rg-cards">
        {gap.categories.map((c) => (
          <div className="rg-card" key={c.category}>
            <span className="rg-chip">{c.funderType}</span>
            <div className="rg-card-title">{c.category}</div>
            <div className="rg-card-band">
              {c.band} <span>typical award band</span>
            </div>
            <p className="rg-card-note">{c.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ReportPage({ params }) {
  const { ein } = await params;
  const id = decodeURIComponent(ein || "").trim();
  const demoMode = process.env.DEMO_MODE === "1";

  let org = null;

  if (isDemoId(id)) {
    org = getFixtureOrg(id);
    if (!org) return <UnavailableNotice ein={id} />;
  } else if (demoMode) {
    // Demo mode never calls the live API.
    return <UnavailableNotice ein={id} />;
  } else {
    const r = await getOrg(id);
    if (r.invalid || r.notFound) return <NotFoundNotice ein={id} />;
    if (!r.ok) return <UnavailableNotice ein={id} />;
    org = r.org;
  }

  const gap = computeGapRead(org);
  const latest = org.filings && org.filings.length ? [...org.filings].sort((a, b) => b.year - a.year)[0] : null;

  return (
    <Shell>
      <article>
        <header>
          <p className="rg-eyebrow">Grant Gap Report</p>
          <h1 className="rg-h1">{org.name}</h1>
          {org.demo ? <DemoBadge /> : null}
          <p className="rg-meta">
            {[org.city, org.state].filter(Boolean).join(", ")}
            {org.category ? <> · {org.category}</> : null}
            {gap.latestYear ? <> · Latest filing FY{gap.latestYear}</> : null}
            <br />
            {org.demo
              ? "Fictional organization — every figure on this page is invented for demonstration."
              : "Source: public IRS Form 990 data via ProPublica Nonprofit Explorer."}
          </p>
        </header>

        {latest ? <StatTiles latest={latest} gap={gap} /> : null}
        <RevenueMix gap={gap} />
        <GapRead gap={gap} />
        <FundingCategories gap={gap} />
        <WaitlistCta ein={org.ein} />
      </article>
    </Shell>
  );
}

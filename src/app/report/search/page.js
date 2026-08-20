import Link from "next/link";
import { searchOrgs } from "@/lib/propublica";
import { FIXTURE_ORGS, searchFixtures } from "@/lib/fixtures/orgs";
import { ReportStyles, TopBar, FooterDisclaimer } from "../report-ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find your organization | Regulus",
  description:
    "Search public IRS 990 filings by organization name or EIN to open a Grant Gap Report.",
};

function ResultLink({ ein, name, meta, demo }) {
  return (
    <Link href={`/report/${encodeURIComponent(ein)}`} className="rg-result">
      <div className="rg-result-name">
        {name}
        {demo ? " · sample" : ""}
      </div>
      <div className="rg-result-meta">{meta}</div>
    </Link>
  );
}

function DemoList({ heading, orgs }) {
  return (
    <section className="rg-section" aria-label="Sample organizations">
      <h2 className="rg-h2">{heading}</h2>
      <p className="rg-section-sub">
        These organizations are fictional — invented, clearly labeled sample
        data that shows exactly what a Grant Gap Report covers.
      </p>
      {orgs.map((o) => (
        <ResultLink
          key={o.id}
          ein={o.id}
          name={o.name}
          demo
          meta={`${o.city}, ${o.state} · ${o.category} · Sample data — demo organization`}
        />
      ))}
    </section>
  );
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? "").trim();
  const demoMode = process.env.DEMO_MODE === "1";

  const einLike = /^\d{2}-?\d{7}$/.test(q) ? q.replace(/-/g, "") : null;

  let live = null; // { results } | null
  let unavailable = false;
  if (q && !demoMode && !einLike) {
    const r = await searchOrgs(q);
    if (r.ok) live = r;
    else unavailable = true;
  }
  const fixtureMatches = q ? searchFixtures(q) : [];

  return (
    <div className="rg-wrap">
      <ReportStyles />
      <main className="rg-main">
        <TopBar />

        <p className="rg-eyebrow">Grant Gap Report</p>
        <h1 className="rg-h1">Find your organization</h1>
        <p className="rg-meta">
          Search public IRS 990 filings by name, or enter a nine-digit EIN.
          Opening a report costs nothing and changes nothing — it&rsquo;s a read
          of data that&rsquo;s already public.
        </p>

        <form className="rg-search-form" action="/report/search" method="GET" role="search">
          <label
            htmlFor="rg-search-q"
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
          >
            Organization name or EIN
          </label>
          <input
            id="rg-search-q"
            className="rg-search-input"
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Organization name or EIN"
            autoComplete="off"
          />
          <button className="rg-btn-solid" type="submit" style={{ border: "none", cursor: "pointer" }}>
            Search filings
          </button>
        </form>

        {einLike ? (
          <section className="rg-section" aria-label="EIN match">
            <h2 className="rg-h2">That looks like an EIN</h2>
            <p className="rg-section-sub">
              We can open the report for it directly from the public filings.
            </p>
            <ResultLink ein={einLike} name={`Open the report for EIN ${q}`} meta="Reads the latest public IRS 990 data for this EIN" />
          </section>
        ) : null}

        {q && !einLike ? (
          <section className="rg-section" aria-label="Search results">
            {demoMode ? (
              <>
                <h2 className="rg-h2">Sample matches for “{q}”</h2>
                <p className="rg-section-sub">
                  Demo mode is on, so results come from the fictional sample
                  organizations.
                </p>
                {fixtureMatches.length ? (
                  fixtureMatches.map((o) => (
                    <ResultLink
                      key={o.id}
                      ein={o.id}
                      name={o.name}
                      demo
                      meta={`${o.city}, ${o.state} · ${o.category} · Sample data — demo organization`}
                    />
                  ))
                ) : (
                  <p className="rg-meta">No sample organization matches that — the full sample list is below.</p>
                )}
              </>
            ) : unavailable ? (
              <>
                <h2 className="rg-h2">Live filings are unreachable right now</h2>
                <div className="rg-inline-note">
                  We could not reach public filing data at the moment — nothing
                  is wrong on your end. Please try again in a few minutes, or
                  explore a sample report below to see what the report covers.
                </div>
                {fixtureMatches.length ? (
                  <>
                    <p className="rg-section-sub">
                      Fictional sample organizations matching “{q}”:
                    </p>
                    {fixtureMatches.map((o) => (
                      <ResultLink
                        key={o.id}
                        ein={o.id}
                        name={o.name}
                        demo
                        meta={`${o.city}, ${o.state} · ${o.category} · Sample data — demo organization`}
                      />
                    ))}
                  </>
                ) : null}
              </>
            ) : live && live.results.length ? (
              <>
                <h2 className="rg-h2">
                  Results for “{q}”
                </h2>
                <p className="rg-section-sub">
                  From public IRS filings via ProPublica Nonprofit Explorer.
                  Pick your organization to open its report.
                </p>
                {live.results.slice(0, 15).map((o, i) => (
                  <ResultLink
                    key={o.ein || `${o.name}-${i}`}
                    ein={o.ein}
                    name={o.name}
                    meta={[
                      [o.city, o.state].filter(Boolean).join(", "),
                      o.ein ? `EIN ${o.ein}` : null,
                      o.ntee ? `NTEE ${o.ntee}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                ))}
              </>
            ) : (
              <>
                <h2 className="rg-h2">No filings matched “{q}”</h2>
                <p className="rg-section-sub">
                  Spelling in IRS records can differ from the name an
                  organization uses day to day — try a shorter or partial name,
                  or search by EIN.
                </p>
              </>
            )}
          </section>
        ) : null}

        <DemoList
          heading={q ? "Or explore a sample report" : "Explore a sample report"}
          orgs={FIXTURE_ORGS}
        />

        <FooterDisclaimer />
      </main>
    </div>
  );
}

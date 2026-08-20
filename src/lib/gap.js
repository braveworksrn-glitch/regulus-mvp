/**
 * Grant-gap read: turns a normalized org (live ProPublica or fixture) into a
 * structured, hedged reading of its revenue mix.
 *
 * computeGapRead(orgData) -> {
 *   name, latestYear, grantStatus,        // "none" | "low" | "present" | "unknown" | "no-data"
 *   headline,                             // one hedged sentence
 *   observations: [{ number, label, detail }],   // every claim carries its number
 *   mix: [{ key, label, value, pct, emphasis }], // latest-year revenue mix rows
 *   categories: [{ category, band, funderType, note }],
 *   caveats: [string]
 * }
 *
 * Compliance rails: everything here is descriptive of public filings, hedged
 * ("suggest", "may", "appears"), and never states or implies odds, approval,
 * or outcomes. Award bands describe funding programs — never the reader.
 */

const LOW_GRANT_SHARE = 0.1; // under 10% of revenue reads as "low"

/** "$412,000" — whole dollars, comma-grouped. Null-safe. */
export function formatMoney(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

function pctOf(part, whole) {
  if (
    typeof part !== "number" ||
    typeof whole !== "number" ||
    !Number.isFinite(part) ||
    !Number.isFinite(whole) ||
    whole <= 0
  ) {
    return null;
  }
  return Math.round((part / whole) * 100);
}

/** Generic categories used when an org has no bundled fundingCategories. */
const DEFAULT_FUNDING_CATEGORIES = [
  {
    category: "Community foundation grant cycles",
    band: "$5k–$50k",
    funderType: "Community foundations",
    note: "Most regions have a community foundation with recurring local cycles; fit depends on mission and geography.",
  },
  {
    category: "City, county & state program funds",
    band: "$10k–$100k",
    funderType: "Local & state government",
    note: "Program categories and deadlines vary by jurisdiction and change year to year.",
  },
  {
    category: "Corporate & employee giving programs",
    band: "$2.5k–$25k",
    funderType: "Corporate foundations",
    note: "Employers with a local footprint often fund organizations where their people live and volunteer.",
  },
  {
    category: "Capacity-building & general operating support",
    band: "$10k–$75k",
    funderType: "Regional foundations",
    note: "A smaller set of funders supports operations and infrastructure rather than a single program.",
  },
];

const BASE_CAVEATS = [
  "Grants booked under contributions may not appear here — does this match your books?",
  "Figures come from the most recent public IRS Form 990 filings, which can lag your current fiscal year by a year or more.",
  "This is an automated reading of public data — not legal, tax, or accounting advice, and no outcome is promised.",
];

export function computeGapRead(orgData) {
  const org = orgData || {};
  const name = org.name || "this organization";
  const filings = (Array.isArray(org.filings) ? org.filings : [])
    .filter((f) => f && f.year != null)
    .slice()
    .sort((a, b) => b.year - a.year);

  const categories =
    Array.isArray(org.fundingCategories) && org.fundingCategories.length > 0
      ? org.fundingCategories
      : DEFAULT_FUNDING_CATEGORIES;

  const caveats = BASE_CAVEATS.slice();

  if (filings.length === 0) {
    return {
      name,
      latestYear: null,
      grantStatus: "no-data",
      headline: `We could not derive a revenue read from the public filing data available for ${name}.`,
      observations: [],
      mix: [],
      categories,
      caveats,
    };
  }

  const latest = filings[0];
  const year = latest.year;
  const total = latest.totrevenue;
  const contributions = latest.contributions;
  const program = latest.programRevenue;
  const gov = latest.governmentGrants;
  const found = latest.foundationGrants;

  // Grants: unknown when neither line is separately identified (live 990 data
  // from the v2 API folds grants into contributions).
  const grantsKnown = gov != null || found != null;
  const grants = grantsKnown ? (gov || 0) + (found || 0) : null;
  const grantPct = grantsKnown ? pctOf(grants, total) : null;

  let grantStatus;
  if (!grantsKnown) grantStatus = "unknown";
  else if (grants === 0) grantStatus = "none";
  else if (typeof total === "number" && total > 0 && grants / total < LOW_GRANT_SHARE)
    grantStatus = "low";
  else grantStatus = "present";

  // ---- headline (hedged) ----
  let headline;
  if (grantStatus === "none") {
    headline = `Public filings show no separately identified grant revenue for ${name} in FY${year} — a gap that may be worth a closer look.`;
  } else if (grantStatus === "low") {
    headline = `Public filings suggest grants play a small part in ${name}'s revenue mix — roughly ${grantPct != null ? `${grantPct}%` : "a sliver"} of FY${year} revenue — which may leave room to explore.`;
  } else if (grantStatus === "present") {
    headline = `Public filings show grant revenue at roughly ${grantPct != null ? `${grantPct}%` : "a meaningful share"} of ${name}'s FY${year} revenue; the mix below shows where the balance sits.`;
  } else {
    headline = `Public filings for ${name} do not separately identify grant revenue — it may be small, absent, or folded into the contributions line.`;
  }

  // ---- observations: every claim carries its number ----
  const observations = [];

  if (total != null) {
    observations.push({
      number: formatMoney(total),
      label: `Total revenue (FY${year})`,
      detail: "Reported total revenue on the most recent public filing.",
    });
  }

  if (contributions != null) {
    const p = pctOf(contributions, total);
    observations.push({
      number: formatMoney(contributions),
      label: "Contributions & gifts",
      detail: `${p != null ? `About ${p}% of total revenue. ` : ""}${
        grantsKnown
          ? "Gifts from individuals, events, and other donors."
          : "On a 990 this line can include grants that are not broken out separately."
      }`,
    });
  }

  if (program != null) {
    const p = pctOf(program, total);
    observations.push({
      number: formatMoney(program),
      label: "Program service revenue",
      detail: `${p != null ? `About ${p}% of total revenue — ` : ""}fees and earned income tied to programs.`,
    });
  }

  if (grantsKnown) {
    observations.push({
      number: formatMoney(grants),
      label: "Identified grant revenue",
      detail:
        grants === 0
          ? "No government or foundation grant revenue appears as a separate line in this data."
          : `${grantPct != null ? `About ${grantPct}% of total revenue. ` : ""}Government grants ${formatMoney(gov || 0)}; foundation grants ${formatMoney(found || 0)}.`,
    });
  } else {
    observations.push({
      number: "—",
      label: "Identified grant revenue",
      detail:
        "Not separately identified in the public data we can read — grants, if any, may sit inside the contributions line.",
    });
  }

  // Multi-year trend, when we have it.
  if (filings.length >= 2) {
    const earliest = filings[filings.length - 1];
    if (earliest.totrevenue != null && total != null && earliest.totrevenue > 0) {
      const change = Math.round(((total - earliest.totrevenue) / earliest.totrevenue) * 100);
      observations.push({
        number: `${change >= 0 ? "+" : ""}${change}%`,
        label: `Revenue trend (FY${earliest.year}–FY${year})`,
        detail: `Total revenue moved from ${formatMoney(earliest.totrevenue)} to ${formatMoney(total)} across the filings we can read.`,
      });
    }
  }

  // ---- revenue mix rows for the bar comparison ----
  const knownParts =
    (contributions || 0) + (program || 0) + (grantsKnown ? grants : 0);
  const other =
    total != null && total - knownParts > 0 ? total - knownParts : null;

  const mix = [
    {
      key: "contributions",
      label: grantsKnown ? "Contributions & gifts" : "Contributions & gifts (may include grants)",
      value: contributions,
      pct: pctOf(contributions, total),
      emphasis: false,
    },
    {
      key: "program",
      label: "Program service revenue",
      value: program,
      pct: pctOf(program, total),
      emphasis: false,
    },
    {
      key: "grants",
      label: "Identified grant revenue",
      value: grantsKnown ? grants : null,
      pct: grantsKnown ? pctOf(grants, total) : null,
      emphasis: true,
    },
  ];
  if (other != null && pctOf(other, total) >= 1) {
    mix.push({
      key: "other",
      label: "Other revenue",
      value: other,
      pct: pctOf(other, total),
      emphasis: false,
    });
  }

  return {
    name,
    latestYear: year,
    grantStatus,
    headline,
    observations,
    mix,
    categories,
    caveats,
  };
}

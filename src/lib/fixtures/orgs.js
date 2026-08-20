/**
 * Fictional sample nonprofits for demo mode and network-unavailable fallback.
 *
 * EVERY organization in this file is invented. Names, cities, EIN-style ids,
 * and every dollar figure are fabricated for demonstration. Ids deliberately
 * use a "demo-" prefix (never a 9-digit number) so they can never collide
 * with, or be mistaken for, a real EIN. Each object carries demo: true and
 * the UI must label it "Sample data — demo organization".
 *
 * Shape matches the normalized org from src/lib/propublica.js, plus
 * fundingCategories. Fixture filing components are mutually exclusive:
 * contributions here means gifts EXCLUDING the grant lines, so
 * contributions + programRevenue + governmentGrants + foundationGrants
 * <= totrevenue (remainder = events, investment, misc). Foundation grants
 * sit at or near zero for most of these orgs on purpose — that absence is
 * the "grant gap" the report is built to surface.
 */

export const DEFAULT_DEMO_ID = "demo-riverbend";

export const FIXTURE_ORGS = [
  {
    demo: true,
    id: "demo-riverbend",
    ein: "demo-riverbend",
    name: "Riverbend Community Pantry",
    city: "Milldale",
    state: "OH",
    category: "K31 — Food banks & pantries",
    filings: [
      { year: 2024, totrevenue: 412000, contributions: 348000, programRevenue: 18500, governmentGrants: 24000, foundationGrants: 0 },
      { year: 2023, totrevenue: 386500, contributions: 331000, programRevenue: 16200, governmentGrants: 21500, foundationGrants: 0 },
      { year: 2022, totrevenue: 401200, contributions: 352400, programRevenue: 14800, governmentGrants: 18000, foundationGrants: 0 },
    ],
    fundingCategories: [
      {
        category: "Local hunger-relief grants",
        band: "$5k–$50k",
        funderType: "Community foundations",
        note: "Many community foundations run recurring food-security cycles; fit depends on service area and program design.",
      },
      {
        category: "Emergency food & shelter programs",
        band: "$10k–$75k",
        funderType: "Federal pass-through (local boards)",
        note: "Allocations are made by local boards on their own schedules and criteria.",
      },
      {
        category: "Grocery & retail partner giving",
        band: "$2.5k–$25k",
        funderType: "Corporate foundations",
        note: "Regional grocery chains often fund pantries in the communities where they operate.",
      },
      {
        category: "Capacity building for food access",
        band: "$15k–$100k",
        funderType: "Regional & statewide foundations",
        note: "Typically funds equipment, cold storage, or staffing rather than food itself; cycles vary by funder.",
      },
    ],
  },
  {
    demo: true,
    id: "demo-lanternhill",
    ein: "demo-lanternhill",
    name: "Lantern Hill Youth Mentoring",
    city: "Cedar Falls Crossing",
    state: "NC",
    category: "O30 — Youth development & mentoring",
    filings: [
      { year: 2024, totrevenue: 297400, contributions: 268900, programRevenue: 21000, governmentGrants: 0, foundationGrants: 0 },
      { year: 2023, totrevenue: 279800, contributions: 254100, programRevenue: 18400, governmentGrants: 0, foundationGrants: 0 },
      { year: 2022, totrevenue: 252300, contributions: 231600, programRevenue: 14100, governmentGrants: 0, foundationGrants: 0 },
    ],
    fundingCategories: [
      {
        category: "Youth development grants",
        band: "$10k–$60k",
        funderType: "Community foundations",
        note: "A common local category; many cycles favor measurable mentoring outcomes and school partnerships.",
      },
      {
        category: "Out-of-school-time programs",
        band: "$15k–$100k",
        funderType: "State & county programs",
        note: "Program rules and reporting vary by state; some require established evaluation practices.",
      },
      {
        category: "Mentoring-specific initiatives",
        band: "$5k–$40k",
        funderType: "National intermediaries",
        note: "Intermediary re-grant programs open periodically; eligibility windows can be short.",
      },
      {
        category: "Employee-engagement giving",
        band: "$2.5k–$20k",
        funderType: "Corporate foundations",
        note: "Often paired with volunteer mentors from the sponsoring employer.",
      },
    ],
  },
  {
    demo: true,
    id: "demo-harborstep",
    ein: "demo-harborstep",
    name: "Harbor Step Transitional Housing",
    city: "Port Alcott",
    state: "WA",
    category: "L41 — Transitional & supportive housing",
    filings: [
      { year: 2024, totrevenue: 884600, contributions: 301200, programRevenue: 196400, governmentGrants: 342000, foundationGrants: 10000 },
      { year: 2023, totrevenue: 851900, contributions: 322700, programRevenue: 171800, governmentGrants: 318000, foundationGrants: 0 },
      { year: 2022, totrevenue: 792300, contributions: 296500, programRevenue: 158200, governmentGrants: 301000, foundationGrants: 0 },
    ],
    fundingCategories: [
      {
        category: "Housing stability & homelessness response",
        band: "$25k–$150k",
        funderType: "Community foundations",
        note: "Local funders in this category often complement, rather than replace, public housing dollars.",
      },
      {
        category: "Continuum-of-care allocations",
        band: "$50k–$250k",
        funderType: "Federal pass-through (local continuums)",
        note: "Awarded through regional processes with their own timelines and performance requirements.",
      },
      {
        category: "Behavioral health & housing pilots",
        band: "$20k–$120k",
        funderType: "Health conversion foundations",
        note: "Some regions have health-legacy foundations that fund housing as a health intervention.",
      },
      {
        category: "Furniture, facilities & move-in support",
        band: "$5k–$35k",
        funderType: "Faith-based & civic funders",
        note: "Smaller, faster cycles that usually fund tangible items rather than operations.",
      },
    ],
  },
  {
    demo: true,
    id: "demo-seconddoor",
    ein: "demo-seconddoor",
    name: "Second Door Re-Entry Services",
    city: "Brackenridge Flats",
    state: "MO",
    category: "I40 — Rehabilitation services for offenders",
    filings: [
      { year: 2024, totrevenue: 336900, contributions: 262400, programRevenue: 41200, governmentGrants: 25000, foundationGrants: 0 },
      { year: 2023, totrevenue: 318200, contributions: 251800, programRevenue: 36700, governmentGrants: 22000, foundationGrants: 0 },
      { year: 2022, totrevenue: 288100, contributions: 234900, programRevenue: 29600, governmentGrants: 18500, foundationGrants: 0 },
    ],
    fundingCategories: [
      {
        category: "Second-chance employment programs",
        band: "$15k–$90k",
        funderType: "Workforce boards & state programs",
        note: "Often structured as reimbursable contracts; cash-flow planning matters as much as eligibility.",
      },
      {
        category: "Justice-involved community reintegration",
        band: "$10k–$75k",
        funderType: "Community & family foundations",
        note: "A growing local category; several funders pair dollars with technical assistance.",
      },
      {
        category: "Recidivism-reduction initiatives",
        band: "$25k–$150k",
        funderType: "National & regional foundations",
        note: "Competitive national cycles that typically expect documented program models.",
      },
      {
        category: "Emergency client assistance funds",
        band: "$2.5k–$15k",
        funderType: "Faith-based & civic funders",
        note: "Small, quick-turn grants for IDs, transportation, tools, and first-month costs.",
      },
    ],
  },
  {
    demo: true,
    id: "demo-prairierose",
    ein: "demo-prairierose",
    name: "Prairie Rose Rural Health Clinic",
    city: "Wheatley Junction",
    state: "KS",
    category: "E32 — Community health clinics",
    filings: [
      { year: 2024, totrevenue: 947300, contributions: 128600, programRevenue: 731500, governmentGrants: 68000, foundationGrants: 0 },
      { year: 2023, totrevenue: 902800, contributions: 121300, programRevenue: 706200, governmentGrants: 61000, foundationGrants: 0 },
      { year: 2022, totrevenue: 861400, contributions: 133800, programRevenue: 662900, governmentGrants: 52000, foundationGrants: 0 },
    ],
    fundingCategories: [
      {
        category: "Rural health outreach & access",
        band: "$25k–$200k",
        funderType: "Federal & state rural health programs",
        note: "Program categories change year to year; eligibility often keys off service-area designations.",
      },
      {
        category: "Community health improvement",
        band: "$10k–$80k",
        funderType: "Health conversion foundations",
        note: "Health-legacy funders frequently prioritize rural counties inside their historic footprint.",
      },
      {
        category: "Medical equipment & telehealth",
        band: "$5k–$60k",
        funderType: "Corporate & utility foundations",
        note: "Equipment-specific cycles; some utility funders favor connectivity and telehealth builds.",
      },
      {
        category: "Prevention & chronic-disease programs",
        band: "$15k–$100k",
        funderType: "Statewide foundations",
        note: "Usually funds defined programs with reporting expectations rather than general operations.",
      },
    ],
  },
  {
    demo: true,
    id: "demo-brightloom",
    ein: "demo-brightloom",
    name: "Bright Loom Arts Education",
    city: "Vessia",
    state: "VT",
    category: "A25 — Arts education",
    filings: [
      { year: 2024, totrevenue: 264800, contributions: 152900, programRevenue: 98300, governmentGrants: 6500, foundationGrants: 0 },
      { year: 2023, totrevenue: 251600, contributions: 149800, programRevenue: 91200, governmentGrants: 5000, foundationGrants: 0 },
      { year: 2022, totrevenue: 239900, contributions: 143200, programRevenue: 87600, governmentGrants: 4500, foundationGrants: 0 },
    ],
    fundingCategories: [
      {
        category: "Arts learning & school partnerships",
        band: "$5k–$40k",
        funderType: "State arts agencies",
        note: "Most states run annual arts-education cycles; match requirements are common.",
      },
      {
        category: "Community arts access",
        band: "$5k–$30k",
        funderType: "Community foundations",
        note: "Local cycles that often favor programs reaching students beyond the studio.",
      },
      {
        category: "Creative youth development",
        band: "$10k–$75k",
        funderType: "Regional & national foundations",
        note: "A defined field with its own vocabulary; strong fit usually requires youth-voice elements.",
      },
    ],
  },
];

/** True when a report id refers to a bundled fictional org (never a real EIN). */
export function isDemoId(value) {
  return typeof value === "string" && value.toLowerCase().startsWith("demo-");
}

/** Look up a fixture by its demo id. Returns the org object or null. */
export function getFixtureOrg(id) {
  const key = String(id || "").toLowerCase().trim();
  return FIXTURE_ORGS.find((o) => o.id === key) || null;
}

/**
 * Case-insensitive name/city/category match over the fixtures.
 * Empty query returns every fixture (useful for demo listings).
 */
export function searchFixtures(q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return FIXTURE_ORGS.slice();
  return FIXTURE_ORGS.filter((o) =>
    [o.name, o.city, o.state, o.category, o.id]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(query))
  );
}

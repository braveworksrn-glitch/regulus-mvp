/**
 * Seed data for the pipeline store — the real trial client.
 *
 * Loaded once by src/lib/pipelineStore.js when .data/pipeline.json does not
 * exist yet. Everything here follows the compliance rails in docs/BRAND.md:
 * program facts cite the program, never "you"; no odds, approvals, or
 * outcomes are stated or implied; unverified items are labeled as such.
 *
 * The three opportunities are PLACEHOLDERS at status "identified". They are
 * unverified stubs to be replaced by the research fleet deliverable — every
 * detail below (award bands, cadence, eligibility) is pending verification.
 */

export function buildSeedState() {
  const at = new Date().toISOString();

  const client = {
    id: "client-hitf-restoration",
    name: "Home Is the Foundation Restoration",
    location:
      "West Liberty, Morgan County, Eastern Kentucky (ARC-designated Appalachian county)",
    entityType: "508(c)(1)(A) faith-based organization (no IRS determination letter)",
    missionSummary:
      "Critical home repair for elderly and low-income homeowners — the \"dry-in\" scope: " +
      "roof leak repair, subfloor and structural repair, accessibility ramps, and " +
      "underpinning/winterization. Materials come partly from a reclaimed-materials " +
      "supply chain (barn deconstruction, scratch-and-dent rescue). Labor model is " +
      "volunteer crews plus homeowner sweat equity, with trades mentorship for " +
      "local workers. Startup organization; plans to stand up a separate 501(c)(3) " +
      "community development corporation (CDC) in the future.",
    contacts: [],
    createdAt: at,
    status: "active",
    notes: [
      {
        at,
        text:
          "KEY ELIGIBILITY CONSTRAINT — no IRS determination letter. The organization " +
          "operates as a 508(c)(1)(A) faith-based entity, which claims tax-exempt " +
          "status automatically rather than through an IRS 501(c)(3) determination " +
          "letter. Many funders ask for that letter as proof of exempt status. Each " +
          "opportunity must be checked for whether the program accepts a 508(c)(1)(A) " +
          "without a letter, allows a fiscal sponsor, or requires the letter outright. " +
          "Track this per-opportunity in the requires501c3Letter field.",
      },
      {
        at,
        text:
          "Startup with no grant history and no prior awards. First applications will " +
          "need extra lead time for organizational documents (budget, board list, " +
          "financial statements or a statement that none exist yet).",
      },
      {
        at,
        text:
          "Plans a future 501(c)(3) CDC. If formed, that entity could hold a " +
          "determination letter and may widen which programs the organization can " +
          "apply to — revisit parked opportunities if that happens.",
      },
      {
        at,
        text:
          "Location context: Morgan County, KY is an ARC-designated Appalachian " +
          "county. Several rural and Appalachian programs cite county designation in " +
          "their published eligibility criteria — verify current designation status " +
          "during vetting for each opportunity.",
      },
    ],
  };

  const opportunities = [
    {
      id: "opp-usda-hpg-533",
      clientId: client.id,
      name: "USDA Housing Preservation Grants (Section 533) — PLACEHOLDER",
      funder: "USDA Rural Development",
      funderType: "federal",
      awardBand: "unverified — placeholder pending research fleet results",
      fitRationale:
        "UNVERIFIED PLACEHOLDER. The program's published purpose funds organizations " +
        "that repair and rehabilitate housing owned or occupied by low- and " +
        "very-low-income rural residents — which appears aligned with the dry-in " +
        "repair mission (roofs, structural, winterization). Whether this " +
        "organization can apply has not been verified.",
      eligibilityNotes: "pending research fleet results — placeholder",
      requires501c3Letter: "unclear",
      cadenceOrDeadline: "unverified — placeholder; annual NOFA cadence to be confirmed",
      sources: [
        "PLACEHOLDER (unverified): https://www.rd.usda.gov/programs-services/single-family-housing-programs/housing-preservation-grants",
      ],
      status: "identified",
      statusHistory: [
        {
          status: "identified",
          at,
          note:
            "Seeded as an unverified placeholder — replace all details with the " +
            "research fleet deliverable before vetting.",
        },
      ],
      nextAction:
        "Replace placeholder details with verified research (eligibility of a " +
        "508(c)(1)(A) applicant without a determination letter, award band, cadence) " +
        "before advancing to vetting.",
    },
    {
      id: "opp-arc-appalachian",
      clientId: client.id,
      name: "Appalachian Regional Commission (ARC) — PLACEHOLDER",
      funder: "Appalachian Regional Commission",
      funderType: "federal-state partnership",
      awardBand: "unverified — placeholder pending research fleet results",
      fitRationale:
        "UNVERIFIED PLACEHOLDER. ARC's published programs fund community and " +
        "economic development in designated Appalachian counties; Morgan County, KY " +
        "is in the ARC region. Which specific ARC program (if any) fits home-repair " +
        "work, and whether applications route through the state program office, has " +
        "not been verified.",
      eligibilityNotes: "pending research fleet results — placeholder",
      requires501c3Letter: "unclear",
      cadenceOrDeadline:
        "unverified — placeholder; ARC funding typically routes through state cycles, to be confirmed",
      sources: ["PLACEHOLDER (unverified): https://www.arc.gov/funding-opportunities/"],
      status: "identified",
      statusHistory: [
        {
          status: "identified",
          at,
          note:
            "Seeded as an unverified placeholder — replace all details with the " +
            "research fleet deliverable before vetting.",
        },
      ],
      nextAction:
        "Replace placeholder details with verified research (correct ARC program, " +
        "state-office routing, applicant-entity requirements) before advancing to " +
        "vetting.",
    },
    {
      id: "opp-home-depot-foundation",
      clientId: client.id,
      name: "Home Depot Foundation — Community Impact Grants — PLACEHOLDER",
      funder: "The Home Depot Foundation",
      funderType: "corporate foundation",
      awardBand: "unverified — placeholder pending research fleet results",
      fitRationale:
        "UNVERIFIED PLACEHOLDER. The foundation's published Community Impact Grants " +
        "program describes funding for veteran- and community-serving volunteer " +
        "projects, often as tool/material support — which appears adjacent to a " +
        "volunteer-crew repair model. Applicant-entity requirements (including " +
        "proof of exempt status) have not been verified.",
      eligibilityNotes: "pending research fleet results — placeholder",
      requires501c3Letter: "unclear",
      cadenceOrDeadline: "unverified — placeholder; rolling vs. cycle cadence to be confirmed",
      sources: [
        "PLACEHOLDER (unverified): https://corporate.homedepot.com/foundation",
      ],
      status: "identified",
      statusHistory: [
        {
          status: "identified",
          at,
          note:
            "Seeded as an unverified placeholder — replace all details with the " +
            "research fleet deliverable before vetting.",
        },
      ],
      nextAction:
        "Replace placeholder details with verified research (exempt-status proof " +
        "requirements for a 508(c)(1)(A), award band, cadence) before advancing to " +
        "vetting.",
    },
  ];

  return {
    version: 1,
    seededAt: at,
    clients: [client],
    opportunities,
  };
}

import { NextResponse } from "next/server";
import { searchOrgs, getOrg } from "@/lib/propublica";
import {
  getFixtureOrg,
  isDemoId,
  searchFixtures,
  DEFAULT_DEMO_ID,
} from "@/lib/fixtures/orgs";
import { computeGapRead } from "@/lib/gap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function json(body, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * GET /api/report?ein=...   -> { ok, demo, org, gap } | { notFound } | { unavailable }
 * GET /api/report?q=...     -> { ok, demo, results }  | { unavailable }
 *
 * Demo ids (demo-*) and DEMO_MODE=1 serve bundled fictional fixtures and
 * never call the live API. Live failures return
 * { unavailable: true, demoSuggestion: "demo-riverbend" }. Responses are
 * always no-store — org data must never be cache-poisoned across orgs.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ein = (searchParams.get("ein") || "").trim();
  const q = (searchParams.get("q") || "").trim();
  const demoMode = process.env.DEMO_MODE === "1";

  if (ein) {
    if (isDemoId(ein)) {
      const org = getFixtureOrg(ein);
      if (!org) {
        return json({ notFound: true, demoSuggestion: DEFAULT_DEMO_ID }, 404);
      }
      return json({ ok: true, demo: true, org, gap: computeGapRead(org) });
    }

    if (demoMode) {
      // Demo mode never hits the live API; point callers at a sample report.
      return json({
        unavailable: true,
        demoMode: true,
        demoSuggestion: DEFAULT_DEMO_ID,
      });
    }

    const r = await getOrg(ein);
    if (r.invalid) {
      return json({ error: r.error, demoSuggestion: DEFAULT_DEMO_ID }, 400);
    }
    if (r.notFound) {
      return json({ notFound: true, demoSuggestion: DEFAULT_DEMO_ID }, 404);
    }
    if (!r.ok) {
      return json({ unavailable: true, demoSuggestion: DEFAULT_DEMO_ID });
    }
    return json({ ok: true, demo: false, org: r.org, gap: computeGapRead(r.org) });
  }

  if (q) {
    if (demoMode) {
      return json({ ok: true, demo: true, results: searchFixtures(q) });
    }
    const r = await searchOrgs(q);
    if (!r.ok) {
      return json({
        unavailable: true,
        demoSuggestion: DEFAULT_DEMO_ID,
        fixtureResults: searchFixtures(q),
      });
    }
    return json({ ok: true, demo: false, results: r.results });
  }

  return json({ error: "Provide ?ein= or ?q=" }, 400);
}

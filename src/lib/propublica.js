/**
 * ProPublica Nonprofit Explorer v2 API client.
 *
 * Live endpoints:
 *   searchOrgs(q) -> GET {API_BASE}/search.json?q=...
 *   getOrg(ein)   -> GET {API_BASE}/organizations/{ein}.json
 *
 * Every call is bounded by an 8s AbortController timeout and never throws:
 * failures come back as graceful error objects so callers can branch on
 * shape, not on try/catch.
 *
 * Result shapes:
 *   { ok: true, results: [...] }         — search success
 *   { ok: true, org: {...} }             — org success (normalized, see below)
 *   { notFound: true }                   — upstream 404 / no such org
 *   { invalid: true, error }             — bad input (e.g. non-numeric EIN)
 *   { unavailable: true, error }         — network failure, timeout, or 5xx
 *
 * Normalized org shape (shared with src/lib/fixtures/orgs.js):
 *   {
 *     demo: false,
 *     ein, name, city, state, category,
 *     filings: [{ year, totrevenue, contributions, programRevenue,
 *                 governmentGrants, foundationGrants }],
 *     fundingCategories: null   // live data has none; fixtures supply theirs
 *   }
 *
 * Note: the v2 API does not break grant revenue out of total contributions
 * (990 line 1e is not exposed), so governmentGrants / foundationGrants are
 * null for live orgs. src/lib/gap.js hedges accordingly.
 */

const API_BASE = "https://projects.propublica.org/nonprofits/api/v2";
const TIMEOUT_MS = 8000;

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function apiGet(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) return { notFound: true };
    if (!res.ok) {
      return { unavailable: true, error: `Upstream responded ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    const timedOut = err && err.name === "AbortError";
    return {
      unavailable: true,
      error: timedOut
        ? `Request timed out after ${TIMEOUT_MS / 1000}s`
        : (err && err.message) || "Network error",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Search organizations by name or keyword.
 * Returns { ok: true, results } or a graceful error object.
 */
export async function searchOrgs(q) {
  const query = String(q || "").trim();
  if (!query) return { ok: true, results: [] };

  const r = await apiGet(`/search.json?q=${encodeURIComponent(query)}`);
  if (!r.ok) return r;

  const orgs = Array.isArray(r.data?.organizations) ? r.data.organizations : [];
  return {
    ok: true,
    results: orgs.map((o) => ({
      ein: o.ein != null ? String(o.ein) : null,
      name: o.name || "Unnamed organization",
      city: o.city || null,
      state: o.state || null,
      ntee: o.ntee_code || null,
    })),
  };
}

/**
 * Fetch one organization (with up to 3 most recent filings) by EIN.
 * Returns { ok: true, org } or a graceful error object.
 */
export async function getOrg(ein) {
  const digits = String(ein || "").replace(/[^0-9]/g, "");
  if (!digits || digits.length > 9) {
    return { invalid: true, error: "EIN must be a number (9 digits)" };
  }

  const r = await apiGet(`/organizations/${digits}.json`);
  if (!r.ok) return r;

  const org = r.data?.organization;
  if (!org) return { notFound: true };

  const rawFilings = Array.isArray(r.data?.filings_with_data)
    ? r.data.filings_with_data
    : [];

  const filings = rawFilings
    .map((f) => ({
      year:
        toNumber(f.tax_prd_yr) ??
        (f.tax_prd ? Math.floor(toNumber(f.tax_prd) / 100) : null),
      totrevenue: toNumber(f.totrevenue),
      contributions: toNumber(f.totcntrbgfts),
      programRevenue: toNumber(f.totprgmrevnue),
      // Not exposed by the v2 API — see file header. gap.js hedges on null.
      governmentGrants: null,
      foundationGrants: null,
    }))
    .filter((f) => f.year != null)
    .sort((a, b) => b.year - a.year)
    .slice(0, 3);

  return {
    ok: true,
    org: {
      demo: false,
      ein: String(org.ein ?? digits),
      name: org.name || "Unnamed organization",
      city: org.city || null,
      state: org.state || null,
      category: org.ntee_code || null,
      filings,
      fundingCategories: null,
    },
  };
}

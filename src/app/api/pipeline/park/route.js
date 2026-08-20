import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminEnabled, isValidSession } from "@/app/admin/_lib/auth";
import { park, PipelineError } from "@/lib/pipelineStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/* POST /api/pipeline/park  { opportunityId, note? }
   Parks a pre-submitted opportunity; calling it again on a parked
   opportunity restores its prior status. Explicit operator click only. */
export async function POST(req) {
  if (!adminEnabled() || !isValidSession(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { ok: false, error: "Not authorized" },
      { status: 401, headers: NO_STORE }
    );
  }
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400, headers: NO_STORE }
      );
    }
    const opportunityId = String(body?.opportunityId || "").trim();
    if (!opportunityId) {
      return NextResponse.json(
        { ok: false, error: "opportunityId is required" },
        { status: 400, headers: NO_STORE }
      );
    }
    const opportunity = await park(opportunityId, body?.note);
    return NextResponse.json({ ok: true, opportunity }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof PipelineError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status, headers: NO_STORE }
      );
    }
    console.error("pipeline park error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to park opportunity" },
      { status: 500, headers: NO_STORE }
    );
  }
}

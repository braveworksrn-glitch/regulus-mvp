import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminEnabled, isValidSession } from "@/app/admin/_lib/auth";
import { recordDecision, PipelineError } from "@/lib/pipelineStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/* POST /api/pipeline/decision  { opportunityId, outcome, note? }
   Records the funder's decision ("awarded" | "declined" | "withdrawn") on a
   submitted opportunity — an explicit operator click. */
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
    const opportunity = await recordDecision(
      opportunityId,
      String(body?.outcome || "").trim(),
      body?.note
    );
    return NextResponse.json({ ok: true, opportunity }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof PipelineError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status, headers: NO_STORE }
      );
    }
    console.error("pipeline decision error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to record decision" },
      { status: 500, headers: NO_STORE }
    );
  }
}

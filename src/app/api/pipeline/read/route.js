/**
 * POST /api/pipeline/read  { clientId }
 *   -> { ok: true, read: { source: "ai"|"template", text, generatedAt } }
 *
 * Drafts a fundability read for one client via
 * src/lib/readDrafter.js#draftFundabilityRead(client, opportunities).
 * Gated by the SAME admin cookie as /admin. Runs only on explicit
 * operator request — never on a schedule.
 */

import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminEnabled,
  isValidSession,
} from "@/app/admin/_lib/auth";
import { draftFundabilityRead } from "@/lib/readDrafter";
import { getClientWithOpportunities } from "@/app/dashboard/_lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function json(body, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function POST(req) {
  if (!adminEnabled() || !isValidSession(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return json({ ok: false, error: "Not authorized" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request body" }, 400);
  }
  const clientId = String(body?.clientId || "").trim();
  if (!clientId) {
    return json({ ok: false, error: "clientId is required" }, 400);
  }

  try {
    const { client, opportunities } = await getClientWithOpportunities(clientId);
    if (!client) {
      return json({ ok: false, error: "Client not found" }, 404);
    }

    const result = await draftFundabilityRead(client, opportunities);
    const source = result && result.source === "ai" ? "ai" : "template";
    const text = result && typeof result.text === "string" ? result.text : "";
    if (!text.trim()) {
      return json({ ok: false, error: "Drafter returned an empty read" }, 500);
    }

    return json({
      ok: true,
      read: { source, text, generatedAt: new Date().toISOString() },
    });
  } catch (err) {
    console.error("pipeline read error:", err);
    return json({ ok: false, error: "Failed to draft the read" }, 500);
  }
}

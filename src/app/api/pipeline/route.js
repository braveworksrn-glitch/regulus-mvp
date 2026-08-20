import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminEnabled, isValidSession } from "@/app/admin/_lib/auth";
import {
  getAll,
  createClient,
  createOpportunity,
  PipelineError,
} from "@/lib/pipelineStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Not authorized" },
    { status: 401, headers: NO_STORE }
  );
}

function isAuthed(req) {
  return adminEnabled() && isValidSession(req.cookies.get(ADMIN_COOKIE)?.value);
}

/* GET /api/pipeline -> { ok, clients, opportunities, needsYou } */
export async function GET(req) {
  if (!isAuthed(req)) return unauthorized();
  try {
    const data = await getAll();
    return NextResponse.json({ ok: true, ...data }, { headers: NO_STORE });
  } catch (err) {
    console.error("pipeline GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to read pipeline" },
      { status: 500, headers: NO_STORE }
    );
  }
}

/* POST /api/pipeline  { type: "client" | "opportunity", ...fields }
   (fields may also be nested under `data`) */
export async function POST(req) {
  if (!isAuthed(req)) return unauthorized();
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

    const { type, data, ...rest } = body || {};
    const input = data && typeof data === "object" ? data : rest;

    if (type === "client") {
      const client = await createClient(input);
      return NextResponse.json({ ok: true, client }, { headers: NO_STORE });
    }
    if (type === "opportunity") {
      const opportunity = await createOpportunity(input);
      return NextResponse.json({ ok: true, opportunity }, { headers: NO_STORE });
    }
    return NextResponse.json(
      { ok: false, error: 'Expected type: "client" or "opportunity"' },
      { status: 400, headers: NO_STORE }
    );
  } catch (err) {
    if (err instanceof PipelineError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status, headers: NO_STORE }
      );
    }
    console.error("pipeline POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create record" },
      { status: 500, headers: NO_STORE }
    );
  }
}

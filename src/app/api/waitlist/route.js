import { NextResponse } from "next/server";
import { add, isValidEmail } from "@/lib/waitlistStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Naive in-memory rate limit: 10 requests / minute / IP.              */
/* Per-process only (fine for V1 on a single instance).                */
/* ------------------------------------------------------------------ */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

const g = globalThis;
if (!g.__regulusWaitlistRate) g.__regulusWaitlistRate = new Map();
const hits = g.__regulusWaitlistRate;

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound.
  if (hits.size > 2000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

function getIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/* ------------------------------------------------------------------ */
/* POST /api/waitlist  { email, source, ein? }                         */
/* ------------------------------------------------------------------ */

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const email = String(body?.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (rateLimited(getIp(req))) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const result = await add({
      email,
      source: body?.source,
      ein: body?.ein,
    });

    return NextResponse.json(
      result.already ? { ok: true, already: true } : { ok: true }
    );
  } catch (err) {
    console.error("waitlist POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong on our end. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}

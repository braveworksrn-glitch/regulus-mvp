import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getIp(req) {
  // Works locally and on most hosts/CDNs
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    ""
  );
}

export async function POST(req) {
  try {
    const {
      email,
      source = "ui",
      segment = null,
      budget_band = null,
      sub_tier_interest = false,
      founding_member = false,
    } = await req.json();
    const e = String(email || "").trim().toLowerCase();

    // Basic email sanity check
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    // Build admin client with SERVICE ROLE (server-only)
    const url =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured (Supabase env missing)" },
        { status: 500 }
      );
    }
    const admin = createClient(url, key, { auth: { persistSession: false } });

    const ua = req.headers.get("user-agent") || "";
    const ip = getIp(req);

    // Upsert by unique email
    const { error } = await admin
      .from("waitlist")
      .upsert(
        {
          email: e,
          source,
          user_agent: ua,
          ip,
          // segment/budget captured in meta so no schema change is required;
          // dedicated columns exist in supabase/migrations/001_regulus_game.sql
          meta: { segment, budget_band, sub_tier_interest, founding_member },
        },
        { onConflict: "email" }
      );

    if (error) {
      // If duplicate or other DB message, return a friendly status
      return NextResponse.json(
        { ok: false, error: error.message || "Database error" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("waitlist POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}

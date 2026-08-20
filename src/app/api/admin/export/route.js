import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminEnabled, isValidSession } from "@/app/admin/_lib/auth";
import { toCsv } from "@/lib/waitlistStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  if (!adminEnabled() || !isValidSession(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json(
      { ok: false, error: "Not authorized" },
      { status: 401 }
    );
  }

  try {
    const csv = await toCsv();
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="regulus-waitlist-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("waitlist export error:", err);
    return NextResponse.json(
      { ok: false, error: "Export failed" },
      { status: 500 }
    );
  }
}

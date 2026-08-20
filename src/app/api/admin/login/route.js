import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminEnabled,
  passwordMatches,
  sessionToken,
  sessionCookieOptions,
} from "@/app/admin/_lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!adminEnabled()) {
    return NextResponse.redirect(new URL("/admin", req.url), 303);
  }

  let password = "";
  try {
    const form = await req.formData();
    password = String(form.get("password") || "");
  } catch {
    // fall through with empty password -> redirect with error
  }

  if (!passwordMatches(password)) {
    return NextResponse.redirect(new URL("/admin?error=1", req.url), 303);
  }

  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, sessionToken(), sessionCookieOptions());
  return res;
}

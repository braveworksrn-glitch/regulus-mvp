/**
 * Operator-session check for the dashboard — server-only.
 *
 * The console is gated by the SAME admin cookie as /admin. This is a
 * read-only import of the admin auth module (do not modify that file).
 * Returns "disabled" | "unauthenticated" | "ok".
 */

import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  adminEnabled,
  isValidSession,
} from "@/app/admin/_lib/auth";

export async function operatorAuthState() {
  if (!adminEnabled()) return "disabled";
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return isValidSession(token) ? "ok" : "unauthenticated";
}

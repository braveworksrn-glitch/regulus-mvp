/**
 * Admin session auth for V1.
 *
 * The session cookie value is an HMAC-SHA256 of a fixed payload keyed by
 * ADMIN_PASSWORD — "signed-ish": unforgeable without the password, no
 * server-side session state. Changing ADMIN_PASSWORD invalidates all
 * sessions. All comparisons are constant-time (inputs are hashed to a
 * fixed length first, so timingSafeEqual never throws on length).
 *
 * Server-only module.
 */

import crypto from "node:crypto";

export const ADMIN_COOKIE = "regulus_admin";
const TOKEN_PAYLOAD = "regulus-admin-session-v1";

export function adminEnabled() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function constantTimeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a), "utf8").digest();
  const hb = crypto.createHash("sha256").update(String(b), "utf8").digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function passwordMatches(candidate) {
  if (!adminEnabled()) return false;
  return constantTimeEqual(candidate ?? "", process.env.ADMIN_PASSWORD);
}

export function sessionToken() {
  return crypto
    .createHmac("sha256", process.env.ADMIN_PASSWORD)
    .update(TOKEN_PAYLOAD)
    .digest("hex");
}

export function isValidSession(token) {
  if (!adminEnabled() || !token) return false;
  return constantTimeEqual(token, sessionToken());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  };
}

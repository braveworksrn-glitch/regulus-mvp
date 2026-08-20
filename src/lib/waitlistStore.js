/**
 * Waitlist storage — one interface, two backends.
 *
 *   add({ email, source, ein })  -> { ok: true, already: boolean }
 *   list()                       -> [{ id, email, source, ein, created_at }] newest first
 *   toCsv()                      -> CSV string (email, source, ein, created_at)
 *
 * Backend selection:
 *   - Supabase when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
 *     (table `waitlist`: id, email, source, ein, created_at — see docs/status/c-waitlist-admin.md
 *     for the CREATE TABLE SQL).
 *   - Otherwise a JSON file store at .data/waitlist.json (atomic writes,
 *     dedupe by email keeping the first signup, ISO timestamps).
 *
 * Server-only module — never import from client components.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeSource(source) {
  const s = String(source || "").trim().toLowerCase();
  return s ? s.slice(0, 40) : "unknown";
}

function normalizeEin(ein) {
  if (ein === undefined || ein === null) return null;
  const s = String(ein).trim().replace(/[^0-9-]/g, "").slice(0, 12);
  return s || null;
}

export function isValidEmail(email) {
  const e = normalizeEmail(email);
  return e.length > 3 && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

function usingSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/* ------------------------------------------------------------------ */
/* Supabase backend (service role — server only)                       */
/* ------------------------------------------------------------------ */

let _adminClient = null;

async function supabaseAdmin() {
  if (_adminClient) return _adminClient;
  const { createClient } = await import("@supabase/supabase-js");
  _adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  return _adminClient;
}

async function supabaseAdd({ email, source, ein }) {
  const db = await supabaseAdmin();

  // Dedupe by email, keeping the first signup.
  const existing = await db
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .limit(1);
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data && existing.data.length > 0) return { ok: true, already: true };

  const { error } = await db.from("waitlist").insert({ email, source, ein });
  if (error) {
    // 23505 = unique violation: someone beat us to it. First signup wins.
    if (error.code === "23505") return { ok: true, already: true };
    throw new Error(error.message);
  }
  return { ok: true, already: false };
}

async function supabaseList() {
  const db = await supabaseAdmin();
  const { data, error } = await db
    .from("waitlist")
    .select("id, email, source, ein, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

/* ------------------------------------------------------------------ */
/* JSON file backend (.data/waitlist.json)                             */
/* ------------------------------------------------------------------ */

async function fileRead() {
  let raw;
  try {
    raw = await fs.readFile(DATA_FILE, "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") return [];
    throw err;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return []; // corrupt file: treat as empty rather than crash the API
  }
  if (!Array.isArray(parsed)) return [];

  // Defensive dedupe by email, keeping the first (earliest) entry.
  const seen = new Set();
  const rows = [];
  for (const row of parsed) {
    const e = normalizeEmail(row && row.email);
    if (!e || seen.has(e)) continue;
    seen.add(e);
    rows.push({
      id: row.id || crypto.randomUUID(),
      email: e,
      source: normalizeSource(row.source),
      ein: normalizeEin(row.ein),
      created_at: row.created_at || new Date().toISOString(),
    });
  }
  return rows;
}

async function fileWrite(rows) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = path.join(
    DATA_DIR,
    `.waitlist.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`
  );
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2) + "\n", "utf8");
  await fs.rename(tmp, DATA_FILE); // atomic on the same filesystem
}

// Serialize writes within this process so concurrent adds don't clobber.
let _writeChain = Promise.resolve();
function withWriteLock(fn) {
  const next = _writeChain.then(fn, fn);
  _writeChain = next.catch(() => {});
  return next;
}

async function fileAdd({ email, source, ein }) {
  return withWriteLock(async () => {
    const rows = await fileRead();
    if (rows.some((r) => r.email === email)) return { ok: true, already: true };
    rows.push({
      id: crypto.randomUUID(),
      email,
      source,
      ein,
      created_at: new Date().toISOString(),
    });
    await fileWrite(rows);
    return { ok: true, already: false };
  });
}

async function fileList() {
  const rows = await fileRead();
  return rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

/* ------------------------------------------------------------------ */
/* Public interface                                                    */
/* ------------------------------------------------------------------ */

export async function add({ email, source, ein } = {}) {
  const e = normalizeEmail(email);
  if (!isValidEmail(e)) throw new Error("Invalid email");
  const entry = { email: e, source: normalizeSource(source), ein: normalizeEin(ein) };
  return usingSupabase() ? supabaseAdd(entry) : fileAdd(entry);
}

export async function list() {
  return usingSupabase() ? supabaseList() : fileList();
}

function csvField(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function toCsv() {
  const rows = await list();
  const lines = ["email,source,ein,created_at"];
  for (const r of rows) {
    lines.push(
      [csvField(r.email), csvField(r.source), csvField(r.ein), csvField(r.created_at)].join(",")
    );
  }
  return lines.join("\r\n") + "\r\n";
}

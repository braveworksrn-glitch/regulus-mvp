# Stream C status — waitlist + admin

*2026-08-20. Done.*

## What was built

### `src/lib/waitlistStore.js`
One interface, two backends: `add({email, source, ein})` → `{ok:true, already:boolean}`, `list()` → rows newest-first, `toCsv()` → CSV string (CRLF, header `email,source,ein,created_at`, proper quoting). Also exports `isValidEmail` used by the API route.

- **Supabase backend** when `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are both set. Lazy client (dynamic import, `persistSession:false`). Dedupe = select-by-email pre-check plus treating Postgres `23505` unique-violation as `already:true` (first signup wins under races).
- **JSON file backend** otherwise: `.data/waitlist.json`. `mkdir -p`, atomic write (temp file + rename), an in-process write lock serializing concurrent adds, dedupe by email keeping the first entry (also defensively on read), ISO-8601 timestamps, `crypto.randomUUID()` ids. A corrupt file reads as empty instead of crashing the API.

**Supabase table SQL** (run once in the SQL editor):

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  ein text,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
-- No policies on purpose: the server uses the service-role key (bypasses RLS);
-- anon/browser access stays blocked.
```

### `src/app/api/waitlist/route.js` (full replacement)
- `POST {email, source, ein?}`: server-side email validation (400), naive in-memory rate limit **10/min/IP** (429; map on `globalThis`, pruned to stay bounded), stores via `waitlistStore`. Returns `{ok:true}`; duplicate email returns `{ok:true, already:true}` (200 — the client form shows success either way, per contract).
- `GET` → 405 with `Allow: POST`. `runtime="nodejs"`, `dynamic="force-dynamic"`.
- Removed the old handler's `user_agent` / `ip` / `meta` columns — V1 stores only what the contract names.

### Admin (`/admin`)
- `src/app/admin/_lib/auth.js` — session token = HMAC-SHA256 of a fixed payload keyed by `ADMIN_PASSWORD` ("signed-ish", stateless; rotating the password signs everyone out). All comparisons hash both sides to fixed length then `crypto.timingSafeEqual` (constant-time, no length leak/throw).
- `src/app/admin/page.js` — fully server-rendered, `force-dynamic`, `robots noindex`. Three states: (1) `ADMIN_PASSWORD` unset → "Admin is disabled. Set `ADMIN_PASSWORD`."; (2) no/invalid cookie → plain-HTML password form posting to `/api/admin/login` (wrong password → `/admin?error=1` message); (3) authenticated → signups table (email, source, EIN, UTC date), total count, Refresh link, **Export CSV** link, Sign out form. No client components, no client state beyond the native form.
- `src/app/api/admin/login/route.js` — constant-time password check, sets httpOnly `regulus_admin` cookie (SameSite=Lax, Secure in production, 8h), 303 back to `/admin`.
- `src/app/api/admin/logout/route.js` — clears cookie, 303 to `/admin`.
- `src/app/api/admin/export/route.js` — cookie-gated (401 otherwise) `text/csv` attachment `regulus-waitlist-YYYY-MM-DD.csv`, `Cache-Control: no-store`.

### `.env.example`
All envs the app reads, each commented: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `DEMO_MODE`. Verified by grepping `process.env.*` across `src/` (only extra hit is runtime-provided `NODE_ENV`).

### `.gitignore`
Kept existing lines; added `.data/` and `!.env.example` (the existing `.env*` line would otherwise ignore the example file).

## How self-verified
- `node --check` passes on the store, auth helper, and all four route handlers (checked as ESM copies).
- Functional test script (scratchpad, run with cwd = temp dir so `.data/` never touches the repo) exercising the file backend: valid/invalid emails, add → `{ok,already:false}`, duplicate → `{ok,already:true}` keeping the *first* signup's source, EIN normalization, 5 concurrent adds without clobbering, newest-first `list()`, ISO timestamps, ids, on-disk JSON matches, zero leftover `.tmp` files, CSV header/row-count/comma+quote escaping. Plus auth: password match/mismatch/empty/undefined, token round-trip, forged/truncated token rejection, everything false when `ADMIN_PASSWORD` unset. **All assertions passed.**
- `npx next lint`: zero findings in Stream C files (remaining errors are `react/no-unescaped-entities` in Stream B's `src/app/report/**`).
- Banned-language grep over all Stream C files: clean. Confirmed no `.data/` directory was created inside the repo.

## Known gaps / notes
- Rate limit is per-process memory — resets on deploy and is per-instance on multi-instance hosts (accepted as "naive" for V1). Same for the file store: on serverless hosts the filesystem is ephemeral, so production should set the Supabase envs.
- Admin route handlers live at `src/app/api/admin/**` (login/logout/export) per this stream's brief; the build-plan ownership table lists `src/app/admin/**` — flagging the delta for the orchestrator. No other stream touches these paths.
- Admin session is a single shared token derived from the password (no per-login expiry payload). Cookie maxAge 8h bounds it client-side; V2 could add a timestamped signed payload.
- `src/lib/supabaseClient.js` (pre-existing, anon-key client) is now unused by the waitlist path; it creates a client at import time and would throw if imported without envs. Not touched — outside this stream's ownership. Recommend deletion in cleanup.
- The old `/api/waitlist` wrote `user_agent`/`ip`; if a real Supabase table already exists with those columns they'll simply stay null now.

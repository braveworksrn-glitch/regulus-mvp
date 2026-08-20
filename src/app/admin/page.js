import { cookies } from "next/headers";
import Logo from "@/components/Logo";
import { list } from "@/lib/waitlistStore";
import { ADMIN_COOKIE, adminEnabled, isValidSession } from "./_lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Admin — Regulus",
  robots: { index: false, follow: false },
};

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

function Shell({ children, wide = false }) {
  return (
    <div className="min-h-screen bg-bg px-6 py-10 text-ink">
      <div className={`mx-auto ${wide ? "max-w-4xl" : "max-w-md"}`}>
        <header className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted">
            Admin
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */

function Disabled() {
  return (
    <Shell>
      <section className="rounded-xl border border-line bg-card p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Admin is disabled.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Set <code className="rounded bg-bg px-1.5 py-0.5 text-sm text-ink">ADMIN_PASSWORD</code>{" "}
          in the environment to enable this page.
        </p>
      </section>
    </Shell>
  );
}

function Login({ showError }) {
  return (
    <Shell>
      <section className="rounded-xl border border-line bg-card p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Enter the admin password to view waitlist signups.
        </p>
        <form method="post" action="/api/admin/login" className="mt-6">
          <label
            htmlFor="admin-password"
            className="block text-xs font-medium uppercase tracking-widest text-muted"
          >
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoFocus
            className="mt-2 h-12 w-full rounded-lg border border-line bg-bg px-4 text-base text-ink focus:border-accent"
          />
          {showError && (
            <p role="alert" className="mt-3 text-sm text-muted">
              That password didn&rsquo;t match. Please try again.
            </p>
          )}
          <button
            type="submit"
            className="mt-5 h-12 w-full rounded-lg bg-accent px-6 text-base font-medium text-bg transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </section>
    </Shell>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(d);
}

function Dashboard({ rows }) {
  return (
    <Shell wide>
      <section className="rounded-xl border border-line bg-card">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-8 py-6">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Waitlist signups
            </h1>
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-accent">{rows.length}</span>{" "}
              {rows.length === 1 ? "signup" : "signups"} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="inline-flex h-10 items-center rounded-lg border border-line bg-bg px-4 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              Refresh
            </a>
            <a
              href="/api/admin/export"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Export CSV
            </a>
            <form method="post" action="/api/admin/logout">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-lg border border-line bg-bg px-4 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="px-8 py-12 text-center text-base text-muted">
            No signups yet. Submissions from the landing page and report pages
            will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-medium uppercase tracking-widest text-muted">
                  <th scope="col" className="px-8 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Source</th>
                  <th scope="col" className="px-4 py-3">EIN</th>
                  <th scope="col" className="px-8 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id || row.email}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-8 py-3.5 font-medium text-ink">{row.email}</td>
                    <td className="px-4 py-3.5 text-muted">{row.source || "—"}</td>
                    <td className="px-4 py-3.5 tabular-nums text-muted">{row.ein || "—"}</td>
                    <td className="whitespace-nowrap px-8 py-3.5 tabular-nums text-muted">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="mt-6 text-center text-xs text-muted">
        Internal view. Signup data is handled for early-access contact only.
      </p>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function AdminPage({ searchParams }) {
  if (!adminEnabled()) return <Disabled />;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!isValidSession(token)) {
    const sp = await searchParams;
    return <Login showError={Boolean(sp?.error)} />;
  }

  let rows = [];
  let loadError = false;
  try {
    rows = await list();
  } catch (err) {
    console.error("admin list error:", err);
    loadError = true;
  }

  if (loadError) {
    return (
      <Shell>
        <section className="rounded-xl border border-line bg-card p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Couldn&rsquo;t load signups
          </h1>
          <p className="mt-3 text-base text-muted">
            The waitlist store returned an error. Check the server logs and
            storage configuration, then{" "}
            <a href="/admin" className="text-accent underline underline-offset-2">
              refresh
            </a>
            .
          </p>
        </section>
      </Shell>
    );
  }

  return <Dashboard rows={rows} />;
}

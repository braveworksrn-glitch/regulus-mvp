import Link from "next/link";
import Shell from "./Shell";

/**
 * Rendered when the operator console cannot show data:
 * state = "disabled" (no ADMIN_PASSWORD) or "unauthenticated".
 * Sign-in reuses the /admin gate — same cookie, same session.
 */
export default function Gate({ state }) {
  return (
    <Shell>
      <section className="mx-auto max-w-md rounded-xl border border-line bg-card p-8">
        {state === "disabled" ? (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Console is disabled.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Set{" "}
              <code className="rounded bg-bg px-1.5 py-0.5 text-sm text-ink">
                ADMIN_PASSWORD
              </code>{" "}
              in the environment to enable the operator console.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Sign in to continue
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              The console uses the same session as the admin area. Sign in
              there, then come back — the session carries over.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent px-6 text-base font-medium text-bg transition-opacity hover:opacity-90"
            >
              Sign in via admin
            </Link>
          </>
        )}
      </section>
    </Shell>
  );
}

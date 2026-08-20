import Link from "next/link";
import Logo from "@/components/Logo";

/**
 * Dashboard chrome: logo, breadcrumb trail, console badge, admin link.
 * Server component. `crumbs` is a list of { href?, label }; the last one
 * renders as the current location.
 */
export default function Shell({ children, crumbs = [] }) {
  return (
    <div className="min-h-screen bg-bg px-6 py-8 text-ink">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" aria-label="Dashboard home">
              <Logo />
            </Link>
            {crumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm text-muted sm:flex">
                {crumbs.map((crumb, i) => (
                  <span key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true">/</span>}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-ink"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-ink">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted">
              Console
            </span>
            <Link
              href="/admin"
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              Admin
            </Link>
          </div>
        </header>
        {children}
        <footer className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          Internal operator console. Nothing here runs on a schedule — every
          state change is an explicit operator action. Regulus prepares
          research and drafts; each organization reviews and submits its own
          applications.
        </footer>
      </div>
    </div>
  );
}

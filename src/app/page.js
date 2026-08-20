import Link from "next/link";
import Logo from "@/components/Logo";
import EinSearch from "@/components/EinSearch";
import WaitlistForm from "@/components/WaitlistForm";

const STEPS = [
  {
    n: "1",
    title: "Enter your EIN",
    body: "Or search by name. Every U.S. nonprofit that files a Form 990 has one — it's on your IRS determination letter and your past filings.",
  },
  {
    n: "2",
    title: "We read your public 990",
    body: "Regulus pulls your latest publicly available filing and profiles your revenue mix — contributions, program revenue, and any grant revenue that appears.",
  },
  {
    n: "3",
    title: "See the gap — and what similar organizations tap",
    body: "A plain-English read on where grant funding may be missing from your mix, and the categories of funders that organizations like yours commonly pursue.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ---------------- Nav ---------------- */}
      <header className="border-b border-line">
        <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" aria-label="Regulus home" className="text-ink">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="hidden text-sm text-muted transition-colors hover:text-ink sm:block"
            >
              How it works
            </a>
            <a
              href="#waitlist"
              className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              Join waitlist
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ---------------- Hero ---------------- */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-20 sm:pt-28">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-accent">
            The Grant Gap Report
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            See the grants your nonprofit may be missing — a free report built
            from your own public IRS 990.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Small nonprofits without a development office often run entirely on
            program fees and donations while grant funding goes unexplored.
            Your public filings can show whether that pattern fits you — and
            what organizations like yours draw on.
          </p>
          <div className="mt-10">
            <EinSearch />
          </div>
          <div className="mt-8">
            <Link
              href="/report/demo-riverbend"
              className="inline-flex items-center gap-2 text-base font-medium text-accent underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
            >
              See a sample report
              <span aria-hidden="true">→</span>
            </Link>
            <span className="ml-3 text-sm text-muted">
              (fictional demo organization)
            </span>
          </div>
        </section>

        <hr className="rule mx-auto w-full max-w-5xl" />

        {/* ---------------- How it works ---------------- */}
        <section
          id="how-it-works"
          className="mx-auto w-full max-w-5xl px-6 py-20"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-xl border border-line bg-card p-6"
              >
                <span className="font-display text-3xl font-semibold text-accent">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <hr className="rule mx-auto w-full max-w-5xl" />

        {/* ---------------- What this is / is not ---------------- */}
        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            An honest note before you start
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-card p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                What this is
              </h3>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted">
                <li>
                  Research and drafts: a reading of your public IRS 990 and a
                  map of the grant categories similar organizations tap.
                </li>
                <li>
                  A starting point for a conversation your board can have with
                  real numbers on the table.
                </li>
                <li>
                  Free, built from data any funder can already see.
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-card p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                What this is not
              </h3>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted">
                <li>
                  Not a promise of funding. No outcome is promised, and we
                  never state your chances with any funder.
                </li>
                <li>
                  Not a submission service. Your organization reviews and
                  submits its own applications.
                </li>
                <li>
                  Not a complete picture. Public 990s lag by a year or more,
                  and grants booked under contributions may not appear as
                  grant revenue — so tell us if the read doesn&rsquo;t match
                  your books.
                </li>
                <li>Not legal, tax, or accounting advice.</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="rule mx-auto w-full max-w-5xl" />

        {/* ---------------- Waitlist ---------------- */}
        <section id="waitlist" className="mx-auto w-full max-w-5xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            The report is free. The next step is the service.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            We&rsquo;re building a done-with-you grant research service for small
            nonprofits: Regulus finds programs worth a look, drafts the
            groundwork, and keeps the pipeline organized — your team reviews
            everything and submits its own applications. Join the waitlist for
            early access.
          </p>
          <div className="mt-8">
            <WaitlistForm source="landing" />
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-ink">
              <Logo size={18} />
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              Regulus prepares research and drafts; your organization reviews
              and submits its own applications. Nothing here is legal, tax, or
              accounting advice, and no outcome is promised.
            </p>
          </div>
          <p className="mt-8 text-xs text-muted">
            © 2026 Regulus. Financial figures are drawn from public IRS Form
            990 filings.
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * EIN-or-name search. A 9-digit EIN (hyphens/spaces allowed) navigates to
 * /report/<ein>; anything else becomes a name search at /report/search?q=…
 * Pure client-side GET navigation — no API call from here.
 */
export default function EinSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    const compact = raw.replace(/[\s-]/g, "");
    if (/^\d{9}$/.test(compact)) {
      router.push(`/report/${compact}`);
    } else {
      router.push(`/report/search?q=${encodeURIComponent(raw)}`);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="ein-search" className="sr-only">
          EIN or organization name
        </label>
        <input
          id="ein-search"
          type="text"
          inputMode="search"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="EIN (e.g. 12-3456789) or organization name"
          className="h-12 flex-1 rounded-lg border border-line bg-card px-4 text-base text-ink placeholder:text-muted/70 focus:border-accent"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-lg bg-ink px-6 text-base font-medium text-bg transition-opacity hover:opacity-90"
        >
          See my report
        </button>
      </div>
      <p className="mt-2.5 text-sm text-muted">
        Free · No account needed · Built from public IRS filings
      </p>
    </form>
  );
}

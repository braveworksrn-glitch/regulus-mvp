"use client";

import { useState } from "react";

const SEGMENTS = [
  ["land_dream", "I dream of owning & taming land"],
  ["builder", "I want a build-ready lot"],
  ["curious", "Just curious"],
] as const;

const BUDGETS = [
  ["<2500", "Under $2,500"],
  ["2500_5000", "$2,500–$5,000"],
  ["5000_plus", "$5,000+"],
] as const;

export default function GameWaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState<string>("land_dream");
  const [budget, setBudget] = useState<string>("2500_5000");
  const [subTier, setSubTier] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setState("err");
      setMsg("Please enter a valid email.");
      return;
    }
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: val,
          source,
          segment,
          budget_band: budget,
          sub_tier_interest: subTier,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setState("err");
        setMsg(data.error || "Something went wrong — try again.");
        return;
      }
      setState("ok");
      setMsg("You're on the list. We'll write when the first county opens.");
      setEmail("");
    } catch {
      setState("err");
      setMsg("Network error — try again.");
    }
  }

  if (state === "ok") {
    return <p className="text-emerald-300 font-medium">{msg}</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 h-11 rounded-lg border border-emerald-800 bg-white text-stone-900 px-3 text-sm"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="h-11 px-5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold text-sm disabled:opacity-60"
        >
          {state === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          aria-label="What describes you best"
          className="h-10 rounded-lg border border-emerald-800 bg-white text-stone-900 px-2 text-sm"
        >
          {SEGMENTS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          aria-label="Budget band"
          className="h-10 rounded-lg border border-emerald-800 bg-white text-stone-900 px-2 text-sm"
        >
          {BUDGETS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-emerald-200/90">
        <input type="checkbox" checked={subTier} onChange={(e) => setSubTier(e.target.checked)} />
        I&apos;d be interested in a future sub-$2,500 lot tier
      </label>
      {msg && <p className="text-xs text-red-300">{msg}</p>}
    </form>
  );
}

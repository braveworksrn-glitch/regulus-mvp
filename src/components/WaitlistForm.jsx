"use client";

import { useState } from "react";

/**
 * Waitlist email capture. Posts { email, source } to /api/waitlist.
 * Landing page uses source="landing" (default); the report page may reuse
 * this with source="report" and an ein.
 */
export default function WaitlistForm({ source = "landing", ein }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | ok | err
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setState("err");
      setMsg("Please enter a valid email address.");
      return;
    }
    setState("loading");
    setMsg("");
    try {
      const body = { email: val, source };
      if (ein) body.ein = ein;
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("request failed");
      setState("ok");
      setMsg("Thanks — you're on the list. We'll be in touch as early access opens.");
      setEmail("");
    } catch {
      setState("err");
      setMsg("Something went wrong on our end. Please try again in a moment.");
    }
  }

  if (state === "ok") {
    return (
      <p role="status" className="rounded-lg border border-line bg-card px-4 py-3 text-base text-ink">
        {msg}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`waitlist-email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`waitlist-email-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourorganization.org"
          className="h-12 flex-1 rounded-lg border border-line bg-card px-4 text-base text-ink placeholder:text-muted/70 focus:border-accent"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="h-12 shrink-0 rounded-lg bg-accent px-6 text-base font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {state === "loading" ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {state === "err" && (
        <p role="alert" className="mt-2.5 text-sm text-muted">
          {msg}
        </p>
      )}
    </form>
  );
}

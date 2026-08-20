"use client";

import { useState } from "react";

/**
 * Report-page waitlist form. Posts JSON per the shared contract:
 *   POST /api/waitlist  { email, source: "report", ein }
 */
export default function WaitlistCta({ ein }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "report", ein }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body?.ok !== false) {
        setStatus("done");
        setMessage("Thanks — you're on the list. We'll be in touch as spots open.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(
          body?.error === "Invalid email"
            ? "That email doesn't look right — mind checking it?"
            : "We couldn't save that just now — please try again in a moment."
        );
      }
    } catch {
      setStatus("error");
      setMessage("We couldn't save that just now — please try again in a moment.");
    }
  }

  return (
    <section className="rg-cta" aria-labelledby="rg-cta-heading">
      <h2 id="rg-cta-heading">Want this gap worked, not just read?</h2>
      <p>
        Regulus is opening a done-for-you research service for small nonprofits:
        we map the local funders and draft the materials; your team reviews and
        submits its own applications. Join the waitlist and we'll reach out as
        spots open.
      </p>
      {status === "done" ? (
        <p className="rg-cta-status" role="status">
          {message}
        </p>
      ) : (
        <>
          <form className="rg-cta-form" onSubmit={onSubmit}>
            <label htmlFor="rg-cta-email" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Work email
            </label>
            <input
              id="rg-cta-email"
              className="rg-cta-input"
              type="email"
              required
              placeholder="you@yourorganization.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <button className="rg-cta-btn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Joining…" : "Join the waitlist"}
            </button>
          </form>
          {status === "error" ? (
            <p className="rg-cta-status" role="alert">
              {message}
            </p>
          ) : null}
        </>
      )}
      <p className="rg-cta-fineprint">
        No spam, no obligation — just a note when the service opens. No outcome
        is promised.
      </p>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- tiny helpers ---------- */
function track(event, params = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}
function classNames(...arr) { return arr.filter(Boolean).join(" "); }

/** Lightweight ad slot placeholder. Replace inner div with your ad tags later. */
function AdSlot({ id, height = 96, label = "Ad (responsive)" }) {
  return (
    <div
      id={id}
      className="w-full rounded-xl border border-slate-300 bg-indigo-50/40 text-slate-600 flex items-center justify-center"
      style={{ minHeight: height }}
    >
      {label}
    </div>
  );
}

/** Rotating GovCon tip — hydration-safe */
function TipCard() {
  const tips = [
    "If the due date is unclear, confirm time zone and late-submission policy with the CO.",
    "Search the PDF for “shall” and “mandatory” to build a quick compliance checklist.",
    "Ask for a budget range or NTE ceiling to guide teaming and pricing strategy.",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(Math.floor(Math.random() * tips.length)); }, []);
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-amber-50/50 p-3 text-sm text-slate-800">
      <span className="font-semibold">GovCon Tip:</span> {tips[idx]}
    </div>
  );
}

/** Waitlist email form */
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | ok | err
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const val = email.trim().toLowerCase();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setState("err"); setMsg("Please enter a valid email."); return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState("err");
        setMsg(data.error || "Something went wrong. Please try again.");
        return;
      }
      setState("ok");
      setMsg("You're on the list! We'll email you when Premium features open.");
      setEmail("");
      track("waitlist_joined");
    } catch (err) {
      setState("err"); setMsg("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-2 flex gap-2 items-center">
      <input
        type="email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        placeholder="you@company.com"
        className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={state==="loading"}
        className="h-9 px-3 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {state==="loading" ? "Adding..." : "Notify me"}
      </button>
      {msg && (
        <div className={classNames(
          "text-xs ml-2",
          state==="ok" ? "text-green-700" : "text-red-600"
        )}>{msg}</div>
      )}
    </form>
  );
}

/* ---------- main page ---------- */
export default function Home() {
  const inputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  /* ---------- pdf.js (UMD from CDN to avoid SSR/chunk issues) ---------- */
  async function ensurePdfJs() {
    if (typeof window !== "undefined" && window.pdfjsLib) return window.pdfjsLib;
    const VERSION = "3.11.174";
    await loadScript(`https://cdn.jsdelivr.net/npm/pdfjs-dist@${VERSION}/build/pdf.min.js`);
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) throw new Error("pdfjsLib failed to load");
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${VERSION}/build/pdf.worker.min.js`;
    return pdfjsLib;
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }
  async function extractTextFromPDF(file) {
    const pdfjsLib = await ensurePdfJs();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return text;
  }
  async function extractTextFromDOCX(file) {
    const mammoth = await import("mammoth");
    const buf = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    return value || "";
  }

  /* ---------- upload handler ---------- */
  async function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setErrMsg("");
    setResult(null);
    setParsed(false);
    setFileName(f.name);
    setLoading(true);
    setCopied(false);

    try {
      const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
      const isDocx =
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.name.toLowerCase().endsWith(".docx");
      if (!isPdf && !isDocx) { setErrMsg("Please upload a PDF or DOCX."); setLoading(false); return; }
      if (f.size > 20 * 1024 * 1024) { setErrMsg("File too large (>20MB). Try a smaller file."); setLoading(false); return; }

      track("rfp_file_selected", { file_ext: f.name.split(".").pop()?.toLowerCase() });

      // 1) Extract text in the browser
      const text = isPdf ? await extractTextFromPDF(f) : await extractTextFromDOCX(f);
      setParsed(true);
      track("rfp_parsed", { length: text.length });

      // 2) Ask server for AI summary
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename: f.name }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI summarize failed: ${errText}`);
      }
      const data = await res.json();
      setResult({
        title: data.title || "Untitled",
        summary: data.summary || "Not found",
        go_no_go: data.go_no_go || null,
        go_no_go_reason: data.go_no_go_reason || "",
        key_fields: data.key_fields || {},
        co_questions: Array.isArray(data.co_questions) ? data.co_questions : [],
        co_email_draft: data.co_email_draft || "",
        timeline: Array.isArray(data.timeline) ? data.timeline : [],
        timeline_explain: data.timeline_explain || "",
        risks: Array.isArray(data.risks) ? data.risks : [],
        beginner_tips: Array.isArray(data.beginner_tips) ? data.beginner_tips : [],
        search_terms: Array.isArray(data.search_terms) ? data.search_terms : [],
        note: data.note || null,
      });
      if (data.note === "ai_fallback") track("ai_fallback_used");
      else track("ai_summary_ready", { sum_chars: (data.summary || "").length });
    } catch (err) {
      console.error(err);
      setErrMsg(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  function linkifySubmission(address) {
    if (!address || address === "Not found") return "Not found";
    const a = String(address).trim();
    if (a.includes("@")) return <a className="text-blue-700 underline" href={`mailto:${a}`}>{a}</a>;
    if (/^https?:\/\//i.test(a)) return <a className="text-blue-700 underline" href={a} target="_blank" rel="noreferrer">{a}</a>;
    if (/sam\.gov/i.test(a)) return <a className="text-blue-700 underline" href={`https://${a.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{a}</a>;
    return a;
  }
  async function copyEmailDraft() {
    try {
      await navigator.clipboard.writeText(result?.co_email_draft || "");
      setCopied(true); setTimeout(() => setCopied(false), 1500); track("co_draft_copied");
    } catch {}
  }

  /* ===================== UI ===================== */
  return (
    <main className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      {/* Brand header */}
      <header className="bg-white/70 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span className="text-sm font-semibold tracking-tight">Regulus</span>
            <span className="text-[11px] text-slate-500 ml-1">MVP</span>
          </div>
          <div className="text-[11px] text-slate-500">RFP Quick Reader</div>
        </div>
      </header>

      {/* Top banner ad */}
      <div className="px-4 pt-4">
        <div className="max-w-5xl mx-auto">
          <AdSlot id="ad-top" height={80} label="Top banner ad (728×90 / responsive)" />
        </div>
      </div>

      {/* Hero */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Regulus — From RFP Drop to Go/No-Go — Fast.
          </h1>
          <p className="text-slate-600 mt-2">
            Upload a PDF or DOCX. Get the essence, the gaps, and your next 3 moves.
          </p>
          <p className="text-xs text-slate-500 mt-1">Free MVP. No sign-up. Ad-supported.</p>

          {/* Upload card */}
          <div className="mt-6 bg-white shadow-sm border border-slate-200 rounded-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              {/* File surface */}
              <div
                className="flex-1 w-full h-12 rounded-xl border border-slate-300 bg-slate-50 pl-4 pr-2
                           flex items-center justify-between cursor-pointer"
                onClick={() => inputRef.current?.click()}
                title="Click to choose a file"
                role="button"
                aria-label="Choose an RFP file to summarize"
              >
                <span className="text-slate-500 truncate">
                  {fileName || "Choose an RFP (PDF or DOCX)…"}
                </span>
                <span className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg">
                  Browse
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                />
              </div>

              {/* Help button */}
              <button
                type="button"
                className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
                onClick={() =>
                  alert("Tip: Start with a smaller RFP to test. We’ll generate a summary, 3 CO questions, and a starter timeline.")
                }
              >
                How it works
              </button>
            </div>

            {/* Skeleton / error */}
            {loading && (
              <div className="mt-4">
                <div className="animate-pulse h-[90px] bg-slate-100 rounded-xl" />
                <p className="text-blue-600 text-sm mt-2">Processing…</p>
              </div>
            )}
            {errMsg && !loading && (
              <div className="mt-3 text-red-600 text-sm whitespace-pre-wrap">{errMsg}</div>
            )}

            {/* Inline ad under input */}
            <div className="mt-4">
              <AdSlot id="ad-inline" height={96} label="Inline ad (responsive)" />
            </div>

            {/* Value add tip */}
            <TipCard />
          </div>
        </div>
      </section>

      {/* Result directly below upload */}
      <section className="pb-14">
        <div className="max-w-3xl mx-auto px-4">
          {result && !loading && (
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5">
              {/* Status row */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {fileName && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 truncate">
                    {fileName}
                  </span>
                )}
                {parsed && (
                  <span className="rounded-full bg-green-100 text-green-700 text-xs px-2.5 py-1">
                    ✓ Parsed
                  </span>
                )}
                {result?.note === "ai_fallback" && (
                  <span className="rounded-full bg-amber-100 text-amber-800 text-xs px-2.5 py-1">
                    AI quota reached — local summary shown
                  </span>
                )}
                {result?.go_no_go && (
                  <span
                    className={classNames(
                      "rounded-full text-xs px-2.5 py-1",
                      result.go_no_go === "Go" && "bg-green-100 text-green-800",
                      result.go_no_go === "Maybe" && "bg-yellow-100 text-yellow-800",
                      result.go_no_go === "No-Go" && "bg-red-100 text-red-800"
                    )}
                  >
                    {result.go_no_go}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900">{result.title}</h2>

              {/* Key Fields */}
              <div className="mt-3">
                <div className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">
                  Key Fields
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px] leading-6 text-slate-800">
                  <Field label="Buyer" value={result.key_fields?.buyer} />
                  <Field label="Place of Performance" value={result.key_fields?.place_of_performance} />
                  <Field label="NAICS" value={result.key_fields?.naics} />
                  <Field label="Set-Aside" value={result.key_fields?.set_aside} />
                  <Field label="Contract Type" value={result.key_fields?.contract_type} />
                  <Field label="Due Date" value={result.key_fields?.due_date} />
                  <Field label="RFI Due" value={result.key_fields?.rfi_due} />
                  <Field label="Submission Method" value={result.key_fields?.submission_method} />
                  <Field label="Submission Address" value={linkifySubmission(result.key_fields?.submission_address)} />
                  <Field label="CO Name" value={result.key_fields?.contact_name} />
                  <Field label="CO Email" value={result.key_fields?.contact_email} />
                  <Field label="CO Phone" value={result.key_fields?.contact_phone} />
                </div>
              </div>

              {/* Go/No-Go Reason */}
              {result.go_no_go_reason && (
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold">Why:</span> {result.go_no_go_reason}
                </p>
              )}

              {/* Summary */}
              <div className="mt-4">
                <div className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1">
                  At-a-Glance Summary
                </div>
                <p className="text-[15px] leading-6 text-slate-800 whitespace-pre-wrap">
                  {result.summary}
                </p>
              </div>

              {/* CO Questions + Draft */}
              {result.co_questions?.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <div className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">
                    Suggested CO Questions
                  </div>
                  <ul className="list-disc pl-5 text-[15px] leading-6 text-slate-800">
                    {result.co_questions.map((q, i) => (<li key={i}>{q}</li>))}
                  </ul>
                  {result.co_email_draft && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                          CO Email Draft (editable)
                        </div>
                        <button
                          onClick={copyEmailDraft}
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                        >
                          {copied ? "Copied ✓" : "Copy"}
                        </button>
                      </div>
                      <pre className="mt-1 whitespace-pre-wrap text-[13px] leading-5 p-3 bg-slate-50 rounded border border-slate-200">
                        {result.co_email_draft}
                      </pre>
                      <p className="text-xs text-slate-500 mt-1">
                        Tip: Paste into your email client, add specifics (project ID, dates), and send via the listed channel.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              {result.timeline?.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <div className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">
                    High-Level Timeline
                  </div>
                  <ul className="list-disc pl-5 text-[15px] leading-6 text-slate-800">
                    {result.timeline.map((t, i) => (<li key={i}>{t}</li>))}
                  </ul>
                  {result.timeline_explain && (
                    <p className="text-xs text-slate-500 mt-2">{result.timeline_explain}</p>
                  )}
                </div>
              )}

              {/* Risks */}
              {result.risks?.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <div className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">
                    Key Risks
                  </div>
                  <ul className="list-disc pl-5 text-[15px] leading-6 text-slate-800">
                    {result.risks.map((r, i) => (<li key={i}>{r}</li>))}
                  </ul>
                </div>
              )}

              {/* Beginner Tips & Search Terms */}
              {(result.beginner_tips?.length > 0 || result.search_terms?.length > 0) && (
                <div className="pt-4 mt-4 border-t border-slate-200">
                  {result.beginner_tips?.length > 0 && (
                    <>
                      <div className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">
                        Beginner Tips
                      </div>
                      <ul className="list-disc pl-5 text-[15px] leading-6 text-slate-800 mb-3">
                        {result.beginner_tips.map((t, i) => (<li key={i}>{t}</li>))}
                      </ul>
                    </>
                  )}
                  {result.search_terms?.length > 0 && (
                    <>
                      <div className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-2">
                        Useful Ctrl-F Terms
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.search_terms.map((s, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Next steps / waitlist (real form) */}
              <div className="pt-4 mt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">
                  <strong>What’s next?</strong> Addenda alerts, compliance matrix, vendor finder, and pricing
                  signals are coming. Join the Regulus waitlist:
                </p>
                <WaitlistForm />
                <p className="text-[11px] text-slate-400 mt-2">
                  This tool is informational only and not legal advice—always read the RFP and amendments.
                </p>
              </div>

              {/* Bottom ad slot under output */}
              <div className="mt-6">
                <AdSlot id="ad-bottom" height={112} label="Bottom banner ad (responsive)" />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ---------- small field display component ---------- */
function Field({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-slate-800">{value || "Not found"}</span>
    </div>
  );
}

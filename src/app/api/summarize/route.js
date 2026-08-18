import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

let _client = null;
function getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

/* -------- Local fallback so UX never blocks -------- */
function localSummarize(snippet, filename = "unknown") {
  const s = (snippet || "").replace(/\s+/g, " ").trim();
  const title =
    (s.match(/^(?:solicitation|rfp|rfi|presolicitation|bid|itb|rfq)[:\s-]*([^.;]{5,120})/i)?.[1] ||
      filename.replace(/\.(pdf|docx)$/i, "").replace(/[_-]+/g, " ")) || "Untitled";

  const due =
    s.match(/\b(?:proposal|response|eoI|expressions? of interest|offers?)\s+(?:are\s+)?due(?:\s+date)?[:\s-]*([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})/i)?.[1] ||
    s.match(/\b(?:proposal|response|eoi|offer)s?\s+(?:are\s+)?due(?:\s+date)?[:\s-]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i)?.[1] ||
    "Not found";

  const email = s.match(/[\w.+-]+@[\w.-]+\.\w{2,}/)?.[0] || "Not found";
  const buyer =
    s.match(/\b(?:agency|department|city|county|state|authority|gsa)[:\s-]*([A-Z][A-Za-z &.-]{3,80})/i)?.[1] ||
    "Not found";
  const place =
    s.match(/\bplace of performance[:\s-]*([A-Z][A-Za-z ,.-]{3,120})/i)?.[1] ||
    s.match(/\b(?:location|city|state)[:\s-]*([A-Z][A-Za-z ,.-]{3,120})/i)?.[1] ||
    "Not found";

  const summary =
    `This notice appears to be issued by ${buyer}. Due date noted: ${due}. ` +
    `Common submission channel: ${email !== "Not found" ? "email" : "Not found"} (${email}). ` +
    `Review scope, eligibility, and mandatory forms before proceeding. Use the questions below to confirm key ambiguities with the Contracting Officer.`;

  return {
    title,
    summary,
    go_no_go: "Maybe",
    go_no_go_reason: "Key details (dates, method, eligibility) need confirmation.",
    key_fields: {
      buyer,
      place_of_performance: place,
      naics: "Not found",
      set_aside: "Not found",
      contract_type: "Not found",
      due_date: due,
      rfi_due: "Not found",
      submission_method: email !== "Not found" ? "email" : "Not found",
      submission_address: email,
      contact_name: "Not found",
      contact_email: email,
      contact_phone: "Not found",
    },
    co_questions: [
      "Please confirm the exact submission method (email/SAM/portal) and any subject line or file-naming requirements.",
      `Please confirm the precise due date/time (${due}) and time zone, plus the cutoff for questions/RFIs.`,
      "Is there an estimated magnitude/budget range or NTE ceiling to guide teaming and pricing?",
    ],
    co_email_draft:
      `Subject: Clarification on Submission & Dates — ${title}\n\nDear Contracting Officer,\n\n` +
      `I’m reviewing ${title} and want to confirm: (1) the exact submission method and any formatting/file-naming rules; ` +
      `(2) the due date/time and time zone, and the final cutoff for questions; (3) whether a budget range or NTE ceiling exists.\n\n` +
      `Thank you for your guidance.\nBest regards,\n[Your Name]\n[Company]\n[Phone]\n[Email]`,
    timeline: [
      "Day 0 — Skim scope & eligibility; send CO clarification email.",
      "Day 1–2 — Build compliance checklist; identify mandatory forms; outline narrative.",
      "T-10 to T-7 — Teaming/partners; collect vendor quotes; draft pricing assumptions.",
      "T-3 — Finalize forms & attachments; internal QA against checklist.",
      "T-0 — Submit per instructions; verify receipt.",
    ],
    timeline_explain:
      "Use this as a starter plan. Calendar the RFI cutoff, begin attachments early, and verify the submission portal or email workflow.",
    risks: [
      "Missing a hidden mandatory form or affidavit can invalidate your submission.",
      "Unclear due time/time zone or portal rules can cause late or rejected submissions.",
    ],
    beginner_tips: [
      "Press Ctrl+F and search for: 'shall', 'mandatory', 'evaluation', 'late', 'NAICS'.",
      "Create a simple compliance matrix (Requirement → Where it appears → How you comply).",
      "If budget isn’t posted, ask the CO for a range or NTE; it informs teaming and pricing.",
    ],
    search_terms: ["shall", "mandatory", "evaluation factors", "late", "NAICS"],
    note: "ai_fallback",
  };
}

export async function POST(req) {
  // Read body once
  let text = "", filename = "unknown";
  try {
    const body = await req.json();
    text = body?.text || "";
    filename = body?.filename || "unknown";
  } catch {}
  const snippet = (text || "").slice(0, 60000); // ≈15k tokens

  // If no key, return fast fallback
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(localSummarize(snippet, filename));
  }

  try {
    const system = `
You are a government contracting analyst. Extract ONLY what is present in the text provided. 
Do NOT invent values. If something is not explicitly stated, return "Not found".
Return STRICT JSON with this exact schema:

{
  "title": "string",
  "summary": "string (<=160 words, plain text)",
  "go_no_go": "Go" | "Maybe" | "No-Go",
  "go_no_go_reason": "string (<=60 words)",
  "key_fields": {
    "buyer": "string",
    "place_of_performance": "string",
    "naics": "string",
    "set_aside": "string",
    "contract_type": "string",
    "due_date": "string",
    "rfi_due": "string",
    "submission_method": "string",         // email | portal | sam.gov | hand delivery | Not found
    "submission_address": "string",        // email or URL if present else "Not found"
    "contact_name": "string",
    "contact_email": "string",
    "contact_phone": "string"
  },
  "co_questions": ["string","string","string"],   // 3 concrete, clause-anchorable questions
  "co_email_draft": "string (80-150 words, editable, plain text)",
  "timeline": ["string","string","string","string","string"], // 4-6 bullets
  "timeline_explain": "string (<=60 words)",
  "risks": ["string","string","string","string"], // 2-4 allowed
  "beginner_tips": ["string","string","string"],  // practical tips for newcomers
  "search_terms": ["string","string","string","string","string"] // 5 Ctrl-F targets
}
No extra keys. Plain text only (no markdown).`.trim();

    const user = `FILENAME: ${filename}
RFP TEXT (truncated):
"""${snippet}"""`;

    let textOut = "";
    try {
      const resp = await getClient().responses.create({
        model: "gpt-4o-mini",
        temperature: 0,
        max_output_tokens: 1200,
        response_format: { type: "json_object" },
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      textOut = (resp.output_text || "").trim();
    } catch (e) {
      const msg = String(e?.message || e);
      if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        return NextResponse.json(localSummarize(snippet, filename));
      }
      // One-shot fallback to chat.completions for SDK quirks
      const cc = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      textOut = (cc.choices?.[0]?.message?.content || "").trim();
    }

    if (textOut.startsWith("```")) {
      textOut = textOut.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    }

    let json;
    try {
      json = JSON.parse(textOut);
    } catch {
      return NextResponse.json(localSummarize(snippet, filename));
    }

    // Safety coerce
    const safe = {
      title: typeof json.title === "string" ? json.title : "Untitled",
      summary: typeof json.summary === "string" ? json.summary : "Not found",
      go_no_go: ["Go","Maybe","No-Go"].includes(json.go_no_go) ? json.go_no_go : "Maybe",
      go_no_go_reason: typeof json.go_no_go_reason === "string" ? json.go_no_go_reason : "Not found",
      key_fields: {
        buyer: json?.key_fields?.buyer ?? "Not found",
        place_of_performance: json?.key_fields?.place_of_performance ?? "Not found",
        naics: json?.key_fields?.naics ?? "Not found",
        set_aside: json?.key_fields?.set_aside ?? "Not found",
        contract_type: json?.key_fields?.contract_type ?? "Not found",
        due_date: json?.key_fields?.due_date ?? "Not found",
        rfi_due: json?.key_fields?.rfi_due ?? "Not found",
        submission_method: json?.key_fields?.submission_method ?? "Not found",
        submission_address: json?.key_fields?.submission_address ?? "Not found",
        contact_name: json?.key_fields?.contact_name ?? "Not found",
        contact_email: json?.key_fields?.contact_email ?? "Not found",
        contact_phone: json?.key_fields?.contact_phone ?? "Not found",
      },
      co_questions: Array.isArray(json.co_questions) ? json.co_questions.slice(0, 3) : [],
      co_email_draft: typeof json.co_email_draft === "string" ? json.co_email_draft : "",
      timeline: Array.isArray(json.timeline) ? json.timeline.slice(0, 6) : [],
      timeline_explain: typeof json.timeline_explain === "string" ? json.timeline_explain : "",
      risks: Array.isArray(json.risks) ? json.risks.slice(0, 4) : [],
      beginner_tips: Array.isArray(json.beginner_tips) ? json.beginner_tips.slice(0, 3) : [],
      search_terms: Array.isArray(json.search_terms) ? json.search_terms.slice(0, 5) : [],
    };

    return NextResponse.json(safe);
  } catch (err) {
    console.error("summarize fatal:", err);
    return NextResponse.json(localSummarize((text || "").slice(0, 60000), filename));
  }
}

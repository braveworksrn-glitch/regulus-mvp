/**
 * Fundability-read drafter for the operator console.
 *
 *   draftFundabilityRead(client, opportunities) -> { source: "ai" | "template", text }
 *
 * If ANTHROPIC_API_KEY is set, drafts an honest ~2-page fundability read with
 * the Anthropic API (compliance-railed system prompt). If the key is missing
 * or the call fails for any reason, returns a deterministic template read
 * built from the same data, clearly marked as a template draft.
 *
 * Runs ONLY when the operator explicitly asks for a draft — nothing here is
 * scheduled or self-triggering. Server-only module.
 */

import Anthropic from "@anthropic-ai/sdk";

/* ------------------------------------------------------------------ */
/* Compliance-railed system prompt (see docs/BRAND.md voice rules)     */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are drafting an internal "fundability read" for Regulus, a grant research and drafting service. The reader is the Regulus operator; the draft may later be shared with the client organization after operator review.

Write an honest read of roughly two pages (about 700-1000 words) assessing how ready this organization is to pursue the grant opportunities in its pipeline.

Non-negotiable compliance rails:
- Never state or imply odds, approval, or outcomes. Do not predict whether any application will be funded. Do not rank opportunities by likelihood of award. No promised results of any kind.
- Program facts cite the program, never "you". Write "this program funds home-repair work in rural counties", never "you are eligible" or "you would receive".
- Hedge every inference. Use "appears", "may", "suggests", "based on the profile". Distinguish what is known from what is assumed.
- Cite your sources within the draft: when a statement comes from the client profile, say so ("per the client profile"). When a statement comes from an opportunity record, name the opportunity. Do not invent facts that are not in the data you were given — if a detail is missing, say it is missing.
- Opportunities marked as placeholders or unverified must be described as unverified; do not treat their details as established facts.
- State weaknesses plainly. If the organization lacks a determination letter, grant history, or organizational documents, name that directly and explain the practical consequence in hedged terms.
- The organization always reviews and submits its own applications. Regulus prepares research and drafts only.
- Nothing you write is legal, tax, or accounting advice; include one plain sentence saying so near the end.
- Plain English. Short sentences. No exclamation points, no urgency, no jargon without a one-line explanation.

Structure the read as:
1. Snapshot — who the organization is and where it stands (from the profile).
2. What strengthens a case — mission clarity, local fit, distinctive model (hedged, profile-cited).
3. Constraints to resolve — entity/documentation gaps and what each blocks, most important first.
4. Pipeline read — a short, hedged paragraph per opportunity: what the program funds (cite the record), open eligibility questions, and the concrete next step.
5. Bottom line — what to do next, in order. No outcome predictions.`;

/* ------------------------------------------------------------------ */
/* Deterministic template path                                         */
/* ------------------------------------------------------------------ */

const TEMPLATE_MARKER =
  "(template draft — connect ANTHROPIC_API_KEY for AI-drafted reads)";

function line(label, value) {
  return value ? `- ${label}: ${value}` : `- ${label}: not recorded`;
}

function letterLine(v) {
  if (v === "yes") return "Determination letter required per the record — a constraint until one exists.";
  if (v === "no") return "Record indicates a determination letter is not required — verify before relying on this.";
  return "Whether a determination letter is required is unclear — resolve during vetting.";
}

export function buildTemplateRead(client = {}, opportunities = []) {
  const opps = Array.isArray(opportunities) ? opportunities : [];
  const noteTexts = (client.notes || [])
    .map((n) => (typeof n === "string" ? n : n && n.text))
    .filter(Boolean);

  const parts = [];
  parts.push(`FUNDABILITY READ — ${client.name || "Unnamed organization"}`);
  parts.push(TEMPLATE_MARKER);
  parts.push("");
  parts.push("1. SNAPSHOT (from the client profile)");
  parts.push(line("Organization", client.name));
  parts.push(line("Location", client.location));
  parts.push(line("Entity type", client.entityType));
  parts.push(line("Mission", client.missionSummary));
  parts.push(line("Client status", client.status));
  parts.push("");
  parts.push("2. WHAT MAY STRENGTHEN A CASE (hedged; per the client profile)");
  parts.push(
    "- The mission is concrete and scoped (specific repair work for a specific population), which tends to make program-fit arguments easier to draft."
  );
  parts.push(
    "- The profile describes a distinctive delivery model (reclaimed materials, volunteer and sweat-equity labor, trades mentorship). Where a program's published criteria value cost-effectiveness or community involvement, these details may help a narrative — whether they do depends on each program's criteria."
  );
  parts.push("");
  parts.push("3. CONSTRAINTS TO RESOLVE (stated plainly; from profile notes)");
  if (noteTexts.length) {
    for (const t of noteTexts) parts.push(`- ${t}`);
  } else {
    parts.push("- No constraint notes recorded on the profile.");
  }
  parts.push("");
  parts.push(`4. PIPELINE READ (${opps.length} opportunit${opps.length === 1 ? "y" : "ies"} on record)`);
  if (!opps.length) {
    parts.push("- No opportunities recorded yet.");
  }
  for (const o of opps) {
    parts.push("");
    parts.push(`• ${o.name || "Unnamed opportunity"} — status: ${o.status || "unknown"}`);
    parts.push(line("Funder", [o.funder, o.funderType ? `(${o.funderType})` : ""].filter(Boolean).join(" ")));
    parts.push(line("Award band (per the record)", o.awardBand));
    parts.push(line("Cadence / deadline (per the record)", o.cadenceOrDeadline));
    parts.push(line("Eligibility notes", o.eligibilityNotes));
    parts.push(`- ${letterLine(o.requires501c3Letter)}`);
    parts.push(line("Recorded next action", o.nextAction));
  }
  parts.push("");
  parts.push("5. BOTTOM LINE");
  parts.push(
    "- Work the constraints list first; documentation gaps block more than any single application does."
  );
  parts.push(
    "- Replace placeholder opportunity details with verified research before advancing any of them."
  );
  parts.push(
    "- No statement above is a prediction of any award or outcome. Program facts describe the programs, not this organization's standing with them."
  );
  parts.push(
    "- Regulus prepares research and drafts; the organization reviews and submits its own applications. Nothing here is legal, tax, or accounting advice."
  );
  return parts.join("\n");
}

/* ------------------------------------------------------------------ */
/* Public interface                                                    */
/* ------------------------------------------------------------------ */

export async function draftFundabilityRead(client, opportunities) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { source: "template", text: buildTemplateRead(client, opportunities) };
  }

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            "Draft the fundability read from this data. Client profile:\n\n" +
            JSON.stringify(client, null, 2) +
            "\n\nPipeline opportunities:\n\n" +
            JSON.stringify(opportunities, null, 2),
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n")
      .trim();

    if (!text) throw new Error("Empty AI response");
    return { source: "ai", text };
  } catch (err) {
    console.error("readDrafter: AI draft failed, using template:", err?.message || err);
    return { source: "template", text: buildTemplateRead(client, opportunities) };
  }
}

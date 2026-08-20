/**
 * Dashboard read path — server-only.
 *
 * Reads go through the shared pipeline store (src/lib/pipelineStore.js,
 * owned by the lib stream — read-only import here), which persists to
 * .data/pipeline.json with atomic writes. All dashboard MUTATIONS go
 * through the contract API routes (/api/pipeline/advance, /decision,
 * /park) so every state change stays an explicit operator click.
 *
 * Never import from client components.
 */

import { getAll } from "@/lib/pipelineStore";

export async function readPipeline() {
  const state = await getAll();
  return {
    clients: Array.isArray(state.clients) ? state.clients : [],
    opportunities: Array.isArray(state.opportunities) ? state.opportunities : [],
  };
}

export async function getClientWithOpportunities(clientId) {
  const { clients, opportunities } = await readPipeline();
  const client = clients.find((c) => c && c.id === clientId) || null;
  if (!client) return { client: null, opportunities: [] };
  return {
    client,
    opportunities: opportunities.filter((o) => o && o.clientId === clientId),
  };
}

export async function getOpportunityWithClient(opportunityId) {
  const { clients, opportunities } = await readPipeline();
  const opportunity = opportunities.find((o) => o && o.id === opportunityId) || null;
  if (!opportunity) return { opportunity: null, client: null };
  return {
    opportunity,
    client: clients.find((c) => c && c.id === opportunity.clientId) || null,
  };
}

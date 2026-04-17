import { postSanctionsScreen } from "@/lib/api";
import { withTimeout, AGENT_TIMEOUT_MS, type RiskInput, type RiskOutput } from "./types";

export const runRiskAgent = async (input: RiskInput): Promise<RiskOutput> => {
  if (input.entities.length === 0) {
    return { results: [] };
  }

  const screenPayloads = input.entities.map(r => ({
    name: r.original,
    country: r.country?.trim() || "—",
    amount: 0,
    doc: input.documentContext,
    cyrillic: (r.variants ?? []).join(" "),
    sdn_match: "",
    fuzzy_score: 0,
    pattern_risk: "LOW",
    sdn_score: 0,
    risk: "LOW",
  }));

  const screenOutput = await withTimeout(postSanctionsScreen(screenPayloads), AGENT_TIMEOUT_MS, "Risk Agent API");

  const results = input.entities.map((ent, i) => {
    const res = screenOutput.results[i] || {};
    return {
      entity: ent.original,
      variants: ent.variants,
      risk: res.risk || "LOW",
      action: res.action || "—",
      reasoning: res.reasoning || "—",
      country: ent.country,
    };
  });

  return { results };
};

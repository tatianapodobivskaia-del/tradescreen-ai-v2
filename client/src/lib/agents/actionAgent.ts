import { runAIDeepAnalysis } from "@/lib/api";
import { withTimeout, AGENT_TIMEOUT_MS, type ActionInput, type ActionOutput } from "./types";
import { DEEP_ANALYSIS_RISK_THRESHOLDS } from "./types";

export const runActionAgent = async (input: ActionInput): Promise<ActionOutput | null> => {
  const flagged = input.flaggedEntities.filter(r => 
    DEEP_ANALYSIS_RISK_THRESHOLDS.includes(r.risk.toUpperCase() as any)
  );

  if (flagged.length === 0) {
    return null; // Signals 'not_triggered'
  }

  const deepPayloads = flagged.map(r => ({
    name: r.entity,
    country: r.country?.trim() || "—",
    amount: 0,
    doc: input.documentContext,
    cyrillic: (r.variants ?? []).join(" "),
    sdn_match: "",
    fuzzy_score: 0,
    pattern_risk: "LOW",
    sdn_score: 0,
    risk: r.risk,
  }));

  const deepRes = await withTimeout(runAIDeepAnalysis(deepPayloads), AGENT_TIMEOUT_MS, "Action Agent API");
  
  // Notice: The backend /screen API payload format mapped from deepRes
  const assessments = flagged.map((ent, i) => {
    // Depending on what deepRes returns, we map it back. 
    // Assuming deepRes.results maps index by index to our payloads.
    // If deepRes is structured differently, adjust mapping.
    const res = deepRes.results?.[i] || {};
    return {
      entity: ent.entity,
      variants: ent.variants,
      risk: ent.risk,
      country: ent.country,
      aiAction: res.action || ent.action || "—",
      aiReasoning: res.reasoning || ent.reasoning || "—",
    };
  });

  return { assessments };
};

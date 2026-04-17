import { runVisionScan } from "@/lib/api";
import { withTimeout, AGENT_TIMEOUT_MS, type VisionOutput } from "./types";

export const runVisionAgent = async (base64: string): Promise<VisionOutput> => {
  const baseData = await withTimeout(runVisionScan(base64), AGENT_TIMEOUT_MS, "Vision Agent API");
  
  if (!baseData.risk_results) baseData.risk_results = [];
  
  const entities = baseData.risk_results.map(r => ({
    name: r.entity,
    country: r.country?.trim() || "—",
    cyrillic_variants: r.cyrillic_variants || [],
  }));
  
  return {
    entities,
    documentContext: baseData.document?.document_type?.trim() || "OCR Doc",
    originalRiskResults: baseData.risk_results,
    entitiesFoundCount: baseData.entities_found || entities.length,
  };
};

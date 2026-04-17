export const DEEP_ANALYSIS_RISK_THRESHOLDS = ["HIGH", "MEDIUM"] as const;
export const AGENT_TIMEOUT_MS = 120000;

export interface VisionOutput {
  entities: Array<{ name: string; country: string; cyrillic_variants?: string[] }>;
  documentContext: string;
  originalRiskResults: any[];
  entitiesFoundCount: number;
}

export interface TransliterationInput {
  entities: VisionOutput["entities"];
}

export interface TransliterationOutput {
  entities: Array<{
    original: string;
    variants: string[];
    country: string;
  }>;
}

export interface RiskInput {
  entities: TransliterationOutput["entities"];
  documentContext: string;
}

export interface RiskOutput {
  results: Array<{
    entity: string;
    variants: string[];
    risk: string;
    action: string;
    reasoning: string;
    country: string;
  }>;
}

export interface ActionInput {
  flaggedEntities: RiskOutput["results"];
  documentContext: string;
}

export interface ActionOutput {
  assessments: Array<{
    entity: string;
    aiAction: string;
    aiReasoning: string;
    risk: string;
    country: string;
    variants: string[];
  }>;
}

export type AgentState = "pending" | "running" | "success" | "failed" | "skipped" | "not_triggered";

export const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout exceeded for ${label}`)), ms)
    ),
  ]);

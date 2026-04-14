import { z } from "zod";

const AZURE_API = "https://trade-compliance-screening-hscyeycsckc3avay.eastus-01.azurewebsites.net/api";

const SCREEN_REQUEST_TIMEOUT_MS = 90_000;
const VISION_REQUEST_TIMEOUT_MS = 120_000;

/** Payload for POST /api/screen (sanctions list screening). */
export type ScreenVendorPayload = {
  name: string;
  country: string;
  amount: number;
  doc: string;
  cyrillic: string;
  sdn_match: string;
  fuzzy_score: number;
  pattern_risk: string;
  sdn_score: number;
  risk: string;
};

/** One vendor row returned from live sanctions screening. */
export const ScreenVendorApiResultSchema = z.object({
  vendor: z.string(),
  assessment: z.string().default("—"),
  risk: z.string().default("LOW"),
  action: z.string().default("—"),
  reasoning: z.string().default(""),
  lists_checked: z.string().optional(),
});
export type ScreenVendorApiResult = z.infer<typeof ScreenVendorApiResultSchema>;

export const PostSanctionsScreenResponseSchema = z.object({
  status: z.string().default("success"),
  results: z.array(ScreenVendorApiResultSchema).default([]),
  lists_screened: z.array(z.string()).optional(),
  total_entities: z.number().optional(),
});

/** Live Azure sanctions screening against full list (~45K entities). */
export async function postSanctionsScreen(vendors: ScreenVendorPayload[]): Promise<{
  status: string;
  results: ScreenVendorApiResult[];
  lists_screened?: string[];
  total_entities?: number;
}> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SCREEN_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${AZURE_API}/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendors }),
      mode: "cors",
      credentials: "omit",
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }

    const json = await response.json();
    return PostSanctionsScreenResponseSchema.parse(json);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const DeepAnalysisResultSchema = z.object({
  vendor_name: z.string(),
  risk_level: z.string().default("LOW"),
  true_positive: z.boolean().default(false),
  confidence: z.number().default(0),
  reasoning: z.string().default(""),
  action: z.string().default("—"),
  compliance_note: z.string().default(""),
  evasion_indicators: z.array(z.string()).default([]),
});

export const RunAIDeepAnalysisResponseSchema = z.object({
  results: z.array(DeepAnalysisResultSchema).default([]),
  usage: z.object({ input_tokens: z.number(), output_tokens: z.number() }).optional(),
});

// AI Deep Analysis — sends flagged vendors for GPT-4o analysis
export async function runAIDeepAnalysis(
  vendors: Array<{
    name: string;
    country: string;
    amount: number;
    doc: string;
    cyrillic: string;
    sdn_match: string;
    fuzzy_score: number;
    risk: string;
  }>
): Promise<{
  results: Array<{
    vendor_name: string;
    risk_level: string;
    true_positive: boolean;
    confidence: number;
    reasoning: string;
    action: string;
    compliance_note: string;
    evasion_indicators: string[];
  }>;
  usage?: { input_tokens: number; output_tokens: number };
}> {
  const response = await fetch(`${AZURE_API}/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vendors }),
    mode: "cors",
    credentials: "omit",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const json = await response.json();
  return RunAIDeepAnalysisResponseSchema.parse(json);
}

export const VisionRiskResultSchema = z.object({
  entity: z.string().default("—"),
  risk: z.string().default("LOW"),
  action: z.string().default("—"),
  reasoning: z.string().default(""),
  cyrillic_variants: z.array(z.string()).default([]),
  country: z.string().optional(),
});

export const VisionScanResultSchema = z.object({
  document_risk: z.string().default("UNKNOWN"),
  entities_found: z.number().default(0),
  summary: z.object({
    blocked: z.number().default(0),
    flagged: z.number().default(0),
    cleared: z.number().default(0),
  }).default({ blocked: 0, flagged: 0, cleared: 0 }),
  document_action: z.string().default("—"),
  document: z.object({ document_type: z.string() }).optional(),
  risk_results: z.array(VisionRiskResultSchema).default([]),
  ts: z.string().default(() => new Date().toISOString()),
});

export type VisionScanResult = z.infer<typeof VisionScanResultSchema>;

export const ApiHealthSnapshotSchema = z.object({
  ts: z.union([z.string(), z.number()]).optional(),
  total_entities: z.number().optional(),
  lists: z.record(z.number()).optional(),
  status: z.string().optional(),
  engine: z.string().optional(),
  ai_model: z.string().optional(),
  vision_status: z.string().optional(),
  ai: z.unknown().optional(),
  vision: z.string().optional(),
});
export type ApiHealthSnapshot = z.infer<typeof ApiHealthSnapshotSchema>;

/**
 * Format health `ts` (ISO UTC string or epoch seconds/ms) in the user's local timezone
 * with a short zone name (e.g. EDT, PST). Example: "Apr 13, 2026 at 6:45 PM EDT".
 */
export function formatSanctionsListHealthTimestamp(ts: string | number | undefined | null): string {
  if (ts === undefined || ts === null) return "";
  const d =
    typeof ts === "number" ? new Date(ts > 1e12 ? ts : ts * 1000) : new Date(String(ts).trim());
  if (Number.isNaN(d.getTime())) return "";
  const raw = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    hour12: true,
  }).format(d);
  return raw.replace(/^([A-Za-z]{3} \d{1,2}, \d{4}),\s+/, "$1 at ");
}

function pickHealthString(r: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function normalizeVisionScanPayload(raw: unknown): VisionScanResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid response from document scan API.");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.error === "string" && r.error.trim()) {
    throw new Error(r.error.trim());
  }
  if (r.status === "error") {
    const detail =
      typeof r.detail === "string"
        ? r.detail
        : r.detail && typeof r.detail === "object"
          ? JSON.stringify(r.detail)
          : "";
    throw new Error(
      [typeof r.error === "string" ? r.error : "Vision request failed", detail].filter(Boolean).join(" — ")
    );
  }

  // Use Zod to completely validate and assign defaults
  // We can pass  directly, but we map simple nested fallbacks first (like country alias)
  const normalizedRaw = { ...r };
  
  if (Array.isArray(normalizedRaw.risk_results)) {
    normalizedRaw.risk_results = normalizedRaw.risk_results.map((row: any) => {
      if (row && typeof row === 'object') {
        const countryAlias = row.country ?? row.jurisdiction ?? row.entity_country;
        if (countryAlias) row.country = countryAlias;
      }
      return row;
    });
  }

  return VisionScanResultSchema.parse(normalizedRaw);
}

/** Vision Document Scanner — POST base64 still image (JPEG/PNG after client prep). */
export async function runVisionScan(imageBase64: string): Promise<VisionScanResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), VISION_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${AZURE_API}/vision-screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
      mode: "cors",
      credentials: "omit",
      signal: controller.signal,
    });

    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`API error ${response.status}: ${text.slice(0, 400)}`);
    }

    if (!response.ok) {
      const errObj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
      const msg =
        errObj && typeof errObj.error === "string"
          ? errObj.error
          : `HTTP ${response.status}`;
      const detail = errObj && typeof errObj.detail === "string" ? errObj.detail : "";
      throw new Error(detail ? `${msg} — ${detail.slice(0, 500)}` : msg);
    }

    return normalizeVisionScanPayload(parsed);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Scan timed out — try a smaller file or a photo of one page.");
    }
    throw e;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// Check if API is reachable (for offline mode detection)
export async function checkAPIHealth(): Promise<ApiHealthSnapshot | null> {
  try {
    const response = await fetch(`${AZURE_API}/health`, { method: "GET", mode: "cors", credentials: "omit" });
    if (!response.ok) return null;
    const parsed = (await response.json()) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const r = parsed as Record<string, unknown>;
    const total_entities =
      typeof r.total_entities === "number"
        ? r.total_entities
        : typeof r.totalEntities === "number"
          ? r.totalEntities
          : undefined;
    const ts = typeof r.ts === "string" || typeof r.ts === "number" ? r.ts : undefined;
    const listsRaw = r.lists;
    const lists: Record<string, number> | undefined =
      listsRaw && typeof listsRaw === "object"
        ? Object.fromEntries(
            Object.entries(listsRaw as Record<string, unknown>).flatMap(([k, v]) =>
              typeof v === "number" ? [[k, v] as const] : []
            )
          )
        : undefined;
    const status = pickHealthString(r, ["status", "api_status"]);
    const engine = pickHealthString(r, ["engine", "engine_name", "service_name"]);
    let ai_model = pickHealthString(r, ["ai_model", "model", "openai_model", "gpt_model"]);
    const aiRaw = r.ai;
    const ai =
      aiRaw !== undefined && aiRaw !== null && aiRaw !== false && aiRaw !== ""
        ? aiRaw
        : pickHealthString(r, ["ai_status", "ai_enabled"]) === "enabled" ||
            r.ai_enabled === true ||
            r.aiEnabled === true
          ? true
          : undefined;
    if (ai && typeof ai === "object" && !Array.isArray(ai)) {
      const o = ai as Record<string, unknown>;
      const nested = typeof o.model === "string" ? o.model.trim() : typeof o.name === "string" ? o.name.trim() : "";
      if (nested) ai_model = ai_model ?? nested;
    } else if (typeof ai === "string" && ai.trim()) {
      ai_model = ai_model ?? ai.trim();
    }

    const visionFromField =
      typeof r.vision === "string"
        ? r.vision.trim()
        : r.vision && typeof r.vision === "object"
          ? pickHealthString(r.vision as Record<string, unknown>, ["status", "state", "mode"])
          : undefined;
    const vision_screen = pickHealthString(r, ["vision_screen"]);
    const vision_status = pickHealthString(r, ["vision_status", "vision", "vision_screen"]);
    const vision = (visionFromField ?? vision_screen ?? vision_status)?.trim();

    return ApiHealthSnapshotSchema.parse({ ts, total_entities, lists, status, engine, ai_model, vision_status, ai, vision });
  } catch {
    return null;
  }
}

/** GET /api/health — list snapshot timestamp for Landing “last updated” line. */
export async function fetchSanctionsApiHealth(): Promise<{ ts?: string | number } | null> {
  try {
    const response = await fetch(`${AZURE_API}/health`, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    });
    if (!response.ok) return null;
    return (await response.json()) as { ts?: string | number };
  } catch {
    return null;
  }
}

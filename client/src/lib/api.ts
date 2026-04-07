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
export type ScreenVendorApiResult = {
  vendor: string;
  assessment: string;
  risk: string;
  action: string;
  reasoning: string;
  lists_checked?: string;
};

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

    return response.json() as Promise<{
      status: string;
      results: ScreenVendorApiResult[];
      lists_screened?: string[];
      total_entities?: number;
    }>;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

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

  return response.json();
}

export type VisionScanResult = {
  document_risk: string;
  entities_found: number;
  summary: { blocked: number; flagged: number; cleared: number };
  document_action: string;
  document?: { document_type: string };
  risk_results: Array<{
    entity: string;
    risk: string;
    action: string;
    reasoning: string;
    cyrillic_variants: string[];
  }>;
  ts: string;
};

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

  const doc = r.document;
  let document: { document_type: string } | undefined;
  if (doc && typeof doc === "object") {
    const d = doc as Record<string, unknown>;
    const dt = d.document_type;
    if (typeof dt === "string" && dt.trim()) {
      document = { document_type: dt.replace(/_/g, " ") };
    }
  }

  const rawRows = Array.isArray(r.risk_results) ? r.risk_results : [];
  const risk_results = rawRows.map((row) => {
    const x = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
    const variants = Array.isArray(x.cyrillic_variants)
      ? x.cyrillic_variants.map((v) => String(v))
      : [];
    return {
      entity: String(x.entity ?? "—"),
      risk: String(x.risk ?? "LOW"),
      action: String(x.action ?? "—"),
      reasoning: String(x.reasoning ?? ""),
      cyrillic_variants: variants,
    };
  });

  const sum =
    r.summary && typeof r.summary === "object" && r.summary !== null
      ? (r.summary as Record<string, unknown>)
      : {};

  return {
    document_risk: String(r.document_risk ?? "UNKNOWN"),
    entities_found: Number(r.entities_found ?? 0),
    summary: {
      blocked: Number(sum.blocked ?? 0),
      flagged: Number(sum.flagged ?? 0),
      cleared: Number(sum.cleared ?? 0),
    },
    document_action: String(r.document_action ?? "—"),
    document,
    risk_results,
    ts: String(r.ts ?? new Date().toISOString()),
  };
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
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AZURE_API}/health`, { method: "GET", mode: "cors" });
    return response.ok;
  } catch {
    return false;
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

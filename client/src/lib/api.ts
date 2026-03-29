const AZURE_API = "https://trade-compliance-screening-hscyeycsckc3avay.eastus-01.azurewebsites.net/api";

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

// Vision Document Scanner — sends base64 image for AI document analysis
export async function runVisionScan(imageBase64: string): Promise<{
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
}> {
  const response = await fetch(`${AZURE_API}/vision-screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 }),
    mode: "cors",
    credentials: "omit",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}

// Check if API is reachable (for offline mode detection)
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(AZURE_API, { method: "HEAD", mode: "cors" });
    return response.ok;
  } catch {
    return false;
  }
}

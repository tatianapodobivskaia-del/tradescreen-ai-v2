/*
 * SCREENING PAGE — Upload document + manual entry
 */
import { useState, useCallback } from "react";
import { Search, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { runAIDeepAnalysis } from "@/lib/api";
import { watchlistEntities } from "@/lib/mockData";

/** Full alphabetical country list (50+) */
const COUNTRY_OPTIONS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Venezuela",
  "Vietnam",
] as const;

const DOCUMENT_TYPES = [
  "Invoice",
  "Bill of Lading",
  "Certificate of Origin",
  "Contract",
  "Purchase Order",
  "Letter of Credit",
] as const;

const LIST_LABELS = ["OFAC SDN", "EU Consolidated", "UN Security Council", "UK OFSI"] as const;

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const cur = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = cur;
    }
  }
  return row[n];
}

function fuzzyPercent(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (!s1 || !s2) return 0;
  const dist = levenshtein(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return Math.round((1 - dist / maxLen) * 100);
}

function bestScoreAgainstEntity(
  needles: string[],
  entityName: string,
  aliases: string[]
): { score: number; matchedAs: string } {
  let best = 0;
  let matchedAs = entityName;
  const candidates = [entityName, ...aliases];
  for (const needle of needles) {
    if (!needle.trim()) continue;
    for (const c of candidates) {
      const sc = fuzzyPercent(needle, c);
      if (sc > best) {
        best = sc;
        matchedAs = c;
      }
    }
  }
  return { score: best, matchedAs };
}

function riskFromScore(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 85) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

type ListHitRow = {
  list: string;
  matchedEntity: string;
  similarity: number;
  tier: "HIGH" | "MEDIUM" | "LOW";
};

type ScreeningResultsState = {
  listHits: ListHitRow[];
  compositeScore: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
  bestMatch: string;
};

function runClientScreening(input: {
  vendorName: string;
  country: string;
  amount: string;
  docType: string;
  cyrillicName: string;
}): ScreeningResultsState {
  const needles = [input.vendorName, input.cyrillicName].filter((s) => s.trim().length > 0);

  const listHits: ListHitRow[] = LIST_LABELS.map((list) => {
    const inList = watchlistEntities.filter((e) => e.list === list);
    let best = 0;
    let bestEntity = "";
    let bestName = "";
    for (const e of inList) {
      const { score, matchedAs } = bestScoreAgainstEntity(needles, e.name, e.aliases);
      if (score > best) {
        best = score;
        bestEntity = e.name;
        bestName = matchedAs;
      }
    }
    const tier = riskFromScore(best);
    return {
      list,
      matchedEntity: best >= 45 ? bestEntity : "—",
      similarity: best,
      tier: best >= 45 ? tier : "LOW",
    };
  });

  const compositeScore = Math.max(...listHits.map((h) => h.similarity), 0);
  const bestHit = listHits.reduce((a, b) => (b.similarity > a.similarity ? b : a), listHits[0]);
  const bestMatch = bestHit.similarity >= 45 ? bestHit.matchedEntity : "No strong list match";

  return {
    listHits,
    compositeScore,
    risk: riskFromScore(compositeScore),
    bestMatch,
  };
}

function parseAmountUsd(raw: string): number {
  const n = parseFloat(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function tierStyle(tier: string): string {
  const u = tier.toUpperCase();
  if (u === "HIGH") return "text-red-700 bg-red-50 border-red-200";
  if (u === "MEDIUM") return "text-amber-900 bg-amber-50 border-cyan-200";
  return "text-emerald-800 bg-emerald-50 border-emerald-200";
}

/** Normalized AI Deep Analysis row (handles API alias field names) */
type NormalizedAIResult = {
  vendor_name: string;
  risk_level: string;
  true_positive: boolean;
  confidence: number;
  reasoning: string;
  action: string;
  compliance_note: string;
  evasion_indicators: string[];
};

type RawAIResult = Record<string, unknown>;

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function parseTruePositive(raw: RawAIResult): boolean {
  if (typeof raw.true_positive === "boolean") return raw.true_positive;
  const a = str(raw.assessment).toUpperCase();
  if (a === "TRUE_POSITIVE") return true;
  if (a === "FALSE_POSITIVE") return false;
  return false;
}

function confidenceFromRaw(raw: RawAIResult, truePositive: boolean): number {
  const c = raw.confidence;
  if (c === null || c === undefined || c === "") {
    return truePositive ? 95 : 15;
  }
  const n = typeof c === "number" ? c : parseFloat(String(c));
  if (!Number.isFinite(n)) return truePositive ? 95 : 15;
  if (n >= 0 && n <= 1) return Math.round(n * 100);
  return Math.round(Math.min(100, Math.max(0, n)));
}

function normalizeAIResult(raw: RawAIResult): NormalizedAIResult {
  const truePositive = parseTruePositive(raw);
  const vendorName = str(raw.vendor_name) || str(raw.vendor) || "—";
  const riskLevel = str(raw.risk_level) || str(raw.risk) || "LOW";
  const action = str(raw.action) || "—";
  const reasoning = str(raw.reasoning) || str(raw.analysis) || str(raw.ai_reasoning) || "—";
  const complianceNote = str(raw.compliance_note) || str(raw.compliance_note_text) || "";

  let evasion: string[] = [];
  const ev = raw.evasion_indicators;
  if (Array.isArray(ev)) {
    evasion = ev.map((x) => str(x)).filter(Boolean);
  }

  return {
    vendor_name: vendorName,
    risk_level: riskLevel,
    true_positive: truePositive,
    confidence: confidenceFromRaw(raw, truePositive),
    reasoning,
    action,
    compliance_note: complianceNote,
    evasion_indicators: evasion,
  };
}

function riskBadgeClasses(level: string): string {
  const u = level.toUpperCase();
  if (u === "HIGH") return "border-red-300 bg-red-100 text-red-900";
  if (u === "MEDIUM") return "border-cyan-300 bg-amber-100 text-amber-950";
  return "border-emerald-300 bg-emerald-100 text-emerald-900";
}

function actionBadgeClasses(action: string): string {
  const u = action.toUpperCase();
  if (u === "BLOCK") return "border-red-300 bg-red-100 text-red-900";
  if (u === "FLAG" || u === "REVIEW") return "border-cyan-300 bg-amber-100 text-amber-950";
  if (u === "APPROVE") return "border-emerald-300 bg-emerald-100 text-emerald-900";
  return "border-slate-300 bg-slate-100 text-slate-800";
}

export default function Screening() {
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [vendorName, setVendorName] = useState("");
  const [country, setCountry] = useState("");
  const [amount, setAmount] = useState("");
  const [docType, setDocType] = useState("");
  const [cyrillicName, setCyrillicName] = useState("");

  const [screeningResults, setScreeningResults] = useState<ScreeningResultsState | null>(null);
  const [lastScreenInput, setLastScreenInput] = useState<{
    vendorName: string;
    country: string;
    amount: string;
    docType: string;
    cyrillicName: string;
  } | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<NormalizedAIResult[] | null>(null);

  const handleScreen = () => {
    if (!vendorName.trim()) return;
    const input = {
      vendorName: vendorName.trim(),
      country: country.trim(),
      amount: amount.trim(),
      docType: docType.trim(),
      cyrillicName: cyrillicName.trim(),
    };
    setLastScreenInput(input);
    setScreeningResults(runClientScreening(input));
    setAiResults(null);
    setAiError(null);
  };

  const handleRunAI = useCallback(async () => {
    if (!screeningResults || !lastScreenInput) return;

    setAiLoading(true);
    setAiError(null);
    setAiResults(null);

    const vendors = [
      {
        name: lastScreenInput.vendorName,
        country: lastScreenInput.country || "—",
        amount: parseAmountUsd(lastScreenInput.amount),
        doc: lastScreenInput.docType || "—",
        cyrillic: lastScreenInput.cyrillicName || "—",
        sdn_match: screeningResults.bestMatch,
        fuzzy_score: screeningResults.compositeScore,
        risk: screeningResults.risk,
      },
    ];

    try {
      const data = await runAIDeepAnalysis(vendors);
      const rows = data.results ?? [];
      setAiResults(rows.map((row) => normalizeAIResult(row as unknown as RawAIResult)));
    } catch {
      setAiError(
        "AI analysis unavailable — check your internet connection. Screening results above are still valid."
      );
    } finally {
      setAiLoading(false);
    }
  }, [screeningResults, lastScreenInput]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Sanctions Screening</h1>
        <p className="mt-2 text-sm text-slate-500 font-body">
          Screen vendors against 45,296 sanctioned entities across 4 international lists
        </p>
      </div>

      <div className="premium-card rounded-xl p-8">
        <div className="mb-8 flex w-fit gap-1 rounded-lg bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload className="h-4 w-4" /> Upload Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Search className="h-4 w-4" /> Manual Entry
          </button>
        </div>

        {activeTab === "upload" ? (
          <div>
            <div className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-12 text-center transition-colors hover:border-cyan-500/40">
              <input id="screening-upload-input" type="file" className="sr-only" accept=".csv,.pdf" />
              <Upload className="mx-auto mb-4 h-12 w-12 text-slate-300 transition-colors group-hover:text-cyan-500" />
              <p className="text-sm font-semibold text-slate-600 font-body">Drop File Here</p>
              <label
                htmlFor="screening-upload-input"
                className="mt-1 inline-block cursor-pointer text-sm font-semibold text-cyan-600 underline-offset-2 transition-colors hover:text-cyan-700 hover:underline font-body"
              >
                Click to Browse
              </label>
              <p className="mt-2 text-xs text-slate-400 font-body">Supports CSV and PDF</p>
            </div>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleScreen();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="vendor-name"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                id="vendor-name"
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Legal name of vendor or entity"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                autoComplete="organization"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="country"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="">Select country...</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Transaction Amount (USD)
              </label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 125000"
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="doc-type"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Document Type
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="">Select type...</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="cyrillic-name"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Cyrillic Name <span className="font-normal normal-case text-slate-400">(if applicable)</span>
              </label>
              <input
                id="cyrillic-name"
                type="text"
                value={cyrillicName}
                onChange={(e) => setCyrillicName(e.target.value)}
                placeholder="e.g. Рособоронэкспорт"
                className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-premium btn-premium-primary shrink-0 text-sm">
                Screen This Vendor
              </button>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                (Research Demo)
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Results + AI Deep Analysis */}
      <div className="premium-card rounded-xl p-8">
        <h2 className="text-base font-bold font-display text-slate-900">Screening results</h2>

        {!screeningResults ? (
          <p className="mt-2 text-sm text-slate-500 font-body">
            Match scores, list hits, and recommended actions will appear here after you screen a vendor (Manual Entry).
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Input summary</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{lastScreenInput?.vendorName}</p>
              {lastScreenInput?.cyrillicName ? (
                <p className="text-xs text-slate-600 font-body">{lastScreenInput.cyrillicName}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-700">
                <span>
                  <span className="font-semibold text-slate-500">Country:</span> {lastScreenInput?.country || "—"}
                </span>
                <span>
                  <span className="font-semibold text-slate-500">Amount:</span>{" "}
                  {lastScreenInput?.amount || "—"}
                </span>
                <span>
                  <span className="font-semibold text-slate-500">Document:</span>{" "}
                  {lastScreenInput?.docType || "—"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Composite match score</span>
                <span className="font-data text-lg font-extrabold text-amber-700">
                  {screeningResults.compositeScore}%
                </span>
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-bold font-display uppercase",
                    screeningResults.risk === "HIGH" && "border-red-200 bg-red-100 text-red-800",
                    screeningResults.risk === "MEDIUM" && "border-cyan-200 bg-amber-100 text-amber-950",
                    screeningResults.risk === "LOW" && "border-emerald-200 bg-emerald-100 text-emerald-900"
                  )}
                >
                  {screeningResults.risk} risk
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 font-body">
                Best SDN / list match:{" "}
                <span className="font-data font-semibold text-slate-900">{screeningResults.bestMatch}</span>
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600">
                    <th className="px-3 py-2 font-display">List</th>
                    <th className="px-3 py-2 font-display">Matched entity</th>
                    <th className="px-3 py-2 text-right font-display tabular-nums">Fuzzy %</th>
                    <th className="px-3 py-2 font-display">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {screeningResults.listHits.map((row) => (
                    <tr key={row.list} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/80">
                      <td className="px-3 py-2 font-medium text-slate-800">{row.list}</td>
                      <td className="px-3 py-2 font-data text-[11px] text-slate-900">{row.matchedEntity}</td>
                      <td className="px-3 py-2 text-right font-data tabular-nums text-slate-800">
                        {row.similarity}%
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[10px] font-bold",
                            tierStyle(row.tier)
                          )}
                        >
                          {row.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-sm font-bold font-display text-slate-900">AI Deep Analysis</h3>
          <p className="mt-1 text-xs text-slate-500 font-body">
            Contextual risk explanation and narrative reasoning — powered by Azure (GPT-4o). Screening above stays on your
            device; only this step calls the API.
          </p>

          <button
            type="button"
            disabled={!screeningResults || aiLoading || activeTab !== "manual"}
            onClick={() => void handleRunAI()}
            className={cn(
              "btn-premium mt-4 text-sm",
              !screeningResults || activeTab !== "manual"
                ? "btn-premium-outline cursor-not-allowed opacity-50"
                : "bg-cyan-500 font-bold text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-400 disabled:opacity-100"
            )}
          >
            Run AI Deep Analysis
          </button>

          {aiLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700 font-body">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-600" strokeWidth={2} />
              <span>Analyzing with AI...</span>
            </div>
          )}

          {aiError && (
            <p className="mt-4 rounded-lg border border-cyan-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-body">
              {aiError}
            </p>
          )}

          {aiResults && aiResults.length > 0 && (
            <div className="mt-6 space-y-4">
              {aiResults.map((r, idx) => {
                const riskU = (r.risk_level || "LOW").toUpperCase();
                const riskClass =
                  riskU === "HIGH"
                    ? "border-red-200 bg-red-50"
                    : riskU === "MEDIUM"
                      ? "border-cyan-200 bg-amber-50"
                      : "border-emerald-200 bg-emerald-50";
                const actionU = (r.action || "—").toUpperCase();
                return (
                  <div
                    key={`${r.vendor_name}-${idx}`}
                    className={cn("rounded-xl border-2 p-5 shadow-sm", riskClass)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vendor</p>
                        <p className="mt-1 text-xl font-extrabold leading-tight text-slate-900 font-display">
                          {r.vendor_name}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-3 py-1.5 text-[11px] font-bold font-display uppercase tracking-wide",
                          r.true_positive
                            ? "border-red-400 bg-red-100 text-red-900"
                            : "border-emerald-400 bg-emerald-100 text-emerald-900"
                        )}
                      >
                        {r.true_positive ? "TRUE POSITIVE" : "FALSE POSITIVE"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-slate-600 font-body">
                        Confidence:{" "}
                        <span className="font-data text-base font-extrabold text-slate-900">{r.confidence}%</span>
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs font-bold font-display uppercase",
                          riskBadgeClasses(riskU)
                        )}
                      >
                        {riskU} risk
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs font-bold font-display uppercase",
                          actionBadgeClasses(actionU)
                        )}
                      >
                        {actionU}
                      </span>
                    </div>
                    <div className="mt-5 rounded-lg border border-slate-200/90 bg-white/90 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI reasoning</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-800 font-body">{r.reasoning}</p>
                    </div>
                    {r.compliance_note ? (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-white/80 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Compliance note</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-800 font-body">{r.compliance_note}</p>
                      </div>
                    ) : null}
                    {r.evasion_indicators.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Evasion indicators
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700 font-body">
                          {r.evasion_indicators.map((ev) => (
                            <li key={ev}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

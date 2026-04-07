/*
 * SCREENING PAGE — Upload document + manual entry
 */
import {
  useState,
  useCallback,
  useRef,
  useMemo,
  Fragment,
  useEffect,
  useLayoutEffect,
  type FormEvent,
} from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Info,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Languages,
  ArrowRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { useSearch } from "wouter";
import { cn } from "@/lib/utils";
import { addScreeningResult, getLastScreeningSnapshot, setLastScreeningSnapshot } from "@/lib/sessionStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  runAIDeepAnalysis,
  postSanctionsScreen,
  type ScreenVendorPayload,
  type ScreenVendorApiResult,
} from "../lib/api";
import {
  isCyrillic,
  generateAllVariants,
  expandScreeningNeedles,
  generateLatinVariants,
} from "../lib/transliteration";

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

type TransliterationScreeningInfo = {
  variants: string[];
  standards: {
    iso9: string;
    icao: string;
    bgn: string;
    informal: string;
  } | null;
  direction: "cyrillic" | "latin";
};

if (typeof generateLatinVariants !== "function") {
  throw new Error("transliteration: generateLatinVariants unavailable");
}

function buildScreeningNeedlesAndTransliteration(
  vendorName: string,
  cyrillicName: string
): {
  needles: string[];
  transliterationInfo: TransliterationScreeningInfo | null;
} {
  const base = [vendorName, cyrillicName].map((s) => s.trim()).filter((s) => s.length > 0);
  const needleSet = new Set<string>();
  for (const n of base) {
    for (const needle of expandScreeningNeedles(n)) {
      needleSet.add(needle);
    }
  }

  const primaryForDisplay = vendorName.trim() || cyrillicName.trim();
  const transliterationInfo: TransliterationScreeningInfo | null =
    primaryForDisplay.length > 0 ? generateAllVariants(primaryForDisplay) : null;

  return {
    needles: Array.from(needleSet),
    transliterationInfo,
  };
}

function ScreeningVariantsCollapsible({ info }: { info: TransliterationScreeningInfo }) {
  return (
    <details className="mt-1 max-w-[min(100%,28rem)] font-mono text-xs text-slate-500">
      <summary className="cursor-pointer select-none text-slate-600 hover:text-slate-800">
        Screening variants ({info.direction}) · {info.variants.length}
      </summary>
      <ul className="mt-1.5 max-h-44 overflow-y-auto border border-slate-100 bg-slate-50/60 py-1.5 pl-5 pr-2">
        {info.variants.map((v, idx) => (
          <li key={`${idx}-${v}`} className="list-disc py-0.5">
            {v}
          </li>
        ))}
      </ul>
      {info.standards ? (
        <p className="mt-2 border-t border-slate-100 pt-2 text-[10px] leading-snug text-slate-500">
          ISO 9: {info.standards.iso9} · ICAO: {info.standards.icao} · BGN: {info.standards.bgn} · Informal:{" "}
          {info.standards.informal}
        </p>
      ) : null}
    </details>
  );
}

type ListHitRow = {
  list: string;
  matchedEntity: string;
  /** Unused for API-driven rows (replaced by status column). */
  similarity: number;
  tier: "HIGH" | "MEDIUM" | "LOW";
  statusLabel: string;
  statusTier: "HIGH" | "MEDIUM" | "LOW";
};

/** Client-side score breakdown (component scores 0–100 before weighting; total = weighted composite) */
type ScoreBreakdown = {
  name: number;
  country: number;
  amount: number;
  doc: number;
  translit: number;
  total: number;
};

/** High-risk jurisdictions (OFAC-style) — audit trail context */
function highRiskJurisdiction(country: string): boolean {
  const c = country.trim().toLowerCase();
  if (!c) return false;
  if (c.includes("russia") || c.includes("russian federation")) return true;
  if (c === "iran" || c.includes("iran,") || c.endsWith(" iran") || c.startsWith("iran ")) return true;
  if (c.includes("north korea") || c.includes("korea, north") || c === "dprk") return true;
  if (c.includes("syria") && !c.includes("australia")) return true;
  if (c.includes("cuba") && c.length < 20) return true;
  return false;
}

/** Batch / upload results: USD from parsed string (always currency-formatted for table) */
function formatUsdCurrencyAmount(raw: string): string {
  const n = parseAmountUsd(raw);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

type ScreeningResultsState = {
  listHits: ListHitRow[];
  compositeScore: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
  bestMatch: string;
  scoreBreakdown: ScoreBreakdown;
  transliterationInfo: null | TransliterationScreeningInfo;
  /** Populated when Azure /api/screen returns a match assessment */
  remote?: {
    assessment: string;
    action: string;
    reasoning: string;
    listsChecked: string;
  };
};

type ScreenPipelineInput = {
  vendorName: string;
  country: string;
  amount: string;
  docType: string;
  cyrillicName: string;
};

/** Unique name strings sent to POST /api/screen (original + transliteration / needle expansion). */
function collectNamesForApiScreening(input: ScreenPipelineInput): {
  names: string[];
  transliterationInfo: TransliterationScreeningInfo | null;
} {
  const { needles, transliterationInfo } = buildScreeningNeedlesAndTransliteration(
    input.vendorName,
    input.cyrillicName
  );
  const set = new Set<string>();
  for (const n of needles) {
    const t = n.trim();
    if (t) set.add(t);
  }
  if (transliterationInfo) {
    for (const v of transliterationInfo.variants) {
      const t = v.trim();
      if (t) set.add(t);
    }
  }
  return { names: Array.from(set), transliterationInfo };
}

function buildMinimalVendorPayload(name: string, input: ScreenPipelineInput): ScreenVendorPayload {
  return {
    name,
    country: input.country.trim() || "—",
    amount: parseAmountUsd(input.amount),
    doc: input.docType.trim() || "—",
    cyrillic: input.cyrillicName.trim() || "",
    sdn_match: "",
    fuzzy_score: 0,
    pattern_risk: "LOW",
    sdn_score: 0,
    risk: "LOW",
  };
}

function parseAmountUsd(raw: string): number {
  const n = parseFloat(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseApiRiskFromScreen(risk: string): "HIGH" | "MEDIUM" | "LOW" {
  const u = risk.trim().toUpperCase();
  if (u === "HIGH" || u === "BLOCK") return "HIGH";
  if (u === "MEDIUM" || u === "REVIEW" || u === "FLAG") return "MEDIUM";
  return "LOW";
}

function normalizeApiAssessmentLabel(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "_");
}

const JURISDICTION_TIER_95 = [
  "russia",
  "iran",
  "north korea",
  "syria",
  "cuba",
  "belarus",
  "myanmar",
  "venezuela",
] as const;

const JURISDICTION_TIER_60 = [
  "china",
  "pakistan",
  "iraq",
  "libya",
  "somalia",
  "yemen",
  "sudan",
  "afghanistan",
] as const;

function jurisdictionRiskComponent(country: string): number {
  const c = country.trim().toLowerCase();
  if (!c || c === "unknown") return 30;
  for (const key of JURISDICTION_TIER_95) {
    if (c === key || c.includes(key)) return 95;
  }
  for (const key of JURISDICTION_TIER_60) {
    if (c === key || c.includes(key)) return 60;
  }
  return 10;
}

function txnValueComponent(amountStr: string): number {
  const n = parseAmountUsd(amountStr);
  if (n <= 0) return 0;
  if (n >= 500_000) return 95;
  if (n >= 100_000) return 80;
  if (n >= 50_000) return 60;
  if (n >= 10_000) return 40;
  return 20;
}

function docTypeComponent(docType: string): number {
  const d = docType.trim();
  if (!d) return 0;
  const lower = d.toLowerCase();
  if (lower === "bill of lading" || lower === "certificate of origin") return 80;
  if (lower === "invoice" || lower === "contract" || lower === "purchase order") return 60;
  if (lower === "document") return 40;
  return 40;
}

function translitBonusComponent(info: TransliterationScreeningInfo | null): number {
  if (!info) return 0;
  if (info.direction === "cyrillic") return 90;
  if (info.variants.length > 3) return 60;
  return 0;
}

function resolveNameSimilarScore(
  apiAssessment: string | null | undefined,
  apiRiskParsed: "HIGH" | "MEDIUM" | "LOW" | undefined,
  nameSimFallback: number | null | undefined
): number {
  if (nameSimFallback != null && Number.isFinite(nameSimFallback)) {
    return Math.min(100, Math.max(0, Math.round(nameSimFallback)));
  }
  const a = normalizeApiAssessmentLabel(apiAssessment ?? "");
  if (a === "FALSE_POSITIVE") return 15;
  if (a === "TRUE_POSITIVE") {
    const r = apiRiskParsed ?? "LOW";
    if (r === "HIGH") return 95;
    if (r === "MEDIUM") return 70;
    return 55;
  }
  if (apiRiskParsed === "HIGH") return 85;
  if (apiRiskParsed === "MEDIUM") return 50;
  if (apiRiskParsed === "LOW") return 20;
  return 15;
}

type CalculateCompositeScoreParams = {
  apiRisk?: string | null;
  apiAssessment?: string | null;
  /** When set (e.g. API offline), used as NameSim 0–100 instead of API-derived name score. */
  nameSimFallback?: number | null;
  country: string;
  amount: string;
  docType: string;
  transliterationInfo: TransliterationScreeningInfo | null;
};

function calculateCompositeScore(params: CalculateCompositeScoreParams): {
  total: number;
  breakdown: { name: number; country: number; amount: number; doc: number; translit: number };
} {
  const parsedRisk =
    params.apiRisk != null && String(params.apiRisk).trim() !== ""
      ? parseApiRiskFromScreen(params.apiRisk)
      : undefined;
  const name = resolveNameSimilarScore(params.apiAssessment, parsedRisk, params.nameSimFallback);
  const country = jurisdictionRiskComponent(params.country);
  const amount = txnValueComponent(params.amount);
  const doc = docTypeComponent(params.docType);
  const translit = translitBonusComponent(params.transliterationInfo);

  const total =
    0.75 * name + 0.1 * country + 0.05 * amount + 0.05 * doc + 0.05 * translit;

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown: {
      name: Math.round(Math.min(100, Math.max(0, name))),
      country: Math.round(Math.min(100, Math.max(0, country))),
      amount: Math.round(Math.min(100, Math.max(0, amount))),
      doc: Math.round(Math.min(100, Math.max(0, doc))),
      translit: Math.round(Math.min(100, Math.max(0, translit))),
    },
  };
}

function riskRank(r: "HIGH" | "MEDIUM" | "LOW"): number {
  if (r === "HIGH") return 3;
  if (r === "MEDIUM") return 2;
  return 1;
}

function pickWorstRiskResult(rows: ScreenVendorApiResult[]): ScreenVendorApiResult | undefined {
  if (!rows.length) return undefined;
  let pick = rows[0];
  let bestRank = riskRank(parseApiRiskFromScreen(pick.risk));
  for (let i = 1; i < rows.length; i++) {
    const rr = riskRank(parseApiRiskFromScreen(rows[i].risk));
    if (rr > bestRank) {
      bestRank = rr;
      pick = rows[i];
    }
  }
  return pick;
}

/** Best-effort sanctioned-entity name extracted from API reasoning (TRUE_POSITIVE / HIGH). */
function matchedEntityFromApiReasoning(reasoning: string): string | null {
  const r = reasoning.trim();
  if (!r) return null;
  const quoted = r.match(/["""']([A-Za-z0-9&][^"""']{0,120})["""']/);
  if (quoted?.[1]) return quoted[1].trim();
  const paren = r.match(/\(([^)]{2,100})\)/);
  if (paren?.[1]) {
    const inner = paren[1].trim();
    if (!/^\d+$/.test(inner) && !/^usd|^eur|\$/i.test(inner)) return inner;
  }
  const entityWord = r.match(/\bentity\s+["']?([A-Za-z\u0400-\u04FF0-9][^.,;]{1,80})/i);
  if (entityWord?.[1]) return entityWord[1].trim();
  const against = r.match(/\b(?:against|to|with)\s+["']?([A-Z\u0400][A-Za-z\u0400-\u04FF\s&.-]{1,80})/);
  if (against?.[1]) return against[1].trim().replace(/\s+$/u, "");
  const listHit = r.match(
    /\b(?:OFAC|SDN|EU|UN|OFSI)\b[^.]{0,40}?\b([A-Z][A-Za-z][A-Za-z\s&.-]{2,60}?)(?:\s+was|\s+is|\.|,|$)/i
  );
  if (listHit?.[1]) return listHit[1].trim();
  return null;
}

type ListHitSharedMeta = Omit<ListHitRow, "list">;

function buildListHitSharedMeta(
  input: ScreenPipelineInput,
  apiRow: ScreenVendorApiResult | undefined,
  risk: "HIGH" | "MEDIUM" | "LOW"
): ListHitSharedMeta {
  const assessment = apiRow ? normalizeApiAssessmentLabel(apiRow.assessment) : "";
  const reasoning = apiRow?.reasoning?.trim() ?? "";
  const extracted = matchedEntityFromApiReasoning(reasoning);

  if (assessment === "FALSE_POSITIVE") {
    return {
      matchedEntity: "No match",
      similarity: 0,
      tier: "LOW",
      statusLabel: "Screened — No Match",
      statusTier: "LOW",
    };
  }

  if (assessment === "TRUE_POSITIVE" || risk === "HIGH") {
    return {
      matchedEntity: extracted ?? "—",
      similarity: 0,
      tier: "HIGH",
      statusLabel: "Screened — Match Found",
      statusTier: "HIGH",
    };
  }

  if (risk === "MEDIUM") {
    return {
      matchedEntity: extracted ?? "—",
      similarity: 0,
      tier: "MEDIUM",
      statusLabel: "Screened — Possible Match",
      statusTier: "MEDIUM",
    };
  }

  return {
    matchedEntity: "No match",
    similarity: 0,
    tier: "LOW",
    statusLabel: "Screened — No Match",
    statusTier: "LOW",
  };
}

/** Per-list rows: same meta on all four lists (API does not return per-list breakdown). */
function buildListHitsForApiScreening(
  input: ScreenPipelineInput,
  apiRow: ScreenVendorApiResult | undefined,
  risk: "HIGH" | "MEDIUM" | "LOW"
): ListHitRow[] {
  const meta = buildListHitSharedMeta(input, apiRow, risk);
  return LIST_LABELS.map((list) => ({ list, ...meta }));
}

function buildScreeningResultsFromApi(
  input: ScreenPipelineInput,
  transliterationInfo: TransliterationScreeningInfo | null,
  apiRow: ScreenVendorApiResult | undefined
): ScreeningResultsState {
  const risk = apiRow ? parseApiRiskFromScreen(apiRow.risk) : "LOW";
  const { total, breakdown: compBreakdown } = calculateCompositeScore({
    apiRisk: apiRow?.risk,
    apiAssessment: apiRow?.assessment,
    country: input.country,
    amount: input.amount,
    docType: input.docType,
    transliterationInfo,
  });
  const compositeScore = Math.round(total);
  const scoreBreakdown: ScoreBreakdown = { ...compBreakdown, total: compositeScore };
  const listsChecked = apiRow?.lists_checked ?? "OFAC+EU+UN+UK";
  const bestMatch = apiRow
    ? `${apiRow.assessment.replace(/_/g, " ")} · ${listsChecked}`
    : "—";
  return {
    listHits: buildListHitsForApiScreening(input, apiRow, risk),
    compositeScore,
    risk,
    bestMatch,
    scoreBreakdown,
    transliterationInfo,
    remote: apiRow
      ? {
          assessment: apiRow.assessment,
          action: apiRow.action,
          reasoning: apiRow.reasoning,
          listsChecked,
        }
      : undefined,
  };
}

/** One row from an uploaded file (vendor + optional metadata columns) */
type ParsedUploadRow = {
  vendorName: string;
  country: string;
  amount: string;
  docType: string;
};

function normalizeHeaderKey(s: string): string {
  return s
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function rowsFromDelimitedText(text: string): string[][] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  return lines.map(parseCsvLine);
}

/** Upload file column aliases — used by handleFileUpload after matrix parse */
const UPLOAD_COLUMN_MAPS = {
  name: ["vendor_name", "vendor", "name", "entity", "fio"],
  country: ["country", "origin", "location", "residence"],
  amount: ["amount", "value", "total", "price", "sum"],
  doc: ["document_type", "document", "doc", "type", "doc_type"],
} as const;

function findFirstColumnIndexForKeys(normHeaders: string[], keys: readonly string[]): number {
  const sorted = [...keys].sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    const i = normHeaders.indexOf(key);
    if (i >= 0) return i;
  }
  for (let i = 0; i < normHeaders.length; i++) {
    const h = normHeaders[i];
    for (const key of sorted) {
      if (key.length <= 4) {
        if (h === key) return i;
      } else if (h === key || h.includes(key)) {
        return i;
      }
    }
  }
  return -1;
}

function findDocColumnIndexWithMaps(normHeaders: string[]): number {
  const keys = [...UPLOAD_COLUMN_MAPS.doc].sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const i = normHeaders.indexOf(key);
    if (i >= 0) return i;
  }
  for (let i = 0; i < normHeaders.length; i++) {
    const h = normHeaders[i];
    for (const key of keys) {
      if (key === "type") {
        if (h === "type") return i;
        if (h.includes("document") && h.includes("type")) return i;
        continue;
      }
      if (key.length <= 4) {
        if (h === key) return i;
      } else if (h === key || (h.includes(key) && !h.includes("vendor"))) {
        return i;
      }
    }
  }
  return -1;
}

function inferMissingColumnsFromWidth(width: number): string[] {
  const m: string[] = [];
  if (width < 2) m.push("Country", "Amount", "Document");
  else if (width < 3) m.push("Amount", "Document");
  else if (width < 4) m.push("Document");
  return m;
}

function applyUploadColumnDefaults(row: ParsedUploadRow, missingCols: string[]): ParsedUploadRow {
  const miss = new Set(missingCols);
  return {
    vendorName: row.vendorName,
    country: miss.has("Country") ? "Unknown" : row.country.trim(),
    amount: miss.has("Amount") ? "0" : row.amount.trim(),
    docType: miss.has("Document") ? "Document" : row.docType.trim(),
  };
}

function normalizeUploadMatrixWithColumnMaps(matrix: string[][]): {
  rows: ParsedUploadRow[];
  missingColumns: string[];
} {
  if (matrix.length === 0) return { rows: [], missingColumns: [] };

  const headerRow = matrix[0].map((c) => normalizeHeaderKey(String(c ?? "").replace(/^\uFEFF/, "")));

  let nameIdx = findFirstColumnIndexForKeys(headerRow, UPLOAD_COLUMN_MAPS.name);
  const countryIdx = findFirstColumnIndexForKeys(headerRow, UPLOAD_COLUMN_MAPS.country);
  const amountIdx = findFirstColumnIndexForKeys(headerRow, UPLOAD_COLUMN_MAPS.amount);
  const docIdx = findDocColumnIndexWithMaps(headerRow);

  const anyMapped = [nameIdx, countryIdx, amountIdx, docIdx].some((i) => i >= 0);

  if (!anyMapped) {
    const rows = buildParsedRowsWithoutNamedHeader(matrix);
    return {
      rows,
      missingColumns: inferMissingColumnsFromWidth(matrix[0]?.length ?? 0),
    };
  }

  const missingColumns: string[] = [];
  if (countryIdx < 0) missingColumns.push("Country");
  if (amountIdx < 0) missingColumns.push("Amount");
  if (docIdx < 0) missingColumns.push("Document");
  if (nameIdx < 0) {
    nameIdx = 0;
  }

  const out: ParsedUploadRow[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const vn = String(row[nameIdx] ?? "").trim();
    if (!vn) continue;
    out.push({
      vendorName: vn,
      country: countryIdx >= 0 ? String(row[countryIdx] ?? "").trim() : "",
      amount: amountIdx >= 0 ? String(row[amountIdx] ?? "").trim() : "",
      docType: docIdx >= 0 ? String(row[docIdx] ?? "").trim() : "",
    });
  }

  if (out.length === 0) {
    const rows = buildParsedRowsWithoutNamedHeader(matrix);
    return {
      rows,
      missingColumns:
        missingColumns.length > 0 ? missingColumns : inferMissingColumnsFromWidth(matrix[0]?.length ?? 0),
    };
  }

  return { rows: out, missingColumns };
}

/** Fallback: column 0 = vendor; optional cols 1–3 = country, amount, document */
function buildParsedRowsWithoutNamedHeader(rows: string[][]): ParsedUploadRow[] {
  if (rows.length === 0) return [];
  const r0 = String(rows[0]?.[0] ?? "").toLowerCase();
  const skipFirst =
    r0.includes("name") ||
    r0.includes("vendor") ||
    r0.includes("country") ||
    r0.includes("amount") ||
    r0.includes("document");
  const data = skipFirst ? rows.slice(1) : rows;
  return data
    .map((row) => ({
      vendorName: String(row[0] ?? "").trim(),
      country: String(row[1] ?? "").trim(),
      amount: String(row[2] ?? "").trim(),
      docType: String(row[3] ?? "").trim(),
    }))
    .filter((r) => r.vendorName.length > 0);
}

function parseWordLinesToRows(lines: string[]): string[][] {
  if (lines.length === 0) return [];
  const first = lines[0];
  if (first.includes("\t")) {
    return lines.map((l) => l.split("\t").map((c) => c.trim()));
  }
  if (first.includes(",")) {
    return lines.map((l) => parseCsvLine(l));
  }
  return [];
}

function parseWordPlainText(text: string): { rows: ParsedUploadRow[]; missingColumns: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { rows: [], missingColumns: [] };
  const matrix = parseWordLinesToRows(lines);
  if (matrix.length > 0) {
    return normalizeUploadMatrixWithColumnMaps(matrix);
  }
  return {
    rows: lines
      .filter((l) => l.length > 2 && l.length < 100)
      .map((l) => ({ vendorName: l, country: "", amount: "", docType: "" })),
    missingColumns: ["Country", "Amount", "Document"],
  };
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
  /** Optional detailed breakdown from API */
  score_breakdown: ScoreBreakdown | null;
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

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : null;
}

function parseScoreBreakdownFromRaw(raw: RawAIResult): ScoreBreakdown | null {
  const sb = raw.score_breakdown ?? raw.scoreBreakdown;
  if (sb && typeof sb === "object" && !Array.isArray(sb)) {
    const o = sb as Record<string, unknown>;
    const name = num(o.name) ?? num(o.name_score);
    const country = num(o.country) ?? num(o.country_score);
    const amount = num(o.amount) ?? num(o.amount_score);
    const doc = num(o.doc) ?? num(o.document) ?? num(o.doc_score);
    const total = num(o.total) ?? num(o.composite);
    if (name !== null && total !== null) {
      const translit = num(o.translit) ?? num(o.transliteration) ?? 0;
      return {
        name,
        country: country ?? 0,
        amount: amount ?? 0,
        doc: doc ?? 0,
        translit,
        total,
      };
    }
  }
  return null;
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
    score_breakdown: parseScoreBreakdownFromRaw(raw),
  };
}

function riskBadgeClasses(level: string): string {
  const u = level.toUpperCase();
  if (u === "HIGH") return "border-red-300 bg-red-100 text-red-900";
  if (u === "MEDIUM") return "border-cyan-300 bg-amber-100 text-amber-950";
  return "border-emerald-300 bg-emerald-100 text-emerald-900";
}

type BatchScreenRow = {
  auditId: string;
  auditedAt: string;
  screenInput: {
    vendorName: string;
    country: string;
    amount: string;
    docType: string;
    cyrillicName: string;
  };
  screeningResults: ScreeningResultsState;
};

function generateAuditId(): string {
  const part = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SCR-2026-${part}`;
}

function complianceActionFromRisk(risk: "HIGH" | "MEDIUM" | "LOW"): { label: string; badge: "HIGH" | "MEDIUM" | "LOW" } {
  if (risk === "HIGH") return { label: "BLOCK", badge: "HIGH" };
  if (risk === "MEDIUM") return { label: "REVIEW", badge: "MEDIUM" };
  return { label: "APPROVE", badge: "LOW" };
}

function normalizeActionDisplay(action: string, risk: string): { label: string; badge: "HIGH" | "MEDIUM" | "LOW" } {
  const a = action.toUpperCase();
  const r = risk.toUpperCase() as "HIGH" | "MEDIUM" | "LOW";
  if (a === "BLOCK") return { label: "BLOCK", badge: "HIGH" };
  if (a === "FLAG" || a === "REVIEW") return { label: "REVIEW", badge: "MEDIUM" };
  if (a === "APPROVE") return { label: "APPROVE", badge: "LOW" };
  return complianceActionFromRisk(r === "HIGH" || r === "MEDIUM" || r === "LOW" ? r : "LOW");
}

/** Display label for AI Deep Analysis cards: BLOCK / FLAG / APPROVE */
function aiDeepAnalysisActionDisplay(action: string): string {
  const a = action.toUpperCase();
  if (a === "REVIEW" || a === "FLAG") return "FLAG";
  if (a === "BLOCK") return "BLOCK";
  if (a === "APPROVE") return "APPROVE";
  return a || "—";
}

function aiAssessmentLabel(truePositive: boolean): string {
  return truePositive ? "Confirmed Match" : "No Direct Match";
}

function aiActionSolidBadgeClasses(action: string): string {
  const a = action.toUpperCase();
  if (a === "BLOCK") return "border-transparent bg-red-600 text-white";
  if (a === "FLAG" || a === "REVIEW") return "border-transparent bg-amber-500 text-white";
  if (a === "APPROVE") return "border-transparent bg-emerald-600 text-white";
  return "border-transparent bg-slate-600 text-white";
}

function auditBulletsFromAI(r: NormalizedAIResult): string[] {
  const chunks: string[] = [];
  if (r.reasoning && r.reasoning !== "—") {
    chunks.push(
      ...r.reasoning
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  if (r.compliance_note) chunks.push(r.compliance_note);
  if (r.evasion_indicators.length) chunks.push(...r.evasion_indicators);
  return chunks.length ? chunks.slice(0, 8) : ["—"];
}

function aiForBatchRow(
  batch: BatchScreenRow,
  index: number,
  aiList: NormalizedAIResult[] | null
): NormalizedAIResult | undefined {
  if (!aiList?.length) return undefined;
  const byName = aiList.find(
    (a) => a.vendor_name.trim().toLowerCase() === batch.screenInput.vendorName.trim().toLowerCase()
  );
  if (byName) return byName;
  return aiList[index];
}

function displayDocumentType(docType: string): string {
  const t = docType.trim();
  return t.length > 0 ? t : "Document";
}

function formatScrFooterCell(auditId: string, iso: string): string {
  const d = new Date(iso);
  const utc = d.toISOString().slice(0, 19).replace("T", " ");
  return `${auditId} | ${utc} UTC`;
}

type ComplianceAuditLineKind = "alert" | "shield" | "arrow";

function buildComplianceAuditLines(
  sr: ScreeningResultsState,
  input: { country: string; amount: string }
): { kind: ComplianceAuditLineKind; text: string }[] {
  const lines: { kind: ComplianceAuditLineKind; text: string }[] = [];

  if (sr.remote) {
    lines.push({
      kind: "shield",
      text: `Live list screening (${sr.remote.listsChecked}): ${sr.remote.assessment.replace(/_/g, " ")} — recommended action ${sr.remote.action}`,
    });
    lines.push({
      kind: "arrow",
      text: sr.remote.reasoning,
    });
  } else {
    lines.push({
      kind: "arrow",
      text: "No live screening data (offline mode).",
    });
    return lines;
  }

  if (highRiskJurisdiction(input.country)) {
    lines.push({
      kind: "arrow",
      text: `Country of origin (${input.country.trim()}) is on OFAC high-risk jurisdiction list`,
    });
  }

  if (parseAmountUsd(input.amount) > 50_000) {
    lines.push({
      kind: "arrow",
      text: "Transaction amount exceeds elevated monitoring threshold",
    });
  }

  if (lines.length === 0) {
    lines.push({
      kind: "arrow",
      text: "No material sanctions exposure detected at current screening thresholds",
    });
  }

  return lines;
}

function buildComplianceEmailDraftContent(
  rows: BatchScreenRow[],
  aiResults: NormalizedAIResult[] | null
): {
  subject: string;
  body: string;
  fullText: string;
} {
  const dateYmd = new Date().toISOString().slice(0, 10);
  const firstScr = rows[0]?.auditId ?? "SCR-N/A";
  const subject = `Sanctions Screening Alert - ${dateYmd} - Batch ${firstScr}`;

  let high = 0;
  let medium = 0;
  let low = 0;
  for (const r of rows) {
    if (r.screeningResults.risk === "HIGH") high++;
    else if (r.screeningResults.risk === "MEDIUM") medium++;
    else low++;
  }

  const screeningDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const highEntityLines: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const batchRow = rows[i];
    if (batchRow.screeningResults.risk !== "HIGH") continue;
    const sr = batchRow.screeningResults;
    const auditLines = buildComplianceAuditLines(sr, {
      country: batchRow.screenInput.country,
      amount: batchRow.screenInput.amount,
    });
    const firstBullet = auditLines[0]?.text ?? "—";
    const ti = sr.transliterationInfo;
    let variantAppend = "";
    if (ti) {
      variantAppend = ` | Screening variants (${ti.direction}): ${ti.variants.join("; ")}`;
      if (ti.standards) {
        variantAppend += ` | ISO 9: ${ti.standards.iso9}; ICAO: ${ti.standards.icao}; BGN: ${ti.standards.bgn}; Informal: ${ti.standards.informal}`;
      }
    }
    highEntityLines.push(
      `- ${batchRow.screenInput.vendorName} (Score: ${sr.compositeScore}%) — ${firstBullet}${variantAppend}`
    );
  }

  const entitiesSection = highEntityLines.length > 0 ? highEntityLines.join("\n") : "- None";

  let aiSummarySection = "";
  if (aiResults?.length) {
    const aiLines: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const aiRow = aiForBatchRow(rows[i], i, aiResults);
      if (!aiRow) continue;
      const riskU = (aiRow.risk_level || "LOW").toUpperCase();
      const actionDisp = aiDeepAnalysisActionDisplay(aiRow.action);
      const assess = aiAssessmentLabel(aiRow.true_positive);
      const reasonOneLine = aiRow.reasoning.replace(/\s+/g, " ").trim();
      aiLines.push(
        `- ${aiRow.vendor_name}: ${assess}; AI risk ${riskU}; Action ${actionDisp}; Confidence ${aiRow.confidence}% — ${reasonOneLine}`
      );
    }
    if (aiLines.length > 0) {
      aiSummarySection = `

AI Deep Analysis summary (Azure OpenAI GPT-4o):
${aiLines.join("\n")}`;
    }
  }

  const body = `Dear Compliance Team,

Please find the summary of the automated sanctions screening performed on ${screeningDate} via TradeScreen AI.

Screening Summary:
- Total Vendors Screened: ${rows.length}
- High Risk (BLOCK): ${high}
- Medium Risk (REVIEW): ${medium}
- Low Risk (APPROVE): ${low}

Entities Requiring Immediate Action:
${entitiesSection}${aiSummarySection}

Detailed evidence is available in the attached PDF screening report.

Please review and confirm the recommended actions.

Regards,
Compliance Officer`;

  const fullText = `Subject: ${subject}\n\n${body}`;
  return { subject, body, fullText };
}

function formatTransliterationBlockForPdf(ti: TransliterationScreeningInfo): string {
  const parts = [`Variants: ${ti.variants.join(", ")}`];
  if (ti.standards) {
    parts.push(
      `ISO 9: ${ti.standards.iso9}; ICAO: ${ti.standards.icao}; BGN: ${ti.standards.bgn}; Informal: ${ti.standards.informal}`
    );
  }
  return parts.join(" | ");
}

function generateSanctionsScreeningPdfBlob(
  rows: BatchScreenRow[],
  aiResults: NormalizedAIResult[] | null
): Blob {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  let high = 0;
  let medium = 0;
  let low = 0;
  for (const r of rows) {
    const risk = r.screeningResults.risk;
    if (risk === "HIGH") high++;
    else if (risk === "MEDIUM") medium++;
    else low++;
  }

  const risks = rows.map((r) => r.screeningResults.risk);
  const bodyRows = rows.map((batchRow, i) => {
    const sr = batchRow.screeningResults;
    const { label: actionLabel } = complianceActionFromRisk(sr.risk);
    return [
      batchRow.screenInput.vendorName,
      batchRow.screenInput.country || "—",
      formatUsdCurrencyAmount(batchRow.screenInput.amount),
      displayDocumentType(batchRow.screenInput.docType),
      sr.bestMatch,
      `${sr.compositeScore}%`,
      sr.risk,
      actionLabel,
    ];
  });

  let yPos = margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("TradeScreen AI — Sanctions Screening Report", margin, yPos);
  yPos += 28;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 55, 55);
  doc.text(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }), margin, yPos);
  yPos += 20;
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text("Academic Research Prototype — Not for production compliance use", margin, yPos);
  yPos += 28;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Summary: ${rows.length} vendors screened — HIGH RISK: ${high}, MEDIUM: ${medium}, LOW/CLEAR: ${low}`,
    margin,
    yPos
  );
  yPos += 22;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin, bottom: 52 },
    head: [
      [
        "VENDOR",
        "COUNTRY",
        "AMOUNT",
        "DOCUMENT",
        "SDN MATCH",
        "SCORE (Total)",
        "RISK",
        "ACTION",
      ],
    ],
    body: bodyRows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      lineColor: [90, 90, 90],
      lineWidth: 0.35,
      textColor: [26, 26, 26],
    },
    headStyles: {
      fillColor: [248, 248, 248],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.4,
      lineColor: [70, 70, 70],
    },
    columnStyles: {
      5: { font: "courier", halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.index === 5) {
        data.cell.styles.font = "courier";
      }
      if (data.column.index === 6) {
        const risk = risks[data.row.index];
        data.cell.styles.fontStyle = "bold";
        if (risk === "HIGH") {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.textColor = [220, 38, 38];
        } else if (risk === "MEDIUM") {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    },
  });

  const lastY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yPos;
  let y = lastY + 28;
  const maxW = pageW - margin * 2;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 56) {
      doc.addPage();
      y = margin;
    }
  };

  ensureSpace(28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Screening / transliteration variants", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(45, 45, 45);
  for (const batchRow of rows) {
    const ti = batchRow.screeningResults.transliterationInfo;
    if (!ti) continue;
    const header = `${batchRow.screenInput.vendorName} (${ti.direction}${
      isCyrillic(batchRow.screenInput.vendorName) ? ", Cyrillic vendor field" : ", Latin vendor field"
    }):`;
    for (const wline of doc.splitTextToSize(header, maxW)) {
      ensureSpace(10);
      doc.text(wline, margin, y);
      y += 10;
    }
    const bodyTxt = formatTransliterationBlockForPdf(ti);
    for (const wline of doc.splitTextToSize(bodyTxt, maxW)) {
      ensureSpace(10);
      doc.text(wline, margin, y);
      y += 10;
    }
    y += 6;
  }
  doc.setTextColor(0, 0, 0);
  y += 8;

  ensureSpace(28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Audit trail", margin, y);
  y += 18;

  for (let i = 0; i < rows.length; i++) {
    const batchRow = rows[i];
    const sr = batchRow.screeningResults;
    const auditLines = buildComplianceAuditLines(sr, {
      country: batchRow.screenInput.country,
      amount: batchRow.screenInput.amount,
    });

    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(batchRow.screenInput.vendorName, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const line of auditLines) {
      const txt = `• ${line.text}`;
      const wrapped = doc.splitTextToSize(txt, maxW);
      for (const wline of wrapped) {
        ensureSpace(10);
        doc.text(wline, margin, y);
        y += 10;
      }
    }
    y += 4;
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(45, 45, 45);
    const scrLine = `SCR ID: ${formatScrFooterCell(batchRow.auditId, batchRow.auditedAt)}`;
    const scrWrapped = doc.splitTextToSize(scrLine, maxW);
    for (const wline of scrWrapped) {
      ensureSpace(10);
      doc.text(wline, margin, y);
      y += 10;
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    y += 14;
  }

  if (aiResults?.length) {
    ensureSpace(32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("AI Deep Analysis", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (let i = 0; i < rows.length; i++) {
      const aiRow = aiForBatchRow(rows[i], i, aiResults);
      if (!aiRow) continue;
      const assess = aiAssessmentLabel(aiRow.true_positive);
      ensureSpace(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(aiRow.vendor_name, margin, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(45, 45, 45);
      for (const wline of doc.splitTextToSize(`Assessment: ${assess}`, maxW)) {
        ensureSpace(10);
        doc.text(wline, margin, y);
        y += 10;
      }
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      for (const wline of doc.splitTextToSize(`Confidence: ${aiRow.confidence}%`, maxW)) {
        ensureSpace(10);
        doc.text(wline, margin, y);
        y += 10;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Reasoning:", margin, y);
      y += 9;
      doc.setFont("helvetica", "normal");
      for (const wline of doc.splitTextToSize(aiRow.reasoning, maxW)) {
        ensureSpace(10);
        doc.text(wline, margin, y);
        y += 10;
      }
      const screeningBatchRow = rows[i];
      const ti = screeningBatchRow.screeningResults.transliterationInfo;
      const transBlock = ti
        ? `${formatTransliterationBlockForPdf(ti)} — screened across 4 lists`
        : "No transliteration metadata.";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(45, 45, 45);
      for (const wline of doc.splitTextToSize(transBlock, maxW)) {
        ensureSpace(10);
        doc.text(wline, margin, y);
        y += 10;
      }
      y += 8;
    }
    doc.setTextColor(0, 0, 0);
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${p} of ${totalPages}`, pageW / 2, pageH - 36, {
      align: "center",
    });
    doc.text("Generated by TradeScreen AI | © 2026 Tatiana Podobivskaia", pageW / 2, pageH - 22, {
      align: "center",
    });
  }

  return doc.output("blob");
}

function ComplianceAuditTrail({
  lines,
  scrFooter,
}: {
  lines: { kind: ComplianceAuditLineKind; text: string }[];
  scrFooter: string;
}) {
  return (
    <div>
      <div className="space-y-2">
        {lines.map((line, i) => {
          if (line.kind === "alert") {
            return (
              <div key={i} className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={2} aria-hidden />
                <span className="text-[11px] leading-snug text-slate-800 font-body">{line.text}</span>
              </div>
            );
          }
          if (line.kind === "shield") {
            return (
              <div key={i} className="flex gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={2} aria-hidden />
                <span className="text-[11px] leading-snug text-slate-800 font-body">{line.text}</span>
              </div>
            );
          }
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-mono text-teal-600">→</span>
              <span className="text-[11px] leading-snug text-slate-700 font-body">{line.text}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 border-t border-slate-100 pt-2 font-mono text-[10px] text-slate-500">{scrFooter}</p>
    </div>
  );
}

function ScoreBreakdownBlock({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="min-w-[7.5rem] text-[10px] leading-snug text-slate-700">
      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
        <span className="text-slate-500">Name:</span>
        <span className="text-right font-mono tabular-nums">{breakdown.name}</span>
        <span className="text-slate-500">Country:</span>
        <span className="text-right font-mono tabular-nums">{breakdown.country}</span>
        <span className="text-slate-500">Amount:</span>
        <span className="text-right font-mono tabular-nums">{breakdown.amount}</span>
        <span className="text-slate-500">Doc:</span>
        <span className="text-right font-mono tabular-nums">{breakdown.doc}</span>
        <span className="text-slate-500">Translit:</span>
        <span className="text-right font-mono tabular-nums">{breakdown.translit}</span>
      </div>
      <div className="my-1.5 border-t border-slate-200" />
      <div className="grid grid-cols-[auto_1fr] gap-x-2">
        <span className="font-semibold text-slate-600">Total:</span>
        <span className="text-right font-mono text-[11px] font-semibold tabular-nums text-slate-900">{breakdown.total}</span>
      </div>
    </div>
  );
}

export default function Screening() {
  const search = useSearch();
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
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  /** Non-null after a successful parse with at least one vendor; cleared when choosing a new file */
  const [parsedUploadRows, setParsedUploadRows] = useState<ParsedUploadRow[] | null>(null);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [uploadScreeningDone, setUploadScreeningDone] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  /** Multi-vendor file upload screening (2+ vendors); null when using single-vendor flow */
  const [batchScreeningRows, setBatchScreeningRows] = useState<BatchScreenRow[] | null>(null);
  const [batchRiskFilter, setBatchRiskFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [batchDetailsExpanded, setBatchDetailsExpanded] = useState(false);
  const [batchTableSearch, setBatchTableSearch] = useState("");
  const [screeningRemoteLoading, setScreeningRemoteLoading] = useState(false);
  const [screeningRemoteFallback, setScreeningRemoteFallback] = useState(false);
  const [emailDraftOpen, setEmailDraftOpen] = useState(false);
  const [emailDraftCopied, setEmailDraftCopied] = useState(false);
  const emailCopyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * When there are no results: restore last snapshot from sessionStore if present;
   * otherwise pre-fill vendor/tab from ?vendor= / ?entity= query (snapshot wins over URL).
   * useLayoutEffect avoids a paint with empty results when returning via SPA navigation.
   */
  useLayoutEffect(() => {
    const q = new URLSearchParams(search);
    const urlVendor = (q.get("vendor") ?? q.get("entity") ?? "").trim();
    const hasResults =
      screeningResults != null || (batchScreeningRows != null && batchScreeningRows.length > 0);
    if (hasResults) return;

    const snap = getLastScreeningSnapshot();
    if (snap) {
      if (snap.kind === "batch") {
        setBatchScreeningRows(snap.batchScreeningRows as BatchScreenRow[]);
        setUploadScreeningDone(true);
        setScreeningResults(null);
        setLastScreenInput(null);
        setActiveTab("upload");
        return;
      }
      const input = snap.lastScreenInput as {
        vendorName: string;
        country: string;
        amount: string;
        docType: string;
        cyrillicName: string;
      };
      setScreeningResults(snap.screeningResults as ScreeningResultsState);
      setLastScreenInput(input);
      setVendorName(input.vendorName);
      setCountry(input.country);
      setAmount(input.amount);
      setDocType(input.docType);
      setCyrillicName(input.cyrillicName);
      setActiveTab("manual");
      return;
    }

    if (urlVendor) {
      setVendorName(urlVendor);
      setActiveTab("manual");
    }
  }, [search, screeningResults, batchScreeningRows]);

  const batchRiskCounts = useMemo(() => {
    if (!batchScreeningRows?.length) return { all: 0, high: 0, medium: 0, low: 0 };
    let high = 0;
    let medium = 0;
    let low = 0;
    for (const r of batchScreeningRows) {
      const risk = r.screeningResults.risk;
      if (risk === "HIGH") high++;
      else if (risk === "MEDIUM") medium++;
      else low++;
    }
    return { all: batchScreeningRows.length, high, medium, low };
  }, [batchScreeningRows]);

  const batchNamesByRisk = useMemo(() => {
    const high: string[] = [];
    const medium: string[] = [];
    const low: string[] = [];
    if (!batchScreeningRows?.length) return { high, medium, low };
    for (const r of batchScreeningRows) {
      const name = r.screenInput.vendorName;
      const risk = r.screeningResults.risk;
      if (risk === "HIGH") high.push(name);
      else if (risk === "MEDIUM") medium.push(name);
      else low.push(name);
    }
    return { high, medium, low };
  }, [batchScreeningRows]);

  const filteredBatchRows = useMemo(() => {
    if (!batchScreeningRows?.length) return [];
    if (batchRiskFilter === "ALL") return batchScreeningRows;
    return batchScreeningRows.filter((r) => r.screeningResults.risk === batchRiskFilter);
  }, [batchScreeningRows, batchRiskFilter]);

  const batchTableRows = useMemo(() => {
    const q = batchTableSearch.trim().toLowerCase();
    if (!q) return filteredBatchRows;
    return filteredBatchRows.filter((r) => r.screenInput.vendorName.toLowerCase().includes(q));
  }, [filteredBatchRows, batchTableSearch]);

  const complianceEmailDraft = useMemo(
    () =>
      batchScreeningRows?.length ? buildComplianceEmailDraftContent(batchScreeningRows, aiResults) : null,
    [batchScreeningRows, aiResults]
  );

  useEffect(() => {
    return () => {
      if (emailCopyResetRef.current) clearTimeout(emailCopyResetRef.current);
    };
  }, []);

  const escapeCsvCell = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

  const handleBatchExportCsv = useCallback(() => {
    if (!batchScreeningRows?.length) return;
    const header = [
      "Vendor",
      "Country",
      "Amount",
      "Document",
      "SDN Match",
      "Composite Score",
      "Risk",
      "Action",
      "SCR ID",
      "Audited At",
      "AI_Assessment",
      "AI_Risk",
      "AI_Action",
      "AI_Confidence",
      "AI_Reasoning",
    ];
    const lines = batchScreeningRows.map((row, i) => {
      const sr = row.screeningResults;
      const action = complianceActionFromRisk(sr.risk).label;
      const ai = aiForBatchRow(row, i, aiResults);
      return [
        escapeCsvCell(row.screenInput.vendorName),
        escapeCsvCell(row.screenInput.country),
        escapeCsvCell(row.screenInput.amount),
        escapeCsvCell(row.screenInput.docType),
        escapeCsvCell(sr.bestMatch),
        escapeCsvCell(String(sr.compositeScore)),
        escapeCsvCell(sr.risk),
        escapeCsvCell(action),
        escapeCsvCell(row.auditId),
        escapeCsvCell(row.auditedAt),
        escapeCsvCell(ai ? aiAssessmentLabel(ai.true_positive) : "—"),
        escapeCsvCell(ai ? (ai.risk_level || "—").toUpperCase() : "—"),
        escapeCsvCell(ai ? aiDeepAnalysisActionDisplay(ai.action) : "—"),
        escapeCsvCell(ai ? String(ai.confidence) : "—"),
        escapeCsvCell(ai ? ai.reasoning.replace(/\r\n|\n|\r/g, " ") : "—"),
      ].join(",");
    });
    const csv = `\uFEFF${[header.join(","), ...lines].join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-screening-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [batchScreeningRows, aiResults]);

  const handleBatchPdfReport = useCallback(() => {
    if (!batchScreeningRows?.length) return;
    const blob = generateSanctionsScreeningPdfBlob(batchScreeningRows, aiResults);
    const pdfBlobUrl = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split("T")[0];
    const downloadName = `Sanctions_Report_${dateStr}.pdf`;
    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>TradeScreen AI &mdash; Screening Report</title>
<style>
  body { margin: 0; font-family: Inter, sans-serif; background: #f1f5f9; }
  .toolbar { position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #0f172a; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; z-index: 10; }
  .toolbar h1 { color: white; font-size: 14px; font-weight: 600; }
  .toolbar .buttons { display: flex; gap: 12px; }
  .toolbar button { padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
  .btn-download { background: #22d3ee; color: #0f172a; }
  .btn-print { background: transparent; border: 1px solid #94a3b8 !important; color: #e2e8f0; }
  iframe { position: fixed; top: 56px; left: 0; right: 0; bottom: 0; width: 100%; height: calc(100vh - 56px); border: none; }
</style></head><body>
<div class="toolbar">
  <h1>TradeScreen AI &mdash; Sanctions Screening Report</h1>
  <div class="buttons">
    <button type="button" class="btn-download" onclick="downloadPdf()">Download PDF</button>
    <button type="button" class="btn-print" onclick="var f=document.querySelector('iframe');if(f&&f.contentWindow)f.contentWindow.print()">Print</button>
  </div>
</div>
<iframe src="${pdfBlobUrl}"></iframe>
<script>
  const pdfUrl = ${JSON.stringify(pdfBlobUrl)};
  const downloadFilename = ${JSON.stringify(downloadName)};
  function downloadPdf() {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = downloadFilename;
    a.click();
  }
</script>
</body></html>`;
    const htmlBlob = new Blob([htmlContent], { type: "text/html" });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    window.open(htmlUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      URL.revokeObjectURL(htmlUrl);
      URL.revokeObjectURL(pdfBlobUrl);
    }, 120_000);
  }, [batchScreeningRows, aiResults]);

  const handleCopyEmailDraft = useCallback(async () => {
    if (!complianceEmailDraft) return;
    try {
      await navigator.clipboard.writeText(complianceEmailDraft.fullText);
      setEmailDraftCopied(true);
      if (emailCopyResetRef.current) clearTimeout(emailCopyResetRef.current);
      emailCopyResetRef.current = setTimeout(() => {
        setEmailDraftCopied(false);
        emailCopyResetRef.current = null;
      }, 2000);
    } catch {
      /* ignore clipboard errors */
    }
  }, [complianceEmailDraft]);

  const handleOpenEmailDraftMailto = useCallback(() => {
    if (!complianceEmailDraft) return;
    const href = `mailto:?subject=${encodeURIComponent(complianceEmailDraft.subject)}&body=${encodeURIComponent(complianceEmailDraft.body)}`;
    window.location.href = href;
  }, [complianceEmailDraft]);

  const handleScreen = useCallback(
    async (vendorNameOverride?: string, fileRow?: ParsedUploadRow) => {
      const t0 = performance.now();
      const vn = (vendorNameOverride !== undefined ? vendorNameOverride : vendorName).trim();
      if (!vn) return;
      setBatchScreeningRows(null);
      const input = {
        vendorName: vn,
        country: (fileRow?.country ?? country).trim(),
        amount: (fileRow?.amount ?? amount).trim(),
        docType: (fileRow?.docType ?? docType).trim(),
        cyrillicName: cyrillicName.trim(),
      };
      setLastScreenInput(input);
      setAiResults(null);
      setAiError(null);
      setScreeningRemoteLoading(true);
      setScreeningRemoteFallback(false);
      try {
        const { names, transliterationInfo } = collectNamesForApiScreening(input);
        if (names.length === 0) {
          setScreeningResults(null);
          return;
        }
        const vendors = names.map((name) => buildMinimalVendorPayload(name, input));
        const data = await postSanctionsScreen(vendors);
        const apiRow = pickWorstRiskResult(data.results ?? []);
        const sr = buildScreeningResultsFromApi(input, transliterationInfo, apiRow);
        setScreeningResults(sr);
        setLastScreeningSnapshot({ kind: "single", screeningResults: sr, lastScreenInput: input });
        addScreeningResult({
          timestamp: new Date().toISOString(),
          vendorName: input.vendorName,
          risk: sr.risk,
          score: sr.compositeScore,
          assessment: sr.remote?.assessment ?? sr.bestMatch,
          action: sr.remote?.action,
          source: "screening",
          durationMs: performance.now() - t0,
        });
      } catch {
        setScreeningRemoteFallback(true);
        setScreeningResults(null);
      } finally {
        setScreeningRemoteLoading(false);
      }
    },
    [vendorName, country, amount, docType, cyrillicName]
  );

  /** Manual entry: read live form values so country / amount / doc always feed the scoring pipeline */
  const handleManualSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t0 = performance.now();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const vn = String(fd.get("vendorName") ?? "").trim();
    if (!vn) return;

    const input = {
      vendorName: vn,
      country: String(fd.get("country") ?? "").trim(),
      amount: String(fd.get("amount") ?? "").trim(),
      docType: String(fd.get("docType") ?? "").trim(),
      cyrillicName: String(fd.get("cyrillicName") ?? "").trim(),
    };

    setVendorName(vn);
    setCountry(input.country);
    setAmount(input.amount);
    setDocType(input.docType);
    setCyrillicName(input.cyrillicName);

    setBatchScreeningRows(null);
    setLastScreenInput(input);
    setAiResults(null);
    setAiError(null);
    setScreeningRemoteLoading(true);
    setScreeningRemoteFallback(false);
    try {
      const { names, transliterationInfo } = collectNamesForApiScreening(input);
      if (names.length === 0) {
        setScreeningResults(null);
        return;
      }
      const vendors = names.map((name) => buildMinimalVendorPayload(name, input));
      const data = await postSanctionsScreen(vendors);
      const apiRow = pickWorstRiskResult(data.results ?? []);
      const sr = buildScreeningResultsFromApi(input, transliterationInfo, apiRow);
      setScreeningResults(sr);
      setLastScreeningSnapshot({ kind: "single", screeningResults: sr, lastScreenInput: input });
      addScreeningResult({
        timestamp: new Date().toISOString(),
        vendorName: input.vendorName,
        risk: sr.risk,
        score: sr.compositeScore,
        assessment: sr.remote?.assessment ?? sr.bestMatch,
        action: sr.remote?.action,
        source: "screening",
        durationMs: performance.now() - t0,
      });
    } catch {
      setScreeningRemoteFallback(true);
      setScreeningResults(null);
    } finally {
      setScreeningRemoteLoading(false);
    }
  }, []);

  const runUploadScreening = useCallback(async () => {
    if (!parsedUploadRows?.length) return;
    const t0 = performance.now();
    setBatchRiskFilter("ALL");
    if (parsedUploadRows.length === 1) {
      const first = applyUploadColumnDefaults(parsedUploadRows[0], missingColumns);
      setVendorName(first.vendorName);
      setBatchScreeningRows(null);
      await handleScreen(first.vendorName, first);
      setUploadScreeningDone(true);
      return;
    }
    const auditedAt = new Date().toISOString();
    const stubs = parsedUploadRows.map((row) => {
      const normalized = applyUploadColumnDefaults(row, missingColumns);
      const screenInput: ScreenPipelineInput = {
        vendorName: normalized.vendorName,
        country: normalized.country,
        amount: normalized.amount,
        docType: normalized.docType,
        cyrillicName: cyrillicName.trim(),
      };
      return {
        auditId: generateAuditId(),
        auditedAt,
        screenInput,
      };
    });
    setScreeningRemoteLoading(true);
    setScreeningRemoteFallback(false);
    try {
      type FlatEntry = { rowIndex: number; name: string; screenInput: ScreenPipelineInput };
      const transliterationByRow: (TransliterationScreeningInfo | null)[] = [];
      const flat: FlatEntry[] = [];
      for (let i = 0; i < stubs.length; i++) {
        const { names, transliterationInfo } = collectNamesForApiScreening(stubs[i].screenInput);
        transliterationByRow[i] = transliterationInfo;
        for (const name of names) {
          flat.push({ rowIndex: i, name, screenInput: stubs[i].screenInput });
        }
      }
      const vendorsPayload = flat.map((f) => buildMinimalVendorPayload(f.name, f.screenInput));
      const data = await postSanctionsScreen(vendorsPayload);
      const results = data.results ?? [];
      const grouped: ScreenVendorApiResult[][] = Array.from({ length: stubs.length }, () => []);
      for (let j = 0; j < flat.length; j++) {
        const apiRow = results[j];
        if (apiRow) grouped[flat[j].rowIndex].push(apiRow);
      }
      const mergedRows: BatchScreenRow[] = stubs.map((stub, i) => ({
        ...stub,
        screeningResults: buildScreeningResultsFromApi(
          stub.screenInput,
          transliterationByRow[i],
          pickWorstRiskResult(grouped[i])
        ),
      }));
      setBatchScreeningRows(mergedRows);
      setLastScreeningSnapshot({ kind: "batch", batchScreeningRows: mergedRows });
      const avgMs = (performance.now() - t0) / Math.max(1, mergedRows.length);
      for (const r of mergedRows) {
        addScreeningResult({
          timestamp: new Date().toISOString(),
          vendorName: r.screenInput.vendorName,
          risk: r.screeningResults.risk,
          score: r.screeningResults.compositeScore,
          assessment: r.screeningResults.remote?.assessment ?? r.screeningResults.bestMatch,
          action: r.screeningResults.remote?.action,
          source: "screening",
          durationMs: avgMs,
        });
      }
    } catch {
      setScreeningRemoteFallback(true);
      setBatchScreeningRows(null);
    } finally {
      setScreeningRemoteLoading(false);
    }
    setBatchDetailsExpanded(false);
    setScreeningResults(null);
    setLastScreenInput(null);
    setAiResults(null);
    setAiError(null);
    setUploadScreeningDone(true);
  }, [parsedUploadRows, missingColumns, handleScreen, cyrillicName]);

  const resetUpload = useCallback(() => {
    setParsedUploadRows(null);
    setMissingColumns([]);
    setUploadedFile(null);
    setUploadScreeningDone(false);
    setBatchScreeningRows(null);
    setBatchDetailsExpanded(false);
    setAiError(null);
    setAiResults(null);
    setScreeningRemoteFallback(false);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setBatchScreeningRows(null);
      setBatchDetailsExpanded(false);
      setScreeningResults(null);
      setLastScreenInput(null);
      setAiResults(null);
      setScreeningRemoteFallback(false);
      setParsedUploadRows(null);
      setMissingColumns([]);
      setUploadScreeningDone(false);
      setUploadedFile(file.name);
      setAiError(null);
      setIsLoading(true);
      const ext = file.name.split(".").pop()?.toLowerCase();
      let parsedRows: ParsedUploadRow[] = [];
      let uploadMissingColumns: string[] = [];

      try {
        if (ext === "csv" || ext === "txt") {
          const text = await file.text();
          const matrix = rowsFromDelimitedText(text);
          const out = normalizeUploadMatrixWithColumnMaps(matrix);
          parsedRows = out.rows;
          uploadMissingColumns = out.missingColumns;
        } else if (ext === "xlsx" || ext === "xls") {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
          const matrix = rows.map((row) => row.map((c) => (c === undefined || c === null ? "" : String(c))));
          const out = normalizeUploadMatrixWithColumnMaps(matrix);
          parsedRows = out.rows;
          uploadMissingColumns = out.missingColumns;
        } else if (ext === "docx" || ext === "doc") {
          const buf = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: buf });
          const out = parseWordPlainText(result.value);
          parsedRows = out.rows;
          uploadMissingColumns = out.missingColumns;
        } else {
          setAiError("Unsupported file format. Please upload CSV, Excel, PDF, Word, or TXT.");
          setIsLoading(false);
          return;
        }

        if (parsedRows.length > 0) {
          setParsedUploadRows(parsedRows);
          setMissingColumns(uploadMissingColumns);
          setIsLoading(false);
        } else {
          setAiError("No vendor names found in file. Try Manual Entry.");
          setMissingColumns([]);
          setIsLoading(false);
        }
      } catch {
        setAiError("Error reading file. Try a different format or use Manual Entry.");
        setMissingColumns([]);
        setIsLoading(false);
      }
    },
    []
  );

  const handleRunAI = useCallback(async () => {
    if (batchScreeningRows && batchScreeningRows.length > 0) {
      setAiLoading(true);
      setAiError(null);
      setAiResults(null);
      const vendors = batchScreeningRows.map((row) => ({
        name: row.screenInput.vendorName,
        country: row.screenInput.country || "—",
        amount: parseAmountUsd(row.screenInput.amount),
        doc: row.screenInput.docType || "—",
        cyrillic: row.screenInput.cyrillicName || "—",
        sdn_match: row.screeningResults.remote?.assessment ?? row.screeningResults.bestMatch,
        fuzzy_score: row.screeningResults.compositeScore,
        risk: row.screeningResults.risk,
      }));
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
      return;
    }

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
        sdn_match: screeningResults.remote?.assessment ?? screeningResults.bestMatch,
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
  }, [batchScreeningRows, screeningResults, lastScreenInput]);

  const canRunAi = Boolean(screeningResults || (batchScreeningRows && batchScreeningRows.length > 0));
  const aiAnalysisComplete = Boolean(!aiLoading && aiResults && aiResults.length > 0 && canRunAi);

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
            <input
              ref={uploadInputRef}
              id="screening-upload-input"
              type="file"
              className="sr-only"
              accept=".csv,.txt,.xlsx,.xls,.docx,.doc"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />
            {parsedUploadRows !== null && parsedUploadRows.length > 0 ? (
              <div
                className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-10 text-center transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
              >
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-600" aria-hidden />
                <p className="text-sm font-semibold text-slate-800 font-body">{uploadedFile}</p>
                <p className="mt-2 text-sm text-slate-600 font-body">
                  {parsedUploadRows.length} vendor{parsedUploadRows.length === 1 ? "" : "s"} loaded
                  {!uploadScreeningDone ? " — ready to screen" : ""}
                </p>
                {!uploadScreeningDone && (
                  <button
                    type="button"
                    disabled={screeningRemoteLoading}
                    onClick={() => void runUploadScreening()}
                    className="btn-premium btn-premium-primary mt-5 inline-flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {screeningRemoteLoading ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} aria-hidden />
                    ) : null}
                    Run Sanctions Screening
                  </button>
                )}
                <p className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      resetUpload();
                      uploadInputRef.current?.click();
                    }}
                    className="text-sm font-semibold text-cyan-600 underline-offset-2 transition-colors hover:text-cyan-700 hover:underline font-body"
                  >
                    Click to upload a different file
                  </button>
                </p>
              </div>
            ) : (
              <div
                className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-12 text-center transition-colors hover:border-cyan-500/40"
                onClick={() => uploadInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
              >
                <Upload className="mx-auto mb-4 h-12 w-12 text-slate-300 transition-colors group-hover:text-cyan-500" />
                <p className="text-sm font-semibold text-slate-600 font-body">Drop File Here</p>
                <label
                  htmlFor="screening-upload-input"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 inline-block cursor-pointer text-sm font-semibold text-cyan-600 underline-offset-2 transition-colors hover:text-cyan-700 hover:underline font-body"
                >
                  Click to Browse
                </label>
                <p className="mt-2 text-xs text-slate-400 font-body">
                  Supports CSV, Excel, Word, TXT
                </p>
              </div>
            )}
            {isLoading && (
              <p className="mt-4 text-center text-sm font-medium text-amber-800 font-body">Processing file…</p>
            )}
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              void handleManualSubmit(e);
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
                name="vendorName"
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
                name="country"
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
                name="amount"
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
                name="docType"
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
                name="cyrillicName"
                type="text"
                value={cyrillicName}
                onChange={(e) => setCyrillicName(e.target.value)}
                placeholder="e.g. Рособоронэкспорт"
                className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={screeningRemoteLoading}
                className="btn-premium btn-premium-primary inline-flex shrink-0 items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {screeningRemoteLoading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} aria-hidden />
                ) : null}
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

        {screeningRemoteFallback ? (
          <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-body">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} aria-hidden />
            <p>API unavailable — showing offline mode</p>
          </div>
        ) : null}

        {missingColumns.length > 0 && (
          <div className="mt-4 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <Info className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            <p className="font-body">
              Missing columns: {missingColumns.join(", ")}. Default values will be used (Country: Unknown, Amount: $0, Doc:
              Document).
            </p>
          </div>
        )}

        {!screeningResults && !(batchScreeningRows && batchScreeningRows.length > 0) ? (
          <p className="mt-2 text-sm text-slate-500 font-body">
            Match scores, list hits, and recommended actions will appear here after you screen a vendor.
          </p>
        ) : batchScreeningRows && batchScreeningRows.length > 0 ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="min-w-0 border-t-4 border-red-600 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HIGH RISK</span>
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
                </div>
                <p className="mt-2 text-2xl font-mono font-bold text-red-600">{batchRiskCounts.high}</p>
                <p
                  className="mt-2 truncate text-[11px] text-slate-500"
                  title={
                    batchNamesByRisk.high.length ? batchNamesByRisk.high.join(", ") : undefined
                  }
                >
                  {batchNamesByRisk.high.length ? batchNamesByRisk.high.join(", ") : "—"}
                </p>
              </div>
              <div className="min-w-0 border-t-4 border-amber-500 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MEDIUM</span>
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                </div>
                <p className="mt-2 text-2xl font-mono font-bold text-amber-600">{batchRiskCounts.medium}</p>
                <p
                  className="mt-2 truncate text-[11px] text-slate-500"
                  title={
                    batchNamesByRisk.medium.length ? batchNamesByRisk.medium.join(", ") : undefined
                  }
                >
                  {batchNamesByRisk.medium.length ? batchNamesByRisk.medium.join(", ") : "—"}
                </p>
              </div>
              <div className="min-w-0 border-t-4 border-emerald-500 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LOW / CLEAR</span>
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                </div>
                <p className="mt-2 text-2xl font-mono font-bold text-emerald-600">{batchRiskCounts.low}</p>
                <p
                  className="mt-2 truncate text-[11px] text-slate-500"
                  title={batchNamesByRisk.low.length ? batchNamesByRisk.low.join(", ") : undefined}
                >
                  {batchNamesByRisk.low.length ? batchNamesByRisk.low.join(", ") : "—"}
                </p>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleBatchPdfReport}
                className="rounded-lg border-2 border-red-600 bg-white px-3 py-2 text-xs font-bold font-display uppercase tracking-wide text-red-700 shadow-sm transition-colors hover:bg-red-50"
              >
                PDF Report
              </button>
              <button
                type="button"
                onClick={handleBatchExportCsv}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold font-display uppercase tracking-wide text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setEmailDraftOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                Email Draft
              </button>
              <a
                href="/app"
                className="ml-2 inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-800"
              >
                View Dashboard <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </a>
              <a
                href="/app/audit"
                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-800"
              >
                View Audit Log <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </a>
            </div>
            <button
              type="button"
              onClick={() => setBatchDetailsExpanded((e) => !e)}
              className="w-full border border-slate-300 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {batchDetailsExpanded ? "Hide Details" : "View Full Screening Table"}
            </button>

            {batchDetailsExpanded ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { key: "ALL" as const, label: "ALL", dot: "bg-slate-400" },
                          { key: "HIGH" as const, label: "HIGH RISK", dot: "bg-red-500" },
                          { key: "MEDIUM" as const, label: "MEDIUM", dot: "bg-amber-500" },
                          { key: "LOW" as const, label: "LOW / CLEAR", dot: "bg-emerald-500" },
                        ] as const
                      ).map((tab) => {
                        const count =
                          tab.key === "ALL"
                            ? batchRiskCounts.all
                            : tab.key === "HIGH"
                              ? batchRiskCounts.high
                              : tab.key === "MEDIUM"
                                ? batchRiskCounts.medium
                                : batchRiskCounts.low;
                        const active = batchRiskFilter === tab.key;
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setBatchRiskFilter(tab.key)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-bold font-display uppercase tracking-wide transition-colors",
                              active
                                ? "border-cyan-200 bg-white text-slate-900 shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            )}
                          >
                            <span className={cn("h-2 w-2 shrink-0 rounded-full", tab.dot)} aria-hidden />
                            {tab.label} ({count})
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative min-w-[200px] max-w-xs flex-1">
                      <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        type="search"
                        value={batchTableSearch}
                        onChange={(e) => setBatchTableSearch(e.target.value)}
                        placeholder="Search vendors..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full min-w-[920px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600">
                        <th className="px-3 py-2 font-display">Vendor</th>
                        <th className="px-3 py-2 font-display">Country</th>
                        <th className="px-3 py-2 font-display">Amount</th>
                        <th className="px-3 py-2 font-display">Document</th>
                        <th className="px-3 py-2 font-display">SDN match</th>
                        <th className="px-3 py-2 font-display">Score breakdown</th>
                        <th className="px-3 py-2 font-display">Risk</th>
                        <th className="min-w-[280px] px-3 py-2 font-display">Action & audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchTableRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-500 font-body">
                            No vendors match this filter.
                          </td>
                        </tr>
                      ) : (
                        batchTableRows.map((batchRow) => {
                      const sr = batchRow.screeningResults;
                      const breakdown = sr.scoreBreakdown;
                      const { label: actionLabel, badge: actionBadge } = sr.remote
                        ? normalizeActionDisplay(sr.remote.action, sr.risk)
                        : complianceActionFromRisk(sr.risk);
                      const auditLines = buildComplianceAuditLines(sr, {
                        country: batchRow.screenInput.country,
                        amount: batchRow.screenInput.amount,
                      });
                      return (
                        <Fragment key={batchRow.auditId}>
                          <tr className="border-b border-slate-100 align-top odd:bg-white even:bg-slate-50/80">
                            <td className="px-3 py-3 font-semibold text-slate-900">
                              <div>{batchRow.screenInput.vendorName}</div>
                              {sr.transliterationInfo ? (
                                <ScreeningVariantsCollapsible info={sr.transliterationInfo} />
                              ) : null}
                            </td>
                            <td className="px-3 py-3 text-slate-700">{batchRow.screenInput.country || "—"}</td>
                            <td className="px-3 py-3 font-mono tabular-nums text-slate-800">
                              {formatUsdCurrencyAmount(batchRow.screenInput.amount)}
                            </td>
                            <td className="px-3 py-3 text-slate-700">{displayDocumentType(batchRow.screenInput.docType)}</td>
                            <td className="max-w-[180px] px-3 py-3 font-data text-[11px] text-slate-900">
                              {sr.bestMatch}
                            </td>
                            <td className="px-3 py-3">
                              <ScoreBreakdownBlock breakdown={breakdown} />
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[10px] font-bold font-display uppercase",
                                  sr.risk === "HIGH" && "border-red-200 bg-red-100 text-red-800",
                                  sr.risk === "MEDIUM" && "border-cyan-200 bg-amber-100 text-amber-950",
                                  sr.risk === "LOW" && "border-emerald-200 bg-emerald-100 text-emerald-900"
                                )}
                              >
                                {sr.risk}
                              </span>
                            </td>
                            <td className="min-w-[280px] px-3 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-900">{actionLabel}</span>
                                <span
                                  className={cn(
                                    "rounded border px-1.5 py-0.5 text-[10px] font-bold font-display uppercase",
                                    actionBadge === "HIGH" && "border-red-300 bg-red-100 text-red-900",
                                    actionBadge === "MEDIUM" && "border-cyan-300 bg-amber-100 text-amber-950",
                                    actionBadge === "LOW" && "border-emerald-300 bg-emerald-100 text-emerald-900"
                                  )}
                                >
                                  {actionBadge}
                                </span>
                              </div>
                              <div className="mt-3">
                                <ComplianceAuditTrail
                                  lines={auditLines}
                                  scrFooter={formatScrFooterCell(batchRow.auditId, batchRow.auditedAt)}
                                />
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
              </>
            ) : null}

            {batchScreeningRows &&
              aiResults &&
              aiResults.length > 0 &&
              !aiLoading && (
                <div className="mt-8 space-y-4 border-t border-slate-200 pt-8">
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-body">
                    AI Analysis complete — {aiResults.length} vendors analyzed via Azure OpenAI GPT-4o
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold font-display text-slate-900">AI Deep Analysis Results</h3>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-white">Azure OpenAI</span>
                  </div>
                  <div className="space-y-4">
                    {batchScreeningRows.map((batchRow, idx) => {
                      const aiRow = aiForBatchRow(batchRow, idx, aiResults);
                      if (!aiRow) return null;
                      const riskU = (aiRow.risk_level || "LOW").toUpperCase();
                      const riskTier =
                        riskU === "HIGH" || riskU === "MEDIUM" || riskU === "LOW" ? riskU : "LOW";
                      const actionDisplay = aiDeepAnalysisActionDisplay(aiRow.action);
                      return (
                        <div
                          key={`${batchRow.auditId}-ai-deep-${idx}`}
                          className={cn(
                            "rounded-lg border border-slate-200 border-l-4 bg-white p-5 shadow-sm",
                            riskTier === "HIGH" && "border-l-red-500",
                            riskTier === "MEDIUM" && "border-l-amber-500",
                            riskTier === "LOW" && "border-l-emerald-500"
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <p className="min-w-0 text-lg font-bold text-slate-900 font-display">{aiRow.vendor_name}</p>
                            <span
                              className={cn(
                                "shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold font-display uppercase",
                                riskBadgeClasses(riskTier)
                              )}
                            >
                              {riskTier}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-baseline gap-1 text-sm">
                            <span
                              className={cn(
                                "font-semibold tracking-tight",
                                aiRow.true_positive ? "text-red-700" : "text-emerald-700"
                              )}
                            >
                              {aiAssessmentLabel(aiRow.true_positive)}
                            </span>
                            <span className="text-slate-500 font-body">— Confidence:</span>
                            <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                              {aiRow.confidence}%
                            </span>
                          </div>
                          <div className="mt-3">
                            <span
                              className={cn(
                                "inline-flex rounded-md border px-2.5 py-1 text-[10px] font-bold font-display uppercase",
                                aiActionSolidBadgeClasses(aiRow.action)
                              )}
                            >
                              {actionDisplay}
                            </span>
                          </div>
                          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            AI REASONING:
                          </p>
                          <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 font-body">
                            {aiRow.reasoning}
                          </div>
                          {batchRow.screeningResults.transliterationInfo ? (
                            <div className="mt-3 flex gap-2 text-xs text-slate-500">
                              <Languages className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                              <div className="min-w-0 flex-1 text-xs text-slate-500">
                                <ScreeningVariantsCollapsible info={batchRow.screeningResults.transliterationInfo} />
                              </div>
                            </div>
                          ) : null}
                          <p className="mt-3 text-xs text-slate-400 font-body">
                            Lists checked: OFAC+EU+UN+UK
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            <Dialog
              open={emailDraftOpen}
              onOpenChange={(open) => {
                setEmailDraftOpen(open);
                if (!open) setEmailDraftCopied(false);
              }}
            >
              <DialogContent
                showCloseButton={false}
                className="max-h-[90vh] max-w-2xl gap-0 overflow-y-auto p-0 sm:max-w-2xl"
              >
                {complianceEmailDraft ? (
                  <>
                    <div className="border-b border-slate-200 px-6 py-4">
                      <DialogHeader className="gap-1 text-left">
                        <DialogTitle className="font-display text-lg text-slate-900">Email draft</DialogTitle>
                        <DialogDescription className="text-sm text-slate-600">
                          Pre-formatted compliance email from the current batch screening results.
                        </DialogDescription>
                      </DialogHeader>
                    </div>
                    <div className="space-y-4 px-6 py-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</p>
                        <p className="mt-2 font-mono text-sm leading-snug text-slate-900">{complianceEmailDraft.subject}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Body</p>
                        <pre className="mt-2 max-h-[min(42vh,360px)] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 font-body text-sm leading-relaxed text-slate-800">
                          {complianceEmailDraft.body}
                        </pre>
                      </div>
                    </div>
                    <DialogFooter className="flex-col gap-2 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end sm:gap-2">
                      <button
                        type="button"
                        onClick={handleCopyEmailDraft}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                      >
                        {emailDraftCopied ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        ) : (
                          <Copy className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                        {emailDraftCopied ? "Copied!" : "Copy to Clipboard"}
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenEmailDraftMailto}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                        Open in Mail
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailDraftOpen(false)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                      >
                        Close
                      </button>
                    </DialogFooter>
                  </>
                ) : null}
              </DialogContent>
            </Dialog>
          </div>
        ) : screeningResults ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Input summary</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{lastScreenInput?.vendorName}</p>
              {lastScreenInput?.cyrillicName ? (
                <p className="text-xs text-slate-600 font-body">{lastScreenInput.cyrillicName}</p>
              ) : null}
              {screeningResults.transliterationInfo ? (
                <div className="mt-1 max-w-xl font-mono text-xs text-slate-500">
                  <ScreeningVariantsCollapsible info={screeningResults.transliterationInfo} />
                </div>
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
                Assessment / lists checked:{" "}
                <span className="font-data font-semibold text-slate-900">{screeningResults.bestMatch}</span>
              </p>
              {screeningResults.remote ? (
                <div className="mt-3 space-y-1 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-700 font-body">
                  <p>
                    <span className="font-semibold text-slate-500">Recommended action:</span>{" "}
                    {screeningResults.remote.action}
                  </p>
                  <p className="text-slate-600">{screeningResults.remote.reasoning}</p>
                </div>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600">
                    <th className="px-3 py-2 font-display">List</th>
                    <th className="px-3 py-2 font-display">Matched entity</th>
                    <th className="px-3 py-2 font-display">Status</th>
                    <th className="px-3 py-2 font-display">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {screeningResults.listHits.map((row) => (
                    <tr key={row.list} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/80">
                      <td className="px-3 py-2 font-medium text-slate-800">{row.list}</td>
                      <td className="px-3 py-2 font-data text-[11px] text-slate-900">{row.matchedEntity}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-slate-800 font-body">{row.statusLabel}</span>
                          <span
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-[10px] font-bold",
                              tierStyle(row.statusTier)
                            )}
                          >
                            {row.statusTier}
                          </span>
                        </div>
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
        ) : null}

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-sm font-bold font-display text-slate-900">AI Deep Analysis</h3>
          <p className="mt-1 text-xs text-slate-500 font-body">
            Contextual risk explanation and narrative reasoning — powered by Azure (GPT-4o). List screening above uses the
            live sanctions API; this step requests an additional narrative analysis.
          </p>

          <button
            type="button"
            disabled={aiLoading || !canRunAi || aiAnalysisComplete}
            onClick={() => void handleRunAI()}
            className={cn(
              "mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm transition-colors border",
              aiAnalysisComplete &&
                "cursor-not-allowed border-slate-200 bg-slate-100 font-semibold text-slate-400",
              !aiAnalysisComplete &&
                (aiLoading || !canRunAi) &&
                "cursor-not-allowed border-slate-200 bg-slate-50 font-semibold text-slate-400",
              !aiAnalysisComplete &&
                !aiLoading &&
                canRunAi &&
                "border-transparent bg-cyan-500 font-bold text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-400"
            )}
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={2} aria-hidden />
                <span>Analyzing with GPT-4o...</span>
              </>
            ) : aiAnalysisComplete ? (
              <>
                <CheckCircle className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                <span>Analysis Complete</span>
              </>
            ) : (
              "Run AI Deep Analysis"
            )}
          </button>

          {aiError && (
            <p className="mt-4 rounded-lg border border-cyan-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-body">
              {aiError}
            </p>
          )}

          {aiResults && aiResults.length > 0 && !(batchScreeningRows && batchScreeningRows.length > 0) && (
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
                        {aiAssessmentLabel(r.true_positive)}
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
                          aiActionSolidBadgeClasses(r.action)
                        )}
                      >
                        {actionU}
                      </span>
                    </div>
                    <div className="mt-5 rounded-lg border border-slate-200/90 bg-white/90 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI reasoning</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-800 font-body">{r.reasoning}</p>
                    </div>
                    {screeningResults?.transliterationInfo ? (
                      <div className="mt-3 flex gap-2 text-xs text-slate-500">
                        <Languages className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <ScreeningVariantsCollapsible info={screeningResults.transliterationInfo} />
                        </div>
                      </div>
                    ) : null}
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

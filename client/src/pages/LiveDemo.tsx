/*
 * LIVE DEMO — Pre-configured scenarios, professional compliance-style results (light panels on dark shell)
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Eye,
  Languages,
  ShieldAlert,
  Zap,
  Play,
  Loader2,
  WifiOff,
  FileText,
  Mail,
  CheckCircle,
  Printer,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

const AGENTS = [
  { id: "vision", label: "Vision Agent", Icon: Eye },
  { id: "translit", label: "Transliteration Agent", Icon: Languages },
  { id: "risk", label: "Risk Agent", Icon: ShieldAlert },
  { id: "action", label: "Action Agent", Icon: Zap },
] as const;

type ScenarioId = "ros" | "sch" | "sun";

type AgentPhase = "pending" | "processing" | "complete";

type RiskTier = "HIGH" | "MEDIUM" | "LOW";

type PipelineCopy = {
  visionProc: string;
  visionResult: string;
  translitProc: string;
  translitResult: string;
  riskProc: string;
  riskResult: string;
  actionProc: string;
  actionResult: string;
};

type DemoResult = {
  matchLine: string;
  matchSub?: string;
  score: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
  action: "BLOCK" | "APPROVE" | "REVIEW";
  breakdown: { name: number; country: number; amount: number; doc: number; cyrillic: number };
  analysis: string;
};

/** Per-list screening row for tables + PDF */
type ListScreeningRow = {
  list: string;
  matchedEntity: string;
  similarity: string;
  statusLabel: string;
  tier: RiskTier;
};

const SCENARIOS: Array<{
  id: ScenarioId;
  title: string;
  entity: string;
  entitySub?: string;
  country: string;
  amount: string;
  docType: string;
  riskBadge: "high" | "medium" | "low";
  pipeline: PipelineCopy;
  result: DemoResult;
  /** Optional per-list similarity % for screening table (defaults derived from score if omitted) */
  listSimilarities?: [number, number, number, number];
}> = [
  {
    id: "ros",
    title: "High Risk — Russian Defense Exporter",
    entity: "Rosoboronexport Trading",
    country: "Russia",
    amount: "$750K",
    docType: "Invoice",
    riskBadge: "high",
    pipeline: {
      visionProc: "Extracting entities from document...",
      visionResult: "Found: Rosoboronexport Trading, Russia, $750K, Invoice",
      translitProc: "Generating Cyrillic variants...",
      translitResult: "Рособоронэкспорт → Rosoboroneksport, Rosoboronexport",
      riskProc: "Screening against 45,296 sanctions entities...",
      riskResult: "Match: ROSOBORONEXPORT (OFAC SDN) — 97% similarity",
      actionProc: "Preparing compliance assessment...",
      actionResult: "Action: BLOCK — Immediate review required",
    },
    result: {
      matchLine: "ROSOBORONEXPORT",
      matchSub: "from OFAC SDN",
      score: 97,
      risk: "HIGH",
      action: "BLOCK",
      breakdown: { name: 99, country: 96, amount: 62, doc: 74, cyrillic: 88 },
      analysis:
        "Direct match to Russian state arms exporter. Entity is listed on OFAC SDN, EU Consolidated, and UN Security Council lists.",
    },
  },
  {
    id: "sch",
    title: "Medium Risk — Cyrillic Evasion Detection",
    entity: "Shcherbakov Import Export",
    entitySub: "Щербаков Импорт Экспорт",
    country: "Turkey",
    amount: "$180K",
    docType: "Bill of Lading",
    riskBadge: "medium",
    listSimilarities: [58, 54, 47, 44],
    pipeline: {
      visionProc: "Extracting entities from document...",
      visionResult: "Found: Shcherbakov Import Export, Turkey, $180K, Bill of Lading",
      translitProc: "Generating Cyrillic variants...",
      translitResult: "Variants: Ščerbakov, Shcherbakov, Scherbakov, Щербаков",
      riskProc: "Screening against 45,296 sanctions entities...",
      riskResult: "Possible link: SHCHERBAKOV DEFENSE SYSTEMS (OFAC SDN) — ambiguous / partial similarity",
      actionProc: "Preparing compliance assessment...",
      actionResult: "REVIEW — Possible false positive; manual adjudication required",
    },
    result: {
      matchLine: "SHCHERBAKOV DEFENSE SYSTEMS (possible)",
      matchSub: "Partial / ambiguous match — not conclusive",
      score: 52,
      risk: "MEDIUM",
      action: "REVIEW",
      breakdown: { name: 58, country: 55, amount: 48, doc: 52, cyrillic: 61 },
      analysis:
        "Transliteration produces a partial fuzzy match to a listed defense-sector entity, but the legal name, jurisdiction, and transaction context differ from typical true-positive profiles. Treat as ambiguous: escalate for analyst review rather than automated block. Document rationale and obtain secondary approval before clearing or rejecting.",
    },
  },
  {
    id: "sun",
    title: "Low Risk — Clean Vendor",
    entity: "Sunny Day Flowers Co",
    country: "Colombia",
    amount: "$12K",
    docType: "Invoice",
    riskBadge: "low",
    pipeline: {
      visionProc: "Extracting entities from document...",
      visionResult: "Found: Sunny Day Flowers Co, Colombia, $12K, Invoice",
      translitProc: "Generating Cyrillic variants...",
      translitResult: "No Cyrillic detected — skipping",
      riskProc: "Screening against 45,296 sanctions entities...",
      riskResult: "No matches found across 4 lists",
      actionProc: "Preparing compliance assessment...",
      actionResult: "APPROVE — Standard due diligence sufficient",
    },
    result: {
      matchLine: "No match found",
      score: 26,
      risk: "LOW",
      action: "APPROVE",
      breakdown: { name: 22, country: 18, amount: 35, doc: 40, cyrillic: 15 },
      analysis:
        "No sanctions matches found. Common business name in low-risk jurisdiction. Standard due diligence sufficient.",
    },
  },
];

/** Phase 1 — name variants shown before list screening (per scenario) */
const NAME_VARIANT_META: Record<
  ScenarioId,
  { rows: { text: string; label: string }[]; summaryCount: number | null; summary: string }
> = {
  ros: {
    summaryCount: 7,
    summary: "variants generated — now screening all against 45,296 entities across 4 lists…",
    rows: [
      { text: "Рособоронэкспорт", label: "Original Cyrillic" },
      { text: "Rosoboronexport", label: "ISO 9" },
      { text: "Rosoboroneksport", label: "ICAO" },
      { text: "Rosoboroneksport", label: "BGN/PCGN" },
      { text: "Rosoboroneksport", label: "Informal" },
      { text: "ROSOBORONEXPORT", label: "Uppercase" },
      { text: "ROSOBORONEKSPORT", label: "Uppercase variant" },
    ],
  },
  sch: {
    summaryCount: 8,
    summary: "variants generated — now screening all against 45,296 entities across 4 lists…",
    rows: [
      { text: "Щербаков Импорт Экспорт", label: "Original Cyrillic" },
      { text: "Shcherbakov", label: "ISO 9" },
      { text: "Ščerbakov", label: "ICAO" },
      { text: "Scherbakov", label: "BGN/PCGN" },
      { text: "Sherbakov", label: "Informal" },
      { text: "SHCHERBAKOV", label: "Uppercase" },
      { text: "SCHERBAKOV", label: "Uppercase variant" },
      { text: "SHERBAKOV", label: "Uppercase informal" },
    ],
  },
  sun: {
    summaryCount: null,
    summary: "No Cyrillic detected — screening Latin name only against 45,296 entities…",
    rows: [{ text: "Sunny Day Flowers Co", label: "Original Latin" }],
  },
};

const VARIANT_GEN_MS = 1000;
const VARIANT_STAGGER_MS = 100;
const VARIANT_SUMMARY_PAUSE_MS = 500;
const VARIANT_TO_TABLE_MS = 350;

const AGENT_STEP_MS = 900;
const PIPELINE_TOTAL_MS = AGENT_STEP_MS * 4;
const FADE_DURATION = 0.3;
const ROW_STAGGER_MS = 420;
const PHASE2_PROCESS_MS = 1600;

/** Web Audio cues — only played when sound toggle is on */
type DemoSoundCue = "phase1" | "phase2" | "agentTick" | "verdictOk" | "verdictHigh";

function playWebAudioCue(ctx: AudioContext, cue: DemoSoundCue) {
  const t0 = ctx.currentTime;

  const tone = (freq: number, start: number, dur: number, type: OscillatorType, peak: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  };

  switch (cue) {
    case "phase1":
      tone(1040, t0, 0.2, "sine", 0.13);
      break;
    case "phase2":
      tone(740, t0, 0.22, "triangle", 0.11);
      break;
    case "agentTick":
      tone(1560, t0, 0.045, "sine", 0.055);
      break;
    case "verdictOk":
      tone(523.25, t0, 0.1, "sine", 0.09);
      tone(659.25, t0 + 0.09, 0.12, "sine", 0.095);
      break;
    case "verdictHigh":
      tone(165, t0, 0.26, "triangle", 0.1);
      break;
    default:
      break;
  }
}

/** Shared table look in PDF preview + print (class `rpt` styled in print window CSS) */
const PDF_TABLE_CLASS =
  "rpt w-full table-fixed border-collapse border-2 border-slate-400 text-[0.8125rem] [&_th]:border [&_td]:border [&_th]:border-slate-400 [&_td]:border-slate-400 [&_th]:px-3 [&_td]:px-3 [&_th]:py-2.5 [&_td]:py-2.5 [&_thead_th]:bg-slate-800 [&_thead_th]:py-3 [&_thead_th]:text-left [&_thead_th]:text-xs [&_thead_th]:font-bold [&_thead_th]:uppercase [&_thead_th]:tracking-wide [&_thead_th]:text-slate-50 [&_tbody_tr:nth-child(even)]:bg-slate-50 [&_tbody_th]:w-[34%] [&_tbody_th]:bg-slate-200 [&_tbody_th]:text-left [&_tbody_th]:font-semibold [&_tbody_td]:align-top";

/* ---- Risk tier (aligned with public demo: ≥85 HIGH, 50–84 MEDIUM, <50 LOW) ---- */
function riskTierFromScore(score: number): RiskTier {
  if (score >= 85) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

function tierBadgeClass(tier: RiskTier): string {
  switch (tier) {
    case "HIGH":
      return "bg-red-100 text-red-900 border-red-300";
    case "MEDIUM":
      return "bg-amber-100 text-amber-950 border-amber-300";
    default:
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
  }
}

function tierCellClass(tier: RiskTier): string {
  switch (tier) {
    case "HIGH":
      return "bg-red-50 text-red-900 font-semibold";
    case "MEDIUM":
      return "bg-amber-50 text-amber-950 font-semibold";
    default:
      return "bg-emerald-50 text-emerald-900 font-semibold";
  }
}

function tierVerdictBox(tier: RiskTier): string {
  switch (tier) {
    case "HIGH":
      return "border-red-300 bg-red-50 text-red-950";
    case "MEDIUM":
      return "border-amber-300 bg-amber-50 text-amber-950";
    default:
      return "border-emerald-300 bg-emerald-50 text-emerald-950";
  }
}

function statusFromSimilarity(sim: number): { statusLabel: string; tier: RiskTier } {
  if (sim >= 85) return { statusLabel: "High match", tier: "HIGH" };
  if (sim >= 50) return { statusLabel: "Partial match", tier: "MEDIUM" };
  return { statusLabel: "No match", tier: "LOW" };
}

function getListScreeningRows(scenario: (typeof SCENARIOS)[number]): ListScreeningRow[] {
  const { result, entity } = scenario;
  const lists = ["OFAC SDN", "EU Consolidated", "UN Security Council", "UK OFSI"] as const;
  const isClear = result.matchLine === "No match found";

  if (isClear) {
    return lists.map((list) => ({
      list,
      matchedEntity: entity,
      similarity: "—",
      statusLabel: "No match",
      tier: "LOW" as RiskTier,
    }));
  }

  return lists.map((list, i) => {
    const sim = scenario.listSimilarities
      ? scenario.listSimilarities[i]
      : i === 0
        ? result.score
        : Math.max(result.score - i * 3, 78);
    const { statusLabel, tier } = statusFromSimilarity(sim);
    return {
      list,
      matchedEntity: result.matchLine,
      similarity: `${sim}%`,
      statusLabel,
      tier,
    };
  });
}

function getAgentCopy(pipeline: PipelineCopy, index: 0 | 1 | 2 | 3): { proc: string; result: string } {
  const map: Record<number, [keyof PipelineCopy, keyof PipelineCopy]> = {
    0: ["visionProc", "visionResult"],
    1: ["translitProc", "translitResult"],
    2: ["riskProc", "riskResult"],
    3: ["actionProc", "actionResult"],
  };
  const [pk, rk] = map[index];
  return { proc: pipeline[pk], result: pipeline[rk] };
}

function initialPhases(): AgentPhase[] {
  return ["pending", "pending", "pending", "pending"];
}

function RiskCapsBadge({ level }: { level: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-display uppercase tracking-widest",
        level === "high" && "border-red-300 bg-red-100 text-red-800",
        level === "medium" && "border-amber-300 bg-amber-100 text-amber-950",
        level === "low" && "border-emerald-300 bg-emerald-100 text-emerald-800"
      )}
    >
      {level === "high" ? "HIGH RISK" : level === "medium" ? "MEDIUM RISK" : "LOW RISK"}
    </span>
  );
}

function ScoreBreakdownBars({
  breakdown,
  composite,
  cyrillicApplicable,
}: {
  breakdown: DemoResult["breakdown"];
  composite: number;
  cyrillicApplicable: boolean;
}) {
  const rows: { label: string; value: number; key: string }[] = [
    { label: "Name match", value: breakdown.name, key: "name" },
    { label: "Country risk", value: breakdown.country, key: "country" },
    { label: "Amount pattern", value: breakdown.amount, key: "amount" },
    { label: "Document signal", value: breakdown.doc, key: "doc" },
    { label: "Cyrillic match", value: breakdown.cyrillic, key: "cyrillic" },
  ];

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-500">Score breakdown</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-600">Total composite</span>
          <span className="font-data text-lg font-extrabold text-slate-900">{composite}/100</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-3">
        {rows.map((row) => {
          const isCyrillic = row.key === "cyrillic";
          if (isCyrillic && !cyrillicApplicable) {
            return (
              <div
                key={row.key}
                className="min-w-0 flex-1 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-2 text-center text-[10px] text-slate-500 font-body lg:max-w-[120px]"
              >
                <span className="font-semibold text-slate-600">Cyrillic</span>
                <p className="mt-1">N/A</p>
              </div>
            );
          }
          return (
            <div key={row.key} className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-1 text-[10px] font-medium text-slate-800 font-body">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 font-data font-semibold text-slate-900">{row.value}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-700 transition-all duration-500"
                  style={{ width: `${Math.min(100, row.value)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypingText({ text, active }: { text: string; active: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    setN(0);
    const ms = Math.max(12, Math.min(22, Math.floor(500 / Math.max(text.length, 1))));
    let idx = 0;
    const id = window.setInterval(() => {
      idx += 1;
      setN(Math.min(idx, text.length));
      if (idx >= text.length) window.clearInterval(id);
    }, ms);
    return () => window.clearInterval(id);
  }, [text, active]);

  if (!active) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="mt-2 min-h-[2.75rem] break-words text-left text-[11px] leading-relaxed text-slate-700 font-body"
    >
      {text.slice(0, n)}
      {n < text.length ? <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-cyan-600" /> : null}
    </motion.p>
  );
}

function ResultDetailText({ text, show }: { text: string; show: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!show) {
      setN(0);
      return;
    }
    setN(0);
    const ms = 10;
    let idx = 0;
    const id = window.setInterval(() => {
      idx += 1;
      setN(Math.min(idx, text.length));
      if (idx >= text.length) window.clearInterval(id);
    }, ms);
    return () => window.clearInterval(id);
  }, [text, show]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: FADE_DURATION, ease: "easeOut" }}
      className="mt-2 flex items-start gap-2 text-left"
    >
      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
      <p className="break-words text-[11px] leading-relaxed text-slate-800 font-body">
        {text.slice(0, n)}
        {n < text.length ? <span className="text-emerald-600/80">|</span> : null}
      </p>
    </motion.div>
  );
}

function StepIndicator({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  const steps = [
    { n: 1 as const, label: "Screening" },
    { n: 2 as const, label: "AI Analysis" },
    { n: 3 as const, label: "Document Scan" },
  ];
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-3 text-[10px] font-display font-bold uppercase tracking-wider sm:gap-2 sm:text-[11px]">
      {steps.map((s, i) => (
        <span key={s.n} className="flex items-center gap-1 sm:gap-2">
          {i > 0 && <span className="text-slate-400">→</span>}
          <span
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors duration-300",
              activeStep === s.n
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-500"
            )}
          >
            Step {s.n}: {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}

function NameVariantGenerationBlock({
  scenarioId,
  genLoading,
  revealed,
  showSummary,
  showScreeningLine,
  screeningLineComplete,
}: {
  scenarioId: ScenarioId;
  genLoading: boolean;
  revealed: number;
  showSummary: boolean;
  showScreeningLine: boolean;
  screeningLineComplete: boolean;
}) {
  const meta = NAME_VARIANT_META[scenarioId];

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/90 to-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Name Variant Generation</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600 font-body">
        This step shows why this system can find matches others miss — it generates every likely spelling before
        screening. That is the key differentiator.
      </p>

      {genLoading && (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-800 font-body">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-600" strokeWidth={2} />
          <span>Generating name variants…</span>
        </div>
      )}

      {!genLoading && revealed > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {meta.rows.slice(0, revealed).map((row, i) => (
            <motion.li
              key={`${scenarioId}-${row.text}-${row.label}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
            >
              <span className="min-w-0 flex-1 break-words font-data text-[13px] font-semibold text-slate-900">{row.text}</span>
              <span className="shrink-0 rounded-md border border-slate-200/90 bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                {row.label}
              </span>
            </motion.li>
          ))}
        </ul>
      )}

      {showSummary && !genLoading && (
        <p className="mt-4 text-sm leading-relaxed text-slate-700 font-body">
          {meta.summaryCount != null ? (
            <>
              <span className="font-data text-lg font-extrabold tabular-nums text-cyan-600">{meta.summaryCount}</span>
              <span>{` ${meta.summary}`}</span>
            </>
          ) : (
            <span>{meta.summary}</span>
          )}
        </p>
      )}

      {showScreeningLine && !genLoading && (
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-800 font-body">
          {screeningLineComplete ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-700" strokeWidth={2} />
          )}
          <span>Screening all variants…</span>
        </div>
      )}
    </div>
  );
}

function AgentPipeline({
  progress,
  phases,
  pipeline,
  containerRef,
}: {
  progress: number;
  phases: AgentPhase[];
  pipeline: PipelineCopy;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={containerRef} className="mt-4 space-y-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-700 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Single horizontal row — 4 agents across full width (stacks on small screens) */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((agent, i) => {
          const { Icon, label } = agent;
          const phase = phases[i] ?? "pending";
          const { proc, result } = getAgentCopy(pipeline, i as 0 | 1 | 2 | 3);
          const isProcessing = phase === "processing";
          const isComplete = phase === "complete";
          const isPending = phase === "pending";

          return (
            <div
              key={agent.id}
              className={cn(
                "flex min-h-[200px] min-w-0 w-full flex-col rounded-xl border-2 border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow duration-300",
                isProcessing &&
                  "border-cyan-500 shadow-md ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-white animate-pulse",
                isComplete && "border-emerald-400 bg-emerald-50/40",
                isPending && "border-slate-200 bg-slate-50 opacity-90"
              )}
            >
              <div className="flex items-start gap-2 border-b border-slate-200 pb-2">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                    isProcessing && "border-cyan-300 bg-cyan-50",
                    isComplete && "border-emerald-300 bg-emerald-100",
                    isPending && "border-slate-200 bg-white"
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-700" strokeWidth={2} />
                  ) : isComplete ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                  ) : (
                    <Icon className="h-5 w-5 text-slate-400" strokeWidth={2} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight text-slate-900 font-display">{label}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                    {isProcessing ? "Processing" : isComplete ? "Complete" : "Pending"}
                  </p>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden pt-2">
                <TypingText text={proc} active={isProcessing} />
                <ResultDetailText text={result} show={isComplete} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatAuditId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `SCR-2026-${n}`;
}

function PdfReportModal({
  open,
  onClose,
  scenario,
  result,
  listRows,
  auditId,
  generatedAt,
}: {
  open: boolean;
  onClose: () => void;
  scenario: (typeof SCENARIOS)[number];
  result: DemoResult;
  listRows: ListScreeningRow[];
  auditId: string;
  generatedAt: string;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const tier = riskTierFromScore(result.score);

  const exec = useMemo(() => {
    const blocked = result.action === "BLOCK" ? 1 : 0;
    const approved = result.action === "APPROVE" ? 1 : 0;
    const review = result.action === "REVIEW" ? 1 : 0;
    const flagged = tier === "MEDIUM" && result.action !== "REVIEW" ? 1 : 0;
    return { total: 1, blocked, flagged, approved, review };
  }, [result.action, tier]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w || !printRef.current) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Screening Report</title>
      <style>
        body { font-family: ui-sans-serif, system-ui, sans-serif; color: #0f172a; padding: 2rem; max-width: 900px; margin: 0 auto; line-height: 1.5; }
        .banner { background: #fef3c7; border: 1px solid #f59e0b; padding: 0.75rem 1rem; font-size: 0.75rem; margin-bottom: 1.5rem; border-radius: 4px; }
        h1 { font-size: 1.35rem; margin: 0 0 0.25rem 0; }
        .sub { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
        h2 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 1.25rem 0 0.5rem 0; }
        table.rpt { width: 100%; border-collapse: collapse; font-size: 0.8125rem; margin-top: 0.5rem; border: 2px solid #cbd5e1; }
        table.rpt th, table.rpt td { border: 1px solid #94a3b8; padding: 0.65rem 0.85rem; vertical-align: top; }
        table.rpt thead th { background: #1e293b; color: #f8fafc; font-weight: 700; text-align: left; }
        table.rpt thead th.num { text-align: right; }
        table.rpt tbody tr:nth-child(even) { background: #f8fafc; }
        table.rpt tbody tr:nth-child(odd) { background: #ffffff; }
        table.rpt tbody th { background: #e2e8f0; font-weight: 600; text-align: left; width: 32%; }
        table.rpt .num { text-align: right; font-variant-numeric: tabular-nums; }
        table.rpt .text { text-align: left; }
        .tier-h { background: #fee2e2 !important; color: #991b1b; font-weight: 600; }
        .tier-m { background: #fef3c7 !important; color: #92400e; font-weight: 600; }
        .tier-l { background: #d1fae5 !important; color: #065f46; font-weight: 600; }
        .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.7rem; color: #64748b; }
      </style></head><body>${printRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  if (!open) return null;

  const actionExplanation =
    result.action === "BLOCK"
      ? "Score meets automated block threshold (≥85). Escalate to compliance and freeze pending transactions per policy."
      : result.action === "REVIEW"
        ? "Composite score in the medium band (50–84). Ambiguous or partial name match — requires analyst review and documented disposition before clearing or blocking."
        : "Score below flag threshold. Standard due diligence and documentation are sufficient for this demo scenario.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: FADE_DURATION }}
        className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-8 text-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div ref={printRef} className="text-black">
          <h1 className="font-display text-xl font-extrabold leading-tight">
            TradeScreen AI — Academic Research Demo — Screening Report
          </h1>
          <p className="sub mt-2 text-sm text-slate-600">
            Generated {generatedAt} · Reference <span className="font-data font-semibold">{auditId}</span>
          </p>

          <div className="banner rounded-md text-amber-950">
            <strong>Academic disclaimer:</strong> This report is produced by a research prototype for educational use
            only. It is not a commercial compliance system and does not constitute legal advice. Verify all results with
            qualified compliance staff and official sanctions sources.
          </div>

          <h2>Executive summary</h2>
          <table className={PDF_TABLE_CLASS}>
            <tbody>
              <tr>
                <th>Total screened (session)</th>
                <td className="num">{exec.total}</td>
              </tr>
              <tr>
                <th>Blocked (high risk)</th>
                <td className="num">{exec.blocked}</td>
              </tr>
              <tr>
                <th>Flagged (medium)</th>
                <td className="num">{exec.flagged}</td>
              </tr>
              <tr>
                <th>Pending manual review</th>
                <td className="num">{exec.review}</td>
              </tr>
              <tr>
                <th>Approved / clear</th>
                <td className="num">{exec.approved}</td>
              </tr>
            </tbody>
          </table>

          <h2>Vendor details</h2>
          <table className={PDF_TABLE_CLASS}>
            <tbody>
              <tr>
                <th>Vendor name</th>
                <td className="text">{scenario.entity}</td>
              </tr>
              {scenario.entitySub && (
                <tr>
                  <th>Cyrillic / alternate</th>
                  <td className="text">{scenario.entitySub}</td>
                </tr>
              )}
              <tr>
                <th>Country</th>
                <td className="text">{scenario.country}</td>
              </tr>
              <tr>
                <th>Amount</th>
                <td className="num">{scenario.amount}</td>
              </tr>
              <tr>
                <th>Document type</th>
                <td className="text">{scenario.docType}</td>
              </tr>
            </tbody>
          </table>

          <h2>Full screening results (4 lists)</h2>
          <table className={PDF_TABLE_CLASS}>
            <thead>
              <tr>
                <th className="w-[22%]">List name</th>
                <th className="w-[38%]">Screened name</th>
                <th className="num w-[14%] text-right">Similarity %</th>
                <th className="w-[26%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {listRows.map((r) => (
                <tr key={r.list}>
                  <td className="text">{r.list}</td>
                  <td className="text font-mono text-[0.8rem]">{r.matchedEntity}</td>
                  <td className="num">{r.similarity}</td>
                  <td className={r.tier === "HIGH" ? "tier-h" : r.tier === "MEDIUM" ? "tier-m" : "tier-l"}>
                    {r.statusLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Score breakdown</h2>
          <table className={PDF_TABLE_CLASS}>
            <tbody>
              <tr>
                <th>Name match</th>
                <td className="num">{result.breakdown.name}%</td>
              </tr>
              <tr>
                <th>Country risk</th>
                <td className="num">{result.breakdown.country}%</td>
              </tr>
              <tr>
                <th>Amount pattern</th>
                <td className="num">{result.breakdown.amount}%</td>
              </tr>
              <tr>
                <th>Document signal</th>
                <td className="num">{result.breakdown.doc}%</td>
              </tr>
              <tr>
                <th>Cyrillic match</th>
                <td className="num">{scenario.entitySub ? `${result.breakdown.cyrillic}%` : "N/A"}</td>
              </tr>
              <tr>
                <th>Total composite</th>
                <td className="num">
                  <strong>{result.score}/100</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <h2>AI analysis</h2>
          <p className="text-sm leading-relaxed">{result.analysis}</p>

          <h2>Recommended action</h2>
          <p className="text-sm">
            <strong>{result.action}</strong> ({result.risk} risk). {actionExplanation}
          </p>

          <h2>Audit trail</h2>
          <table className={PDF_TABLE_CLASS}>
            <tbody>
              <tr>
                <th>Screening ID</th>
                <td className="text font-mono">{auditId}</td>
              </tr>
              <tr>
                <th>Timestamp (UTC)</th>
                <td className="text font-mono">{generatedAt}</td>
              </tr>
              <tr>
                <th>Engine</th>
                <td className="text">TradeScreen AI — Live Demo (cached)</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-6 text-xs leading-relaxed text-slate-600">
            <strong>Compliance disclaimer:</strong> Sanctions lists change frequently. This export reflects demo data
            only. Always cross-check against official OFAC, EU, UN, and UK OFSI publications before taking regulatory
            action.
          </p>

          <div className="footer">
            TradeScreen AI — MBA Information &amp; Technology Management Systems — Atlantis University, Miami FL.
            Research prototype.
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" strokeWidth={2} />
            Print Report
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function EmailModal({
  open,
  onClose,
  scenario,
  result,
  listRows,
  auditId,
  generatedAt,
}: {
  open: boolean;
  onClose: () => void;
  scenario: (typeof SCENARIOS)[number];
  result: DemoResult;
  listRows: ListScreeningRow[];
  auditId: string;
  generatedAt: string;
}) {
  const subject = `Sanctions screening summary — ${scenario.entity} [${auditId}]`;
  const tier = riskTierFromScore(result.score);

  const body = `Dear Compliance Team,

Please find below the sanctions screening summary for your review. This message is a demo draft only; no email has been sent.

────────────────────────────────────
VENDOR DETAILS
────────────────────────────────────
Legal name: ${scenario.entity}
${scenario.entitySub ? `Cyrillic / alternate: ${scenario.entitySub}\n` : ""}Country: ${scenario.country}
Transaction amount: ${scenario.amount}
Document type: ${scenario.docType}

────────────────────────────────────
SCREENING RESULTS (4 LISTS)
────────────────────────────────────
${listRows.map((r) => `${r.list}: ${r.matchedEntity} | Similarity: ${r.similarity} | ${r.statusLabel} (${r.tier})`).join("\n")}

────────────────────────────────────
RISK & SCORE
────────────────────────────────────
Composite score: ${result.score}/100
Risk tier: ${tier}
System recommendation: ${result.action}

────────────────────────────────────
ANALYSIS SUMMARY
────────────────────────────────────
${result.analysis}

────────────────────────────────────
DISCLAIMER
────────────────────────────────────
This communication was generated by TradeScreen AI (academic research prototype). It does not constitute legal or compliance advice. Verify all matches against official sanctions sources and internal policy before acting.

Audit reference: ${auditId}
Timestamp: ${generatedAt}

Respectfully,
TradeScreen AI — Demo Export`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: FADE_DURATION }}
        className="relative z-10 flex h-[min(92vh,720px)] min-h-[500px] w-full min-w-0 max-w-[min(100vw-2rem,880px)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:min-w-[600px]"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-slate-200 px-8 pb-4 pt-8 pr-14">
          <h2 className="font-display text-lg font-bold text-slate-900">Email to bank (draft preview)</h2>
          <p className="mt-1 text-sm text-slate-600">Demo only — no message is sent. Professional business format.</p>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-white px-8 py-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</label>
            <p className="mt-1.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900">
              {subject}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Message</label>
            <pre className="mt-1.5 min-h-[280px] whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-5 text-left text-sm leading-relaxed text-slate-800 font-body">
              {body}
            </pre>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 bg-white px-8 py-5">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(`Subject: ${subject}\n\n${body}`);
            }}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Copy to clipboard
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  playCue,
}: {
  scenario: (typeof SCENARIOS)[number];
  playCue?: (cue: DemoSoundCue) => void;
}) {
  const [phase1, setPhase1] = useState<"idle" | "running" | "complete">("idle");
  const [phase2, setPhase2] = useState<"locked" | "idle" | "running" | "complete">("locked");
  const [phase3, setPhase3] = useState<"locked" | "idle" | "running" | "complete">("locked");
  const [screeningSpinner, setScreeningSpinner] = useState(false);
  const [showScreeningComplete, setShowScreeningComplete] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [variantGenLoading, setVariantGenLoading] = useState(false);
  const [variantRevealedCount, setVariantRevealedCount] = useState(0);
  const [variantShowSummary, setVariantShowSummary] = useState(false);
  const [variantShowScreeningLine, setVariantShowScreeningLine] = useState(false);
  const [showPhase1Table, setShowPhase1Table] = useState(false);
  const [analysisExpanded, setAnalysisExpanded] = useState(false);

  const [agentProgress, setAgentProgress] = useState(0);
  const [phases, setPhases] = useState<AgentPhase[]>(() => initialPhases());
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const agentsWrapRef = useRef<HTMLDivElement>(null);
  const prevProcessingIndex = useRef<number>(-1);
  const prevSoundPhasesRef = useRef<AgentPhase[] | null>(null);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [auditId, setAuditId] = useState(() => formatAuditId());
  const [reportStamp, setReportStamp] = useState(() => new Date().toISOString());

  const listRows = useMemo(() => getListScreeningRows(scenario), [scenario]);
  const resultTier = scenario.result.risk as RiskTier;
  const cyrillicApplicable = Boolean(scenario.entitySub);

  const clearTimers = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const runAgentPipeline = useCallback(() => {
    clearTimers();
    stopRaf();
    setAgentProgress(0);
    setPhases(["processing", "pending", "pending", "pending"]);
    startRef.current = performance.now();

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeoutIdsRef.current.push(id);
    };

    schedule(() => setPhases(["complete", "processing", "pending", "pending"]), AGENT_STEP_MS);
    schedule(() => setPhases(["complete", "complete", "processing", "pending"]), AGENT_STEP_MS * 2);
    schedule(() => setPhases(["complete", "complete", "complete", "processing"]), AGENT_STEP_MS * 3);
    schedule(() => {
      setPhases(["complete", "complete", "complete", "complete"]);
      setAgentProgress(100);
      setPhase3("complete");
      const vCue: DemoSoundCue = scenario.result.risk === "HIGH" ? "verdictHigh" : "verdictOk";
      const idVerdict = window.setTimeout(() => playCue?.(vCue), 140);
      timeoutIdsRef.current.push(idVerdict);
    }, AGENT_STEP_MS * 4);

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(100, (elapsed / PIPELINE_TOTAL_MS) * 100);
      setAgentProgress(p);
      if (elapsed < PIPELINE_TOTAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [clearTimers, stopRaf, playCue, scenario.result.risk]);

  useEffect(
    () => () => {
      stopRaf();
      clearTimers();
    },
    [stopRaf, clearTimers]
  );

  useEffect(() => {
    if (!playCue || phase3 !== "running") {
      if (phase3 === "idle" || phase3 === "locked") prevSoundPhasesRef.current = null;
      return;
    }
    const prev = prevSoundPhasesRef.current;
    if (prev) {
      phases.forEach((p, i) => {
        if (p === "complete" && prev[i] !== "complete") playCue("agentTick");
      });
    }
    prevSoundPhasesRef.current = [...phases];
  }, [phases, phase3, playCue]);

  /* Auto-scroll when agents advance so the user sees each step */
  useEffect(() => {
    if (phase3 !== "running") return;
    const idx = phases.findIndex((p) => p === "processing");
    if (idx === -1) return;
    if (idx !== prevProcessingIndex.current) {
      prevProcessingIndex.current = idx;
      requestAnimationFrame(() => {
        agentsWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }, [phase3, phases]);

  useEffect(() => {
    if (phase3 === "running" || phase3 === "complete") {
      requestAnimationFrame(() => {
        agentsWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }, [phase3]);

  const resetDemo = () => {
    stopRaf();
    clearTimers();
    setPhase1("idle");
    setPhase2("locked");
    setPhase3("locked");
    setScreeningSpinner(false);
    setShowScreeningComplete(false);
    setVisibleRows(0);
    setVariantGenLoading(false);
    setVariantRevealedCount(0);
    setVariantShowSummary(false);
    setVariantShowScreeningLine(false);
    setShowPhase1Table(false);
    setAnalysisExpanded(false);
    setAgentProgress(0);
    setPhases(initialPhases());
    prevProcessingIndex.current = -1;
    prevSoundPhasesRef.current = null;
    setAuditId(formatAuditId());
  };

  const runPhase1 = () => {
    clearTimers();
    setShowScreeningComplete(false);
    setVisibleRows(0);
    setPhase1("running");
    setVariantGenLoading(true);
    setVariantRevealedCount(0);
    setVariantShowSummary(false);
    setVariantShowScreeningLine(false);
    setShowPhase1Table(false);
    setScreeningSpinner(false);

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeoutIdsRef.current.push(id);
    };

    const meta = NAME_VARIANT_META[scenario.id];
    const n = meta.rows.length;

    schedule(() => setVariantGenLoading(false), VARIANT_GEN_MS);
    for (let i = 0; i < n; i++) {
      schedule(() => setVariantRevealedCount(i + 1), VARIANT_GEN_MS + i * VARIANT_STAGGER_MS);
    }
    const tSummary = VARIANT_GEN_MS + (n - 1) * VARIANT_STAGGER_MS + 120;
    schedule(() => setVariantShowSummary(true), tSummary);
    const tScreening = tSummary + VARIANT_SUMMARY_PAUSE_MS;
    schedule(() => setVariantShowScreeningLine(true), tScreening);
    const tTable = tScreening + VARIANT_TO_TABLE_MS;
    schedule(() => {
      setShowPhase1Table(true);
      setScreeningSpinner(true);
      listRows.forEach((_, i) => {
        const id = setTimeout(() => setVisibleRows(i + 1), (i + 1) * ROW_STAGGER_MS);
        timeoutIdsRef.current.push(id);
      });
      const rowsDoneMs = listRows.length * ROW_STAGGER_MS + 200;
      const idStop = setTimeout(() => {
        setScreeningSpinner(false);
        setShowScreeningComplete(true);
      }, rowsDoneMs);
      timeoutIdsRef.current.push(idStop);
      const idComplete = setTimeout(() => {
        setPhase1("complete");
        setPhase2("idle");
        playCue?.("phase1");
      }, rowsDoneMs + 550);
      timeoutIdsRef.current.push(idComplete);
    }, tTable);
  };

  const runPhase2 = () => {
    setPhase2("running");
    const id = setTimeout(() => {
      setPhase2("complete");
      setPhase3("idle");
      playCue?.("phase2");
    }, PHASE2_PROCESS_MS);
    timeoutIdsRef.current.push(id);
  };

  const runPhase3 = () => {
    prevProcessingIndex.current = -1;
    prevSoundPhasesRef.current = null;
    setPhase3("running");
    runAgentPipeline();
  };

  const openPdf = () => {
    setReportStamp(new Date().toISOString());
    setPdfOpen(true);
  };

  const openEmail = () => {
    setReportStamp(new Date().toISOString());
    setEmailOpen(true);
  };

  const activeStep: 1 | 2 | 3 =
    phase3 !== "locked" ? 3 : phase2 !== "locked" ? 2 : 1;

  const showDemoPanel = phase1 !== "idle" || phase2 !== "locked" || phase3 !== "locked";

  const lightPanel = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

  return (
    <motion.article
      layout
      className="flex w-full min-w-0 max-w-full flex-col rounded-xl border border-slate-700/80 bg-slate-900/95 p-6 text-left shadow-lg shadow-black/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold font-display leading-snug text-white">{scenario.title}</h3>
          <p className="mt-2 text-sm font-medium text-slate-200 font-body">{scenario.entity}</p>
          {scenario.entitySub && <p className="mt-0.5 text-xs text-slate-400 font-body">{scenario.entitySub}</p>}
          <p className="mt-2 text-xs text-slate-500 font-body">
            {scenario.country} · {scenario.amount} · {scenario.docType}
          </p>
        </div>
        <RiskCapsBadge level={scenario.riskBadge} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={resetDemo}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white"
        >
          Reset demo
        </button>
      </div>

      {phase1 === "idle" && (
        <button
          type="button"
          onClick={runPhase1}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold font-display sm:w-auto sm:px-8",
            "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25",
            "transition-colors duration-200 hover:from-cyan-400 hover:to-teal-400"
          )}
        >
          <Play className="h-4 w-4 fill-current" strokeWidth={2} />
          Run Demo
        </button>
      )}

      {phase1 === "running" && (
        <div
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 py-3 text-sm font-bold text-slate-400 sm:w-auto sm:px-8"
          aria-disabled
        >
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          Screening in progress…
        </div>
      )}

      {phase1 === "complete" && phase2 === "idle" && (
        <button
          type="button"
          onClick={runPhase2}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold font-display sm:w-auto sm:px-8",
            "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25",
            "transition-colors duration-200 hover:from-cyan-400 hover:to-teal-400"
          )}
        >
          Run AI Deep Analysis
        </button>
      )}

      {phase2 === "running" && (
        <div
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 py-3 text-sm font-bold text-slate-400 sm:w-auto sm:px-8"
          aria-disabled
        >
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          Analyzing…
        </div>
      )}

      {phase2 === "complete" && phase3 === "idle" && (
        <button
          type="button"
          onClick={runPhase3}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold font-display sm:w-auto sm:px-8",
            "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25",
            "transition-colors duration-200 hover:from-cyan-400 hover:to-teal-400"
          )}
        >
          Scan Document with AI
        </button>
      )}

      {phase3 === "running" && (
        <div
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 py-3 text-sm font-bold text-slate-400 sm:w-auto sm:px-8"
          aria-disabled
        >
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          Scanning document…
        </div>
      )}

      <AnimatePresence mode="wait">
        {showDemoPanel && (
          <motion.div
            key="panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DURATION }}
            className={cn("mt-5 w-full min-w-0 max-w-full", lightPanel)}
          >
            <p className="mb-1 text-center text-[10px] font-bold font-display uppercase tracking-[0.2em] text-slate-500">
              {activeStep === 1 && "Sanctions list screening"}
              {activeStep === 2 && "AI deep analysis"}
              {activeStep === 3 && "AI document scanner"}
            </p>
            <StepIndicator activeStep={activeStep} />

            <AnimatePresence mode="wait">
              {phase1 !== "idle" && (
                <motion.div
                  key="p1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: FADE_DURATION }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: phase1 === "running" || phase1 === "complete" ? 1 : 0 }}
                    transition={{ duration: FADE_DURATION }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vendor input</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{scenario.entity}</p>
                    {scenario.entitySub && (
                      <p className="text-xs text-slate-700 font-body">{scenario.entitySub}</p>
                    )}
                    <div className="mt-2 grid gap-2 text-xs text-slate-800 sm:grid-cols-3">
                      <div>
                        <span className="font-semibold text-slate-600">Country</span>
                        <p className="font-medium">{scenario.country}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Amount</span>
                        <p className="font-data font-medium">{scenario.amount}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Document</span>
                        <p className="font-medium">{scenario.docType}</p>
                      </div>
                    </div>
                  </motion.div>

                  <NameVariantGenerationBlock
                    scenarioId={scenario.id}
                    genLoading={variantGenLoading}
                    revealed={variantRevealedCount}
                    showSummary={variantShowSummary}
                    showScreeningLine={variantShowScreeningLine}
                    screeningLineComplete={showScreeningComplete || phase1 === "complete"}
                  />

                  {phase1 === "running" && screeningSpinner && showPhase1Table && visibleRows < listRows.length && (
                    <div className="flex items-center gap-2 text-sm text-slate-800">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-700" strokeWidth={2} />
                      <span>Screening lists…</span>
                    </div>
                  )}

                  <AnimatePresence>
                    {showScreeningComplete && (
                      <motion.p
                        key="done"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: FADE_DURATION }}
                        className="flex items-center gap-2 text-sm font-semibold text-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                        Screening Complete ✓
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {showPhase1Table && (
                    <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full min-w-0 table-fixed border-collapse text-left text-xs">
                        <colgroup>
                          <col className="w-[24%]" />
                          <col className="w-[36%]" />
                          <col className="w-[14%]" />
                          <col className="w-[26%]" />
                        </colgroup>
                        <thead>
                          <tr className="border-b-2 border-slate-300 bg-slate-100 text-[10px] uppercase tracking-wider text-slate-700">
                            <th className="px-3 py-3 text-left font-display">List name</th>
                            <th className="px-3 py-3 text-left font-display">Screened name</th>
                            <th className="px-3 py-3 text-right font-display tabular-nums">Similarity %</th>
                            <th className="px-3 py-3 text-left font-display">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-900">
                          {listRows.slice(0, visibleRows).map((row, i) => (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: FADE_DURATION }}
                              className="border-b border-slate-200 odd:bg-white even:bg-slate-50"
                            >
                              <td className="px-3 py-2.5 align-top font-medium text-slate-800">{row.list}</td>
                              <td className="break-words px-3 py-2.5 align-top font-data text-[11px] text-slate-900">
                                {row.matchedEntity}
                              </td>
                              <td className="px-3 py-2.5 text-right font-data tabular-nums text-slate-800">
                                {row.similarity}
                              </td>
                              <td className={cn("px-3 py-2.5 align-top", tierCellClass(row.tier))}>
                                {row.statusLabel}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {phase1 === "complete" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: FADE_DURATION }}
                      className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Screening summary
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-500">Primary match</p>
                          <p className="font-data text-sm font-bold text-slate-900">{scenario.result.matchLine}</p>
                          {scenario.result.matchSub && (
                            <p className="text-xs text-slate-600">{scenario.result.matchSub}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-500">Composite score</p>
                          <p className="font-data text-2xl font-extrabold text-slate-900">
                            {scenario.result.score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-500">Risk level</p>
                          <span
                            className={cn(
                              "mt-1 inline-flex rounded-md border px-2.5 py-1 text-xs font-bold",
                              tierBadgeClass(resultTier)
                            )}
                          >
                            {resultTier}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-500">Recommended action</p>
                          <span
                            className={cn(
                              "mt-1 inline-flex rounded-md border px-2.5 py-1 text-xs font-bold",
                              scenario.result.action === "BLOCK" && "border-red-300 bg-red-100 text-red-900",
                              scenario.result.action === "REVIEW" && "border-amber-300 bg-amber-100 text-amber-950",
                              scenario.result.action === "APPROVE" && "border-emerald-300 bg-emerald-100 text-emerald-900"
                            )}
                          >
                            {scenario.result.action}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {(phase2 === "running" || phase2 === "complete" || phase3 !== "locked") && phase1 === "complete" && (
              <motion.div
                key="p2block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: FADE_DURATION }}
                className={cn("space-y-3", phase1 === "complete" && "mt-6 border-t border-slate-200 pt-6")}
              >
                {phase2 === "running" && (
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-700" strokeWidth={2} />
                    <span>Running AI deep analysis…</span>
                  </div>
                )}
                {phase2 === "complete" && (
                  <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-600">
                      AI analysis
                    </p>
                    <div
                      className={cn(
                        "mt-2 break-words text-sm leading-relaxed text-slate-900 font-body",
                        !analysisExpanded && scenario.result.analysis.length > 160 && "line-clamp-3"
                      )}
                    >
                      {scenario.result.analysis}
                    </div>
                    {!analysisExpanded && scenario.result.analysis.length > 160 && (
                      <button
                        type="button"
                        onClick={() => setAnalysisExpanded(true)}
                        className="mt-3 text-xs font-semibold text-cyan-800 underline-offset-2 hover:underline"
                      >
                        Show More ▼
                      </button>
                    )}
                  </div>
                )}

                {phase2 === "complete" && (
                  <div className="mt-4">
                    <ScoreBreakdownBars
                      breakdown={scenario.result.breakdown}
                      composite={scenario.result.score}
                      cyrillicApplicable={cyrillicApplicable}
                    />
                  </div>
                )}

                {(phase3 === "running" || phase3 === "complete") && phase2 === "complete" && (
                  <div className="mt-6 w-full min-w-0 border-t border-slate-200 pt-6">
                    <AgentPipeline
                      progress={agentProgress}
                      phases={phases}
                      pipeline={scenario.pipeline}
                      containerRef={agentsWrapRef}
                    />
                    {phase3 === "complete" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: FADE_DURATION }}
                        className="mt-6 space-y-4 border-t border-slate-200 pt-6"
                      >
                        <div
                          className={cn(
                            "rounded-xl border-2 px-4 py-4",
                            tierVerdictBox(resultTier)
                          )}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                            Final verdict
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-relaxed">
                            {scenario.result.risk} risk — Action: <strong>{scenario.result.action}</strong>. Primary
                            match: {scenario.result.matchLine}
                            {scenario.result.matchSub ? ` (${scenario.result.matchSub})` : ""}. Composite{" "}
                            {scenario.result.score}/100.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={openPdf}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold font-display",
                              "bg-slate-900 text-white shadow-md",
                              "transition-colors duration-200 hover:bg-slate-800"
                            )}
                          >
                            <FileText className="h-4 w-4" strokeWidth={2} />
                            Generate PDF Report
                          </button>
                          <button
                            type="button"
                            onClick={openEmail}
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                          >
                            <Mail className="h-4 w-4" strokeWidth={2} />
                            Generate Email to Bank
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PdfReportModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        scenario={scenario}
        result={scenario.result}
        listRows={listRows}
        auditId={auditId}
        generatedAt={reportStamp}
      />
      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        scenario={scenario}
        result={scenario.result}
        listRows={listRows}
        auditId={auditId}
        generatedAt={reportStamp}
      />
    </motion.article>
  );
}

export default function LiveDemo() {
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);
  soundOnRef.current = soundOn;
  const audioRef = useRef<AudioContext | null>(null);

  const ensureCtx = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
    return audioRef.current;
  }, []);

  const playCue = useCallback((cue: DemoSoundCue) => {
    if (!soundOnRef.current) return;
    try {
      playWebAudioCue(ensureCtx(), cue);
    } catch {
      /* ignore */
    }
  }, [ensureCtx]);

  return (
    <div className="w-full min-w-0 max-w-full space-y-8">
      <div className="relative flex flex-col gap-4 pr-14 sm:pr-16">
        <button
          type="button"
          onClick={() => {
            setSoundOn((v) => {
              const next = !v;
              if (next) ensureCtx();
              return next;
            });
          }}
          className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50/80 hover:text-cyan-800"
          title={soundOn ? "Mute sounds" : "Enable sounds"}
          aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
          aria-pressed={soundOn}
        >
          {soundOn ? <Volume2 className="h-5 w-5" strokeWidth={2} /> : <VolumeX className="h-5 w-5" strokeWidth={2} />}
        </button>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold font-display uppercase tracking-wide text-emerald-400">
          <WifiOff className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
          No internet required
        </span>
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Live Demo</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 font-body">
            Pre-configured scenarios with cached results — professional screening layout (light results on dark chrome).
            Three steps: list screening, AI analysis, document scan.
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 max-w-full rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 shadow-xl shadow-cyan-500/5 lg:p-8">
        <p className="mb-6 text-center text-xs text-slate-400 font-body lg:text-sm">
          Step 1: Screening → Step 2: AI Analysis → Step 3: Document Scan. Each scenario uses the full width of the content
          area below.
        </p>
        <div className="flex w-full min-w-0 flex-col gap-10">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} scenario={s} playCue={playCue} />
          ))}
        </div>
      </div>
    </div>
  );
}

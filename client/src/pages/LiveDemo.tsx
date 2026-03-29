/*
 * LIVE DEMO — Pre-configured scenarios, cached results, offline-capable UI
 * Three-phase flow: Screening → AI Analysis → Document scan (agents)
 */
import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";

const AGENTS = [
  { id: "vision", label: "Vision Agent", Icon: Eye },
  { id: "translit", label: "Transliteration Agent", Icon: Languages },
  { id: "risk", label: "Risk Agent", Icon: ShieldAlert },
  { id: "action", label: "Action Agent", Icon: Zap },
] as const;

type ScenarioId = "ros" | "sch" | "sun";

type AgentPhase = "pending" | "processing" | "complete";

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
  risk: "HIGH" | "LOW";
  action: "BLOCK" | "APPROVE";
  breakdown: { name: number; country: number; amount: number; doc: number; cyrillic: number };
  analysis: string;
};

type ScreeningRow = { list: string; entity: string; match: string; status: string };

const SCENARIOS: Array<{
  id: ScenarioId;
  title: string;
  entity: string;
  entitySub?: string;
  country: string;
  amount: string;
  docType: string;
  riskBadge: "high" | "low";
  pipeline: PipelineCopy;
  result: DemoResult;
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
    title: "High Risk — Cyrillic Evasion Detection",
    entity: "Shcherbakov Import Export",
    entitySub: "Щербаков Импорт Экспорт",
    country: "Turkey",
    amount: "$180K",
    docType: "Bill of Lading",
    riskBadge: "high",
    pipeline: {
      visionProc: "Extracting entities from document...",
      visionResult: "Found: Shcherbakov Import Export, Turkey, $180K, Bill of Lading",
      translitProc: "Generating Cyrillic variants...",
      translitResult: "Variants: Ščerbakov, Shcherbakov, Scherbakov, Щербаков",
      riskProc: "Screening against 45,296 sanctions entities...",
      riskResult: "Match: SHCHERBAKOV DEFENSE SYSTEMS (OFAC SDN) — 91% similarity",
      actionProc: "Preparing compliance assessment...",
      actionResult: "Action: BLOCK — Immediate review required",
    },
    result: {
      matchLine: "SHCHERBAKOV DEFENSE SYSTEMS",
      matchSub: "from OFAC SDN",
      score: 91,
      risk: "HIGH",
      action: "BLOCK",
      breakdown: { name: 92, country: 84, amount: 58, doc: 71, cyrillic: 97 },
      analysis:
        "Cyrillic transliteration reveals match. ISO 9 variant Ščerbakov, ICAO variant Shcherbakov, informal Scherbakov all map to sanctioned entity.",
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

const AGENT_STEP_MS = 800;
const PIPELINE_TOTAL_MS = AGENT_STEP_MS * 4;
const FADE_DURATION = 0.3;
const ROW_STAGGER_MS = 420;
const PHASE2_PROCESS_MS = 1600;

function getScreeningRows(scenario: (typeof SCENARIOS)[number]): ScreeningRow[] {
  const { result, entity } = scenario;
  const isClear = result.matchLine === "No match found";
  const lists = ["OFAC SDN", "EU Consolidated", "UN Security Council", "UK OFSI"];
  if (isClear) {
    return lists.map((list) => ({
      list,
      entity: entity.slice(0, 28) + (entity.length > 28 ? "…" : ""),
      match: "—",
      status: "Clear",
    }));
  }
  const pct = `${result.score}%`;
  return lists.map((list, i) => ({
    list,
    entity: result.matchLine,
    match: i === 0 ? pct : `${Math.max(result.score - i * 2, 72)}%`,
    status: "Potential match",
  }));
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

function splitAnalysisPreview(text: string, maxSentences: number): { preview: string; remainder: string | null } {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  const trimmed = sentences.map((s) => s.trim()).filter(Boolean);
  if (trimmed.length <= maxSentences) {
    return { preview: text, remainder: null };
  }
  return {
    preview: trimmed.slice(0, maxSentences).join(" "),
    remainder: trimmed.slice(maxSentences).join(" "),
  };
}

function RiskCapsBadge({ level }: { level: "high" | "low" }) {
  const isHigh = level === "high";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-display uppercase tracking-widest",
        isHigh
          ? "border-red-500/40 bg-red-500/15 text-red-400 animate-pulse-glow"
          : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
      )}
    >
      {isHigh ? "HIGH RISK" : "LOW RISK"}
    </span>
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
      className="mt-2 min-h-[2.5rem] text-left text-[10px] leading-relaxed text-cyan-200/90 font-body"
    >
      {text.slice(0, n)}
      {n < text.length ? <span className="ml-0.5 inline-block w-0.5 animate-pulse bg-cyan-400" /> : null}
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: FADE_DURATION, ease: "easeOut" }}
      className="mt-2 flex items-start gap-1.5 text-left"
    >
      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2} />
      <p className="text-[10px] leading-relaxed text-emerald-100/95 font-body">
        {text.slice(0, n)}
        {n < text.length ? <span className="text-emerald-400/80">|</span> : null}
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
    <div className="mb-5 flex flex-wrap items-center justify-center gap-1 text-[10px] font-display font-bold uppercase tracking-wider sm:gap-2 sm:text-[11px]">
      {steps.map((s, i) => (
        <span key={s.n} className="flex items-center gap-1 sm:gap-2">
          {i > 0 && <span className="text-slate-500">→</span>}
          <span
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors duration-300",
              activeStep === s.n
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40"
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

function AgentPipeline({
  progress,
  phases,
  pipeline,
}: {
  progress: number;
  phases: AgentPhase[];
  pipeline: PipelineCopy;
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-600/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                "flex min-h-0 flex-col rounded-xl border p-3 text-left transition-colors duration-300",
                isProcessing && "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.12)]",
                isComplete && "border-emerald-500/35 bg-emerald-500/5",
                isPending && "border-slate-600/80 bg-slate-700/40 opacity-80"
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isProcessing && "bg-cyan-500/20",
                    isComplete && "bg-emerald-500/15",
                    isPending && "bg-slate-700"
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-400" strokeWidth={2} />
                  ) : isComplete ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={2} />
                  ) : (
                    <Icon className="h-5 w-5 text-slate-500" strokeWidth={2} />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[11px] font-bold font-display leading-tight text-slate-100">{label}</p>
                  <TypingText text={proc} active={isProcessing} />
                  <ResultDetailText text={result} show={isComplete} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PdfReportModal({
  open,
  onClose,
  scenario,
  result,
}: {
  open: boolean;
  onClose: () => void;
  scenario: (typeof SCENARIOS)[number];
  result: DemoResult;
}) {
  const printRef = useRef<HTMLDivElement>(null);

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
    w.document.write(`<!DOCTYPE html><html><head><title>Screening Report</title>
      <style>
        body { font-family: system-ui, sans-serif; color: #0f172a; padding: 2rem; max-width: 720px; margin: 0 auto; }
        h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .meta { color: #475569; font-size: 0.875rem; margin-bottom: 1.5rem; }
        h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-top: 1.25rem; }
        p { line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.875rem; }
        th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
        th { background: #f8fafc; }
      </style></head><body>${printRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

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
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-8 text-slate-900 shadow-2xl"
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
          <h1 className="font-display text-xl font-extrabold">Sanctions screening report</h1>
          <p className="mt-1 text-sm text-slate-600">TradeScreen AI — Demo export</p>
          <p className="mt-4 text-sm text-slate-600">
            <strong className="text-slate-900">Scenario:</strong> {scenario.title}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <strong className="text-slate-900">Vendor:</strong> {scenario.entity}
          </p>
          <h2 className="mt-6 font-display text-xs font-bold uppercase tracking-wider text-slate-500">Match summary</h2>
          <p className="mt-2 text-sm">
            <strong>{result.matchLine}</strong>
            {result.matchSub ? ` ${result.matchSub}` : ""}
          </p>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">Risk &amp; action</h2>
          <p className="mt-2 text-sm">
            Risk: <strong>{result.risk}</strong> — Recommended action: <strong>{result.action}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-700">Composite score: {result.score}</p>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">Analysis</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">{result.analysis}</p>
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
}: {
  open: boolean;
  onClose: () => void;
  scenario: (typeof SCENARIOS)[number];
  result: DemoResult;
}) {
  const subject = `Sanctions screening — ${scenario.entity} (${result.risk} risk)`;
  const body = `Compliance team,

Please find below a summary of the automated sanctions screening (demo).

Vendor: ${scenario.entity}
Jurisdiction: ${scenario.country}
Match: ${result.matchLine}${result.matchSub ? ` (${result.matchSub})` : ""}
Risk level: ${result.risk}
Recommended action: ${result.action}
Score: ${result.score}

Analysis:
${result.analysis}

— Generated by TradeScreen AI (demo)`;

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
        className="relative z-10 w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="pr-10 font-display text-lg font-bold text-white">Email to bank (draft)</h2>
        <p className="mt-1 text-xs text-slate-500">Demo preview — no message is sent.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</label>
            <p className="mt-1.5 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-200">{subject}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Message</label>
            <pre className="mt-1.5 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950/80 p-3 text-left text-xs leading-relaxed text-slate-300 font-body">
              {body}
            </pre>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(`Subject: ${subject}\n\n${body}`);
            }}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
          >
            Copy to clipboard
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: (typeof SCENARIOS)[number] }) {
  const [phase1, setPhase1] = useState<"idle" | "running" | "complete">("idle");
  const [phase2, setPhase2] = useState<"locked" | "idle" | "running" | "complete">("locked");
  const [phase3, setPhase3] = useState<"locked" | "idle" | "running" | "complete">("locked");
  const [screeningSpinner, setScreeningSpinner] = useState(false);
  const [showScreeningComplete, setShowScreeningComplete] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);
  const [analysisExpanded, setAnalysisExpanded] = useState(false);

  const [agentProgress, setAgentProgress] = useState(0);
  const [phases, setPhases] = useState<AgentPhase[]>(() => initialPhases());
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const screeningRows = getScreeningRows(scenario);
  const { preview: analysisPreview, remainder: analysisRemainder } = splitAnalysisPreview(scenario.result.analysis, 3);

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
  }, [clearTimers, stopRaf]);

  useEffect(
    () => () => {
      stopRaf();
      clearTimers();
    },
    [stopRaf, clearTimers]
  );

  const resetDemo = () => {
    stopRaf();
    clearTimers();
    setPhase1("idle");
    setPhase2("locked");
    setPhase3("locked");
    setScreeningSpinner(false);
    setShowScreeningComplete(false);
    setVisibleRows(0);
    setAnalysisExpanded(false);
    setAgentProgress(0);
    setPhases(initialPhases());
  };

  const runPhase1 = () => {
    clearTimers();
    setShowScreeningComplete(false);
    setScreeningSpinner(true);
    setVisibleRows(0);
    setPhase1("running");
    screeningRows.forEach((_, i) => {
      const id = setTimeout(() => setVisibleRows(i + 1), (i + 1) * ROW_STAGGER_MS);
      timeoutIdsRef.current.push(id);
    });
    const rowsDoneMs = screeningRows.length * ROW_STAGGER_MS + 200;
    const idStop = setTimeout(() => {
      setScreeningSpinner(false);
      setShowScreeningComplete(true);
    }, rowsDoneMs);
    timeoutIdsRef.current.push(idStop);
    const idComplete = setTimeout(() => {
      setPhase1("complete");
      setPhase2("idle");
    }, rowsDoneMs + 550);
    timeoutIdsRef.current.push(idComplete);
  };

  const runPhase2 = () => {
    setPhase2("running");
    const id = setTimeout(() => {
      setPhase2("complete");
      setPhase3("idle");
    }, PHASE2_PROCESS_MS);
    timeoutIdsRef.current.push(id);
  };

  const runPhase3 = () => {
    setPhase3("running");
    runAgentPipeline();
  };

  const activeStep: 1 | 2 | 3 =
    phase3 !== "locked" ? 3 : phase2 !== "locked" ? 2 : 1;

  const showDemoPanel = phase1 !== "idle" || phase2 !== "locked" || phase3 !== "locked";

  return (
    <motion.article
      layout
      className="premium-card-dark flex flex-col rounded-xl border border-cyan-500/15 p-6 text-left shadow-lg shadow-black/20"
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
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-800/80 hover:text-slate-200"
        >
          Reset demo
        </button>
      </div>

      {/* Phase 1 primary */}
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 py-3 text-sm font-bold text-slate-500 sm:w-auto sm:px-8"
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 py-3 text-sm font-bold text-slate-500 sm:w-auto sm:px-8"
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 py-3 text-sm font-bold text-slate-500 sm:w-auto sm:px-8"
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
            className="mt-5 overflow-hidden rounded-xl border border-slate-600/80 bg-slate-800/95 p-5 shadow-inner"
          >
            <p className="mb-1 text-center text-[10px] font-bold font-display uppercase tracking-[0.2em] text-cyan-500/90">
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
                    className="rounded-lg border border-slate-600/80 bg-slate-700/50 px-4 py-3"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vendor</p>
                    <p className="mt-1 text-sm font-semibold text-white">{scenario.entity}</p>
                    <p className="text-xs text-slate-300">
                      {scenario.country} · {scenario.amount} · {scenario.docType}
                    </p>
                  </motion.div>

                  {phase1 === "running" && screeningSpinner && (
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-400" strokeWidth={2} />
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
                        className="flex items-center gap-2 text-sm font-semibold text-emerald-400"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                        Screening Complete ✓
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[280px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-600 text-[10px] uppercase tracking-wider text-slate-400">
                          <th className="pb-2 pr-2 font-display">List</th>
                          <th className="pb-2 pr-2 font-display">Screened name</th>
                          <th className="pb-2 pr-2 font-display">Match</th>
                          <th className="pb-2 font-display">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-100">
                        {screeningRows.slice(0, visibleRows).map((row, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: FADE_DURATION }}
                            className="border-b border-slate-600/60"
                          >
                            <td className="py-2 pr-2 font-medium text-slate-200">{row.list}</td>
                            <td className="py-2 pr-2 font-data text-slate-100">{row.entity}</td>
                            <td className="py-2 pr-2 font-data text-cyan-200">{row.match}</td>
                            <td
                              className={cn(
                                "py-2 font-semibold",
                                row.status === "Clear" ? "text-emerald-400" : "text-amber-400"
                              )}
                            >
                              {row.status}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {phase1 === "complete" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: FADE_DURATION }}
                      className="rounded-lg border border-slate-600/80 bg-slate-700/40 px-3 py-2"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Screening summary</p>
                      <p className="mt-1 font-data text-sm font-semibold text-cyan-200">{scenario.result.matchLine}</p>
                      {scenario.result.matchSub && (
                        <p className="text-xs text-slate-300">{scenario.result.matchSub}</p>
                      )}
                      <p className="mt-1 font-data text-lg font-extrabold text-white">Score: {scenario.result.score}</p>
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
                className={cn("space-y-3", phase1 === "complete" && "mt-6 border-t border-slate-600/80 pt-6")}
              >
                {phase2 === "running" && (
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-400" strokeWidth={2} />
                    <span>Running AI deep analysis…</span>
                  </div>
                )}
                {phase2 === "complete" && (
                  <div className="rounded-lg border border-cyan-500/25 bg-slate-700/50 px-4 py-3">
                    <p className="text-[10px] font-bold font-display uppercase tracking-wider text-cyan-400/90">
                      AI analysis
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-100 font-body">
                      {analysisPreview}
                      {analysisExpanded && analysisRemainder ? ` ${analysisRemainder}` : null}
                    </p>
                    {analysisRemainder && !analysisExpanded && (
                      <button
                        type="button"
                        onClick={() => setAnalysisExpanded(true)}
                        className="mt-3 text-xs font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        Show More ▼
                      </button>
                    )}
                  </div>
                )}

                {(phase3 === "running" || phase3 === "complete") && phase2 === "complete" && (
                  <div className="mt-6 border-t border-slate-600/80 pt-6">
                    <AgentPipeline progress={agentProgress} phases={phases} pipeline={scenario.pipeline} />
                    {phase3 === "complete" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: FADE_DURATION }}
                        className="mt-6 space-y-4 border-t border-slate-600/80 pt-6"
                      >
                        <div className="rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final verdict</p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {scenario.result.risk} risk — {scenario.result.action}. {scenario.result.matchLine}
                            {scenario.result.matchSub ? ` (${scenario.result.matchSub})` : ""}.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setPdfOpen(true)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold font-display",
                              "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25",
                              "transition-colors duration-200 hover:from-cyan-400 hover:to-teal-400"
                            )}
                          >
                            <FileText className="h-4 w-4" strokeWidth={2} />
                            Generate PDF Report
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-700/80 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-400/60 hover:bg-slate-600/80"
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

            {/* Score breakdown after analysis visible */}
            {phase2 === "complete" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: FADE_DURATION }}
                className="mt-6 border-t border-slate-600/80 pt-6"
              >
                <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-400">
                  Score breakdown
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["Name match", scenario.result.breakdown.name],
                      ["Country risk", scenario.result.breakdown.country],
                      ["Amount pattern", scenario.result.breakdown.amount],
                      ["Document signal", scenario.result.breakdown.doc],
                      ["Cyrillic / alias", scenario.result.breakdown.cyrillic],
                    ] as const
                  ).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded-lg border border-slate-600/80 bg-slate-700/40 px-3 py-2"
                    >
                      <span className="text-xs text-slate-300 font-body">{k}</span>
                      <span className="font-data text-sm font-semibold text-cyan-200">{v}%</span>
                    </div>
                  ))}
                </div>
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
      />
      <EmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        scenario={scenario}
        result={scenario.result}
      />
    </motion.article>
  );
}

export default function LiveDemo() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold font-display uppercase tracking-wide text-emerald-400">
          <WifiOff className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
          No internet required
        </span>
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Live Demo</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 font-body">
            Pre-configured scenarios with cached results — works offline. Three steps: list screening, AI analysis, then
            document scan with four agents.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 shadow-xl shadow-cyan-500/5 lg:p-8">
        <p className="mb-6 text-center text-xs text-slate-400 font-body lg:text-sm">
          Step 1: Screening → Step 2: AI Analysis → Step 3: Document Scan. Each scenario runs the same flow independently.
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

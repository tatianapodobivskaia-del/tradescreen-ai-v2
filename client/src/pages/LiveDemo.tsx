/*
 * LIVE DEMO — Pre-configured scenarios, cached results, offline-capable UI
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

/** Typing + subtle fade for processing lines */
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

/** Fade-in + light typewriter tail for result lines */
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
      transition={{ duration: 0.3, ease: "easeOut" }}
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

function AgentPipeline({
  progress,
  phases,
  pipeline,
}: {
  progress: number;
  phases: AgentPhase[];
  pipeline: PipelineCopy;
}) {
  const allDone = phases.every((p) => p === "complete");

  return (
    <div className="mt-5 space-y-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
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
                "flex min-h-0 flex-col rounded-xl border p-3 text-left transition-all duration-300",
                isProcessing && "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.12)]",
                isComplete && "border-emerald-500/35 bg-emerald-500/5",
                isPending && "border-slate-700/80 bg-slate-900/40 opacity-70"
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isProcessing && "bg-cyan-500/20",
                    isComplete && "bg-emerald-500/15",
                    isPending && "bg-slate-800"
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
                  <p className="text-[11px] font-bold font-display leading-tight text-slate-200">{label}</p>
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

function ResultPanel({ result }: { result: DemoResult }) {
  const { breakdown } = result;
  const rows = [
    { k: "Name match", v: breakdown.name },
    { k: "Country risk", v: breakdown.country },
    { k: "Amount pattern", v: breakdown.amount },
    { k: "Document signal", v: breakdown.doc },
    { k: "Cyrillic / alias", v: breakdown.cyrillic },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-5 border-t border-cyan-500/20 pt-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-500">Matched entity</p>
          <p className="mt-1 font-data text-sm font-semibold text-cyan-300">{result.matchLine}</p>
          {result.matchSub && <p className="mt-0.5 text-xs text-slate-400 font-body">{result.matchSub}</p>}
        </div>
        <div className="flex flex-wrap items-end gap-4 sm:justify-end">
          <div>
            <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-500">Score</p>
            <p className="font-data text-3xl font-extrabold text-white">{result.score}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-500">Risk</p>
            <p
              className={cn(
                "mt-1 font-display text-sm font-bold",
                result.risk === "HIGH" ? "text-red-400" : "text-emerald-400"
              )}
            >
              {result.risk}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-500">Action</p>
            <p className="mt-1 font-data text-sm font-bold text-white">{result.action}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold font-display uppercase tracking-wider text-slate-500">Score breakdown</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.k}
              className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/50 px-3 py-2"
            >
              <span className="text-xs text-slate-400 font-body">{row.k}</span>
              <span className="font-data text-sm font-semibold text-cyan-200">{row.v}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
        <p className="text-[10px] font-bold font-display uppercase tracking-wider text-cyan-400/90">AI analysis</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-200 font-body">{result.analysis}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => alert("Demo: a PDF screening report would be generated here.")}
          className="btn-premium btn-premium-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <FileText className="h-4 w-4" strokeWidth={2} />
          Generate PDF Report
        </button>
        <button
          type="button"
          onClick={() => alert("Demo: bank notification email draft would open here.")}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:bg-slate-800 hover:border-cyan-400/60"
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          Generate Email to Bank
        </button>
      </div>
    </motion.div>
  );
}

function ScenarioCard({ scenario }: { scenario: (typeof SCENARIOS)[number] }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phases, setPhases] = useState<AgentPhase[]>(() => initialPhases());
  const [showResults, setShowResults] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const runDemo = () => {
    clearTimers();
    stopRaf();
    setShowResults(false);
    setProgress(0);
    setPhases(["processing", "pending", "pending", "pending"]);
    setRunning(true);
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
      setProgress(100);
      setRunning(false);
      setShowResults(true);
    }, AGENT_STEP_MS * 4);

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(100, (elapsed / PIPELINE_TOTAL_MS) * 100);
      setProgress(p);
      if (elapsed < PIPELINE_TOTAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(
    () => () => {
      stopRaf();
      clearTimers();
    },
    [stopRaf, clearTimers]
  );

  return (
    <motion.article
      layout
      className="premium-card-dark flex flex-col rounded-xl border border-cyan-500/15 p-6 text-left shadow-lg shadow-black/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold font-display leading-snug text-white">{scenario.title}</h3>
          <p className="mt-2 text-sm font-medium text-slate-200 font-body">{scenario.entity}</p>
          {scenario.entitySub && (
            <p className="text-xs text-slate-400 font-body mt-0.5">{scenario.entitySub}</p>
          )}
          <p className="mt-2 text-xs text-slate-500 font-body">
            {scenario.country} · {scenario.amount} · {scenario.docType}
          </p>
        </div>
        <RiskCapsBadge level={scenario.riskBadge} />
      </div>

      <button
        type="button"
        onClick={runDemo}
        disabled={running}
        className={cn(
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold font-display transition-all sm:w-auto sm:px-8",
          running
            ? "cursor-not-allowed border border-slate-600 bg-slate-800 text-slate-500"
            : "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-teal-400"
        )}
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Running pipeline…
          </>
        ) : (
          <>
            <Play className="h-4 w-4 fill-current" strokeWidth={2} />
            Run Demo
          </>
        )}
      </button>

      <AnimatePresence>
        {(running || showResults) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {(running || (showResults && progress >= 100)) && (
              <AgentPipeline
                progress={running || showResults ? progress : 0}
                phases={phases}
                pipeline={scenario.pipeline}
              />
            )}
            {showResults && !running && <ResultPanel result={scenario.result} />}
          </motion.div>
        )}
      </AnimatePresence>
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
            Pre-configured scenarios with cached results — works offline
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 shadow-xl shadow-cyan-500/5 lg:p-8">
        <p className="mb-6 text-center text-xs text-slate-400 font-body lg:text-sm">
          Four-agent pipeline: each stage shows live processing text for 0.8s, then a checked result before the next
          agent runs — then full results load from cache.
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

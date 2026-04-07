/*
 * AI DOCUMENT SCANNER — Upload zone; Azure vision-screen API + 4-agent animation
 * PDFs are rasterized to JPEG (first page): the vision API only accepts webp/jpeg/png/gif.
 */
import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from "react";
import { Upload, Eye, Languages, ShieldAlert, Zap, CheckCircle, Loader2, FileText, Mail, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { runVisionScan } from "@/lib/api";

declare global {
  // set by pdf.worker.mjs when evaluated on the main thread
  interface GlobalThis {
    pdfjsWorker?: { WorkerMessageHandler?: unknown };
  }
}

/**
 * Load pdf.js for PDF uploads only.
 * Pre-import the worker bundle on the **main thread** so `globalThis.pdfjsWorker` is set; then PDF.js uses a
 * "fake worker" (LoopbackPort) instead of `new Worker()`, which avoids Safari/other browsers where the real
 * worker thread has no `Map.prototype.getOrInsertComputed` (pdfjs 5.6+).
 * Polyfills in main.tsx still cover the main-thread Map/Promise APIs.
 */
async function getPdfjs() {
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  if (!globalThis.pdfjsWorker?.WorkerMessageHandler) {
    await import(/* @vite-ignore */ workerSrc);
  }
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  return pdfjs;
}

const DOC_SCAN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/document-scan-T5uLdZ2Jukfd7PKfZx9XEn.webp";

const AGENT_ACTIVATE_MS = [0, 800, 1600, 2400] as const;
const MIN_PIPELINE_MS = 2400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fileToBase64Raw(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res !== "string") {
        reject(new Error("Could not read file"));
        return;
      }
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

const VISION_MAX_EDGE_PX = 2048;

async function pdfFirstPageToJpegBase64(file: File): Promise<string> {
  const pdfjs = await getPdfjs();
  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const baseVp = page.getViewport({ scale: 1 });
  let scale = 2;
  if (baseVp.width * scale > VISION_MAX_EDGE_PX) {
    scale = VISION_MAX_EDGE_PX / baseVp.width;
  }
  if (baseVp.height * scale > VISION_MAX_EDGE_PX) {
    scale = Math.min(scale, VISION_MAX_EDGE_PX / baseVp.height);
  }
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Could not encode PDF page as image");
  return fileToBase64Raw(new File([blob], "page1.jpg", { type: "image/jpeg" }));
}

function isPdfFile(file: File): boolean {
  const t = file.type?.toLowerCase() ?? "";
  if (t === "application/pdf") return true;
  return file.name?.toLowerCase().endsWith(".pdf") ?? false;
}

/** Re-encode to JPEG + max edge — vision API only accepts webp/jpeg/png/gif; avoids HEIC/TIFF failures. */
async function rasterImageFileToJpegBase64(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Could not read this image — try PNG, JPG, WebP, GIF, or export iPhone photos as “Most Compatible” (JPEG)."
    );
  }
  try {
    let w = bitmap.width;
    let h = bitmap.height;
    const maxDim = Math.max(w, h);
    if (maxDim > VISION_MAX_EDGE_PX) {
      const s = VISION_MAX_EDGE_PX / maxDim;
      w = Math.floor(w * s);
      h = Math.floor(h * s);
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
    );
    if (!blob) throw new Error("Could not encode image for upload");
    return fileToBase64Raw(new File([blob], "scan.jpg", { type: "image/jpeg" }));
  } finally {
    bitmap.close();
  }
}

/** Base64 for /api/vision-screen: PDF → page 1 as JPEG; all other files → rasterized JPEG. */
async function fileToVisionApiBase64(file: File): Promise<string> {
  if (isPdfFile(file)) {
    return pdfFirstPageToJpegBase64(file);
  }
  return rasterImageFileToJpegBase64(file);
}

function formatVisionClientError(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Scan timed out — try a smaller file or one page at a time.";
  }
  if (err instanceof Error) {
    if (err.name === "AbortError" || /aborted/i.test(err.message)) {
      return "Scan timed out — try a smaller file or one page at a time.";
    }
    const m = err.message.trim();
    if (m.length <= 320) return m;
    return `${m.slice(0, 317)}…`;
  }
  return "Document scan failed — check connection and use PNG, JPG, WebP, GIF, or PDF.";
}

type VisionResponse = Awaited<ReturnType<typeof runVisionScan>>;

function riskBadgeClass(risk: string): string {
  const u = risk.toUpperCase();
  if (u === "HIGH") return "border-red-300 bg-red-100 text-red-900";
  if (u === "MEDIUM") return "border-cyan-300 bg-amber-100 text-amber-950";
  return "border-emerald-300 bg-emerald-100 text-emerald-900";
}

function docRiskBorder(risk: string): string {
  const u = risk.toUpperCase();
  if (u === "HIGH") return "border-red-400 ring-1 ring-red-200";
  if (u === "MEDIUM") return "border-cyan-400 ring-1 ring-cyan-200";
  return "border-emerald-400 ring-1 ring-emerald-200";
}

const AGENT_META = [
  { key: "vision", label: "Vision Agent", Icon: Eye },
  { key: "translit", label: "Transliteration Agent", Icon: Languages },
  { key: "risk", label: "Risk Agent", Icon: ShieldAlert },
  { key: "action", label: "Action Agent", Icon: Zap },
] as const;

export default function DocumentScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const activateTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastFileRef = useRef<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "scanning" | "complete" | "error">("idle");
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [visionData, setVisionData] = useState<VisionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearActivateTimers = useCallback(() => {
    activateTimersRef.current.forEach((id) => clearTimeout(id));
    activateTimersRef.current = [];
  }, []);

  useEffect(() => () => clearActivateTimers(), [clearActivateTimers]);

  const startAgentSequence = useCallback(() => {
    clearActivateTimers();
    setActiveAgentIndex(0);
    AGENT_ACTIVATE_MS.forEach((ms, idx) => {
      const id = setTimeout(() => setActiveAgentIndex(idx), ms);
      activateTimersRef.current.push(id);
    });
  }, [clearActivateTimers]);

  const processFile = useCallback(
    async (file: File) => {
      lastFileRef.current = file;
      setErrorMessage(null);
      setVisionData(null);
      setPhase("scanning");
      startAgentSequence();

      const pMin = sleep(MIN_PIPELINE_MS);

      try {
        const base64 = await fileToVisionApiBase64(file);
        const data = await runVisionScan(base64);
        await pMin;
        clearActivateTimers();
        setVisionData(data);
        setPhase("complete");
      } catch (err) {
        await pMin;
        clearActivateTimers();
        setErrorMessage(formatVisionClientError(err));
        setPhase("error");
      }
    },
    [startAgentSequence, clearActivateTimers]
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) void processFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void processFile(f);
  };

  const onRetry = () => {
    setErrorMessage(null);
    setPhase("idle");
    const f = lastFileRef.current;
    if (f) void processFile(f);
  };

  const handlePdfExport = () => {
    if (!visionData) return;
    window.alert(
      "In production, this would build a PDF from the vision scan results.\n\n" +
        `Document risk: ${visionData.document_risk}\n` +
        `Entities: ${visionData.entities_found}\n` +
        `Summary — blocked: ${visionData.summary.blocked}, flagged: ${visionData.summary.flagged}, cleared: ${visionData.summary.cleared}`
    );
  };

  const handleEmailExport = () => {
    if (!visionData) return;
    window.alert(
      "In production, this would draft an email to the bank with the scan summary.\n\n" +
        `Timestamp: ${visionData.ts}\n` +
        `Action: ${visionData.document_action}`
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">AI Document Scanner</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 font-body">
          Upload any trade document — the AI extracts entity names, screens sanctions lists, and generates a risk
          assessment
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="hidden"
        onChange={onInputChange}
      />

      <div className="premium-card rounded-xl p-8">
        <h3 className="mb-4 text-base font-bold font-display text-slate-900">Document Upload</h3>
        <button
          type="button"
          disabled={phase === "scanning"}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "group w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors",
            isDragging ? "border-cyan-500 bg-amber-50/30" : "border-slate-200 hover:border-cyan-500/40",
            phase === "scanning" && "pointer-events-none opacity-80"
          )}
        >
          <div className="relative min-h-[300px]">
            <img
              src={DOC_SCAN_IMG}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
            />
            <div className="relative flex min-h-[300px] flex-col items-center justify-center px-4 py-12">
              {phase === "scanning" ? (
                <Loader2 className="mb-3 h-10 w-10 animate-spin text-amber-600" strokeWidth={2} />
              ) : (
                <Upload className="mb-3 h-10 w-10 text-slate-300 transition-colors group-hover:text-cyan-500" />
              )}
              <p className="text-center text-sm font-medium text-slate-600 font-body">
                {phase === "scanning" ? "Scanning document…" : "Drop document or click browse or take picture"}
              </p>
              <p className="mt-1 text-center text-xs text-slate-400 font-body">
                Supports PDF, PNG, JPG — invoices, bills of lading, contracts
              </p>
            </div>
          </div>
        </button>
        <p className="mt-4 text-center text-xs text-slate-400 font-body">
          Powered by 4 AI Agents: Vision → Transliteration → Risk → Action
        </p>
      </div>

      {(phase === "scanning" || phase === "complete") && (
        <div className="premium-card rounded-xl p-8">
          <h3 className="mb-4 text-base font-bold font-display text-slate-900">Agent pipeline</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {AGENT_META.map((agent, idx) => {
              const { Icon, label } = agent;
              const isComplete = phase === "complete" && visionData;
              const isScanning = phase === "scanning";
              const isActive = isScanning && activeAgentIndex === idx;
              const isPastAnim = isScanning && activeAgentIndex > idx;
              const isFuture = isScanning && activeAgentIndex < idx;

              let statusText = "";
              if (isComplete && visionData) {
                if (idx === 0) statusText = `✅ Found ${visionData.entities_found} entities`;
                else if (idx === 1) statusText = "✅ Generated Cyrillic variants";
                else if (idx === 2) statusText = "✅ Screened against 45,296 entities";
                else statusText = "✅ Assessment complete";
              } else if (isScanning) {
                if (isPastAnim) statusText = "Done";
                else if (isActive) statusText = idx === 0 ? "Extracting entities from document…" : "Waiting…";
                else if (isFuture) statusText = "Waiting…";
              }

              return (
                <div
                  key={agent.key}
                  className={cn(
                    "flex gap-3 rounded-xl border-2 p-4 transition-all",
                    isComplete && "border-emerald-400 bg-emerald-50/40",
                    isScanning && isActive && "border-cyan-500 bg-amber-50/50 shadow-sm ring-2 ring-cyan-200",
                    isScanning && isFuture && "border-slate-100 bg-slate-50/60 opacity-90",
                    isScanning && isPastAnim && "border-slate-200 bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                      isComplete ? "border-emerald-300 bg-emerald-100" : "border-slate-200 bg-white",
                      isActive && "border-cyan-400 bg-amber-50"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-amber-700" strokeWidth={2} />
                    ) : isPastAnim ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500/90" strokeWidth={2} />
                    ) : (
                      <Icon className="h-5 w-5 text-slate-400" strokeWidth={2} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold font-display text-slate-900">{label}</p>
                    <p className="mt-0.5 text-xs text-slate-700 font-body leading-snug">{statusText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "error" && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-900 font-body">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-900 transition-colors hover:bg-red-100/50"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
            Retry
          </button>
        </div>
      )}

      {phase === "complete" && visionData && (
        <div className="premium-card space-y-6 rounded-xl p-8">
          <div
            className={cn(
              "rounded-xl border-2 bg-gradient-to-b from-white to-slate-50/80 p-6",
              docRiskBorder(visionData.document_risk)
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Document risk</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-md border px-3 py-1 text-sm font-extrabold font-display uppercase",
                  riskBadgeClass(visionData.document_risk)
                )}
              >
                {visionData.document_risk}
              </span>
              {visionData.document?.document_type ? (
                <span className="text-xs text-slate-600 font-body">
                  Type: {visionData.document.document_type}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-slate-700 font-body">
              <span className="font-semibold">Entities found:</span>{" "}
              <span className="font-data font-bold text-slate-900">{visionData.entities_found}</span>
            </p>
            <p className="mt-2 text-sm text-slate-700 font-body">
              <span className="font-semibold">Summary:</span>{" "}
              <span className="text-red-800 font-semibold">{visionData.summary.blocked} blocked</span>
              {", "}
              <span className="text-amber-900 font-semibold">{visionData.summary.flagged} flagged</span>
              {", "}
              <span className="text-emerald-800 font-semibold">{visionData.summary.cleared} cleared</span>
            </p>
            <p className="mt-2 text-xs text-slate-500 font-body">Recommended action: {visionData.document_action}</p>
            <p className="mt-1 font-data text-[10px] text-slate-400">Response time: {visionData.ts}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold font-display text-slate-900">Entity results</h3>
            <div className="space-y-4">
              {(visionData.risk_results ?? []).map((row, i) => (
                <div key={`${row.entity}-${i}`} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-data text-sm font-bold text-slate-900">{row.entity}</p>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-bold font-display uppercase",
                        riskBadgeClass(row.risk)
                      )}
                    >
                      {row.risk}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-800 font-body">
                    Action: <span className="font-data uppercase">{row.action}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 font-body">{row.reasoning}</p>
                  {row.cyrillic_variants && row.cyrillic_variants.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Cyrillic variants
                      </p>
                      <ul className="mt-1 list-inside list-disc text-xs text-slate-700 font-body">
                        {row.cyrillic_variants.map((v) => (
                          <li key={v}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={handlePdfExport}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              <FileText className="h-4 w-4" strokeWidth={2} />
              Generate PDF Report
            </button>
            <button
              type="button"
              onClick={handleEmailExport}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              Generate Email to Bank
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

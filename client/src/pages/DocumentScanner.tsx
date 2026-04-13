/*
 * AI DOCUMENT SCANNER — Upload zone; Azure vision-screen API + 4-agent animation
 * PDFs are rasterized to JPEG (first page): the vision API only accepts webp/jpeg/png/gif.
 */
import { useState, useRef, useCallback, useEffect, useMemo, type ChangeEvent, type DragEvent } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Upload,
  Eye,
  Languages,
  ShieldAlert,
  Zap,
  CheckCircle,
  Loader2,
  FileText,
  Mail,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { runVisionScan, type VisionScanResult } from "@/lib/api";
import { transliterateInformal } from "../lib/transliteration";
import { addScreeningResult } from "@/lib/sessionStore";

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

type VisionResponse = VisionScanResult;

function formatScanDateTime(ts: string): string {
  const d = new Date(ts);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }
  return ts;
}

function setPdfRiskTextColor(doc: jsPDF, risk: string): void {
  const u = risk.trim().toUpperCase();
  if (u === "HIGH") doc.setTextColor(220, 38, 38);
  else if (u === "MEDIUM") doc.setTextColor(217, 119, 6);
  else doc.setTextColor(22, 163, 74);
}

function sanitizePdfText(input: string): string | null {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  const latinized = transliterateInformal(normalized);
  // jsPDF default fonts reliably support Latin-1; drop anything outside to avoid broken glyphs.
  const unsupported = /[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/.test(latinized);
  if (unsupported) return null;
  return latinized;
}

function pdfSafeText(input: unknown, fallback = "—"): string {
  const s = typeof input === "string" ? input : input == null ? "" : String(input);
  return sanitizePdfText(s) ?? fallback;
}

const DOCUMENT_SCAN_PDF_FOOTER =
  "Generated by TradeScreen AI | Academic Research Prototype | © 2026 Tatiana Podobivskaia";

function generateDocumentScanPdfBlob(data: VisionScanResult): Blob {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 56) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("TradeScreen AI — Document Scan Report", margin, y);
  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 55, 55);
  doc.text(`Scan time: ${pdfSafeText(formatScanDateTime(data.ts), "—")}`, margin, y);
  y += 16;
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text("Academic Research Prototype — Not for production compliance use", margin, y);
  y += 22;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  ensureSpace(80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Document overview", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const summaryBody: string[][] = [
    ["Document risk", pdfSafeText(data.document_risk, "—").toUpperCase()],
    ["Document type", pdfSafeText(data.document?.document_type?.trim() || "", "—")],
    ["Entities found", pdfSafeText(String(data.entities_found), "0")],
    ["Blocked", pdfSafeText(String(data.summary.blocked), "0")],
    ["Flagged", pdfSafeText(String(data.summary.flagged), "0")],
    ["Cleared", pdfSafeText(String(data.summary.cleared), "0")],
    ["Recommended action", pdfSafeText(data.document_action || "", "—")],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, bottom: 52 },
    body: summaryBody,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5, textColor: [26, 26, 26] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 140 } },
    didParseCell: (hook) => {
      if (hook.section === "body" && hook.column.index === 1 && hook.row.index === 0) {
        setPdfRiskTextColor(doc, data.document_risk);
        hook.cell.styles.textColor = undefined;
        const r = data.document_risk.trim().toUpperCase();
        if (r === "HIGH") hook.cell.styles.textColor = [220, 38, 38];
        else if (r === "MEDIUM") hook.cell.styles.textColor = [217, 119, 6];
        else hook.cell.styles.textColor = [22, 163, 74];
        hook.cell.styles.fontStyle = "bold";
      }
    },
  });

  const lastTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  y = lastTableY + 22;
  doc.setTextColor(0, 0, 0);

  const rows = data.risk_results ?? [];
  ensureSpace(28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Entity results (${rows.length})`, margin, y);
  y += 16;

  const entityRisks = rows.map((r) => (r.risk || "").trim().toUpperCase());
  const detailRowFlags: boolean[] = [];
  const bodyRows: Array<(string | { content: string; colSpan: number })[]> = [];

  for (const r of rows) {
    const entity = pdfSafeText(r.entity || "", "—");
    const risk = pdfSafeText((r.risk || "").toUpperCase(), "—");
    const action = pdfSafeText((r.action || "").toUpperCase(), "—");

    bodyRows.push([entity, risk, action]);
    detailRowFlags.push(false);

    const reasoningSafe = sanitizePdfText((r.reasoning || "").trim());
    const reasoningLine = reasoningSafe ? `Reasoning: ${reasoningSafe}` : "Reasoning: —";

    const variants = (r.cyrillic_variants ?? [])
      .map((v) => sanitizePdfText(v))
      .filter((v): v is string => Boolean(v))
      .map((v) => `${v} (Cyrillic: ${v})`);
    const variantsLine = variants.length ? `Cyrillic variants: ${variants.join(", ")}` : "";

    const detail = [reasoningLine, variantsLine].filter(Boolean).join("\n");
    bodyRows.push([{ content: detail, colSpan: 3 }]);
    detailRowFlags.push(true);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, bottom: 52 },
    head: [["ENTITY", "RISK", "ACTION"]],
    body: bodyRows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      lineColor: [90, 90, 90],
      lineWidth: 0.35,
      textColor: [26, 26, 26],
      valign: "top",
    },
    headStyles: {
      fillColor: [248, 248, 248],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.4,
      lineColor: [70, 70, 70],
    },
    columnStyles: {
      0: { cellWidth: 300 },
      1: { cellWidth: 90 },
      2: { cellWidth: "auto" },
    },
    didParseCell: (hook) => {
      if (hook.section !== "body") return;

      const isDetail = detailRowFlags[hook.row.index] === true;
      if (isDetail) {
        hook.cell.styles.fontSize = 8;
        hook.cell.styles.textColor = [45, 45, 45];
        hook.cell.styles.fontStyle = "normal";
        hook.cell.styles.cellPadding = 5;
        hook.cell.styles.lineWidth = 0.25;
        hook.cell.styles.lineColor = [200, 200, 200];
        return;
      }

      if (hook.column.index === 1) {
        const riskVal = entityRisks[Math.floor(hook.row.index / 2)] ?? "";
        hook.cell.styles.fontStyle = "bold";
        hook.cell.styles.fillColor = [255, 255, 255];
        if (riskVal === "HIGH") hook.cell.styles.textColor = [220, 38, 38];
        else if (riskVal === "MEDIUM") hook.cell.styles.textColor = [217, 119, 6];
        else hook.cell.styles.textColor = [22, 163, 74];
      }
    },
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(DOCUMENT_SCAN_PDF_FOOTER, margin, pageH - 28, { maxWidth: maxW });
  }

  return doc.output("blob");
}

function buildDocumentScanEmailDraft(data: VisionScanResult): {
  subject: string;
  body: string;
  fullText: string;
} {
  const riskU = (data.document_risk || "UNKNOWN").trim().toUpperCase();
  const scanDate = new Date(data.ts);
  const dateYmd = Number.isNaN(scanDate.getTime())
    ? new Date().toISOString().slice(0, 10)
    : scanDate.toISOString().slice(0, 10);
  const subject = `Document Scan Alert — ${riskU} — ${dateYmd}`;
  const scanTime = formatScanDateTime(data.ts);
  const docType = data.document?.document_type?.trim() || "—";
  const entities = data.risk_results ?? [];

  let body = `Dear Compliance Team,

Please find below the automated document scan results from TradeScreen AI.

Scan completed: ${scanTime}
Document risk level: ${riskU}
Document type: ${docType}
Entities detected: ${data.entities_found}
Summary — blocked: ${data.summary.blocked}, flagged: ${data.summary.flagged}, cleared: ${data.summary.cleared}
Recommended action: ${data.document_action || "—"}

— Entity results —

`;

  for (let i = 0; i < entities.length; i++) {
    const e = entities[i];
    body += `${i + 1}. ${e.entity}
   Risk: ${(e.risk || "—").toUpperCase()}
   Action: ${(e.action || "—").toUpperCase()}
   Reasoning: ${(e.reasoning || "—").trim()}
`;
    if (e.cyrillic_variants?.length) {
      body += `   Cyrillic variants: ${e.cyrillic_variants.join("; ")}\n`;
    }
    body += "\n";
  }

  body += `Recommended next steps:
• Review each entity above against internal policy and the cited sanctions lists.
• Escalate any BLOCK recommendations before proceeding with the underlying transaction.
• Retain this scan record with your compliance file for audit purposes.

Regards,
Compliance Team`;

  return { subject, body, fullText: `Subject: ${subject}\n\n${body}` };
}

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

function documentRiskHeroClasses(risk: string): string {
  const u = risk.toUpperCase();
  if (u === "HIGH")
    return "bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-1 ring-red-500/40";
  if (u === "MEDIUM")
    return "bg-amber-500 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50";
  return "bg-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1 ring-emerald-500/40";
}

function entityCardLeftBorder(risk: string): string {
  const u = risk.toUpperCase();
  if (u === "HIGH") return "border-l-red-500";
  if (u === "MEDIUM") return "border-l-amber-500";
  return "border-l-emerald-500";
}

function actionBadgeClass(action: string): string {
  const u = (action || "").toUpperCase();
  if (u === "BLOCK") return "border-red-200 bg-red-50 text-red-900";
  if (u === "FLAG") return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-slate-200 bg-slate-100 text-slate-800";
}

const AGENT_META = [
  { key: "vision", label: "Vision Agent", Icon: Eye },
  { key: "translit", label: "Transliteration Agent", Icon: Languages },
  { key: "risk", label: "Risk Agent", Icon: ShieldAlert },
  { key: "action", label: "Action Agent", Icon: Zap },
] as const;

export default function DocumentScanner() {
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const activateTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const emailCopyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFileRef = useRef<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "scanning" | "complete" | "error">("idle");
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [visionData, setVisionData] = useState<VisionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailDraftOpen, setEmailDraftOpen] = useState(false);
  const [emailDraftCopied, setEmailDraftCopied] = useState(false);

  const documentScanEmailDraft = useMemo(
    () => (visionData ? buildDocumentScanEmailDraft(visionData) : null),
    [visionData]
  );

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
      const t0 = performance.now();
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
        const durationMs = performance.now() - t0;
        const nowIso = new Date().toISOString();
        for (const r of data.risk_results ?? []) {
          addScreeningResult({
            timestamp: nowIso,
            vendorName: r.entity,
            risk: (r.risk || "").toUpperCase(),
            assessment: (r.reasoning || "").trim(),
            action: (r.action || "").toUpperCase(),
            source: "scanner",
            durationMs,
          });
        }
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

  const handlePdfExport = useCallback(() => {
    if (!visionData) return;
    const blob = generateDocumentScanPdfBlob(visionData);
    const pdfBlobUrl = URL.createObjectURL(blob);
    const scanDate = new Date(visionData.ts);
    const dateStr = Number.isNaN(scanDate.getTime())
      ? new Date().toISOString().split("T")[0]
      : scanDate.toISOString().split("T")[0];
    const downloadName = `TradeScreen_DocumentScan_${dateStr}.pdf`;
    const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>TradeScreen AI &mdash; Document Scan Report</title>
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
  <h1>TradeScreen AI &mdash; Document Scan Report</h1>
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
  }, [visionData]);

  const handleEmailExport = useCallback(() => {
    if (!visionData) return;
    setEmailDraftOpen(true);
  }, [visionData]);

  const handleCopyDocumentScanEmailDraft = useCallback(async () => {
    if (!documentScanEmailDraft) return;
    try {
      await navigator.clipboard.writeText(documentScanEmailDraft.fullText);
      setEmailDraftCopied(true);
      if (emailCopyResetRef.current) clearTimeout(emailCopyResetRef.current);
      emailCopyResetRef.current = setTimeout(() => {
        setEmailDraftCopied(false);
        emailCopyResetRef.current = null;
      }, 2000);
    } catch {
      /* ignore clipboard errors */
    }
  }, [documentScanEmailDraft]);

  const handleOpenDocumentScanEmailMailto = useCallback(() => {
    if (!documentScanEmailDraft) return;
    const href = `mailto:?subject=${encodeURIComponent(documentScanEmailDraft.subject)}&body=${encodeURIComponent(documentScanEmailDraft.body)}`;
    window.location.href = href;
  }, [documentScanEmailDraft]);

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
          <div className="relative min-h-[300px] overflow-hidden rounded-[inherit]">
            <img
              src={DOC_SCAN_IMG}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
            />
            {phase === "scanning" ? (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 z-20 h-[2px] rounded-full bg-[#22d3ee]"
                style={{
                  boxShadow:
                    "0 0 14px 3px rgba(34, 211, 238, 0.55), 0 0 28px 6px rgba(34, 211, 238, 0.22)",
                }}
                initial={{ top: "8%" }}
                animate={{ top: ["8%", "88%", "8%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            <div className="relative z-10 flex min-h-[300px] flex-col items-center justify-center px-4 py-12">
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

              const cyrillicEntityCount =
                visionData?.risk_results?.filter((r) => (r.cyrillic_variants?.length ?? 0) > 0).length ?? 0;

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

              let detailLine = "";
              if (isComplete && visionData) {
                if (idx === 0)
                  detailLine = `Extracted ${visionData.entities_found} entities from document`;
                else if (idx === 1)
                  detailLine = `Generated Cyrillic variants for ${cyrillicEntityCount} entities`;
                else if (idx === 2)
                  detailLine = "Screened against 45,296 entities across 4 lists";
                else
                  detailLine = `Assessment complete — ${visionData.summary.blocked} blocked, ${visionData.summary.flagged} flagged, ${visionData.summary.cleared} cleared`;
              }

              return (
                <div
                  key={agent.key}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border-2 p-4 transition-all",
                    isComplete && "border-emerald-400 bg-emerald-50/40",
                    isScanning && isActive && "border-cyan-500 bg-amber-50/50 shadow-sm ring-2 ring-cyan-200",
                    isScanning && isFuture && "border-slate-100 bg-slate-50/60 opacity-90",
                    isScanning && isPastAnim && "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                        isComplete ? "border-emerald-300 bg-emerald-100" : "border-slate-200 bg-white",
                        isActive && "border-cyan-400 bg-amber-50"
                      )}
                    >
                      {isComplete ? (
                        <motion.span
                          className="inline-flex"
                          animate={
                            isComplete
                              ? { scale: [1, 1.08, 1], opacity: [1, 0.92, 1] }
                              : { scale: 1, opacity: 1 }
                          }
                          transition={
                            isComplete
                              ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                              : { duration: 0.45, ease: "easeOut" }
                          }
                        >
                          <CheckCircle className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                        </motion.span>
                      ) : isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin text-amber-700" strokeWidth={2} />
                      ) : isPastAnim ? (
                        <motion.span
                          className="inline-flex"
                          animate={{ scale: [1, 1.12, 1] }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <CheckCircle className="h-5 w-5 text-emerald-500/90" strokeWidth={2} />
                        </motion.span>
                      ) : (
                        <Icon className="h-5 w-5 text-slate-400" strokeWidth={2} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold font-display text-slate-900">{label}</p>
                      <p className="mt-0.5 text-xs text-slate-700 font-body leading-snug">{statusText}</p>
                    </div>
                  </div>
                  {detailLine ? (
                    <p className="pl-[52px] text-[11px] leading-snug text-slate-500 font-body">{detailLine}</p>
                  ) : null}
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
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div
                className={cn(
                  "inline-flex w-fit min-w-[200px] items-center justify-center rounded-xl px-8 py-5 font-display uppercase tracking-wide",
                  documentRiskHeroClasses(visionData.document_risk)
                )}
              >
                <span className="text-2xl font-bold">{visionData.document_risk}</span>
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-sm text-slate-700 font-body">
                {visionData.document?.document_type ? (
                  <p>
                    <span className="font-semibold text-slate-800">Document type:</span>{" "}
                    {visionData.document.document_type}
                  </p>
                ) : null}
                <p>
                  <span className="font-semibold text-slate-800">Entities found:</span>{" "}
                  <span className="font-data font-bold text-slate-900">{visionData.entities_found}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Summary:</span>{" "}
                  <span className="text-red-800 font-semibold">{visionData.summary.blocked} blocked</span>
                  {", "}
                  <span className="text-amber-900 font-semibold">{visionData.summary.flagged} flagged</span>
                  {", "}
                  <span className="text-emerald-800 font-semibold">{visionData.summary.cleared} cleared</span>
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Recommended action:</span>{" "}
                  {visionData.document_action}
                </p>
                <p className="font-data text-[10px] text-slate-400">Response time: {visionData.ts}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold font-display text-slate-900">Entity results</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {(visionData.risk_results ?? []).map((row, i) => (
                <div
                  key={`${row.entity}-${i}`}
                  className={cn(
                    "flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm",
                    "border-l-4",
                    entityCardLeftBorder(row.risk)
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-2">
                    <h4 className="min-w-0 flex-1 font-body text-lg font-semibold leading-snug text-slate-900">
                      {row.entity}
                    </h4>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <span
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[10px] font-bold font-display uppercase",
                          riskBadgeClass(row.risk)
                        )}
                      >
                        {row.risk}
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[10px] font-bold font-display uppercase",
                          actionBadgeClass(row.action)
                        )}
                      >
                        {row.action}
                      </span>
                    </div>
                  </div>
                  <div className="mx-4 mb-4 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-3">
                    <p className="text-sm leading-relaxed text-slate-700 font-body">{row.reasoning}</p>
                  </div>
                  {row.cyrillic_variants && row.cyrillic_variants.length > 0 ? (
                    <div className="border-t border-slate-100 px-4 py-3">
                      <details className="group rounded-lg border border-slate-200 bg-slate-50/50">
                        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-slate-700 outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                          <span className="group-open:hidden">Cyrillic variants — show</span>
                          <span className="hidden group-open:inline">Cyrillic variants — hide</span>
                        </summary>
                        <ul className="border-t border-slate-200 px-3 py-2 text-xs text-slate-700 font-body">
                          {row.cyrillic_variants.map((v) => (
                            <li key={v} className="py-0.5">
                              {v}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  ) : null}
                  <div className="mt-auto border-t border-slate-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set("vendor", row.entity.trim());
                        const c = row.country?.trim();
                        if (c) params.set("country", c);
                        params.set("force", "true");
                        setLocation(`/app/screening?${params.toString()}`);
                      }}
                      className="text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
                    >
                      Screen this Entity →
                    </button>
                  </div>
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
              <FileText className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Generate PDF Report
            </button>
            <button
              type="button"
              onClick={handleEmailExport}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              Generate Email to Bank
            </button>
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
          {documentScanEmailDraft ? (
            <>
              <div className="border-b border-slate-200 px-6 py-4">
                <DialogHeader className="gap-1 text-left">
                  <DialogTitle className="font-display text-lg text-slate-900">Email draft</DialogTitle>
                  <DialogDescription className="text-sm text-slate-600">
                    Pre-formatted compliance email from the current document scan results.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="space-y-4 px-6 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</p>
                  <p className="mt-2 font-mono text-sm leading-snug text-slate-900">
                    {documentScanEmailDraft.subject}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Body</p>
                  <pre className="mt-2 max-h-[min(42vh,360px)] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 font-body text-sm leading-relaxed text-slate-800">
                    {documentScanEmailDraft.body}
                  </pre>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end sm:gap-2">
                <button
                  type="button"
                  onClick={handleCopyDocumentScanEmailDraft}
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
                  onClick={handleOpenDocumentScanEmailMailto}
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
  );
}

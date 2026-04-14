/*
 * AUDIT LOG — Session screening history with search, filters, expandable compliance detail
 */
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { addPdfReportRecord, getScreeningHistory, subscribeSession, type SessionScreeningResult } from "@/lib/sessionStore";
import {
  buildBatchScreenRowFromSessionRecord,
  generateSanctionsScreeningPdfBlob,
} from "@/pages/Screening";
import {
  ScrollText,
  Search,
  Download,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowLeft,
  ScanLine,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/shared";

const severityConfig = {
  high: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  medium: { color: "text-amber-600", bg: "bg-amber-50", border: "border-cyan-200", icon: ShieldAlert },
  low: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: Info },
  info: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Info },
};

type AuditEntrySeverity = keyof typeof severityConfig;

type AuditEntry = {
  timestamp: string;
  action: string;
  user: string;
  entity: string;
  details: string;
  severity: AuditEntrySeverity;
};

function mapSessionToAuditEntry(r: SessionScreeningResult): AuditEntry {
  const riskU = (r.risk || "LOW").toUpperCase();
  let severity: AuditEntrySeverity = "low";
  if (riskU === "HIGH") severity = "high";
  else if (riskU === "MEDIUM") severity = "medium";
  const scoreVal = typeof r.score === "number" ? r.score : typeof r.compositeScore === "number" ? r.compositeScore : null;
  const scoreStr = scoreVal != null ? String(scoreVal) : "—";
  const actionStr = r.action?.trim() ? r.action.trim() : "—";
  const sourceLabel = r.source === "scanner" ? "scanner" : "screening";
  return {
    timestamp: r.timestamp,
    action: riskU,
    user: sourceLabel,
    entity: r.vendorName,
    details: `Score: ${scoreStr} · Action: ${actionStr} · Source: ${sourceLabel}`,
    severity,
  };
}

function formatAuditTimestamp(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

function riskDisplayLabel(risk: string): "High" | "Medium" | "Low" {
  const u = risk.toUpperCase();
  if (u === "HIGH" || u === "BLOCK") return "High";
  if (u === "MEDIUM" || u === "FLAG" || u === "REVIEW") return "Medium";
  return "Low";
}

function actionBadgeClass(action: string): string {
  const a = action.toUpperCase();
  if (a === "BLOCK") return "border-red-300 bg-red-100 text-red-900";
  if (a === "FLAG" || a === "REVIEW") return "border-amber-300 bg-amber-100 text-amber-950";
  if (a === "APPROVE") return "border-emerald-300 bg-emerald-100 text-emerald-900";
  return "border-slate-200 bg-slate-100 text-slate-800";
}

function openSingleScreeningPdfPreview(session: SessionScreeningResult): void {
  const row = buildBatchScreenRowFromSessionRecord(session);
  const blob = generateSanctionsScreeningPdfBlob([row], null);
  addPdfReportRecord({
    title: `Sanctions screening — ${session.vendorName}`,
    kind: "sanctions_screening_single",
    recordCount: 1,
    flaggedCount: (session.risk || "").toUpperCase() !== "LOW" ? 1 : 0,
  });
  const pdfBlobUrl = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split("T")[0];
  const safeName = session.vendorName.replace(/[^\w.-]+/g, "_").slice(0, 48) || "entity";
  const downloadName = `Sanctions_Report_${safeName}_${dateStr}.pdf`;
  const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>TradeScreen AI - Screening Report</title>
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
  <h1>TradeScreen AI - Sanctions Screening Report</h1>
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
}

function AuditExpandedPanel({ session }: { session: SessionScreeningResult }) {
  const composite =
    typeof session.score === "number"
      ? session.score
      : typeof session.compositeScore === "number"
        ? session.compositeScore
        : null;
  const breakdown = session.scoreBreakdown;
  const assessmentDisplay = (session.assessment || "—").trim().replace(/_/g, " ") || "—";
  const actionRaw = (session.action || "APPROVE").trim().toUpperCase();
  const listsLine = session.listsChecked ?? "OFAC + EU + UN + UK — 45,296 entities";
  const variants = session.transliterationInfo?.variants ?? [];
  const isScanner = session.source === "scanner";

  return (
    <div className="border-t border-slate-100 bg-slate-50/90 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Entity</p>
          <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 font-display">{session.vendorName}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Timestamp</p>
          <p className="mt-1 text-sm font-data text-slate-700">{formatAuditTimestamp(session.timestamp)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display mb-1">Risk</p>
            <RiskBadge risk={riskDisplayLabel(session.risk)} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display mb-1">Action</p>
            <span
              className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold font-display uppercase ${actionBadgeClass(actionRaw)}`}
            >
              {actionRaw || "—"}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Composite score</p>
          <p className="mt-1 text-2xl font-extrabold font-data text-slate-900">
            {composite != null ? `${composite}%` : "—"}
          </p>
          {breakdown ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-display text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Document</th>
                    <th className="px-3 py-2">Transliteration</th>
                  </tr>
                </thead>
                <tbody className="font-data text-slate-800">
                  <tr className="border-t border-slate-100">
                    <td className="px-3 py-2">{breakdown.name}</td>
                    <td className="px-3 py-2">{breakdown.country}</td>
                    <td className="px-3 py-2">{breakdown.amount}</td>
                    <td className="px-3 py-2">{breakdown.doc}</td>
                    <td className="px-3 py-2">{breakdown.translit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500 font-body">No score breakdown for this entry (e.g. document scanner extract).</p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Assessment</p>
          <p className="mt-1 font-mono text-sm font-semibold text-slate-800">{assessmentDisplay}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">AI reasoning</p>
          <div className="mt-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-3 text-sm leading-relaxed text-slate-700 font-body">
            {session.reasoning?.trim() ? session.reasoning : "—"}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700 font-body">
          <span>
            <span className="font-semibold text-slate-500">Country:</span> {session.country?.trim() || "—"}
          </span>
          <span>
            <span className="font-semibold text-slate-500">Amount:</span> {session.amount?.trim() || "—"}
          </span>
          <span>
            <span className="font-semibold text-slate-500">Document:</span> {session.docType?.trim() || "—"}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Transliteration variants</p>
          {variants.length ? (
            <details className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700 font-body">
                {variants.length} variant{variants.length === 1 ? "" : "s"} screened
              </summary>
              <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-xs text-slate-600 font-mono">
                {variants.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </details>
          ) : (
            <p className="mt-2 text-xs text-slate-500 font-body">None recorded for this entry.</p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Lists checked</p>
          <p className="mt-1 text-sm text-slate-800 font-body">{listsLine}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">SCR ID</p>
          <p className="mt-1 font-mono text-sm text-slate-800">{session.scrId ?? "—"}</p>
        </div>

        <div className="flex items-center gap-2">
          {isScanner ? (
            <>
              <ScanLine className="h-4 w-4 text-cyan-600 shrink-0" aria-hidden />
              <span className="text-sm font-semibold text-slate-800 font-body">Document Scanner</span>
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 text-cyan-600 shrink-0" aria-hidden />
              <span className="text-sm font-semibold text-slate-800 font-body">Sanctions Screening</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
          <Link
            href={`/app/screening?vendor=${encodeURIComponent(session.vendorName.trim())}&force=true`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-slate-50"
          >
            Screen Again →
          </Link>
          <button
            type="button"
            onClick={() => openSingleScreeningPdfPreview(session)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            Download PDF
          </button>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
            View Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sessionTick, setSessionTick] = useState(0);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSession(() => setSessionTick((t) => t + 1));
  }, []);

  const rowsWithEntry = useMemo(() => {
    void sessionTick;
    return getScreeningHistory().map((session) => ({
      session,
      entry: mapSessionToAuditEntry(session),
      rowKey: `${session.scrId ?? ""}|${session.timestamp}|${session.vendorName}`,
    }));
  }, [sessionTick]);

  const filtered = useMemo(() => {
    return rowsWithEntry.filter(({ session, entry }) => {
      const hay = [
        entry.entity,
        entry.details,
        entry.action,
        session.vendorName,
        session.assessment,
        session.reasoning,
        session.listsChecked,
        session.scrId,
        session.country,
        session.action,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !search || hay.includes(search.toLowerCase());
      const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [search, severityFilter, rowsWithEntry]);

  const hasAnySessionActivity = rowsWithEntry.length > 0;

  const toggleRow = useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500 font-body mt-1 leading-relaxed">
            Session audit trail of screening activity from this browser tab. Entries reset when the page is reloaded —
            for regulatory workflows, export or integrate with your own logging layer.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/app/screening"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden /> Back to Screening
          </Link>
          <Button variant="outline" className="gap-2 text-sm">
            <Download className="w-4 h-4" /> Export Log
          </Button>
        </div>
      </div>

      <div className="premium-card rounded-xl p-8">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by entity or details..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-body focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-body focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <option value="all">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div className="mt-3 font-data text-xs text-slate-400">{filtered.length} entries</div>
      </div>

      <div className="premium-card overflow-hidden rounded-xl">
        {!hasAnySessionActivity ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <ScrollText className="mb-3 h-10 w-10 text-slate-300" aria-hidden />
            <p className="text-sm font-medium text-slate-600 font-body">No screening activity in this session</p>
            <Link
              href="/app/screening"
              className="mt-4 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-800"
            >
              Go to Screening →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500 font-body">
                No entries match your search or severity filter.
              </div>
            ) : (
              filtered.map(({ session, entry, rowKey }) => {
                const config = severityConfig[entry.severity];
                const SevIcon = config.icon;
                const date = new Date(entry.timestamp);
                const expanded = expandedKey === rowKey;
                return (
                  <Fragment key={rowKey}>
                    <button
                      type="button"
                      onClick={() => toggleRow(rowKey)}
                      className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-slate-50/50"
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                        <SevIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className={`font-data text-xs font-semibold ${config.color}`}>{entry.action}</span>
                          <span className="font-body text-xs text-slate-400">· {entry.user}</span>
                          <span className="ml-auto font-body text-[10px] text-slate-400">{expanded ? "Hide" : "Details"}</span>
                        </div>
                        <div className="font-body text-sm text-slate-800">
                          <span className="font-medium">{entry.entity}</span>
                          <span className="text-slate-500"> — {entry.details}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-data text-[11px] text-slate-400">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="font-data text-[10px] text-slate-300">
                          {date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}{" "}
                          local
                        </div>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded ? (
                        <motion.div
                          key={rowKey}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <AuditExpandedPanel session={session} />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </Fragment>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

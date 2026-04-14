/*
 * REPORTS & ANALYTICS — Session-based trends, geography, PDF archive
 */
import { useEffect, useMemo, useState } from "react";
import { Download, Globe, TrendingUp, FileText, Award } from "lucide-react";
import { CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getPdfReports, getScreeningHistory, subscribeSession } from "@/lib/sessionStore";
import type { SessionPdfReportEntry } from "@/lib/sessionStore";

/** Static comparison table (educational); not tied to live session metrics. */
const PERFORMANCE_METRICS = [
  { metric: "Detection Rate", tradescreen: "97%", manual: "~60%", ruleBased: "~78%" },
  { metric: "False Positive Rate", tradescreen: "8%", manual: "~45%", ruleBased: "~34%" },
  { metric: "Precision", tradescreen: "92%", manual: "~55%", ruleBased: "~68%" },
  { metric: "Recall", tradescreen: "97%", manual: "~60%", ruleBased: "~78%" },
  { metric: "F1 Score", tradescreen: "94.4%", manual: "~57%", ruleBased: "~73%" },
  { metric: "Avg. Processing Time", tradescreen: "1.2s", manual: "15 min", ruleBased: "8s" },
] as const;

function formatReportKind(kind: SessionPdfReportEntry["kind"]): string {
  if (kind === "sanctions_screening_batch") return "Batch screening";
  if (kind === "sanctions_screening_single") return "Single screening";
  return "Document scan";
}

function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function Reports() {
  const [sessionTick, setSessionTick] = useState(0);

  useEffect(() => {
    return subscribeSession(() => setSessionTick((t) => t + 1));
  }, []);

  const history = useMemo(() => {
    void sessionTick;
    return getScreeningHistory();
  }, [sessionTick]);

  const pdfReports = useMemo(() => {
    void sessionTick;
    return getPdfReports();
  }, [sessionTick]);

  const sessionEmpty = history.length === 0 && pdfReports.length === 0;

  const screeningTrends = useMemo(() => {
    const byDay = new Map<string, { week: string; low: number; medium: number; high: number }>();
    for (const r of history) {
      const d = new Date(r.timestamp);
      if (Number.isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!byDay.has(key)) {
        byDay.set(key, { week: label, low: 0, medium: 0, high: 0 });
      }
      const b = byDay.get(key)!;
      const risk = (r.risk || "").toUpperCase();
      if (risk === "HIGH") b.high += 1;
      else if (risk === "MEDIUM") b.medium += 1;
      else b.low += 1;
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [history]);

  const geographicDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of history) {
      const c = (r.country || "").trim();
      if (!c || c === "—") continue;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
    const max = entries.length ? Math.max(...entries.map(([, n]) => n)) : 1;
    return entries.map(([country, count]) => ({
      country,
      count,
      percentage: max ? Math.round((count / max) * 100) : 0,
    }));
  }, [history]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 font-body mt-1 leading-relaxed">
          Session analytics from screenings in this browser tab, plus PDFs generated during this session.
        </p>
      </div>

      {sessionEmpty ? (
        <div className="premium-card rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
          <p className="text-sm font-medium text-slate-700 font-body">Run screenings to see analytics here</p>
          <Link
            href="/app/screening"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-800"
          >
            Go to Screening →
          </Link>
        </div>
      ) : null}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Screening Trends */}
        <div className="premium-card rounded-xl p-8">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Screening Trends</h3>
          </div>
          <p className="mb-4 text-xs text-slate-500 font-body">Screenings in this session by calendar day and risk tier</p>
          {screeningTrends.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500 font-body">
              No screening timestamps yet — complete a screening to plot trends.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={screeningTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, fontFamily: "Inter", borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }} />
                  <Bar dataKey="low" stackId="a" fill="#10b981" name="Low Risk" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Risk" />
                  <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Risk" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Geographic Distribution */}
        <div className="premium-card rounded-xl p-8">
          <div className="mb-1 flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Geographic Distribution</h3>
          </div>
          <p className="mb-4 text-xs text-slate-500 font-body">Countries from session screening inputs (relative counts)</p>
          {geographicDistribution.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-500 font-body">
              No country metadata in session screenings yet.
            </div>
          ) : (
            <div className="space-y-3">
              {geographicDistribution.map((item, i) => (
                <div key={item.country} className="flex items-center gap-3">
                  <span className="w-24 truncate text-xs font-medium text-slate-600 font-body">{item.country}</span>
                  <div className="relative flex-1 overflow-hidden rounded-md bg-slate-100">
                    <div
                      className="h-6 rounded-md"
                      style={{
                        width: `${item.percentage}%`,
                        background: `linear-gradient(90deg, #22d3ee ${Math.min(item.percentage * 2, 100)}%, #0ea5e9)`,
                        opacity: 1 - i * 0.06,
                      }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-data text-slate-600">
                      {item.percentage}%
                    </span>
                  </div>
                  <span className="w-14 text-right text-xs font-data text-slate-500">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reports Archive */}
      <div className="premium-card overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Reports Archive</h3>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" type="button" disabled={pdfReports.length === 0}>
            <Download className="h-3.5 w-3.5" /> Export All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Report ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Records</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {pdfReports.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500 font-body">
                    No PDFs in this session yet. Generate a report from Screening (batch PDF), Audit Log (single row), or
                    Document Scanner (export).
                  </td>
                </tr>
              ) : (
                pdfReports.map((report) => (
                  <tr key={report.id} className="border-t border-slate-100 transition-colors hover:bg-amber-50/20">
                    <td className="px-5 py-3 font-data text-xs text-slate-400">{report.id}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 font-body">{report.title}</td>
                    <td className="px-5 py-3 font-data text-xs text-slate-500">{formatIsoDate(report.generatedAt)}</td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {formatReportKind(report.kind)}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-data text-slate-700">
                      {typeof report.recordCount === "number" ? report.recordCount.toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3 font-data text-red-600">
                      {typeof report.flaggedCount === "number" ? report.flaggedCount.toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="premium-card rounded-xl p-8">
        <div className="mb-1 flex items-center gap-2">
          <Award className="h-4 w-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Performance Metrics</h3>
        </div>
        <p className="mb-4 text-xs text-slate-500 font-body">
          Comparison: TradeScreenAI vs. manual review vs. rule-based systems (illustrative benchmarks)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Metric</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-amber-600 font-display">TradeScreenAI</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 font-display">Manual Review</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 font-display">Rule-Based</th>
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_METRICS.map((row) => (
                <tr key={row.metric} className="border-t border-slate-100 transition-colors hover:bg-amber-50/20">
                  <td className="px-5 py-3 font-medium text-slate-800 font-body">{row.metric}</td>
                  <td className="px-5 py-3 text-center font-data font-semibold text-amber-600">{row.tradescreen}</td>
                  <td className="px-5 py-3 text-center font-data text-slate-500">{row.manual}</td>
                  <td className="px-5 py-3 text-center font-data text-slate-500">{row.ruleBased}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

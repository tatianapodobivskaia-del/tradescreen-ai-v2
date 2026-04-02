/*
 * REPORTS & ANALYTICS — Charts, heatmap, reports archive, performance metrics
 */
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { screeningTrends, geographicDistribution, performanceMetrics, reportsArchive } from "@/lib/mockData";
import { BarChart3, Download, Globe, TrendingUp, FileText, Award, Printer, X, ShieldAlert } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Button } from "@/components/ui/button";

const pdfSampleRows = [
  { entity: "Rosoboronexport Trading", country: "Russia", score: "97", risk: "HIGH", decision: "BLOCK" },
  { entity: "Shcherbakov Import Export", country: "Turkey", score: "91", risk: "HIGH", decision: "BLOCK" },
  { entity: "Sunny Day Flowers Co", country: "Colombia", score: "26", risk: "LOW", decision: "APPROVE" },
  { entity: "Miami Fresh Produce LLC", country: "USA", score: "18", risk: "LOW", decision: "APPROVE" },
] as const;

function PdfReportPreviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:inset-auto print:p-0">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 print:hidden"
        onClick={onClose}
        aria-label="Close report preview"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-report-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-[800px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl print:max-h-none print:shadow-none print:border-0"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3 print:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => alert("In production, this would download the screening report as a PDF.")}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} />
              Download PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-opacity hover:opacity-90"
            >
              <Printer className="h-4 w-4 shrink-0 text-slate-600" strokeWidth={2} />
              Print
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-600 transition-opacity hover:bg-slate-200/80 hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div id="pdf-report-print-area" className="min-h-0 flex-1 overflow-y-auto px-8 py-8 text-slate-900 print:overflow-visible">
          <h1 id="pdf-report-title" className="text-center text-xl font-extrabold font-display tracking-tight text-slate-900">
            TradeScreenAI — Academic Research Demo — Screening Report
          </h1>

          <div className="mt-6 rounded-md bg-[#0ea5e9] px-4 py-3 text-center">
            <p className="text-[10px] font-bold font-display leading-relaxed tracking-wide text-white sm:text-[11px]">
              ACADEMIC RESEARCH PROTOTYPE — FOR EDUCATIONAL USE ONLY — NOT A COMMERCIAL COMPLIANCE TOOL
            </p>
          </div>

          <section className="mt-8">
            <h2 className="border-b border-slate-200 pb-2 text-sm font-bold font-display uppercase tracking-wider text-slate-800">
              Executive Summary
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 font-body">
              Screened 7 vendors. 5 blocked (high risk), 0 flagged (medium risk), 2 approved (low risk). Total value
              screened: $2,020,500. Average risk score: 71/100.
            </p>
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-slate-200 py-4 text-center text-xs font-bold font-display tracking-wide text-slate-800 sm:text-sm">
            <span>
              <span className="font-data text-lg text-slate-900 sm:text-xl">7</span> TOTAL SCREENED
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span>
              <span className="font-data text-lg text-slate-900 sm:text-xl">5</span> BLOCKED
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span>
              <span className="font-data text-lg text-slate-900 sm:text-xl">0</span> FLAGGED
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span>
              <span className="font-data text-lg text-slate-900 sm:text-xl">2</span> APPROVED
            </span>
          </div>

          <section className="mt-8">
            <h2 className="border-b border-slate-200 pb-2 text-sm font-bold font-display uppercase tracking-wider text-slate-800">
              Screening Results (sample)
            </h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="px-4 py-3 text-xs font-bold font-display uppercase tracking-wide text-slate-600">Entity</th>
                    <th className="px-4 py-3 text-xs font-bold font-display uppercase tracking-wide text-slate-600">Country</th>
                    <th className="px-4 py-3 text-xs font-bold font-display uppercase tracking-wide text-slate-600">Score</th>
                    <th className="px-4 py-3 text-xs font-bold font-display uppercase tracking-wide text-slate-600">Risk</th>
                    <th className="px-4 py-3 text-xs font-bold font-display uppercase tracking-wide text-slate-600">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {pdfSampleRows.map((row) => (
                    <tr key={row.entity} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-800 font-body">{row.entity}</td>
                      <td className="px-4 py-3 text-slate-600 font-body">{row.country}</td>
                      <td className="px-4 py-3 font-data font-semibold text-slate-800">{row.score}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold font-display ${
                            row.risk === "HIGH" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {row.risk}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-data text-xs font-bold text-slate-800">{row.decision}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="mt-10 flex gap-3 rounded-lg border border-cyan-200/80 bg-amber-50/80 px-4 py-4">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" strokeWidth={2} />
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wide text-amber-900">Compliance disclaimer</h3>
              <p className="mt-2 text-xs leading-relaxed text-amber-950/90 font-body">
                This report is produced by an academic research prototype for educational use only. It does not constitute
                legal, regulatory, or compliance advice. Screening results are simulated demo data and must not be used for
                real transaction decisions. Verify all outcomes with qualified compliance professionals and official
                sanctions sources.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 font-body mt-1 leading-relaxed">
          Screening reports archive — view and download completed screening results with risk scores, matched entities,
          and recommended actions.
        </p>
      </div>

      <PdfReportPreviewModal open={pdfPreviewOpen} onClose={() => setPdfPreviewOpen(false)} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="premium-card rounded-xl p-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Screening Trends</h3>
          </div>
          <p className="text-xs text-slate-500 font-body mb-4">Weekly screening volume by risk level</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={screeningTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }} />
                <Bar dataKey="low" stackId="a" fill="#10b981" name="Low Risk" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Risk" />
                <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Risk" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="premium-card rounded-xl p-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Geographic Distribution</h3>
          </div>
          <p className="text-xs text-slate-500 font-body mb-4">Sanctioned entities by country of origin</p>
          <div className="space-y-3">
            {geographicDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-slate-600 font-body truncate">{item.country}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    viewport={{ once: true }}
                    className="h-full rounded-md"
                    style={{
                      background: `linear-gradient(90deg, #22d3ee ${Math.min(item.percentage * 2, 100)}%, #0ea5e9)`,
                      opacity: 1 - i * 0.08,
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-data text-slate-600">
                    {item.percentage}%
                  </span>
                </div>
                <span className="text-xs font-data text-slate-500 w-14 text-right">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reports Archive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
        className="premium-card rounded-xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Reports Archive</h3>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Report ID</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Title</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Date</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Type</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Records</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Flagged</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportsArchive.map((report, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-amber-50/20 transition-colors">
                  <td className="py-3 px-5 font-data text-xs text-slate-400">{report.id}</td>
                  <td className="py-3 px-5 text-slate-800 font-medium font-body">{report.title}</td>
                  <td className="py-3 px-5 font-data text-xs text-slate-500">{report.date}</td>
                  <td className="py-3 px-5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">{report.type}</span>
                  </td>
                  <td className="py-3 px-5 font-data text-slate-700">{report.records.toLocaleString()}</td>
                  <td className="py-3 px-5 font-data text-red-600">{report.flagged}</td>
                  <td className="py-3 px-5">
                    <button
                      type="button"
                      onClick={() => setPdfPreviewOpen(true)}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      <FileText className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="premium-card rounded-xl p-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Performance Metrics</h3>
        </div>
        <p className="text-xs text-slate-500 font-body mb-4">Comparison: TradeScreenAI vs. manual review vs. rule-based systems</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Metric</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-amber-600 font-display">TradeScreenAI</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 font-display">Manual Review</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 font-display">Rule-Based</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-amber-50/20 transition-colors">
                  <td className="py-3 px-5 text-slate-800 font-medium font-body">{row.metric}</td>
                  <td className="py-3 px-5 text-center font-data font-semibold text-amber-600">{row.tradescreen}</td>
                  <td className="py-3 px-5 text-center font-data text-slate-500">{row.manual}</td>
                  <td className="py-3 px-5 text-center font-data text-slate-500">{row.ruleBased}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

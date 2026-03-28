/*
 * REPORTS & ANALYTICS — Charts, heatmap, reports archive, performance metrics
 */
import { motion } from "framer-motion";
import { screeningTrends, geographicDistribution, performanceMetrics, reportsArchive } from "@/lib/mockData";
import { BarChart3, Download, Globe, TrendingUp, FileText, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Button } from "@/components/ui/button";

export default function Reports() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 font-body mt-1">Screening trends, risk distribution, and performance benchmarks</p>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card rounded-xl p-8">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card rounded-xl p-8">
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
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="h-full rounded-md"
                    style={{
                      background: `linear-gradient(90deg, #22d3ee ${Math.min(item.percentage * 2, 100)}%, #0891b2)`,
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card rounded-xl overflow-hidden">
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
                <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors">
                  <td className="py-3 px-5 font-data text-xs text-slate-400">{report.id}</td>
                  <td className="py-3 px-5 text-slate-800 font-medium font-body">{report.title}</td>
                  <td className="py-3 px-5 font-data text-xs text-slate-500">{report.date}</td>
                  <td className="py-3 px-5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">{report.type}</span>
                  </td>
                  <td className="py-3 px-5 font-data text-slate-700">{report.records.toLocaleString()}</td>
                  <td className="py-3 px-5 font-data text-red-600">{report.flagged}</td>
                  <td className="py-3 px-5">
                    <button className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="premium-card rounded-xl p-8">
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
                <th className="text-center py-3 px-5 text-xs font-semibold text-cyan-600 font-display">TradeScreenAI</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 font-display">Manual Review</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 font-display">Rule-Based</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors">
                  <td className="py-3 px-5 text-slate-800 font-medium font-body">{row.metric}</td>
                  <td className="py-3 px-5 text-center font-data font-semibold text-cyan-600">{row.tradescreen}</td>
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

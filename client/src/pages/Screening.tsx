/*
 * SCREENING PAGE — Single + Batch screening with demo scenarios
 * Risk badges, score bars, GPT-4o deep analysis panel
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiskBadge, ScanningLine } from "@/components/shared";
import { demoScenarios, batchResults } from "@/lib/mockData";
import {
  Search, Upload, FileSpreadsheet, Play, Brain, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, Shield, Zap, Users, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Screening() {
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState<string | null>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) setShowResults(true);
  };

  const scenario = demoScenarios.find(s => s.id === activeScenario);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Sanctions Screening</h1>
        <p className="text-sm text-slate-500 font-body mt-1">Screen vendors against 45,296 sanctioned entities across 4 international lists</p>
      </div>

      {/* Input Section */}
      <div className="glass-card rounded-xl p-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-6">
          <button onClick={() => setActiveTab("single")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Search className="w-4 h-4" /> Single Entity
          </button>
          <button onClick={() => setActiveTab("batch")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "batch" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <FileSpreadsheet className="w-4 h-4" /> Batch Upload
          </button>
        </div>

        {activeTab === "single" ? (
          <div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter vendor or entity name..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
              </div>
              <Button onClick={handleSearch} className="px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
                Screen
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 font-body mt-2 italic">For demonstration purposes only</p>
          </div>
        ) : (
          <div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-cyan-500/40 transition-colors cursor-pointer group">
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3 group-hover:text-cyan-500 transition-colors" />
              <p className="text-sm font-medium text-slate-600 font-body">Drop CSV file here or click to browse</p>
              <p className="text-xs text-slate-400 font-body mt-1">Expected format: one vendor name per row</p>
            </div>
            <p className="text-[11px] text-slate-400 font-body mt-2 italic">For demonstration purposes only</p>
          </div>
        )}
      </div>

      {/* Demo Scenarios */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Demo Scenarios</h3>
          <span className="text-xs text-slate-400 font-body">— Click to run a pre-configured screening</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoScenarios.map((demo) => (
            <button
              key={demo.id}
              onClick={() => { setActiveScenario(demo.id); setShowAiAnalysis(null); }}
              className={`text-left p-4 rounded-xl border transition-all duration-300 ${activeScenario === demo.id ? "border-cyan-500 bg-cyan-50/50 shadow-md" : "border-slate-200 hover:border-cyan-500/30 hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <RiskBadge risk={demo.risk} />
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800 font-display mb-1">{demo.title}</h4>
              <p className="text-xs text-slate-500 font-body">{demo.entity}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Results */}
      <AnimatePresence>
        {scenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Result Header */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">{scenario.entity}</h3>
                  <p className="text-sm text-slate-500 font-body">{scenario.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold font-data text-slate-900">{scenario.score}</div>
                  <RiskBadge risk={scenario.risk} />
                </div>
              </div>

              {/* Score bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scenario.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${scenario.risk === "High" ? "bg-red-500" : scenario.risk === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-data text-slate-400 mt-1">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>

              {/* Matches table */}
              {scenario.matches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 font-display">List</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 font-display">Matched Entity</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 font-display">Type</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 font-display">Country</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 font-display">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.matches.map((m, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors">
                          <td className="py-2.5 px-4 font-data text-xs text-cyan-600">{m.list}</td>
                          <td className="py-2.5 px-4 text-slate-800 font-medium font-body">{m.entityName}</td>
                          <td className="py-2.5 px-4 text-xs text-slate-500 font-body">{m.entityType}</td>
                          <td className="py-2.5 px-4 text-xs text-slate-500 font-body">{m.country}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${m.matchScore > 80 ? "bg-red-500" : m.matchScore > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${m.matchScore}%` }} />
                              </div>
                              <span className="font-data text-xs text-slate-700">{m.matchScore}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-slate-400 font-body">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  No matches found across any monitored sanctions lists
                </div>
              )}

              {/* AI Analysis Button */}
              {scenario.risk !== "Low" && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => setShowAiAnalysis(showAiAnalysis === scenario.id ? null : scenario.id)}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    {showAiAnalysis === scenario.id ? "Hide" : "Run"} GPT-4o Deep Analysis
                  </Button>
                </div>
              )}
            </div>

            {/* AI Analysis Panel */}
            <AnimatePresence>
              {showAiAnalysis === scenario.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-card rounded-xl p-6 border-l-4 border-l-violet-500">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-violet-500" />
                      <h4 className="text-sm font-semibold font-display text-slate-900">GPT-4o Deep Analysis</h4>
                      <span className="text-[10px] font-data px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">AI-Generated</span>
                    </div>

                    <p className="text-sm text-slate-700 font-body leading-relaxed mb-4">{scenario.aiAnalysis.summary}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-slate-50">
                        <div className="text-xs text-slate-500 font-body mb-1">Confidence</div>
                        <div className="text-lg font-bold font-data text-slate-900">{(scenario.aiAnalysis.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50">
                        <div className="text-xs text-slate-500 font-body mb-1">Recommendation</div>
                        <div className={`text-lg font-bold font-data ${scenario.aiAnalysis.recommendation === "BLOCK" ? "text-red-600" : scenario.aiAnalysis.recommendation === "REVIEW" ? "text-amber-600" : "text-emerald-600"}`}>
                          {scenario.aiAnalysis.recommendation}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50">
                        <div className="text-xs text-slate-500 font-body mb-1">Risk Level</div>
                        <RiskBadge risk={scenario.risk} />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-slate-500 font-display uppercase tracking-wider mb-2">Reasoning</h5>
                      <ul className="space-y-2">
                        {scenario.aiAnalysis.reasoning.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-body">
                            <ArrowRight className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Results Preview */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold font-display text-slate-900">Batch Screening Results</h3>
            <p className="text-xs text-slate-400 font-body mt-0.5">Sample: 10 vendors screened</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-data">
            <span className="px-2 py-1 rounded bg-red-50 text-red-600">3 High</span>
            <span className="px-2 py-1 rounded bg-amber-50 text-amber-600">2 Medium</span>
            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600">5 Low</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Vendor</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Risk</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Score</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Matched List</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Matched Entity</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Country</th>
              </tr>
            </thead>
            <tbody>
              {batchResults.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors">
                  <td className="py-3 px-5 text-slate-800 font-medium font-body">{row.vendor}</td>
                  <td className="py-3 px-5"><RiskBadge risk={row.risk} /></td>
                  <td className="py-3 px-5 font-data text-slate-700">{row.score}</td>
                  <td className="py-3 px-5 text-xs font-data text-cyan-600">{row.matchedList}</td>
                  <td className="py-3 px-5 text-xs text-slate-500 font-body">{row.matchedEntity}</td>
                  <td className="py-3 px-5 text-xs text-slate-500 font-body">{row.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-World Use Case */}
      <div className="glass-card rounded-xl p-6 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Real-World Use Case</h3>
        </div>
        <p className="text-sm text-slate-600 font-body">
          A compliance team uploaded <span className="font-semibold text-slate-800">40 vendor names</span> via batch CSV.
          TradeScreenAI screened all entities across 4 sanctions lists in <span className="font-semibold text-slate-800">under 2 minutes</span>,
          flagging <span className="font-semibold text-red-600">3 high-risk matches</span> that required immediate review.
          Traditional manual screening of the same batch would have taken approximately 6 hours.
        </p>
      </div>
    </div>
  );
}

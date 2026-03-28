/*
 * SCREENING PAGE — Single + Batch screening with demo scenarios
 * Premium: enlarged spacing, premium cards, stronger headings, AI glow on GPT-4o
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiskBadge, ScanningLine } from "@/components/shared";
import { demoScenarios, batchResults } from "@/lib/mockData";
import {
  Search, Upload, FileSpreadsheet, Play, Brain, BrainCircuit, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, Shield, Zap, Users, ArrowRight, Mail
} from "lucide-react";
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">Sanctions Screening</h1>
        <p className="text-sm text-slate-500 font-body mt-2">Screen vendors against 45,296 sanctioned entities across 4 international lists</p>
      </div>

      {/* Input Section */}
      <div className="premium-card rounded-xl p-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1.5 bg-slate-100 rounded-lg w-fit mb-8">
          <button onClick={() => setActiveTab("single")} className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${activeTab === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Search className="w-4 h-4" /> Single Entity
          </button>
          <button onClick={() => setActiveTab("batch")} className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${activeTab === "batch" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <FileSpreadsheet className="w-4 h-4" /> Batch Upload
          </button>
        </div>

        {activeTab === "single" ? (
          <div>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter vendor or entity name..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                />
              </div>
              <button onClick={handleSearch} className="btn-premium btn-premium-primary text-sm">
                Screen
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-body mt-3 italic">For demonstration purposes only</p>
          </div>
        ) : (
          <div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-cyan-500/40 transition-colors cursor-pointer group">
              <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4 group-hover:text-cyan-500 transition-colors" />
              <p className="text-sm font-semibold text-slate-600 font-body">Drop CSV file here or click to browse</p>
              <p className="text-xs text-slate-400 font-body mt-2">Expected format: one vendor name per row</p>
            </div>
            <p className="text-[11px] text-slate-400 font-body mt-3 italic">For demonstration purposes only</p>
          </div>
        )}
      </div>

      {/* Demo Scenarios */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Play className="w-5 h-5 text-cyan-500" />
          <h3 className="text-lg font-extrabold font-display text-slate-900">Demo Scenarios</h3>
          <span className="text-xs text-slate-400 font-body ml-1">— Click to run a pre-configured screening</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoScenarios.map((demo) => (
            <button
              key={demo.id}
              onClick={() => { setActiveScenario(demo.id); setShowAiAnalysis(null); }}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-300 ${activeScenario === demo.id ? "border-cyan-500 bg-cyan-50/50 shadow-lg shadow-cyan-500/10" : "border-slate-200 hover:border-cyan-500/30 hover:shadow-md"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <RiskBadge risk={demo.risk} />
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="text-base font-bold text-slate-800 font-display mb-1.5">{demo.title}</h4>
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
            className="space-y-6"
          >
            {/* Result Header */}
            <div className="premium-card rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-extrabold font-display text-slate-900">{scenario.entity}</h3>
                  <p className="text-sm text-slate-500 font-body mt-1">{scenario.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold font-data text-slate-900">{scenario.score}</div>
                  <RiskBadge risk={scenario.risk} />
                </div>
              </div>

              {/* Score bar */}
              <div className="mb-6">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scenario.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${scenario.risk === "High" ? "bg-red-500" : scenario.risk === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-data text-slate-400 mt-1.5">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>

              {/* Matches table */}
              {scenario.matches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">List</th>
                        <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Matched Entity</th>
                        <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Type</th>
                        <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Country</th>
                        <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.matches.map((m, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors">
                          <td className="py-3.5 px-5 font-data text-xs text-cyan-600 font-bold">{m.list}</td>
                          <td className="py-3.5 px-5 text-slate-800 font-semibold font-body">{m.entityName}</td>
                          <td className="py-3.5 px-5 text-xs text-slate-500 font-body">{m.entityType}</td>
                          <td className="py-3.5 px-5 text-xs text-slate-500 font-body">{m.country}</td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${m.matchScore > 80 ? "bg-red-500" : m.matchScore > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${m.matchScore}%` }} />
                              </div>
                              <span className="font-data text-xs font-bold text-slate-700">{m.matchScore}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-slate-400 font-body">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  No matches found across any monitored sanctions lists
                </div>
              )}

              {/* AI Analysis Button */}
              {scenario.risk !== "Low" && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setShowAiAnalysis(showAiAnalysis === scenario.id ? null : scenario.id)}
                    className="btn-premium inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 text-sm"
                  >
                    <Brain className="w-5 h-5" />
                    {showAiAnalysis === scenario.id ? "Hide" : "Run"} AI Deep Analysis
                  </button>
                </div>
              )}
            </div>

            {/* AI Analysis Panel — with glow wow effect */}
            <AnimatePresence>
              {showAiAnalysis === scenario.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="ai-glow premium-card rounded-xl p-8 border-l-4 border-l-violet-500">
                    <div className="flex items-center gap-3 mb-6">
                      <Brain className="w-6 h-6 text-violet-500" />
                      <h4 className="text-lg font-extrabold font-display text-slate-900">AI Deep Analysis</h4>
                      <span className="text-[10px] font-data px-2.5 py-1 rounded-full bg-violet-100 text-violet-600 font-bold">AI-Generated</span>
                    </div>

                    <p className="text-sm text-slate-700 font-body leading-relaxed mb-6">{scenario.aiAnalysis.summary}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-slate-500 font-body mb-2 font-medium">Confidence</div>
                        <div className="text-2xl font-extrabold font-data text-slate-900">{(scenario.aiAnalysis.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-slate-500 font-body mb-2 font-medium">Recommendation</div>
                        <div className={`text-2xl font-extrabold font-data ${scenario.aiAnalysis.recommendation === "BLOCK" ? "text-red-600" : scenario.aiAnalysis.recommendation === "REVIEW" ? "text-amber-600" : "text-emerald-600"}`}>
                          {scenario.aiAnalysis.recommendation}
                        </div>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-slate-500 font-body mb-2 font-medium">Risk Level</div>
                        <RiskBadge risk={scenario.risk} />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-500 font-display uppercase tracking-wider mb-3">Reasoning</h5>
                      <ul className="space-y-3">
                        {scenario.aiAnalysis.reasoning.map((r, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-body leading-relaxed">
                            <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
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

      <div className="mb-3">
        <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-100/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 font-data">
          Sample Results (Demo Data)
        </span>
      </div>

      {/* Batch Results Preview */}
      <div className="premium-card rounded-xl overflow-hidden">
        <div className="p-7 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold font-display text-slate-900">Batch Screening Results</h3>
            <p className="text-xs text-slate-400 font-body mt-1">Sample: 10 vendors screened</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-data font-bold">
            <span className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">3 High</span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">2 Medium</span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">5 Low</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Vendor</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Risk</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Score</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Matched List</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Matched Entity</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Country</th>
              </tr>
            </thead>
            <tbody>
              {batchResults.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors">
                  <td className="py-4 px-6 text-slate-800 font-semibold font-body">{row.vendor}</td>
                  <td className="py-4 px-6"><RiskBadge risk={row.risk} /></td>
                  <td className="py-4 px-6 font-data font-bold text-slate-700">{row.score}</td>
                  <td className="py-4 px-6 text-xs font-data text-cyan-600 font-bold">{row.matchedList}</td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-body">{row.matchedEntity}</td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-body">{row.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button
          type="button"
          onClick={() => alert("AI Deep Analysis will be available when connected to Azure API")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00D2D3] to-[#0AB4B4] px-6 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition-opacity duration-200 hover:opacity-90"
        >
          <BrainCircuit className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
          Run AI Deep Analysis
        </button>
        <button
          type="button"
          onClick={() => alert("Email generation will be available when connected to Azure API")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500 bg-[#1a2332] px-6 py-3 text-sm font-bold text-white shadow-md transition-opacity duration-200 hover:opacity-90"
        >
          <Mail className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
          Generate Email to Bank
        </button>
      </div>

      {/* Real-World Use Case — with AI glow */}
      <div className="ai-glow premium-card rounded-xl p-8 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-2.5 mb-3">
          <Zap className="w-5 h-5 text-cyan-500" />
          <h3 className="text-lg font-extrabold font-display text-slate-900">Real-World Use Case</h3>
        </div>
        <p className="text-sm text-slate-600 font-body leading-relaxed">
          A compliance team uploaded <span className="font-bold text-slate-800">40 vendor names</span> via batch CSV.
          TradeScreenAI screened all entities across 4 sanctions lists in <span className="font-bold text-slate-800">under 2 minutes</span>,
          flagging <span className="font-bold text-red-600">3 high-risk matches</span> that required immediate review.
          Traditional manual screening of the same batch would have taken approximately 6 hours.
        </p>
      </div>
    </div>
  );
}

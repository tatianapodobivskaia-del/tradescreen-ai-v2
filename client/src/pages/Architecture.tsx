/*
 * ARCHITECTURE & METHODOLOGY — Pipeline, scoring, two-pass architecture, AI comparison
 */
import { pipelineStages, scoringFormula } from "@/lib/mockData";
import { Download, Languages, Search, Calculator, Brain, ArrowRight, Cpu, Shield, Lock, AlertTriangle, Zap, Server, Eye } from "lucide-react";

const stageIcons: Record<string, React.ElementType> = { Download, Languages, Search, Calculator, Brain };

const PIPELINE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/pipeline-bg-8Zu7zPKHW5zG9LriKMqhok.webp";

export default function Architecture() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Architecture & Methodology</h1>
        <p className="text-sm text-slate-500 font-body mt-1">How TradeScreen AI processes and analyzes trade documents</p>
      </div>

      {/* 5-Stage Pipeline */}
      <div className="premium-card rounded-xl overflow-hidden">
        <div className="relative h-32 overflow-hidden">
          <img src={PIPELINE_IMG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          <div className="absolute bottom-4 left-6">
            <h3 className="text-lg font-bold font-display text-slate-900">5-Stage Processing Pipeline</h3>
            <p className="text-xs text-slate-500 font-body">From data ingestion to AI-powered compliance decision</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage, i) => {
              const Icon = stageIcons[stage.icon];
              return (
                <div key={stage.id} className="relative">
                  <div className="p-4 rounded-xl border border-slate-200 text-center h-full hover:border-cyan-500/30 hover:shadow-md transition-all">
                    <div className="text-3xl font-bold font-data text-cyan-500/20 mb-2">{stage.id}</div>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="text-base font-bold font-display text-slate-800 mb-1">{stage.name}</h4>
                    <p className="text-[11px] text-slate-500 font-body leading-relaxed">{stage.description}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4-Agent Document Scanner */}
      <div className="premium-card rounded-xl p-8">
        <h3 className="text-base font-bold font-display text-slate-900 mb-6">4-Agent Document Scanner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              title: "Vision Agent",
              icon: Eye,
              desc: "Reads uploaded documents using OCR, extracts entity names and transaction details",
            },
            {
              title: "Transliteration Agent",
              icon: Languages,
              desc: "Generates all possible name spellings across Latin and Cyrillic alphabets",
            },
            {
              title: "Risk Agent",
              icon: Shield,
              desc: "Screens extracted names against 45,296 entities across 4 sanctions lists",
            },
            {
              title: "Action Agent",
              icon: Zap,
              desc: "Calculates composite risk score and generates compliance recommendation",
            },
          ].map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.title}
                className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 hover:border-cyan-500/25 hover:shadow-sm transition-all"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <Icon className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold font-display text-slate-900 mb-1.5">{agent.title}</h4>
                <p className="text-[12px] leading-relaxed text-slate-600 font-body">{agent.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring Formula */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Composite Risk Scoring Formula</h3>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 text-center mb-6">
          <code className="text-sm font-data text-cyan-400">{scoringFormula.formula}</code>
        </div>

        <div className="space-y-4">
          {scoringFormula.weights.map((w, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-20 text-right">
                <span className="text-lg font-bold font-data text-amber-600">{(w.weight * 100).toFixed(0)}%</span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-[#22d3ee]"
                    style={{ width: `${w.weight * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 font-display">{w.factor}</span>
                  <span className="text-xs text-slate-500 font-body">{w.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Pass Architecture */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Two-Pass Architecture</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="text-base font-bold font-display text-slate-800">Pass 1: Fast Screening</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 font-body">
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-cyan-400 mt-1 shrink-0" />Fuzzy string matching using Levenshtein distance</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-cyan-400 mt-1 shrink-0" />Cyrillic transliteration variant generation</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-cyan-400 mt-1 shrink-0" />Multi-list parallel search across all 45,296 entities</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-cyan-400 mt-1 shrink-0" />Composite risk score calculation</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-violet-200 bg-violet-50/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-600" />
              </div>
              <h4 className="text-base font-bold font-display text-slate-800">Pass 2: AI Deep Analysis</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 font-body">
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-violet-400 mt-1 shrink-0" />GPT-4o contextual analysis of flagged entities</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-violet-400 mt-1 shrink-0" />Cross-reference with sanctions program details</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-violet-400 mt-1 shrink-0" />Confidence scoring and recommendation generation</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 text-violet-400 mt-1 shrink-0" />BLOCK / REVIEW / CLEAR action classification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="premium-card rounded-xl p-8">
        <h3 className="text-base font-bold font-display text-slate-900 mb-6">Side-by-Side Comparison</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 border-l-4 border-l-red-500 shadow-lg">
            <div className="px-4 py-3.5 bg-gradient-to-r from-red-950 via-orange-950/90 to-red-950 border-b border-red-900/40">
              <h4 className="text-sm font-extrabold font-display text-orange-100 tracking-tight">Fuzzy Matching Only</h4>
            </div>
            <div className="p-5">
              <ul className="space-y-2.5 text-sm text-slate-300 font-body">
                {[
                  "Basic string comparison",
                  "Single transliteration system",
                  "Binary match/no-match result",
                  "No context understanding",
                  "High false positive rate on short names",
                  "Misses transliteration variants",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-500/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3">
                <p className="text-xs font-bold font-data text-red-300 leading-relaxed">
                  Щербаков → NOT FOUND
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 border-l-4 border-l-cyan-500 shadow-lg">
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#1f1706] via-emerald-950/80 to-[#2b2108] border-b border-amber-900/40">
              <h4 className="text-sm font-extrabold font-display text-amber-50 tracking-tight">TradeScreenAI 4-Agent AI Pipeline</h4>
            </div>
            <div className="p-5">
              <ul className="space-y-2.5 text-sm text-slate-300 font-body">
                {[
                  "Multi-algorithm fuzzy matching (n-gram + token sort + token set)",
                  "4 transliteration systems (ISO 9, ICAO, BGN/PCGN, Informal)",
                  "Composite risk score 0-100 with breakdown",
                  "GPT-4o contextual analysis with reasoning",
                  "AI-powered false positive reduction",
                  "Catches all Cyrillic name variants",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#22d3ee]/90" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-lg border border-emerald-900/50 bg-emerald-950/35 px-4 py-3">
                <p className="text-[11px] sm:text-xs font-bold font-data text-emerald-300 leading-relaxed break-words">
                  Щербаков → Shcherbakov, Scherbakov, Ščerbakov → MATCH: SHCHERBAKOV DEFENSE SYSTEMS (91% similarity) → BLOCK
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why AI */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Why AI — Beyond Rule-Based Systems</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Capability</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 font-display">Rule-Based</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-amber-600 font-display">AI-Powered</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Name variant detection", "Limited patterns", "Contextual understanding"],
                ["False positive handling", "Manual review queue", "Automated confidence scoring"],
                ["Document processing", "Template-based OCR", "Multi-modal vision analysis"],
                ["Cross-language matching", "Dictionary lookup", "Semantic transliteration"],
                ["Reasoning transparency", "Binary match/no-match", "Explainable AI with citations"],
                ["Adaptability", "Requires rule updates", "Learns from patterns"],
              ].map(([cap, rule, ai], i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-amber-50/20 transition-colors">
                  <td className="py-3 px-5 text-slate-800 font-medium font-body">{cap}</td>
                  <td className="py-3 px-5 text-center text-slate-500 font-body text-xs">{rule}</td>
                  <td className="py-3 px-5 text-center text-amber-600 font-semibold font-body text-xs">{ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Scalability + Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card rounded-xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Security & Scalability</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: Lock, label: "End-to-end encryption for all data in transit" },
              { icon: Server, label: "Horizontally scalable microservice architecture" },
              { icon: Shield, label: "Role-based access control and audit logging" },
              { icon: Cpu, label: "Sub-second response time for single entity screening" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <item.icon className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-600 font-body">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card rounded-xl p-6 border-l-4 border-l-cyan-400">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-cyan-500" />
            <h3 className="text-base font-bold font-display text-slate-900">Limitations of Current Prototype</h3>
          </div>
          <div className="space-y-3">
            {[
              "Uses periodic sanctions list snapshots — real-time feed integration planned",
              "No persistent storage — screening data resets on page reload",
              "Academic research prototype — not validated for production compliance use",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <span className="text-sm text-slate-600 font-body">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

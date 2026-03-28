/*
 * ARCHITECTURE & METHODOLOGY — Pipeline, scoring, two-pass architecture, AI comparison
 */
import { motion } from "framer-motion";
import { pipelineStages, scoringFormula } from "@/lib/mockData";
import { Download, Languages, Search, Calculator, Brain, ArrowRight, Cpu, Shield, Lock, AlertTriangle, Zap, Server } from "lucide-react";

const stageIcons: Record<string, React.ElementType> = { Download, Languages, Search, Calculator, Brain };

const PIPELINE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/pipeline-bg-8Zu7zPKHW5zG9LriKMqhok.webp";

export default function Architecture() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Architecture & Methodology</h1>
        <p className="text-sm text-slate-500 font-body mt-1">Technical documentation of the screening pipeline, scoring algorithm, and system design</p>
      </div>

      {/* 5-Stage Pipeline */}
      <div className="glass-card rounded-xl overflow-hidden">
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="p-4 rounded-xl border border-slate-200 text-center h-full hover:border-cyan-500/30 hover:shadow-md transition-all"
                  >
                    <div className="text-3xl font-bold font-data text-cyan-500/20 mb-2">{stage.id}</div>
                    <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h4 className="text-sm font-semibold font-display text-slate-800 mb-1">{stage.name}</h4>
                    <p className="text-[11px] text-slate-500 font-body leading-relaxed">{stage.description}</p>
                  </motion.div>
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

      {/* Scoring Formula */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Composite Risk Scoring Formula</h3>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 text-center mb-6">
          <code className="text-sm font-data text-cyan-400">{scoringFormula.formula}</code>
        </div>

        <div className="space-y-4">
          {scoringFormula.weights.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-20 text-right">
                <span className="text-lg font-bold font-data text-cyan-600">{(w.weight * 100).toFixed(0)}%</span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${w.weight * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 font-display">{w.factor}</span>
                  <span className="text-xs text-slate-500 font-body">{w.description}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Two-Pass Architecture */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Two-Pass Architecture</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-600" />
              </div>
              <h4 className="text-sm font-semibold font-display text-slate-800">Pass 1: Fast Screening</h4>
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
              <h4 className="text-sm font-semibold font-display text-slate-800">Pass 2: AI Deep Analysis</h4>
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

      {/* Why AI */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Why AI — Beyond Rule-Based Systems</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Capability</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 font-display">Rule-Based</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-cyan-600 font-display">AI-Powered</th>
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
                <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors">
                  <td className="py-3 px-5 text-slate-800 font-medium font-body">{cap}</td>
                  <td className="py-3 px-5 text-center text-slate-500 font-body text-xs">{rule}</td>
                  <td className="py-3 px-5 text-center text-cyan-600 font-semibold font-body text-xs">{ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Scalability + Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold font-display text-slate-900">Security & Scalability</h3>
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

        <div className="glass-card rounded-xl p-6 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold font-display text-slate-900">Limitations of Current Prototype</h3>
          </div>
          <div className="space-y-3">
            {[
              "Uses static sanctions list snapshots (not real-time feeds)",
              "AI analysis is simulated — not connected to live GPT-4o",
              "Document scanner uses pre-processed demo data",
              "Fuzzy matching algorithm is simplified for demonstration",
              "No persistent storage — all data resets on page reload",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span className="text-sm text-slate-600 font-body">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

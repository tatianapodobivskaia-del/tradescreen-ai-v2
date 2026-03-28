/*
 * AI DOCUMENT SCANNER — 4-agent pipeline with sequential animation
 * Upload zone, extracted entities, AI recommendations
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiskBadge, ScanningLine } from "@/components/shared";
import { documentPipelineStages, extractedEntities } from "@/lib/mockData";
import { Eye, Languages, ShieldAlert, CheckCircle, Upload, FileText, ArrowRight, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const stageIcons: Record<string, React.ElementType> = { Eye, Languages, ShieldAlert, CheckCircle };

const DOC_SCAN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/document-scan-T5uLdZ2Jukfd7PKfZx9XEn.webp";

export default function DocumentScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  const runDemo = () => {
    setIsScanning(true);
    setScanComplete(false);
    setCurrentStage(0);
  };

  useEffect(() => {
    if (!isScanning) return;
    if (currentStage >= 4) {
      setIsScanning(false);
      setScanComplete(true);
      return;
    }
    const timer = setTimeout(() => setCurrentStage(prev => prev + 1), 1200);
    return () => clearTimeout(timer);
  }, [isScanning, currentStage]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">AI Document Scanner</h1>
        <p className="text-sm text-slate-500 font-body mt-1">4-agent pipeline for extracting and screening entities from trade documents</p>
      </div>

      {/* Pipeline Visualization */}
      <div className="premium-card rounded-xl p-6 relative overflow-hidden">
        {isScanning && <ScanningLine />}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold font-display text-slate-900">Processing Pipeline</h3>
          <Button onClick={runDemo} disabled={isScanning} className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white">
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isScanning ? "Scanning..." : "Run Demo Scan"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {documentPipelineStages.map((stage, i) => {
            const Icon = stageIcons[stage.icon];
            const isActive = isScanning && currentStage === i;
            const isComplete = currentStage > i || scanComplete;
            return (
              <div key={stage.id} className="relative">
                <motion.div
                  animate={{
                    borderColor: isActive ? "#22d3ee" : isComplete ? "#10b981" : "#e2e8f0",
                    backgroundColor: isActive ? "rgba(34,211,238,0.05)" : isComplete ? "rgba(16,185,129,0.05)" : "transparent",
                  }}
                  className="p-4 rounded-xl border-2 text-center transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 ${isActive ? "bg-cyan-100" : isComplete ? "bg-emerald-100" : "bg-slate-100"}`}>
                    {isActive ? (
                      <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                    ) : isComplete ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Icon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <h4 className="text-base font-bold font-display text-slate-800 mb-1">{stage.name}</h4>
                  <p className="text-[11px] text-slate-500 font-body leading-relaxed">{stage.description}</p>
                </motion.div>
                {i < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className={`w-4 h-4 ${isComplete ? "text-emerald-400" : "text-slate-300"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="premium-card rounded-xl p-8">
        <h3 className="text-base font-bold font-display text-slate-900 mb-4">Document Upload</h3>
        <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-colors cursor-pointer group">
          <div className="relative h-48">
            <img src={DOC_SCAN_IMG} alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Upload className="w-10 h-10 text-slate-300 mb-3 group-hover:text-cyan-500 transition-colors" />
              <p className="text-sm font-medium text-slate-600 font-body">Drop trade document here or click to browse</p>
              <p className="text-xs text-slate-400 font-body mt-1">Supports PDF, PNG, JPG — invoices, bills of lading, contracts</p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 font-body mt-2 italic">For demonstration purposes only</p>
      </div>

      {/* Extracted Entities */}
      <AnimatePresence>
        {scanComplete && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="premium-card rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold font-display text-slate-900">Extracted Entities</h3>
                <p className="text-xs text-slate-400 font-body mt-0.5">4 entities identified from sample document</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Entity</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Type</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Source</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Risk</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Score</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Transliterated Variants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedEntities.map((entity, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="border-t border-slate-100 hover:bg-cyan-50/20 transition-colors"
                      >
                        <td className="py-3 px-5 text-slate-800 font-medium font-body">{entity.entity}</td>
                        <td className="py-3 px-5 text-xs text-slate-500 font-body">{entity.type}</td>
                        <td className="py-3 px-5 text-xs text-slate-500 font-body">{entity.source}</td>
                        <td className="py-3 px-5"><RiskBadge risk={entity.risk} /></td>
                        <td className="py-3 px-5 font-data text-slate-700">{entity.score}</td>
                        <td className="py-3 px-5 text-xs text-slate-500 font-body max-w-xs truncate">{entity.transliterated}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="premium-card rounded-xl p-6 border-l-4 border-l-violet-500">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-violet-500" />
                <h3 className="text-base font-bold font-display text-slate-900">AI Recommendations</h3>
                <span className="text-[10px] font-data px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">AI-Generated</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-red-700 font-display">BLOCK — OOO Tekhnoexport</span>
                    <RiskBadge risk="High" />
                  </div>
                  <p className="text-xs text-red-600 font-body">Entity matches sanctioned Russian defense exporter. Recommend immediate escalation to compliance officer.</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-amber-700 font-display">REVIEW — Ivanov A.P. / Vessel Nadezhda</span>
                    <RiskBadge risk="Medium" />
                  </div>
                  <p className="text-xs text-amber-600 font-body">Partial name matches require enhanced due diligence. Verify against full entity records and ownership structures.</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-emerald-700 font-display">CLEAR — Port of Novorossiysk</span>
                    <RiskBadge risk="Low" />
                  </div>
                  <p className="text-xs text-emerald-600 font-body">Geographic location identified. No direct sanctions match. Standard trade route.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

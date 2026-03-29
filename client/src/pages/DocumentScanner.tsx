/*
 * AI DOCUMENT SCANNER — Upload zone; extraction results after processing
 */
import { Upload } from "lucide-react";

const DOC_SCAN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/document-scan-T5uLdZ2Jukfd7PKfZx9XEn.webp";

export default function DocumentScanner() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">AI Document Scanner</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 font-body">
          Upload any trade document — the AI extracts entity names, screens sanctions lists, and generates a risk
          assessment
        </p>
      </div>

      <div className="premium-card rounded-xl p-8">
        <h3 className="mb-4 text-base font-bold font-display text-slate-900">Document Upload</h3>
        <div className="group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-200 transition-colors hover:border-cyan-500/40">
          <div className="relative min-h-[300px]">
            <img
              src={DOC_SCAN_IMG}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
            />
            <div className="relative flex min-h-[300px] flex-col items-center justify-center px-4 py-12">
              <Upload className="mb-3 h-10 w-10 text-slate-300 transition-colors group-hover:text-cyan-500" />
              <p className="text-center text-sm font-medium text-slate-600 font-body">
                Drop document or click browse or take picture
              </p>
              <p className="mt-1 text-center text-xs text-slate-400 font-body">
                Supports PDF, PNG, JPG — invoices, bills of lading, contracts
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400 font-body">
          Powered by 4 AI Agents: Vision → Transliteration → Risk → Action
        </p>
      </div>
    </div>
  );
}

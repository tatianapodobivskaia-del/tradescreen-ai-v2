/*
 * CYRILLIC ENGINE — Transliteration across ISO 9, ICAO, BGN/PCGN, Informal
 * Two tabs, animated flow, matched entities, reference table
 */
import { useState } from "react";
import { cyrillicTransliterations, cyrillicVariantsReference, tradeDocumentComparison } from "@/lib/mockData";
import { Languages, ArrowRight, Search, BookOpen, FileText } from "lucide-react";

export default function CyrillicEngine() {
  const [activeTab, setActiveTab] = useState<"cyr2lat" | "lat2all">("cyr2lat");
  const [input, setInput] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Cyrillic Transliteration Engine</h1>
        <p className="mt-1 text-sm text-slate-500 font-body">
          Generate all standard Latin variants of Russian names for comprehensive sanctions matching
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 space-y-8 lg:col-span-8">
      {/* Tabs */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-6">
          <button onClick={() => setActiveTab("cyr2lat")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "cyr2lat" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Languages className="w-4 h-4" /> Cyrillic → Latin
          </button>
          <button onClick={() => setActiveTab("lat2all")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "lat2all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <Search className="w-4 h-4" /> Latin → All Variants
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeTab === "cyr2lat" ? "Enter Cyrillic name (e.g., Щербаков)" : "Enter Latin name (e.g., Shcherbakov)"}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>
          <button className="px-6 py-3 bg-[#06b6d4] hover:bg-[#0ea5e9] text-white font-semibold rounded-lg text-sm transition-colors">
            Transliterate
          </button>
        </div>
        <p className="text-[11px] text-slate-400 font-body italic">For demonstration purposes only</p>
      </div>

      {/* Animated Transliteration Flow */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <ArrowRight className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Transliteration Flow Visualization</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Cyrillic</th>
                <th className="text-center py-3 px-1 text-xs text-slate-300">→</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">ISO 9</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">ICAO</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">BGN/PCGN</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">Informal</th>
              </tr>
            </thead>
            <tbody>
              {cyrillicTransliterations.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-100 hover:bg-amber-50/20 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 font-body">{row.cyrillic}</td>
                  <td className="py-3 px-1 text-center"><ArrowRight className="w-3 h-3 text-cyan-400 mx-auto" /></td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.iso9}</td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.icao}</td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.bgn}</td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.informal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Cyrillic Variants Reference */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Cyrillic Variants Reference</h3>
          <span className="text-xs text-slate-400 font-body">— Key letters with multiple transliteration forms</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Letter</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">ISO 9</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">ICAO</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">BGN/PCGN</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-amber-600 font-display">Informal</th>
              </tr>
            </thead>
            <tbody>
              {cyrillicVariantsReference.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-2xl font-bold text-slate-900">{row.letter}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-body">{row.name}</td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.iso9}</td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.icao}</td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.bgn}</td>
                  <td className="py-3 px-4 font-data text-slate-700">{row.informal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Document Comparison */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">How Russian Names Appear in Trade Documents</h3>
          <span className="text-xs text-slate-400 font-body">— Same person, different spellings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Russian Original</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Passport (ICAO)</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Bank Record</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 font-display">Trade Document</th>
              </tr>
            </thead>
            <tbody>
              {tradeDocumentComparison.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-amber-50/20 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 font-body">{row.russianOriginal}</td>
                  <td className="py-3 px-4 font-data text-sm text-slate-700">{row.passport}</td>
                  <td className="py-3 px-4 font-data text-sm text-slate-700">{row.bankRecord}</td>
                  <td className="py-3 px-4 font-data text-sm text-amber-600 font-semibold">{row.tradeDoc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg border border-cyan-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-700 font-body">
            <span className="font-semibold">Key insight:</span> The same Russian name can appear in 4+ different Latin spellings across international documents. Traditional screening systems that rely on exact matching will miss these variants.
          </p>
        </div>
      </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="premium-card sticky top-6 space-y-4 rounded-xl p-6 lg:top-24">
            <h2 className="text-sm font-bold font-display text-slate-900">Why This Matters</h2>
            <p className="text-sm leading-relaxed text-slate-600 font-body">
              A single Russian company name like &apos;Рособоронэкспорт&apos; can be written as Rosoboronexport,
              Rosoboroneksport, or Rosoboroneksport depending on the transliteration standard. Traditional screening
              tools check only one spelling — missing matches on other lists. This engine generates ALL variants across 4
              international standards to catch what others miss.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-slate-600 font-body">
                <span className="font-semibold text-slate-700">Example:</span> Щербаков → Shcherbakov (ISO 9) / Ščerbakov
                (ICAO) / Scherbakov (BGN/PCGN) / Sherbakov (Informal)
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/*
 * SCREENING PAGE — Single entity + batch upload forms
 */
import { useState } from "react";
import { Search, Upload, FileSpreadsheet } from "lucide-react";

const COUNTRY_OPTIONS = ["Russia", "Iran", "North Korea", "Syr"] as const;

export default function Screening() {
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [vendorName, setVendorName] = useState("");
  const [country, setCountry] = useState("");

  const handleScreen = () => {
    if (!vendorName.trim()) return;
    // Demo: no backend — form validates only
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">Sanctions Screening</h1>
        <p className="text-sm text-slate-500 font-body mt-2">
          Screen vendors against 45,296 sanctioned entities across 4 international lists
        </p>
      </div>

      <div className="premium-card rounded-xl p-8">
        <div className="flex gap-1 p-1.5 bg-slate-100 rounded-lg w-fit mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
              activeTab === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Search className="w-4 h-4" /> Single Entity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("batch")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
              activeTab === "batch" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Batch Upload
          </button>
        </div>

        {activeTab === "single" ? (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleScreen();
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="screening-search" className="block text-xs font-semibold text-slate-600 font-display uppercase tracking-wide">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    id="screening-search"
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Enter vendor or entity name..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-4 pl-12 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    autoComplete="organization"
                  />
                </div>
              </div>
              <button type="submit" className="btn-premium btn-premium-primary shrink-0 text-sm lg:self-end">
                Screen
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="vendor-name" className="block text-xs font-semibold text-slate-600 font-display uppercase tracking-wide">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                id="vendor-name"
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Legal name of vendor or entity"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                autoComplete="organization"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="block text-xs font-semibold text-slate-600 font-display uppercase tracking-wide">
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body text-slate-800 transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="">Select country</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-400 font-body italic">For demonstration purposes only</p>
          </form>
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
    </div>
  );
}

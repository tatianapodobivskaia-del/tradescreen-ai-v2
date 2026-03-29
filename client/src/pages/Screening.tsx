/*
 * SCREENING PAGE — Upload document + manual entry
 */
import { useState } from "react";
import { Search, Upload, FileText } from "lucide-react";

/** Full alphabetical country list (50+) */
const COUNTRY_OPTIONS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Venezuela",
  "Vietnam",
] as const;

const DOCUMENT_TYPES = [
  "Invoice",
  "Bill of Lading",
  "Certificate of Origin",
  "Contract",
  "Purchase Order",
  "Letter of Credit",
] as const;

export default function Screening() {
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [vendorName, setVendorName] = useState("");
  const [country, setCountry] = useState("");
  const [amount, setAmount] = useState("");
  const [docType, setDocType] = useState("");
  const [cyrillicName, setCyrillicName] = useState("");

  const handleScreen = () => {
    if (!vendorName.trim()) return;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Sanctions Screening</h1>
        <p className="mt-2 text-sm text-slate-500 font-body">
          Screen vendors against 45,296 sanctioned entities across 4 international lists
        </p>
      </div>

      <div className="premium-card rounded-xl p-8">
        <div className="mb-8 flex w-fit gap-1 rounded-lg bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload className="h-4 w-4" /> Upload Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Search className="h-4 w-4" /> Manual Entry
          </button>
        </div>

        {activeTab === "upload" ? (
          <div>
            <div className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-12 text-center transition-colors hover:border-cyan-500/40">
              <Upload className="mx-auto mb-4 h-12 w-12 text-slate-300 transition-colors group-hover:text-cyan-500" />
              <p className="text-sm font-semibold text-slate-600 font-body">Drop CSV file here or click to browse</p>
              <p className="mt-2 text-xs text-slate-400 font-body">
                Supports CSV and PDF. Excel coming soon.
              </p>
            </div>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleScreen();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="vendor-name"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
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
              <label
                htmlFor="country"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="">Select country...</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Transaction Amount (USD)
              </label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 125000"
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="doc-type"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Document Type
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="">Select type...</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="cyrillic-name"
                className="block text-xs font-semibold font-display uppercase tracking-wide text-slate-600"
              >
                Cyrillic Name <span className="font-normal normal-case text-slate-400">(if applicable)</span>
              </label>
              <input
                id="cyrillic-name"
                type="text"
                value={cyrillicName}
                onChange={(e) => setCyrillicName(e.target.value)}
                placeholder="e.g. Рособоронэкспорт"
                className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-body transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-premium btn-premium-primary shrink-0 text-sm">
                Screen This Vendor
              </button>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                (Research Demo)
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Results placeholder + AI Deep Analysis */}
      <div className="premium-card rounded-xl p-8">
        <h2 className="text-base font-bold font-display text-slate-900">Screening results</h2>
        <p className="mt-2 text-sm text-slate-500 font-body">
          Match scores, list hits, and recommended actions will appear here after you screen a vendor.
        </p>
        <div className="mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-sm font-bold font-display text-slate-900">AI Deep Analysis</h3>
          <p className="mt-1 text-xs text-slate-500 font-body">
            Contextual risk explanation and narrative reasoning for the screening decision.
          </p>
          <button
            type="button"
            className="btn-premium btn-premium-outline mt-4 text-sm"
          >
            Run AI Deep Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

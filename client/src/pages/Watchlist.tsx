/*
 * WATCHLIST EXPLORER — Live search against sanctions API (session-local)
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { RiskBadge } from "@/components/shared";
import {
  checkAPIHealth,
  formatSanctionsListHealthTimestamp,
  postSanctionsScreen,
  type ApiHealthSnapshot,
  type ScreenVendorApiResult,
} from "@/lib/api";
import { Search, Loader2 } from "lucide-react";

function listCountsFromHealth(h: ApiHealthSnapshot | null): {
  ofac?: number;
  eu?: number;
  un?: number;
  uk?: number;
} {
  if (!h?.lists) return {};
  const lc = h.lists;
  return {
    ofac: lc.OFAC_SDN ?? lc.ofac_sdn,
    eu: lc.EU ?? lc.eu,
    un: lc.UN ?? lc.un,
    uk: lc.UK_OFSI ?? lc.uk_ofsi,
  };
}

function computeTotalFromLists(h: ApiHealthSnapshot | null): number | undefined {
  if (!h) return undefined;
  const { ofac, eu, un, uk } = listCountsFromHealth(h);
  if (
    typeof ofac === "number" &&
    typeof eu === "number" &&
    typeof un === "number" &&
    typeof uk === "number"
  ) {
    return ofac + eu + un + uk;
  }
  if (typeof h.total_entities === "number" && Number.isFinite(h.total_entities)) {
    return h.total_entities;
  }
  return undefined;
}

function riskToBadge(risk: string): "High" | "Medium" | "Low" {
  const u = risk.trim().toUpperCase();
  if (u === "HIGH" || u === "BLOCK") return "High";
  if (u === "MEDIUM" || u === "REVIEW" || u === "FLAG") return "Medium";
  return "Low";
}

export default function Watchlist() {
  const [health, setHealth] = useState<ApiHealthSnapshot | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenVendorApiResult | null>(null);

  useEffect(() => {
    void (async () => {
      const h = await checkAPIHealth();
      setHealth(h);
    })();
  }, []);

  const { ofac, eu, un, uk } = listCountsFromHealth(health);
  const totalListed = computeTotalFromLists(health);
  const barDenominator = totalListed ?? (parseInt(getCachedSanctionsCount().replace(/\D/g, "")) || 45000);

  const listDistribution = useMemo(() => {
    const rows: { name: string; value: number; color: string; flag: string }[] = [];
    if (typeof ofac === "number") rows.push({ name: "OFAC SDN", value: ofac, color: "#22d3ee", flag: "🇺🇸" });
    if (typeof uk === "number") rows.push({ name: "UK OFSI", value: uk, color: "#06b6d4", flag: "🇬🇧" });
    if (typeof eu === "number") rows.push({ name: "EU Consolidated", value: eu, color: "#0ea5e9", flag: "🇪🇺" });
    if (typeof un === "number") rows.push({ name: "UN Security Council", value: un, color: "#38bdf8", flag: "🇺🇳" });
    return rows;
  }, [ofac, uk, eu, un]);

  const healthTsLabel = health?.ts != null ? formatSanctionsListHealthTimestamp(health.ts) : "";

  const runSearch = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSubmittedQuery(trimmed);
    try {
      const data = await postSanctionsScreen([
        {
          name: trimmed,
          country: "—",
          amount: 0,
          doc: "—",
          cyrillic: "",
          sdn_match: "",
          fuzzy_score: 0,
          pattern_risk: "LOW",
          sdn_score: 0,
          risk: "LOW",
        },
      ]);
      const row = data.results?.[0];
      setResult(row ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch(query);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Watchlist Explorer</h1>
        <p className="mt-1 text-sm text-slate-500 font-body">
          Search and explore sanctioned entities across all monitored lists
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 font-body">
          {healthTsLabel ? `Last health check: ${healthTsLabel}` : "Connect to the API to see live list metadata."}
        </p>
      </div>

      {/* List proportion bars */}
      <div className="premium-card rounded-xl p-8">
        <h3 className="text-xs font-semibold text-slate-500 font-display uppercase tracking-wider mb-3">List Distribution</h3>
        {listDistribution.length === 0 ? (
          <p className="text-sm text-slate-500 font-body">Load health data to see live list counts.</p>
        ) : (
          <div className="space-y-3">
            {listDistribution.map((source, i) => {
              const pct = barDenominator > 0 ? ((source.value / barDenominator) * 100).toFixed(1) : "0";
              return (
                <div key={source.name} className="flex items-center gap-3">
                  <span className="text-lg">{source.flag}</span>
                  <span className="w-36 text-xs font-medium text-slate-600 font-body shrink-0">{source.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#06b6d4]"
                      style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }}
                    />
                  </div>
                  <span className="text-xs font-data text-slate-500 w-20 text-right shrink-0">
                    {source.value.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="premium-card rounded-xl p-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="watchlist-search" className="mb-1 block text-xs font-semibold text-slate-500 font-display uppercase tracking-wider">
              Entity name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                id="watchlist-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${getCachedSanctionsCount()} entities across OFAC, EU, UN, UK OFSI`}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-body focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#06b6d4] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Search
          </button>
        </form>
        {error ? (
          <p className="mt-3 text-sm text-red-600 font-body" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {/* Results */}
      <div className="premium-card rounded-xl overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold font-display text-slate-900">Screening result</h3>
          <p className="mt-1 text-xs text-slate-500 font-body">
            {submittedQuery ? `Query: “${submittedQuery}”` : "Submit a name to call the live screening endpoint."}
          </p>
        </div>
        {submittedQuery == null ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-500 font-body">Enter a name to search the sanctions database</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span className="text-sm font-body">Screening…</span>
          </div>
        ) : result ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Entity</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Assessment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Risk</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Action</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 font-display">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4 font-medium text-slate-800 font-body">{result.vendor}</td>
                  <td className="px-5 py-4 text-xs text-slate-600 font-body">
                    {result.assessment.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge risk={riskToBadge(result.risk)} />
                  </td>
                  <td className="px-5 py-4 font-data text-xs font-semibold text-slate-800">{result.action}</td>
                  <td className="max-w-md px-5 py-4 text-xs leading-relaxed text-slate-600 font-body">{result.reasoning}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-500 font-body">No result row returned for this query.</div>
        )}
      </div>
    </div>
  );
}

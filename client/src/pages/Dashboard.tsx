// @ts-nocheck
/*
 * DASHBOARD — Intelligence Overview
 * Premium: enlarged spacing, premium cards, stronger headings, AI glow on key metrics
 */
import { CountUpNumber, RiskBadge, StatusDot, ScanningLine } from "@/components/shared";
import { useEffect, useMemo, useState } from "react";
import { checkAPIHealth, type ApiHealthSnapshot } from "@/lib/api";
import { getScreeningHistory, getSessionStats, subscribeSession } from "@/lib/sessionStore";
import { useLocation, Link } from "wouter";
import { TrendingUp, TrendingDown, Clock, Shield, AlertTriangle, Activity, ArrowLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statIcons = [Activity, Shield, AlertTriangle, Clock];

const STAT_CARD_TITLES = [
  "TOTAL SCREENED",
  "ENTITIES MONITORED",
  "HIGH RISK",
  "AVG. PROCESSING TIME",
] as const;

const STAT_CARD_SUBTITLES = [
  "Screenings completed in this browser session",
  "Total sanctioned entities reported by the live API health endpoint",
  "Session count of HIGH risk screening outcomes",
  "Mean screening duration for this session",
] as const;

function formatHealthTimestamp(ts: string | number | undefined): string {
  if (ts === undefined) return "—";
  if (typeof ts === "number") {
    const ms = ts < 1e12 ? ts * 1000 : ts;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
  }
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString();
}

function computeTotalEntitiesFromHealth(h: ApiHealthSnapshot): number | undefined {
  if (typeof h.total_entities === "number" && Number.isFinite(h.total_entities)) {
    return h.total_entities;
  }
  const lc = h.lists ?? {};
  const ofac = lc.OFAC_SDN ?? lc.ofac_sdn;
  const eu = lc.EU ?? lc.eu;
  const un = lc.UN ?? lc.un;
  const uk = lc.UK_OFSI ?? lc.uk_ofsi;
  if (
    typeof ofac === "number" &&
    typeof eu === "number" &&
    typeof un === "number" &&
    typeof uk === "number"
  ) {
    return ofac + eu + un + uk;
  }
  return undefined;
}

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

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [health, setHealth] = useState<ApiHealthSnapshot | null>(null);
  const [sessionTick, setSessionTick] = useState(0);

  useEffect(() => {
    void (async () => {
      const h = await checkAPIHealth();
      setHealth(h);
    })();
  }, []);

  useEffect(() => {
    return subscribeSession(() => setSessionTick((t) => t + 1));
  }, []);

  /** Re-read session stats when landing on the dashboard (same module as Screening via @/lib/sessionStore). */
  useEffect(() => {
    void location;
    setSessionTick((t) => t + 1);
  }, [location]);

  const sessionHistory = useMemo(() => {
    void sessionTick;
    return getScreeningHistory();
  }, [sessionTick]);

  const sessionStats = useMemo(() => {
    void sessionTick;
    return getSessionStats();
  }, [sessionTick]);

  const apiReachable = health !== null;
  const { ofac, eu, un, uk } = listCountsFromHealth(health);
  const totalEntities = health != null ? computeTotalEntitiesFromHealth(health) : undefined;

  const apiOperational =
    apiReachable &&
    (!health?.status || String(health.status).trim().toLowerCase() === "online");

  const avgMs = sessionStats.avgProcessingMs;
  const avgLabel = avgMs ? `${(avgMs / 1000).toFixed(avgMs >= 1000 ? 1 : 2)}s` : "—";

  const statCardSubtitles = useMemo(() => {
    const base = [...STAT_CARD_SUBTITLES];
    if (!apiReachable) {
      base[1] = "API unreachable — connect to load live watchlist counts";
    } else if (ofac != null && eu != null && un != null && uk != null) {
      base[1] = `OFAC: ${ofac.toLocaleString()}, EU: ${eu.toLocaleString()}, UN: ${un.toLocaleString()}, UK: ${uk.toLocaleString()}`;
    } else if (typeof totalEntities === "number") {
      base[1] = `Combined watchlist size: ${totalEntities.toLocaleString()}`;
    } else {
      base[1] = "Total entities not reported in this health payload";
    }
    return base;
  }, [apiReachable, ofac, eu, un, uk, totalEntities]);

  const dashboardStats = useMemo(() => {
    const total = sessionStats.total;
    const high = sessionStats.high;
    const entitiesValue: number | string =
      !apiReachable ? "OFFLINE" : typeof totalEntities === "number" ? totalEntities : "—";
    const entitiesSparkline =
      !apiReachable || typeof totalEntities !== "number"
        ? Array(12).fill(0)
        : Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round((totalEntities * (i + 1)) / 12)));

    return [
      {
        label: "TOTAL SCREENED",
        value: total as number | string,
        change: total > 0 ? `+${total}` : "",
        trend: "up" as const,
        sparkline: sessionHistory
          .slice()
          .reverse()
          .slice(-12)
          .map((_, i) => i + 1),
      },
      {
        label: "ENTITIES MONITORED",
        value: entitiesValue,
        change: "",
        trend: "up" as const,
        sparkline: entitiesSparkline,
      },
      {
        label: "HIGH RISK",
        value: high,
        change: high > 0 ? `+${high}` : "",
        trend: "up" as const,
        sparkline: sessionHistory
          .slice()
          .reverse()
          .slice(-12)
          .map((r) => ((r.risk || "").toUpperCase() === "HIGH" ? 1 : 0))
          .reduce<number[]>((acc, v) => {
            const prev = acc.length ? acc[acc.length - 1] : 0;
            acc.push(prev + v);
            return acc;
          }, []),
      },
      {
        label: "AVG. PROCESSING TIME",
        value: avgLabel,
        change: avgMs ? "" : "",
        trend: "down" as const,
        sparkline: sessionHistory
          .slice()
          .reverse()
          .slice(-12)
          .map((r) => (typeof r.durationMs === "number" ? Math.max(0.2, r.durationMs / 1000) : 0)),
      },
    ];
  }, [sessionStats.total, sessionStats.high, avgLabel, avgMs, sessionHistory, apiReachable, totalEntities]);

  const listDistribution = useMemo(() => {
    if (!apiReachable) return [];
    const rows: { name: string; value: number; color: string }[] = [];
    if (typeof ofac === "number") rows.push({ name: "OFAC SDN", value: ofac, color: "#22d3ee" });
    if (typeof uk === "number") rows.push({ name: "UK OFSI", value: uk, color: "#06b6d4" });
    if (typeof eu === "number") rows.push({ name: "EU Consolidated", value: eu, color: "#0ea5e9" });
    if (typeof un === "number") rows.push({ name: "UN Security Council", value: un, color: "#0ea5e9" });
    return rows;
  }, [apiReachable, ofac, uk, eu, un]);

  const screeningActivityData = useMemo(() => {
    const buckets = new Map<string, { month: string; screenings: number; flagged: number }>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() - i);
      const label = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      buckets.set(label, { month: label, screenings: 0, flagged: 0 });
    }
    for (const r of sessionHistory) {
      const d = new Date(r.timestamp);
      if (Number.isNaN(d.getTime())) continue;
      d.setMinutes(0, 0, 0);
      const label = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      const b = buckets.get(label);
      if (!b) continue;
      b.screenings += 1;
      if ((r.risk || "").toUpperCase() !== "LOW") b.flagged += 1;
    }
    return [...buckets.values()];
  }, [sessionHistory]);

  const recentRows = useMemo(() => sessionHistory.slice(0, 8), [sessionHistory]);

  const systemRows = useMemo(() => {
    type Row = { label: string; value: string; status: "operational" | "degraded" | "down" };
    if (!apiReachable || !health) {
      return [
        { label: "Screening Engine", value: "Offline", status: "down" as const },
        { label: "Sanctions Database", value: "—", status: "down" as const },
        { label: "Cyrillic Engine", value: "Operational", status: "operational" as const },
        { label: "AI Analysis", value: "—", status: "down" as const },
        { label: "Document Scanner", value: "—", status: "down" as const },
        { label: "Health response", value: "—", status: "down" as const },
      ] satisfies Row[];
    }
    const engineUp = Boolean(health.engine && String(health.engine).trim());
    const dbCount =
      typeof totalEntities === "number" && Number.isFinite(totalEntities)
        ? `${totalEntities.toLocaleString()} entities`
        : "—";
    const aiUp = health.ai != null && health.ai !== false && health.ai !== "";
    const aiLabel = [typeof health.ai_model === "string" && health.ai_model.trim() ? health.ai_model.trim() : null]
      .filter(Boolean)
      .join("") || (aiUp ? "Connected" : "");
    const visionNorm = String(health.vision ?? health.vision_status ?? "")
      .trim()
      .toLowerCase();
    const docScannerUp = visionNorm === "enabled";
    const tsLabel = formatHealthTimestamp(health.ts);

    const rows: Row[] = [
      {
        label: "Screening Engine",
        value: engineUp ? "Operational" : "Offline",
        status: engineUp ? "operational" : "down",
      },
      {
        label: "Sanctions Database",
        value: dbCount,
        status: "operational",
      },
      {
        label: "Cyrillic Engine",
        value: "Operational",
        status: "operational",
      },
      {
        label: "AI Analysis",
        value: aiUp ? (aiLabel || "Operational") : "Offline",
        status: aiUp ? "operational" : "down",
      },
      {
        label: "Document Scanner",
        value: docScannerUp ? "Operational" : "Offline",
        status: docScannerUp ? "operational" : "down",
      },
      {
        label: "Health response",
        value: tsLabel,
        status: apiOperational ? "operational" : "degraded",
      },
    ];
    return rows;
  }, [apiReachable, apiOperational, health, totalEntities]);

  return (
    <div className="space-y-8">
      {!apiReachable ? (
        <div
          className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-body"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} aria-hidden />
          <p>API temporarily unreachable — list metrics and system status show OFFLINE until the health endpoint responds.</p>
        </div>
      ) : null}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">
            Intelligence Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-body">Session data — resets on page reload</p>
          <p className="mt-2 text-sm text-slate-500 font-body">
            Screening activity overview — aggregated metrics from all completed screenings
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/app/screening"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden /> Back to Screening
          </Link>
          <div className="text-xs font-data text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
            API health as of: {health != null ? formatHealthTimestamp(health.ts) : "—"}
          </div>
        </div>
      </div>

      {/* Stat Cards — premium with glow on first card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => {
          const Icon = statIcons[i];
          const isHighlight = i === 0;
          return (
            <div
              key={i}
              className={`${isHighlight ? "ai-glow" : "premium-card"} rounded-xl p-6 relative overflow-hidden group`}
            >
              <ScanningLine className="opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${isHighlight ? "bg-amber-100" : "bg-amber-50"} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  {stat.change ? (
                    <div className="flex items-center gap-1 text-xs font-data text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  ) : null}
                </div>
                <div className="font-data text-3xl font-extrabold text-slate-900">
                  {typeof stat.value === "number" ? <CountUpNumber value={stat.value} /> : stat.value}
                </div>
                <div className="mt-2 font-display text-xs font-bold uppercase tracking-wide text-slate-800">
                  {STAT_CARD_TITLES[i]}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-slate-500 font-body">
                  {statCardSubtitles[i]}
                </p>
                {/* Mini sparkline */}
                <div className="mt-4 h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stat.sparkline.map((v, j) => ({ v, i: j }))}>
                      <defs>
                        <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#22d3ee" strokeWidth={1.5} fill={`url(#spark-${i})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Screening Activity */}
        <div className="lg:col-span-2 premium-card rounded-xl p-8">
          <h3 className="text-lg font-extrabold font-display text-slate-900 mb-1">Screening Activity</h3>
          <p className="text-xs text-slate-500 font-body mb-6">Monthly screening volume and flagged entities</p>
          <div className="h-72">
            {sessionHistory.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 px-6 text-center">
                <p className="text-sm font-semibold text-slate-700 font-body">Run your first screening to see activity data here</p>
                <button
                  type="button"
                  onClick={() => setLocation("/app/screening")}
                  className="mt-3 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
                >
                  Go to Screening →
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={screeningActivityData}>
                  <defs>
                    <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="flagGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="screenings" stroke="#22d3ee" strokeWidth={2} fill="url(#screenGrad)" name="Total Screenings" />
                  <Area type="monotone" dataKey="flagged" stroke="#f59e0b" strokeWidth={2} fill="url(#flagGrad)" name="Flagged" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* List Distribution */}
        <div className="premium-card rounded-xl p-8">
          <h3 className="text-lg font-extrabold font-display text-slate-900 mb-1">List Distribution</h3>
          <p className="text-xs text-slate-500 font-body mb-6">Entities by sanctions list</p>
          {!apiReachable || listDistribution.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center">
              <p className="text-sm font-medium text-slate-600 font-body">
                {!apiReachable ? "—" : "No per-list counts in this health response"}
              </p>
            </div>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={listDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                      {listDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {listDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-body font-medium">{item.name}</span>
                    </div>
                    <span className="font-data font-bold text-slate-900">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Screenings + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Screenings Table */}
        <div className="lg:col-span-2 premium-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-extrabold font-display text-slate-900">Recent Screenings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">ID</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Entity</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Risk</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">Score</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 font-display uppercase tracking-wider">List</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.length === 0 ? (
                  <tr className="border-t border-slate-100">
                    <td colSpan={5} className="py-8 px-6 text-sm text-slate-500 font-body">
                      No screenings yet in this session
                    </td>
                  </tr>
                ) : (
                  recentRows.map((row, i) => {
                    const risk = (row.risk || "LOW").toUpperCase();
                    const displayRisk = risk === "HIGH" ? "High" : risk === "MEDIUM" ? "Medium" : "Low";
                    const score = typeof row.score === "number" ? row.score : "—";
                    const ts = new Date(row.timestamp);
                    const tsLabel = Number.isNaN(ts.getTime())
                      ? row.timestamp
                      : ts.toLocaleString("en-US", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
                    const type = row.source === "scanner" ? "Individual" : "Organization";
                    return (
                      <tr key={i} className="border-t border-slate-100 hover:bg-amber-50/30 transition-colors">
                        <td className="py-4 px-6 font-data text-xs text-slate-400">{tsLabel}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${type === "Individual" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}
                            >
                              {type === "Individual" ? "I" : "O"}
                            </span>
                            <span className="text-slate-800 font-semibold font-body">{row.vendorName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <RiskBadge risk={displayRisk as "High" | "Medium" | "Low"} />
                        </td>
                        <td className="py-4 px-6 font-data text-sm font-bold text-slate-700">{score}</td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-body">{row.action ?? "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="premium-card rounded-xl p-6">
          <h3 className="text-lg font-extrabold font-display text-slate-900 mb-6">System Status</h3>
          <div className="space-y-5">
            {systemRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <StatusDot status={row.status} />
                  <span className="truncate text-sm text-slate-700 font-body font-medium">{row.label}</span>
                </div>
                <span className="shrink-0 text-right text-xs font-data font-bold text-slate-600 max-w-[55%] break-words">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

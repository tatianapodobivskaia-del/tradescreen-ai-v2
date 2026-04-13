/*
 * AUDIT LOG — Session screening history with search, filters, export
 */
import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { getScreeningHistory, subscribeSession, type SessionScreeningResult } from "@/lib/sessionStore";
import { ScrollText, Search, Download, AlertTriangle, Info, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const severityConfig = {
  high: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  medium: { color: "text-amber-600", bg: "bg-amber-50", border: "border-cyan-200", icon: ShieldAlert },
  low: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: Info },
  info: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Info },
};

type AuditEntrySeverity = keyof typeof severityConfig;

type AuditEntry = {
  timestamp: string;
  action: string;
  user: string;
  entity: string;
  details: string;
  severity: AuditEntrySeverity;
};

function mapSessionToAuditEntry(r: SessionScreeningResult): AuditEntry {
  const riskU = (r.risk || "LOW").toUpperCase();
  let severity: AuditEntrySeverity = "low";
  if (riskU === "HIGH") severity = "high";
  else if (riskU === "MEDIUM") severity = "medium";
  const scoreStr = typeof r.score === "number" ? String(r.score) : "—";
  const actionStr = r.action?.trim() ? r.action.trim() : "—";
  const sourceLabel = r.source === "scanner" ? "scanner" : "screening";
  return {
    timestamp: r.timestamp,
    action: riskU,
    user: sourceLabel,
    entity: r.vendorName,
    details: `Score: ${scoreStr} · Action: ${actionStr} · Source: ${sourceLabel}`,
    severity,
  };
}

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sessionTick, setSessionTick] = useState(0);

  useEffect(() => {
    return subscribeSession(() => setSessionTick((t) => t + 1));
  }, []);

  const auditEntries = useMemo(() => {
    void sessionTick;
    return getScreeningHistory().map(mapSessionToAuditEntry);
  }, [sessionTick]);

  const filtered = useMemo(() => {
    return auditEntries.filter((entry) => {
      const matchesSearch =
        !search ||
        entry.entity.toLowerCase().includes(search.toLowerCase()) ||
        entry.details.toLowerCase().includes(search.toLowerCase()) ||
        entry.action.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [search, severityFilter, auditEntries]);

  const hasAnySessionActivity = auditEntries.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500 font-body mt-1 leading-relaxed">
            Session audit trail of screening activity from this browser tab. Entries reset when the page is reloaded —
            for regulatory workflows, export or integrate with your own logging layer.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/app/screening"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden /> Back to Screening
          </Link>
          <Button variant="outline" className="gap-2 text-sm">
            <Download className="w-4 h-4" /> Export Log
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by entity or details..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <option value="all">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div className="mt-3 text-xs text-slate-400 font-data">
          {filtered.length} entries
        </div>
      </div>

      {/* Log Entries */}
      <div className="premium-card rounded-xl overflow-hidden">
        {!hasAnySessionActivity ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <ScrollText className="mb-3 h-10 w-10 text-slate-300" aria-hidden />
            <p className="text-sm font-medium text-slate-600 font-body">No screening activity in this session</p>
            <Link
              href="/app/screening"
              className="mt-4 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-800"
            >
              Go to Screening →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500 font-body">
                No entries match your search or severity filter.
              </div>
            ) : (
              filtered.map((entry, i) => {
                const config = severityConfig[entry.severity];
                const SevIcon = config.icon;
                const date = new Date(entry.timestamp);
                return (
                  <div
                    key={`${entry.timestamp}-${i}`}
                    className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <SevIcon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold font-data ${config.color}`}>{entry.action}</span>
                        <span className="text-xs text-slate-400 font-body">· {entry.user}</span>
                      </div>
                      <div className="text-sm text-slate-800 font-body">
                        <span className="font-medium">{entry.entity}</span>
                        <span className="text-slate-500"> — {entry.details}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-data text-slate-400">
                        {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div className="text-[10px] font-data text-slate-300">
                        {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}{" "}
                        local
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

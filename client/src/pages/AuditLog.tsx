/*
 * AUDIT LOG — Timestamped log with search, filters, export
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { auditLogEntries } from "@/lib/mockData";
import { ScrollText, Search, Download, Filter, Clock, AlertTriangle, Info, ShieldAlert, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const severityConfig = {
  high: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  medium: { color: "text-amber-600", bg: "bg-amber-50", border: "border-cyan-200", icon: ShieldAlert },
  low: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: Info },
  info: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Info },
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = useMemo(() => {
    return auditLogEntries.filter((entry) => {
      const matchesSearch = !search || entry.entity.toLowerCase().includes(search.toLowerCase()) || entry.details.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [search, severityFilter]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500 font-body mt-1 leading-relaxed">
            Complete audit trail of all screening activity. Every scan, analysis, and export is logged with timestamps —
            essential for regulatory compliance and internal reviews.
          </p>
        </div>
        <Button variant="outline" className="gap-2 text-sm">
          <Download className="w-4 h-4" /> Export Log
        </Button>
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
        <div className="divide-y divide-slate-100">
          {filtered.map((entry, i) => {
            const config = severityConfig[entry.severity];
            const SevIcon = config.icon;
            const date = new Date(entry.timestamp);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <SevIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold font-data ${config.color}`}>{entry.action}</span>
                    <span className="text-xs text-slate-400 font-body">by {entry.user}</span>
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
                    {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} UTC
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

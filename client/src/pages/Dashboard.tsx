/*
 * DASHBOARD — Intelligence Overview
 * Premium: enlarged spacing, premium cards, stronger headings, AI glow on key metrics
 */
import { motion } from "framer-motion";
import { CountUpNumber, RiskBadge, StatusDot, ScanningLine } from "@/components/shared";
import { dashboardStats, screeningActivityData, listDistribution, recentScreenings, systemStatus } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Clock, Shield, AlertTriangle, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const statIcons = [Activity, Shield, AlertTriangle, Clock];

/** Subtitles aligned to dashboardStats order from mockData */
const STAT_CARD_SUBTITLES = [
  "Vendors processed through sanctions screening",
  "Known sanctioned entities correctly identified in tests",
  "Entities with score > 70 matched against sanctions lists",
  "Average time to complete an automated screening run",
];

const STAT_CARD_TITLES = ["Total Screened", "Detection Rate", "High Risk", "Avg. Processing Time"] as const;

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">
            Intelligence Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-body">
            Screening activity overview — aggregated metrics from all completed screenings
          </p>
        </div>
        <div className="text-xs font-data text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">Last updated: {new Date().toLocaleString()}</div>
      </div>

      {/* Stat Cards — premium with glow on first card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => {
          const Icon = statIcons[i];
          const isHighlight = i === 0;
          return (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className={`${isHighlight ? "ai-glow" : "premium-card"} rounded-xl p-6 relative overflow-hidden group`}
            >
              <ScanningLine className="opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${isHighlight ? "bg-amber-100" : "bg-amber-50"} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-data text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="font-data text-3xl font-extrabold text-slate-900">
                  {typeof stat.value === "number" ? <CountUpNumber value={stat.value} /> : stat.value}
                </div>
                <div className="mt-2 font-display text-xs font-bold uppercase tracking-wide text-slate-800">
                  {STAT_CARD_TITLES[i]}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-slate-500 font-body">
                  {STAT_CARD_SUBTITLES[i]}
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
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Screening Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="lg:col-span-2 premium-card rounded-xl p-8"
        >
          <h3 className="text-lg font-extrabold font-display text-slate-900 mb-1">Screening Activity</h3>
          <p className="text-xs text-slate-500 font-body mb-6">Monthly screening volume and flagged entities</p>
          <div className="h-72">
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
          </div>
        </motion.div>

        {/* List Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="premium-card rounded-xl p-8"
        >
          <h3 className="text-lg font-extrabold font-display text-slate-900 mb-1">List Distribution</h3>
          <p className="text-xs text-slate-500 font-body mb-6">Entities by sanctions list</p>
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
        </motion.div>
      </div>

      {/* Recent Screenings + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Screenings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="lg:col-span-2 premium-card rounded-xl overflow-hidden"
        >
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
                {recentScreenings.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-amber-50/30 transition-colors">
                    <td className="py-4 px-6 font-data text-xs text-slate-400">{row.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${row.type === "Individual" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                          {row.type === "Individual" ? "I" : "O"}
                        </span>
                        <span className="text-slate-800 font-semibold font-body">{row.entity}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6"><RiskBadge risk={row.risk as "High" | "Medium" | "Low"} /></td>
                    <td className="py-4 px-6 font-data text-sm font-bold text-slate-700">{row.score}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-body">{row.list}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          viewport={{ once: true }}
          className="premium-card rounded-xl p-6"
        >
          <h3 className="text-lg font-extrabold font-display text-slate-900 mb-6">System Status</h3>
          <div className="space-y-5">
            {systemStatus.map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot status={service.status as "operational"} />
                  <span className="text-sm text-slate-700 font-body font-medium">{service.service}</span>
                </div>
                <span className="text-xs font-data font-bold text-slate-400">{service.uptime}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="text-xs text-slate-400 font-body">
              <span className="font-bold text-slate-600">Version:</span> 1.0.0-beta
            </div>
            <div className="text-xs text-slate-400 font-body mt-1.5">
              <span className="font-bold text-slate-600">Database:</span> Updated 2h ago
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

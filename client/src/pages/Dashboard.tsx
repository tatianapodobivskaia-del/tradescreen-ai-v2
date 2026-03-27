/*
 * DASHBOARD — Intelligence Overview
 * Light theme (#f5f7fa bg), glassmorphism cards, sparklines, count-up animations
 */
import { motion } from "framer-motion";
import { CountUpNumber, RiskBadge, StatusDot, ScanningLine } from "@/components/shared";
import { dashboardStats, screeningActivityData, listDistribution, recentScreenings, systemStatus } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Clock, Shield, Users, AlertTriangle, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const statIcons = [Activity, Shield, AlertTriangle, Clock];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 font-body mt-1">Real-time sanctions screening overview</p>
        </div>
        <div className="text-xs font-data text-slate-400">Last updated: {new Date().toLocaleString()}</div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, i) => {
          const Icon = statIcons[i];
          return (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="glass-card rounded-xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <ScanningLine className="opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-cyan-600" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-data ${stat.trend === "up" && i !== 2 ? "text-emerald-600" : stat.trend === "down" && i === 2 ? "text-emerald-600" : "text-emerald-600"}`}>
                  {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold font-data text-slate-900">
                {typeof stat.value === "number" ? <CountUpNumber value={stat.value} /> : stat.value}
              </div>
              <div className="text-xs text-slate-500 font-body mt-1">{stat.label}</div>
              {/* Mini sparkline */}
              <div className="mt-3 h-8">
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
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Screening Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold font-display text-slate-900 mb-1">Screening Activity</h3>
          <p className="text-xs text-slate-500 font-body mb-4">Monthly screening volume and flagged entities</p>
          <div className="h-64">
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
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold font-display text-slate-900 mb-1">List Distribution</h3>
          <p className="text-xs text-slate-500 font-body mb-4">Entities by sanctions list</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={listDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {listDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {listDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-body">{item.name}</span>
                </div>
                <span className="font-data text-slate-900">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Screenings + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Screenings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card rounded-xl overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-semibold font-display text-slate-900">Recent Screenings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">ID</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Entity</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Risk</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">Score</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 font-display">List</th>
                </tr>
              </thead>
              <tbody>
                {recentScreenings.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-cyan-50/30 transition-colors">
                    <td className="py-3 px-5 font-data text-xs text-slate-400">{row.id}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${row.type === "Individual" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                          {row.type === "Individual" ? "I" : "O"}
                        </span>
                        <span className="text-slate-800 font-medium font-body">{row.entity}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5"><RiskBadge risk={row.risk as "High" | "Medium" | "Low"} /></td>
                    <td className="py-3 px-5 font-data text-sm text-slate-700">{row.score}</td>
                    <td className="py-3 px-5 text-xs text-slate-500 font-body">{row.list}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="glass-card rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold font-display text-slate-900 mb-4">System Status</h3>
          <div className="space-y-4">
            {systemStatus.map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot status={service.status as "operational"} />
                  <span className="text-sm text-slate-700 font-body">{service.service}</span>
                </div>
                <span className="text-xs font-data text-slate-400">{service.uptime}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-400 font-body">
              <span className="font-semibold text-slate-600">Version:</span> 1.0.0-beta
            </div>
            <div className="text-xs text-slate-400 font-body mt-1">
              <span className="font-semibold text-slate-600">Database:</span> Updated 2h ago
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

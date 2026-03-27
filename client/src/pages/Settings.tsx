/*
 * SETTINGS — Fuzzy matching threshold, notifications, version, data policy
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Sliders, Bell, Info, Shield, Database } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(75);
  const [notifications, setNotifications] = useState({
    highRisk: true,
    batchComplete: true,
    listUpdates: false,
    weeklyReport: true,
  });

  const handleSave = () => {
    toast.success("Settings saved (demo only — not persisted)");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 font-body mt-1">Configure screening parameters and preferences</p>
      </div>

      {/* Fuzzy Matching Threshold */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Fuzzy Matching Threshold</h3>
        </div>
        <p className="text-sm text-slate-500 font-body mb-4">
          Minimum similarity score required to flag a potential match. Lower values increase sensitivity but may produce more false positives.
        </p>
        <div className="space-y-3">
          <input
            type="range"
            min={30}
            max={99}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-data">30% (High Sensitivity)</span>
            <span className="text-lg font-bold font-data text-cyan-600">{threshold}%</span>
            <span className="text-xs text-slate-400 font-data">99% (Exact Match)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-body">
              <span className="font-semibold text-slate-700">Current setting:</span> Entities with a name similarity score of {threshold}% or higher will be flagged for review.
              {threshold < 60 && " Warning: Very low threshold may generate excessive false positives."}
              {threshold > 90 && " Note: High threshold may miss transliteration variants."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: "highRisk", label: "High-risk entity alerts", description: "Immediate notification when a HIGH risk match is detected" },
            { key: "batchComplete", label: "Batch processing complete", description: "Notification when batch CSV screening finishes" },
            { key: "listUpdates", label: "Sanctions list updates", description: "Alert when OFAC, EU, UN, or UK OFSI lists are updated" },
            { key: "weeklyReport", label: "Weekly summary report", description: "Automated weekly screening activity digest" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-sm font-medium text-slate-800 font-body">{item.label}</div>
                <div className="text-xs text-slate-400 font-body">{item.description}</div>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-cyan-500" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* About / Version */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">About</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Version</div>
            <div className="text-sm font-data text-slate-900">1.0.0-beta</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Build</div>
            <div className="text-sm font-data text-slate-900">2025.03.15</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Entities Database</div>
            <div className="text-sm font-data text-slate-900">45,296</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Lists Monitored</div>
            <div className="text-sm font-data text-slate-900">4 (OFAC, EU, UN, UK)</div>
          </div>
        </div>
      </motion.div>

      {/* Data Handling Policy */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Data Handling Policy</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-600 font-body leading-relaxed">
          <p>This is an academic research prototype. All data processing occurs locally in the browser.</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              No vendor names or screening results are stored on external servers
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              Uploaded documents are processed in-memory and discarded after analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              Sanctions list data is sourced from publicly available government databases
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
              All session data is cleared when the browser tab is closed
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

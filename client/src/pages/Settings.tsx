/*
 * SETTINGS — AI sensitivity threshold, notifications, version, data policy
 */
import { useEffect, useState } from "react";
import { Sliders, Bell, Info, Shield } from "lucide-react";
import { toast } from "sonner";
import { getCachedSanctionsCount } from "@/lib/hooks/useSanctionsListCounts";
import { getThreshold, setThreshold as persistSensitivityThreshold, subscribeSession } from "@/lib/sessionStore";

function sensitivityBandExplanation(threshold: number): string {
  if (threshold < 60) {
    return "High sensitivity — more entities flagged, higher false positive rate";
  }
  if (threshold <= 80) {
    return "Balanced — recommended for most compliance workflows";
  }
  return "Strict — only strong matches flagged, lowest false positive rate";
}

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(() => getThreshold());
  const [notifications, setNotifications] = useState({
    highRisk: true,
    batchComplete: true,
    listUpdates: false,
    weeklyReport: true,
  });

  useEffect(() => {
    return subscribeSession(() => setThreshold(getThreshold()));
  }, []);

  const handleSave = () => {
    persistSensitivityThreshold(threshold);
    toast.success("Settings saved — sensitivity threshold applies to new composite risk tiers.");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 font-body mt-1">Configure screening parameters and preferences</p>
      </div>

      {/* AI Sensitivity Threshold */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">AI Sensitivity Threshold</h3>
        </div>
        <p className="text-sm text-slate-500 font-body mb-4">
          Composite scores (0–100) are compared to this threshold: at or above the threshold counts as HIGH risk; at or
          above 70% of the threshold counts as MEDIUM; otherwise LOW. Adjust to match your tolerance for false positives
          versus missed matches.
        </p>
        <div className="space-y-3">
          <input
            type="range"
            min={30}
            max={99}
            value={threshold}
            onChange={(e) => {
              const v = Number(e.target.value);
              setThreshold(v);
              persistSensitivityThreshold(v);
            }}
            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#06b6d4]"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-data">30% (High Sensitivity)</span>
            <span className="text-lg font-bold font-data text-amber-600">{threshold}%</span>
            <span className="text-xs text-slate-400 font-data">99% (Exact Match)</span>
          </div>
          <p className="text-sm text-slate-700 font-body leading-relaxed border border-slate-100 bg-slate-50/80 rounded-lg px-3 py-2.5">
            {sensitivityBandExplanation(threshold)}
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-body">
              <span className="font-semibold text-slate-700">Current setting:</span> HIGH if composite ≥ {threshold}%;
              MEDIUM if composite ≥ {Math.round(threshold * 0.7)}%; LOW otherwise. Changes apply immediately to new
              screenings.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            {
              key: "highRisk",
              label: "High Risk Alert",
              description: "Get notified immediately when a high-risk entity (score > 70) is detected",
            },
            { key: "batchComplete", label: "Batch Complete", description: "Notification when a batch screening finishes processing" },
            {
              key: "listUpdates",
              label: "List Updates",
              description: "Alert when sanctions lists are refreshed (auto-updates every 6 hours from OFAC, EU, UN, UK OFSI)",
            },
            { key: "weeklyReport", label: "Weekly Report", description: "Receive a weekly summary of all screening activity" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <div className="text-sm font-medium text-slate-800 font-body">{item.label}</div>
                <div className="text-xs text-slate-400 font-body">{item.description}</div>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-[#06b6d4]" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500 font-body leading-relaxed">
          Supported upload formats: CSV, PDF. Excel support coming soon.
        </p>
      </div>

      {/* About / Version */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">About</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Version</div>
            <div className="text-sm font-data text-slate-900">1.0.0-beta</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Build</div>
            <div className="text-sm font-data text-slate-900">2026.03.15</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Entities Database</div>
            <div className="text-sm font-data text-slate-900">{getCachedSanctionsCount()}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50">
            <div className="text-xs text-slate-500 font-body mb-1">Lists Monitored</div>
            <div className="text-sm font-data text-slate-900">4 (OFAC, EU, UN, UK)</div>
          </div>
        </div>
      </div>

      {/* Data Handling Policy */}
      <div className="premium-card rounded-xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-cyan-500" />
          <h3 className="text-base font-bold font-display text-slate-900">Data Handling Policy</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-600 font-body leading-relaxed">
          <p>This is an academic research prototype. All data processing occurs locally in the browser.</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-2 shrink-0" />
              No vendor names or screening results are stored on external servers
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-2 shrink-0" />
              Uploaded documents are processed in-memory and discarded after analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-2 shrink-0" />
              Sanctions list data is sourced from publicly available government databases
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] mt-2 shrink-0" />
              All session data is cleared when the browser tab is closed
            </li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#06b6d4] hover:bg-[#0ea5e9] text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

// ---- Risk Badge ----
export function RiskBadge({ risk, className }: { risk: "High" | "Medium" | "Low"; className?: string }) {
  const badgeClass = risk === "High" ? "badge-high" : risk === "Medium" ? "badge-medium" : "badge-low";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-data", badgeClass, risk === "High" && "animate-pulse-glow", className)}>
      {risk}
    </span>
  );
}

// ---- Count Up Number ----
export function CountUpNumber({ value, prefix = "", suffix = "", className, duration = 2000 }: { value: number; prefix?: string; suffix?: string; className?: string; duration?: number }) {
  const { count, ref } = useCountUp(value, duration);
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className={cn("font-data tabular-nums", className)}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ---- Status Dot ----
export function StatusDot({ status }: { status: "operational" | "degraded" | "down" }) {
  const colors = {
    operational: "bg-emerald-500 status-dot",
    degraded: "bg-amber-500 animate-pulse",
    down: "bg-red-500",
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full", colors[status])} />;
}

// ---- Academic Badge ----
export function AcademicBadge({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded border text-[10px] font-semibold tracking-widest uppercase font-data", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent animate-pulse" />
      Academic Research Prototype
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase font-data border border-amber-500/30 bg-amber-500/10 text-amber-500", className)}>
      DEMO
    </span>
  );
}

// ---- Footer ----
export function Footer({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <footer className={cn("py-8 text-center text-sm font-body", isDark ? "bg-[#050810] text-slate-500 border-t border-slate-800" : "bg-white text-slate-500 border-t border-slate-200")}>
      <div className="max-w-6xl mx-auto px-4 space-y-2">
        <p className="font-medium">TradeScreen AI — Academic Research Prototype — Atlantis University ISM 6026</p>
        <p className="text-xs opacity-70">For Educational Use Only — Not a Commercial Compliance Tool</p>
        <p className="text-xs opacity-50">This prototype provides AI-assisted analysis to support human review.</p>
      </div>
    </footer>
  );
}

// ---- Section Title ----
export function SectionTitle({ children, subtitle, className, dark = false }: { children: React.ReactNode; subtitle?: string; className?: string; dark?: boolean }) {
  return (
    <div className={cn("text-center mb-12", className)}>
      <h2 className={cn("text-3xl md:text-4xl font-bold font-display tracking-tight", dark ? "text-white" : "text-slate-900")}>
        {children}
      </h2>
      {subtitle && (
        <p className={cn("mt-3 text-lg font-body max-w-2xl mx-auto", dark ? "text-slate-400" : "text-slate-600")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ---- Scanning Line Overlay ----
export function ScanningLine({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-scan" />
    </div>
  );
}

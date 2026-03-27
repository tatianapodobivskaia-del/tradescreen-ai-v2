/*
 * APP LAYOUT — Professional fintech command center
 * Design: Bloomberg/Palantir-grade sidebar with strong typography hierarchy
 * Logo is clickable → returns to landing page
 * Nav items use compact spacing so bottom links are always visible
 */
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Footer, AcademicBadge } from "./shared";
import {
  LayoutDashboard, Search, Globe, Languages, ScanLine, BarChart3,
  ScrollText, Cpu, User, Settings, Shield, ChevronLeft, ChevronRight, Menu, Home, ExternalLink
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/screening", label: "Screening", icon: Search },
  { path: "/app/watchlist", label: "Watchlist Explorer", icon: Globe },
  { path: "/app/cyrillic", label: "Cyrillic Engine", icon: Languages },
  { path: "/app/scanner", label: "AI Document Scanner", icon: ScanLine },
  { path: "/app/reports", label: "Reports & Analytics", icon: BarChart3 },
  { path: "/app/audit", label: "Audit Log", icon: ScrollText },
  { path: "/app/architecture", label: "Architecture", icon: Cpu },
  { path: "/app/about", label: "About Researcher", icon: User },
  { path: "/app/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        collapsed ? "w-[76px]" : "w-[280px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo / Branding — Clickable, returns to landing page */}
        <a
          href="/"
          className={cn(
            "flex items-center border-b border-sidebar-border shrink-0 hover:bg-white/[0.04] transition-colors",
            collapsed ? "justify-center px-3 h-[72px]" : "gap-4 px-6 h-[72px]"
          )}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/25">
            <Shield className="w-5.5 h-5.5 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-extrabold font-display text-white tracking-tight leading-none">
                TradeScreen<span className="text-cyan-400">AI</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.12em] uppercase font-data bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Prototype
                </span>
                <span className="text-[10px] font-data text-slate-500 tracking-wider">v1.0</span>
              </div>
            </div>
          )}
        </a>

        {/* Navigation — Compact spacing to ensure all items + bottom links fit */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <ul className="space-y-0.5 px-3">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/app" && location.startsWith(item.path));
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 rounded-lg transition-all duration-200 group relative",
                      collapsed ? "justify-center px-3 py-2.5" : "px-4 py-2.5",
                      isActive
                        ? "bg-cyan-500/12 text-cyan-400 font-semibold"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 font-medium"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400" />
                    )}
                    <Icon className={cn(
                      "w-[19px] h-[19px] shrink-0",
                      isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                    )} strokeWidth={isActive ? 2.2 : 1.8} />
                    {!collapsed && (
                      <span className="text-[14.5px] tracking-[-0.01em]">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section — always visible */}
        <div className="shrink-0 border-t border-sidebar-border">
          {/* Collapse toggle */}
          <div className="px-3 py-1.5 hidden lg:flex justify-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Back to landing */}
          <div className="px-3 pb-4 pt-0.5">
            <a
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-lg text-[13px] font-medium text-slate-500 hover:text-cyan-400 hover:bg-white/[0.06] transition-all duration-200",
                collapsed ? "justify-center px-3 py-2" : "px-4 py-2"
              )}
            >
              <Home className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <span className="flex items-center gap-1.5">
                  Landing Page
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </span>
              )}
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-[76px]" : "lg:ml-[280px]")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-13 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 flex items-center justify-between px-5 lg:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <AcademicBadge className="border-slate-200 text-slate-500" />
          </div>
          <div className="flex items-center gap-2.5 text-xs font-data text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot" />
            All Systems Operational
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7">
          {children}
        </main>

        <Footer variant="light" />
      </div>
    </div>
  );
}

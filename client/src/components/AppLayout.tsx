/*
 * APP LAYOUT — Premium fintech command center
 * Design: Bloomberg/Palantir-grade sidebar with strong typography hierarchy
 * Premium: larger fonts, more spacing, polished branding
 */
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Footer, AcademicBadge } from "./shared";
import TopNavbar from "./TopNavbar";
import {
  LayoutDashboard, Search, Globe, Languages, ScanLine, BarChart3,
  ScrollText, Cpu, User, Settings, Shield, ChevronLeft, ChevronRight, Home, ExternalLink,
  PlayCircle,
} from "lucide-react";
import { useState } from "react";

const LOGO_LIGHT = "data:image/png;base64,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";

const navItems = [
  { path: "/app/screening", label: "Screening", icon: Search },
  { path: "/app/live-demo", label: "Live Demo", icon: PlayCircle },
  { path: "/app/scanner", label: "AI Document Scanner", icon: ScanLine },
  { path: "/app/cyrillic", label: "Cyrillic Engine", icon: Languages },
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/watchlist", label: "Watchlist Explorer", icon: Globe },
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

      {/* Sidebar — premium fintech */}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        collapsed ? "w-[76px]" : "w-[288px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo / Branding — Clickable, returns to landing page */}
        <div className="flex items-center gap-2 px-4 py-4">
          <img src={LOGO_LIGHT} alt="TradeScreen AI" className="h-8 w-8 object-contain" />
          <span className="font-bold text-base text-slate-50 tracking-tight">TradeScreen <span className="text-cyan-400">AI</span></span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/app" && location.startsWith(item.path));
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 rounded-xl transition-all duration-200 group relative",
                      collapsed ? "justify-center px-3 py-3" : "px-5 py-3",
                      isActive
                        ? "bg-cyan-500/12 text-cyan-400 font-bold"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 font-medium"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-cyan-300" />
                    )}
                    <Icon className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                    )} strokeWidth={isActive ? 2.2 : 1.8} />
                    {!collapsed && (
                      <span className="text-[15px] tracking-[-0.01em]">{item.label}</span>
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
          <div className="px-3 py-2 hidden lg:flex justify-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Back to landing */}
          <div className="px-3 pb-5 pt-1">
            <a
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-cyan-400 hover:bg-white/[0.06] transition-all duration-200",
                collapsed ? "justify-center px-3 py-2.5" : "px-5 py-2.5"
              )}
            >
              <Home className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="flex items-center gap-1.5">
                  Landing Page
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </span>
              )}
            </a>
          </div>
        </div>
      </aside>

      {/* Main content — premium spacing */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-[76px]" : "lg:ml-[288px]")}>
        <TopNavbar className={collapsed ? "lg:left-[76px]" : "lg:left-[288px]"} />

        {/* Page content — premium padding */}
        <main className="flex-1 p-6 pt-24 lg:p-8 lg:pt-28">
          {children}
        </main>

        <Footer variant="light" />
      </div>
    </div>
  );
}

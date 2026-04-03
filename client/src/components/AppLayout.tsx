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
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo / Branding — Clickable, returns to landing page */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-2 py-4 text-inherit no-underline",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <img src="/logo-dark.png" alt="TradeScreen AI" className="h-8 w-8 shrink-0 object-contain" />
          {!collapsed && (
            <span className="font-bold text-base text-slate-50 tracking-tight">
              TradeScreen <span className="text-cyan-400">AI</span>
            </span>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className={cn("space-y-1", collapsed ? "px-1.5" : "px-3")}>
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
                      collapsed ? "justify-center px-0 py-3" : "px-5 py-3",
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
          <div className={cn("py-2 hidden lg:flex justify-center", collapsed ? "px-1.5" : "px-3")}>
            <button
              type="button"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
              className="p-2.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Back to landing */}
          <div className={cn("pb-5 pt-1", collapsed ? "px-1.5" : "px-3")}>
            <a
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-cyan-400 hover:bg-white/[0.06] transition-all duration-200",
                collapsed ? "justify-center px-0 py-2.5" : "px-5 py-2.5"
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
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-16" : "lg:ml-64")}>
        <TopNavbar variant="light" className={collapsed ? "lg:left-16" : "lg:left-64"} />

        {/* Page content — premium padding */}
        <main className="flex-1 p-6 pt-24 lg:p-8 lg:pt-28">
          {children}
        </main>

        <Footer variant="light" />
      </div>
    </div>
  );
}

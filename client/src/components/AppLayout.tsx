import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Footer, AcademicBadge, DemoBadge } from "./shared";
import {
  LayoutDashboard, Search, Globe, Languages, ScanLine, BarChart3,
  ScrollText, Cpu, User, Settings, Shield, ChevronLeft, ChevronRight, Menu, X
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
        collapsed ? "w-[68px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-accent flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-navy-deep" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold font-display text-white truncate">TradeScreenAI</h1>
              <DemoBadge className="mt-0.5" />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/app" && location.startsWith(item.path));
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-sidebar-accent text-cyan-accent"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-accent" />
                    )}
                    <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-cyan-accent")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-sidebar-border hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Back to landing */}
        <div className="p-3 border-t border-sidebar-border">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent/50 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && "Back to Landing"}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]")}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <AcademicBadge className="border-slate-300 text-slate-500" />
          </div>
          <div className="flex items-center gap-2 text-xs font-data text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-dot" />
            All Systems Operational
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        <Footer variant="light" />
      </div>
    </div>
  );
}

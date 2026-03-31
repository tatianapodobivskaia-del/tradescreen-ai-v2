/*
 * APP LAYOUT — Premium fintech command center
 * Design: Bloomberg/Palantir-grade sidebar with strong typography hierarchy
 * Premium: larger fonts, more spacing, polished branding
 */
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Footer, AcademicBadge } from "./shared";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Search, Globe, Languages, ScanLine, BarChart3,
  ScrollText, Cpu, User, Settings, Shield, ChevronLeft, ChevronRight, Menu, Home, ExternalLink, X,
  PlayCircle,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"solutions" | "research" | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (openDropdown && dropdownWrapRef.current && !dropdownWrapRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openDropdown]);

  const closeMenus = () => {
    setOpenDropdown(null);
    setMobileNavOpen(false);
  };

  const handleHowItWorks = (event?: MouseEvent) => {
    if (location === "/") {
      event?.preventDefault();
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenus();
    }
  };

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
        <a
          href="/"
          className={cn(
            "flex items-center border-b border-sidebar-border shrink-0 hover:bg-white/[0.04] transition-colors",
            collapsed ? "justify-center px-3 h-[80px]" : "gap-4 px-7 h-[80px]"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5C542] to-[#F5C542] flex items-center justify-center shrink-0 shadow-lg shadow-[#D4A843]/25">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-[22px] font-extrabold font-display text-white tracking-tight leading-none">
                TradeScreen<span className="text-amber-400">AI</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-[0.12em] uppercase font-data bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Prototype
                </span>
                <span className="text-[10px] font-data text-slate-500 tracking-wider">v1.0</span>
              </div>
            </div>
          )}
        </a>

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
                        ? "bg-[#D4A843]/12 text-amber-400 font-bold"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 font-medium"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[#F5C542]" />
                    )}
                    <Icon className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
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
                "flex items-center gap-3 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-amber-400 hover:bg-white/[0.06] transition-all duration-200",
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

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-[#0B0F1A]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-20 items-center justify-between border-b border-amber-500/20 px-6">
              <span className="text-xl font-extrabold tracking-tight text-white">TradeScreen AI</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg border border-amber-500/30 p-2 text-amber-400 transition-colors hover:bg-amber-500/10"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex h-[calc(100%-5rem)] flex-col justify-between overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Solutions</p>
                <div className="space-y-3">
                  <Link href="/app/screening" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">Sanctions Screening</Link>
                  <Link href="/app/scanner" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">Document Scanner</Link>
                  <Link href="/app/cyrillic" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">Cyrillic Transliteration</Link>
                  <Link href="/app/live-demo" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">Live Demo</Link>
                </div>
                <div className="h-px bg-slate-800" />
                {location === "/" ? (
                  <Link
                    href="/#how-it-works"
                    onClick={(e) => handleHowItWorks(e)}
                    className="block text-lg font-semibold text-white hover:text-amber-400"
                  >
                    How It Works
                  </Link>
                ) : (
                  <Link href="/app/architecture" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">How It Works</Link>
                )}
                <p className="pt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Research</p>
                <div className="space-y-3">
                  <Link href="/app/architecture" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">Architecture</Link>
                  <Link href="/app/about" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">About Researcher</Link>
                  <Link href="/app/reports" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">Reports</Link>
                </div>
                <div className="h-px bg-slate-800" />
                <Link href="/app/watchlist" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-amber-400">Data Sources</Link>
              </div>

              <div className="space-y-4 pt-8">
                <Link
                  href="/app/screening"
                  onClick={closeMenus}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#D4A843] px-4 py-3 text-sm font-bold text-[#0B0F1A] transition-colors hover:bg-[#F5C542]"
                >
                  Start Screening
                </Link>
                <p className="text-center text-[11px] font-medium text-slate-400">Academic Research Prototype</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — premium spacing */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "lg:ml-[76px]" : "lg:ml-[288px]")}>
        {/* Top navbar */}
        <header
          className={cn(
            "fixed right-0 top-0 z-[60] h-20 border-b transition-all duration-300",
            collapsed ? "lg:left-[76px]" : "lg:left-[288px]",
            scrolled
              ? "border-amber-500/20 bg-[#0B0F1A]/90 backdrop-blur-xl shadow-lg shadow-black/30"
              : "border-transparent bg-transparent"
          )}
        >
          <div className="flex h-full items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
                TradeScreen AI
              </Link>
            </div>

            <div ref={dropdownWrapRef} className="hidden items-center gap-7 lg:flex">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "solutions" ? null : "solutions")}
                  className="text-sm font-semibold text-slate-200 transition-colors hover:text-amber-400"
                >
                  Solutions
                </button>
                <AnimatePresence>
                  {openDropdown === "solutions" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-9 min-w-[260px] rounded-xl border border-amber-500/20 border-t-2 border-t-amber-400 bg-[#1A1F2E]/95 p-2 shadow-xl shadow-black/40 backdrop-blur-xl"
                    >
                      <Link href="/app/screening" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300">Sanctions Screening</Link>
                      <Link href="/app/scanner" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300">Document Scanner</Link>
                      <Link href="/app/cyrillic" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300">Cyrillic Transliteration</Link>
                      <Link href="/app/live-demo" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300">Live Demo</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {location === "/" ? (
                <Link
                  href="/#how-it-works"
                  onClick={(e) => handleHowItWorks(e)}
                  className="text-sm font-semibold text-slate-200 transition-colors hover:text-amber-400"
                >
                  How It Works
                </Link>
              ) : (
                <Link href="/app/architecture" onClick={closeMenus} className="text-sm font-semibold text-slate-200 transition-colors hover:text-amber-400">
                  How It Works
                </Link>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === "research" ? null : "research")}
                  className="text-sm font-semibold text-slate-200 transition-colors hover:text-amber-400"
                >
                  Research
                </button>
                <AnimatePresence>
                  {openDropdown === "research" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-9 min-w-[220px] rounded-xl border border-amber-500/20 border-t-2 border-t-amber-400 bg-[#1A1F2E]/95 p-2 shadow-xl shadow-black/40 backdrop-blur-xl"
                    >
                      <Link href="/app/architecture" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300">Architecture</Link>
                      <Link href="/app/about" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300">About Researcher</Link>
                      <Link href="/app/reports" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300">Reports</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/app/watchlist" onClick={closeMenus} className="text-sm font-semibold text-slate-200 transition-colors hover:text-amber-400">
                Data Sources
              </Link>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <span className="rounded-full border border-slate-600/80 bg-slate-800/60 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                Academic Research Prototype
              </span>
              <Link
                href="/app/screening"
                onClick={closeMenus}
                className="inline-flex items-center rounded-lg bg-[#D4A843] px-4 py-2 text-sm font-bold text-[#0B0F1A] transition-colors hover:bg-[#F5C542]"
              >
                Start Screening
              </Link>
            </div>
          </div>
        </header>

        {/* Page content — premium padding */}
        <main className="flex-1 p-6 pt-24 lg:p-8 lg:pt-28">
          {children}
        </main>

        <Footer variant="light" />
      </div>
    </div>
  );
}

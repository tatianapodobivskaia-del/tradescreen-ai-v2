import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type DropdownKey = "solutions" | "research";

export default function TopNavbar({ className }: { className?: string }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
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

  const handleHowItWorks = (event?: React.MouseEvent<HTMLAnchorElement>) => {
    const pathname = window.location.pathname;
    if (pathname === "/") {
      event?.preventDefault();
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    }
    closeMenus();
  };

  return (
    <>
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-[#0B0F1A]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-20 items-center justify-between border-b border-cyan-500/20 px-6">
              <span className="text-xl font-extrabold tracking-tight text-white">TradeScreen AI</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg border border-cyan-500/30 p-2 text-cyan-400 transition-colors hover:bg-cyan-500/10"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex h-[calc(100%-5rem)] flex-col justify-between overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Solutions</p>
                <div className="space-y-3">
                  <Link href="/app/screening" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">Sanctions Screening</Link>
                  <Link href="/app/scanner" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">Document Scanner</Link>
                  <Link href="/app/cyrillic" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">Cyrillic Transliteration</Link>
                  <Link href="/app/live-demo" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">Live Demo</Link>
                </div>
                <div className="h-px bg-slate-800" />
                <Link
                  href="/#how-it-works"
                  onClick={(e) => handleHowItWorks(e)}
                  className="block text-lg font-semibold text-white hover:text-cyan-400"
                >
                  How It Works
                </Link>
                <p className="pt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Research</p>
                <div className="space-y-3">
                  <Link href="/app/architecture" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">Architecture</Link>
                  <Link href="/app/about" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">About Researcher</Link>
                  <Link href="/app/reports" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">Reports</Link>
                </div>
                <div className="h-px bg-slate-800" />
                <Link href="/app/watchlist" onClick={closeMenus} className="block text-lg font-semibold text-white hover:text-cyan-400">Data Sources</Link>
              </div>

              <div className="space-y-4 pt-8">
                <Link
                  href="/app/screening"
                  onClick={closeMenus}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#06b6d4] px-4 py-3 text-sm font-bold text-[#0B0F1A] transition-colors hover:bg-[#22d3ee]"
                >
                  Start Screening
                </Link>
                <p className="text-center text-[11px] font-medium text-slate-400">Academic Research Prototype</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-[60] h-20 border-b transition-all duration-300",
          scrolled
            ? "border-cyan-500/20 bg-[#0B0F1A]/90 backdrop-blur-xl shadow-lg shadow-black/30"
            : "border-transparent bg-transparent",
          className
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
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("solutions")}
              onMouseLeave={() => setOpenDropdown((prev) => (prev === "solutions" ? null : prev))}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "solutions" ? null : "solutions")}
                className="text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-400"
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
                    className="absolute left-0 top-9 min-w-[260px] rounded-xl border border-cyan-500/20 border-t-2 border-t-cyan-400 bg-[#1A1F2E]/95 p-2 shadow-xl shadow-black/40 backdrop-blur-xl"
                  >
                    <Link href="/app/screening" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300">Sanctions Screening</Link>
                    <Link href="/app/scanner" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300">Document Scanner</Link>
                    <Link href="/app/cyrillic" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300">Cyrillic Transliteration</Link>
                    <Link href="/app/live-demo" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300">Live Demo</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/#how-it-works"
              onClick={(e) => handleHowItWorks(e)}
              className="text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-400"
            >
              How It Works
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("research")}
              onMouseLeave={() => setOpenDropdown((prev) => (prev === "research" ? null : prev))}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "research" ? null : "research")}
                className="text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-400"
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
                    className="absolute left-0 top-9 min-w-[220px] rounded-xl border border-cyan-500/20 border-t-2 border-t-cyan-400 bg-[#1A1F2E]/95 p-2 shadow-xl shadow-black/40 backdrop-blur-xl"
                  >
                    <Link href="/app/architecture" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300">Architecture</Link>
                    <Link href="/app/about" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300">About Researcher</Link>
                    <Link href="/app/reports" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300">Reports</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/app/watchlist" onClick={closeMenus} className="text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-400">
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
              className="inline-flex items-center rounded-lg bg-[#06b6d4] px-4 py-2 text-sm font-bold text-[#0B0F1A] transition-colors hover:bg-[#22d3ee]"
            >
              Start Screening
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

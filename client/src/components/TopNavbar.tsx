import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type DropdownKey = "products" | "solutions" | "resources" | "company";

const MENU = {
  products: [
    { label: "Sanctions Screening", href: "/app/screening" },
    { label: "Document Scanner", href: "/app/scanner" },
    { label: "Cyrillic Engine", href: "/app/cyrillic" },
  ],
  solutions: [
    { label: "Financial Institutions", href: "#" },
    { label: "Trade Finance", href: "#" },
    { label: "Corporate Compliance", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "/app/architecture" },
    { label: "Case Studies", href: "/app/live-demo" },
    { label: "Compliance Guide", href: "#" },
  ],
  company: [
    { label: "About", href: "/app/about" },
    { label: "Research", href: "/app/reports" },
  ],
} as const;

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

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.scrollY > 8) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
              <span className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight">
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/15">
                  <span className="absolute h-4 w-[1px] bg-cyan-300/80" />
                  <span className="absolute w-4 h-[1px] bg-cyan-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </span>
                <span className="text-white">TradeScreen</span>
                <span className="text-cyan-400">AI</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg border border-cyan-500/30 p-2 text-cyan-400 transition-colors hover:bg-cyan-500/10"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto px-6 py-6">
              {Object.entries(MENU).map(([group, items]) => (
                <div key={group} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{group}</p>
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenus}
                      className="block text-lg font-semibold text-white transition-colors hover:text-cyan-400"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}

              <div className="pt-4">
                <Link
                  href="/app/architecture"
                  onClick={closeMenus}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#06b6d4] px-4 py-3 text-sm font-bold text-[#0B0F1A] transition-colors hover:bg-[#22d3ee]"
                >
                  Explore Demo
                </Link>
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
          className,
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
            <Link
              href="/"
              onClick={handleLogoClick}
              className="inline-flex items-center gap-3 text-[1.7rem] font-extrabold tracking-tight leading-none"
            >
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/15">
                <span className="absolute h-5 w-[1px] bg-cyan-300/80" />
                <span className="absolute w-5 h-[1px] bg-cyan-300/70" />
                <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              </span>
              <span className="text-white">TradeScreen</span>
              <span className="text-cyan-400">AI</span>
            </Link>
          </div>

          <div ref={dropdownWrapRef} className="hidden items-center gap-7 lg:flex">
            {(Object.keys(MENU) as DropdownKey[]).map((group) => (
              <div
                key={group}
                className="relative"
                onMouseEnter={() => setOpenDropdown(group)}
                onMouseLeave={() => setOpenDropdown((prev) => (prev === group ? null : prev))}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === group ? null : group)}
                  className="inline-flex items-center gap-1 text-sm font-semibold capitalize text-slate-200 transition-colors hover:text-cyan-400"
                >
                  {group}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {openDropdown === group && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-9 min-w-[250px] rounded-xl border border-cyan-500/20 border-t-2 border-t-cyan-400 bg-[#1A1F2E]/95 p-2 shadow-xl shadow-black/40 backdrop-blur-xl"
                    >
                      {MENU[group].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={closeMenus}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex">
            <Link
              href="/app/architecture"
              onClick={closeMenus}
              className="inline-flex items-center rounded-full bg-[#06b6d4] px-5 py-2.5 text-sm font-bold text-[#0B0F1A] transition-colors hover:bg-[#22d3ee]"
            >
              Explore Demo
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

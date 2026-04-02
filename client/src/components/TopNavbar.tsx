// IA/UX Reconstruction Phase 1 — approved by Tatiana 2026-04-01
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

const LogoSVG = () => (
  <svg width="240" height="64" viewBox="0 0 240 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Globe */}
    <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="5"/>
    <path d="M12 32 Q32 12 52 32 Q32 52 12 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    <path d="M8 22 Q32 22 56 22" stroke="currentColor" strokeWidth="3"/>
    <path d="M8 42 Q32 42 56 42" stroke="currentColor" strokeWidth="3"/>
    {/* Magnifier handle */}
    <circle cx="52" cy="42" r="13" stroke="currentColor" strokeWidth="5"/>
    <line x1="62" y1="52" x2="72" y2="62" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
    {/* Text TradeScreen */}
    <text x="82" y="41" fontFamily="system-ui" fontSize="28" fontWeight="700" fill="currentColor">TradeScreen</text>
    {/* AI badge */}
    <rect x="195" y="20" width="42" height="42" rx="9" fill="#00D4FF"/>
    <text x="205" y="46" fontFamily="system-ui" fontSize="24" fontWeight="800" fill="#0A2540">AI</text>
  </svg>
);

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
              <div className="text-white">
                <LogoSVG />
              </div>
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
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="cursor-pointer flex items-center gap-2 select-none"
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="13" stroke="#22d3ee" strokeWidth="1.5" fill="none"/>
                <ellipse cx="16" cy="16" rx="5" ry="13" stroke="#22d3ee" strokeWidth="1.2" fill="none"/>
                <line x1="3" y1="16" x2="29" y2="16" stroke="#22d3ee" strokeWidth="1.2"/>
                <line x1="5" y1="10" x2="27" y2="10" stroke="#22d3ee" strokeWidth="1"/>
                <line x1="5" y1="22" x2="27" y2="22" stroke="#22d3ee" strokeWidth="1"/>
                <circle cx="26" cy="26" r="6" stroke="#22d3ee" strokeWidth="1.8" fill="rgba(34,211,238,0.1)"/>
                <line x1="30" y1="30" x2="34" y2="34" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <span style={{fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', color: '#f0f9ff', letterSpacing: '-0.3px'}}>
                TradeScreen <span style={{color: '#22d3ee'}}>AI</span>
              </span>
            </div>
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

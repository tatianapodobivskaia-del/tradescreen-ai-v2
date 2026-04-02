// IA/UX Reconstruction Phase 1 — approved by Tatiana 2026-04-01
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const LOGO_DARK = "data:image/png;base64,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";

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
            <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer flex items-center gap-2">
              <img src={LOGO_DARK} alt="TradeScreen AI" className="h-9 w-9 object-contain" />
              <span className="font-bold text-lg text-slate-50 tracking-tight">TradeScreen <span className="text-cyan-400">AI</span></span>
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

// IA/UX Reconstruction Phase 1 — approved by Tatiana 2026-04-01
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type DropdownKey = "prototype" | "useCases" | "research";

const MENU = {
  prototype: [
    { label: "Sanctions Screening", href: "/app/screening" },
    { label: "Document Scanner", href: "/app/scanner" },
    { label: "Cyrillic Engine", href: "/app/cyrillic" },
  ],
  useCases: [
    { label: "Financial Institutions", href: "/app/live-demo" },
    { label: "Trade Finance", href: "/app/live-demo" },
    { label: "Corporate Compliance", href: "/app/live-demo" },
  ],
  research: [
    { label: "Live Demo", href: "/app/live-demo" },
    { label: "System Architecture", href: "/app/architecture" },
  ],
} as const;

const MENU_LABELS: Record<DropdownKey, string> = {
  prototype: "Prototype",
  useCases: "Use Cases",
  research: "Research",
};

export default function TopNavbar({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  const logoSrc = isLight ? "/logo-light.png" : "/logo-dark.png";
  const brandTextClass = isLight ? "text-slate-800" : "text-slate-50";
  const aiTextClass = isLight ? "text-cyan-600" : "text-cyan-400";
  const navTextClass = isLight ? "text-slate-800 hover:text-cyan-600" : "text-slate-200 hover:text-cyan-400";
  const overlayBgClass = isLight ? "bg-white/95" : "bg-[#0B0F1A]/95";
  const headerScrolledClass = isLight
    ? "border-slate-200 bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5"
    : "border-cyan-500/20 bg-[#0B0F1A]/90 backdrop-blur-xl shadow-lg shadow-black/30";
  const dropdownPanelClass = isLight
    ? "border-slate-200 border-t-slate-300 bg-white/95 shadow-xl shadow-black/10"
    : "border-cyan-500/20 border-t-cyan-400 bg-[#1A1F2E]/95 shadow-xl shadow-black/40";
  const dropdownItemClass = isLight
    ? "text-slate-700 hover:bg-cyan-500/10 hover:text-cyan-700"
    : "text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300";

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
            className={cn("fixed inset-0 z-[70] backdrop-blur-xl lg:hidden", overlayBgClass)}
          >
            <div className={cn("flex h-20 items-center justify-between border-b px-6", isLight ? "border-slate-200" : "border-cyan-500/20")}>
              <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer flex items-center gap-2">
                <img src={logoSrc} alt="TradeScreen AI" className="h-9 w-9 object-contain" />
                <span className={cn("font-bold text-lg tracking-tight", brandTextClass)}>
                  TradeScreen <span className={aiTextClass}>AI</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "rounded-lg border p-2 transition-colors",
                  isLight
                    ? "border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10",
                )}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto px-6 py-6">
              {Object.entries(MENU).map(([group, items]) => (
                <div key={group} className="space-y-2">
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", isLight ? "text-slate-500" : "text-slate-400")}>{MENU_LABELS[group as DropdownKey]}</p>
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenus}
                      className={cn("block text-lg font-semibold transition-colors", isLight ? "text-slate-900 hover:text-cyan-700" : "text-white hover:text-cyan-400")}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}

              <div className="pt-2">
                <Link href="/app/about" onClick={closeMenus} className="block text-lg font-semibold text-white transition-colors hover:text-cyan-400">
                  About
                </Link>
              </div>

              <div className="pt-4">
                <Link
                  href="/app/architecture"
                  onClick={closeMenus}
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-full bg-[#06b6d4] px-4 py-3 text-sm font-bold transition-colors hover:bg-[#22d3ee]",
                    isLight ? "text-slate-900" : "text-[#0B0F1A]",
                  )}
                >
                  Explore Prototype
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
            ? headerScrolledClass
            : "border-transparent bg-transparent",
          className,
        )}
      >
        <div className="flex h-full items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className={cn(
                "rounded-lg p-2 transition-colors lg:hidden",
                isLight ? "text-slate-800 hover:bg-slate-100" : "text-white/90 hover:bg-white/10",
              )}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer flex items-center gap-2">
              <img src={logoSrc} alt="TradeScreen AI" className="h-9 w-9 object-contain" />
              <span className={cn("font-bold text-lg tracking-tight", brandTextClass)}>
                TradeScreen <span className={aiTextClass}>AI</span>
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
                  className={cn("inline-flex items-center gap-1 text-sm font-semibold transition-colors", navTextClass)}
                >
                  {MENU_LABELS[group]}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {openDropdown === group && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        "absolute left-0 top-9 min-w-[250px] rounded-xl border border-t-2 p-2 backdrop-blur-xl",
                        dropdownPanelClass,
                      )}
                    >
                      {MENU[group].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={closeMenus}
                          className={cn("block rounded-lg px-3 py-2 text-sm transition-colors", dropdownItemClass)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <Link
              href="/app/about"
              className={cn(
                "text-sm font-semibold transition-colors",
                isLight ? "text-slate-600 hover:text-cyan-600" : "text-slate-200 hover:text-cyan-400",
              )}
            >
              About
            </Link>
          </div>

          <div className="hidden lg:flex">
            <Link
              href="/app/architecture"
              onClick={closeMenus}
              className={cn(
                "inline-flex items-center rounded-full bg-[#06b6d4] px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#22d3ee]",
                isLight ? "text-slate-900" : "text-[#0B0F1A]",
              )}
            >
              Explore Prototype
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

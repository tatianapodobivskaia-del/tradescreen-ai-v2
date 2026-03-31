/*
 * LANDING PAGE — TradeScreenAI
 * Design: Intelligence Command Center — dark cinematic (#0a0e1a)
 * Premium: enlarged spacing, stronger headings, premium cards, glow effects
 * Typography: Inter display + JetBrains Mono data
 */
import { useState, useEffect, useRef, type CSSProperties } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useCountUp";
import { CountUpNumber, AcademicBadge, Footer, ScanningLine } from "@/components/shared";
import HeroNetworkAnimation from '../components/HeroNetworkAnimation';
import {
  heroStats, whyItMattersStats, howItWorksSteps, coreCapabilities,
  comparisonData, dataSources
} from "@/lib/mockData";
import {
  DollarSign, Users, AlertTriangle, TrendingUp, Upload, Search, FileText,
  Shield, Languages, ScanLine, Brain, BarChart3, Database, Check, X,
  ArrowRight, ChevronDown, ChevronUp, Lock, ExternalLink, GraduationCap, Play,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  DollarSign, Users, AlertTriangle, TrendingUp, Upload, Search, FileText,
  Shield, Languages, ScanLine, Brain, BarChart3, Database,
};

/** Landing-only copy; titles/icons still from mockData */
const coreCapabilityDescriptions: Record<string, string> = {
  "Multi-List Screening":
    "Screen against 4 sanctions lists at once — OFAC, EU, UN, and UK OFSI",
  "Cyrillic Transliteration Engine":
    "Find hidden matches by generating all possible name spellings across Latin and Cyrillic alphabets",
  "AI Document Scanner":
    "Upload a trade document — AI reads it, extracts names, and screens them automatically",
  "AI Deep Analysis":
    "Get a detailed risk explanation with confidence scores and recommended next steps",
  "Composite Risk Scoring":
    "One clear risk score (0-100) combining name match, country risk, and list source",
  "PDF Report Generation":
    "Download a professional compliance report ready to share with your team or bank",
};

const howItWorksScreenDescription =
  "Checks all name variations across 4 sanctions lists and 45,296 entities";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

/** Fade-up with stagger 0ms / 200ms / 400ms (per card index) when section enters view */
const fadeUpStaggerScroll = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.65,
      ease: [0, 0, 0.58, 1] as const,
    },
  }),
};

const LANDING_SECTION_ORDER = [
  "landing-hero",
  "landing-why-it-matters",
  "landing-how-it-works",
  "landing-core-capabilities",
  "landing-see-it-in-action",
  "landing-comparison",
  "landing-data-sources",
  "landing-performance",
  "landing-privacy",
] as const;

const heroDifferentiatorGlow: CSSProperties = {
  textShadow:
    "0 0 28px rgba(212, 168, 67, 0.45), 0 0 56px rgba(212, 168, 67, 0.2), 0 0 96px rgba(184, 146, 45, 0.12)",
};

function SectionScrollArrow({
  sectionId,
  variant = "inline",
}: {
  sectionId: (typeof LANDING_SECTION_ORDER)[number];
  variant?: "inline" | "floating";
}) {
  const idx = LANDING_SECTION_ORDER.indexOf(sectionId);
  const nextId = idx >= 0 ? LANDING_SECTION_ORDER[idx + 1] : undefined;

  const scrollNext = () => {
    if (nextId) {
      document.getElementById(nextId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const label = nextId ? "Scroll to next section" : "Back to top";

  const button = (
    <button
      type="button"
      onClick={scrollNext}
      aria-label={label}
      className="rounded-full p-2 text-slate-500 transition-colors hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
    >
      <motion.div
        animate={{ y: [0, 4, 0], opacity: [0.55, 1, 0.55] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5" strokeWidth={2} />
      </motion.div>
    </button>
  );

  if (variant === "floating") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.25, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 md:bottom-8"
      >
        {button}
      </motion.div>
    );
  }

  return <div className="flex justify-center pb-6 pt-2 md:pb-8 md:pt-4">{button}</div>;
}

function WhyItMattersStatCount({ value }: { value: string }) {
  const isPercent = value.endsWith("%");
  const numeric = isPercent
    ? parseInt(value.slice(0, -1), 10)
    : parseInt(value.replace(/,/g, ""), 10);
  const end = Number.isFinite(numeric) ? numeric : 0;
  const useComma = value.includes(",") && !isPercent;
  const [count, setCount] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();

        const duration = 2000;
        const t0 = performance.now();
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

        const tick = (now: number) => {
          const raw = Math.min((now - t0) / duration, 1);
          const eased = easeOut(raw);
          setCount(Math.floor(end * eased));
          if (raw < 1) requestAnimationFrame(tick);
          else setCount(end);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  const display = useComma ? count.toLocaleString("en-US") : String(count);

  return (
    <div ref={wrapRef} className="mb-3 font-data text-4xl font-extrabold tabular-nums text-white md:text-5xl">
      {display}
      {isPercent ? "%" : ""}
    </div>
  );
}

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/hero-globe-Hs5QvnPaBrKy3WbVNY2vHm.webp";
const PATTERN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/data-pattern-M5u9jMgYtxdMLTqSeDkH66.webp";

/* ===== SECTION HEADING — premium version ===== */
function PremiumHeading({ children, subtitle, dark }: { children: React.ReactNode; subtitle?: string; dark?: boolean }) {
  return (
    <div className="mb-9 text-center md:mb-12">
      <h2 className={`section-heading ${dark ? "text-white" : "text-slate-900"}`}>{children}</h2>
      {subtitle && <p className={`mt-3 section-subtitle ${dark ? "section-subtitle-dark" : ""}`}>{subtitle}</p>}
    </div>
  );
}

export default function Landing() {
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > window.innerHeight * 0.45);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="overflow-hidden bg-[#0a0e1a] text-white">
      <header className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-end gap-2 border-b border-white/10 bg-[#0a0e1a]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <Link
          href="/app/architecture"
          className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-[#D4A843]/10 px-4 py-2 font-display text-sm font-bold text-amber-300 transition-colors hover:border-amber-400/60 hover:bg-[#D4A843]/15"
        >
          Open App
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </header>

      {/* ===== HERO ===== */}
      <section id="landing-hero" className="relative flex min-h-screen items-center justify-center pt-14">
        <HeroNetworkAnimation />
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-[#0a0e1a]/20 to-[#0a0e1a]" />
        </div>
        <ScanningLine />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center md:py-24">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <AcademicBadge className="mb-6 border-amber-500/30 text-amber-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            AI-Powered Sanctions Screening
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={heroDifferentiatorGlow}
            className="mx-auto mb-5 max-w-4xl font-display text-2xl font-bold leading-snug tracking-tight text-amber-300 sm:text-3xl md:text-4xl md:leading-tight"
          >
            Find Risks Hidden in Name Variations Across Languages
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.75, delay: 1.2 }}
            className="mx-auto mb-8 max-w-3xl font-body text-lg leading-snug text-white sm:text-xl md:text-2xl md:leading-snug"
          >
            See What Others Miss — <span className="font-semibold text-amber-400">in 60 Seconds</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.35 }}
            className="mb-8 flex flex-col items-center gap-2"
          >
            <div className="ai-glow-dark inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full px-6 py-3 sm:px-8 sm:py-4">
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#F5C542]" />
              <span className="text-sm text-slate-400 font-body">Monitoring</span>
              <CountUpNumber value={heroStats.totalEntities} className="text-3xl font-bold text-amber-400" />
              <span className="text-sm text-slate-400 font-body">sanctioned entities</span>
              <span className="w-full shrink-0 text-center font-body text-[11px] leading-tight text-slate-500 sm:ml-1 sm:w-auto sm:text-left">
                Auto-updated every 6 hours
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <Link href="/app/screening" className="btn-premium btn-premium-primary group flex items-center gap-2.5 text-base">
              Start Screening
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/app/live-demo" className="btn-premium btn-premium-primary flex items-center gap-2.5 text-base">
              <Play className="h-5 w-5 shrink-0 fill-current" strokeWidth={2} />
              Try Live Demo
            </Link>
            <Link href="/app/architecture" className="btn-premium btn-premium-outline flex items-center gap-2.5 text-base">
              Explore Prototype
            </Link>
          </motion.div>
        </div>

        <SectionScrollArrow sectionId="landing-hero" variant="floating" />
      </section>

      {showBackTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/40 bg-[#0a0e1a]/95 text-amber-300 shadow-lg shadow-black/40 backdrop-blur-sm transition-colors hover:border-amber-400/60 hover:bg-[#D4A843]/10"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      {/* ===== WHY IT MATTERS ===== */}
      <WhyItMatters />
      <HowItWorks />
      <CoreCapabilities />
      <SeeItInAction />
      <ComparisonSection />
      <DataSourcesSection />
      <PerformanceBenchmarksSection />
      <PrivacySection />
      <section id="landing-footer" className="relative" aria-label="Site footer">
        <Footer variant="dark" />
      </section>
    </div>
  );
}

function WhyItMatters() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section
      id="landing-why-it-matters"
      ref={ref as React.Ref<HTMLElement>}
      className="relative py-16 md:py-24"
      style={{ backgroundImage: `url(${PATTERN_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[#0a0e1a]/90" />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <PremiumHeading dark subtitle="The challenge of sanctions compliance grows more complex every year">Why It Matters</PremiumHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {whyItMattersStats.map((stat, i) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="premium-card-dark rounded-xl p-6 text-center group"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#D4A843]/10 transition-colors group-hover:bg-[#D4A843]/20">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
                <WhyItMattersStatCount value={stat.value} />
                <div className="text-sm font-bold text-slate-200 mb-1.5 tracking-wide uppercase">{stat.label}</div>
                <div className="text-xs text-slate-500 font-body">{stat.sublabel}</div>
              </motion.div>
            );
          })}
        </div>
        <SectionScrollArrow sectionId="landing-why-it-matters" />
      </div>
    </section>
  );
}

function HowItWorks() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section
      id="landing-how-it-works"
      ref={ref as React.Ref<HTMLElement>}
      className="relative bg-[#060a16] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading dark subtitle="Three steps from vendor name to compliance decision">How It Works</PremiumHeading>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {howItWorksSteps.map((step, i) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUpStaggerScroll}
                className="relative"
              >
                <div className="premium-card-dark h-full rounded-xl p-7 text-center group">
                  <div className="absolute right-6 top-4 font-data text-7xl font-extrabold text-amber-500/8">{step.step}</div>
                  <div
                    className="mx-auto mb-5 flex items-center justify-center rounded-2xl bg-[#D4A843]/10 transition-colors group-hover:bg-[#D4A843]/20"
                    style={{ width: "4.5rem", height: "4.5rem" }}
                  >
                    <Icon className="h-9 w-9 text-amber-400" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-extrabold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400 font-body leading-relaxed">
                    {step.title === "Screen" ? howItWorksScreenDescription : step.description}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-7 h-7 text-amber-500/30" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        <SectionScrollArrow sectionId="landing-how-it-works" />
      </div>
    </section>
  );
}

function CoreCapabilities() {
  const { isInView, ref } = useInView(0.15);
  return (
    <section id="landing-core-capabilities" ref={ref as React.Ref<HTMLElement>} className="relative py-16 md:py-24">
      <ScanningLine />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <PremiumHeading dark subtitle="Purpose-built for sanctions compliance intelligence">Core Capabilities</PremiumHeading>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coreCapabilities.map((cap, i) => {
            const Icon = iconMap[cap.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUpStaggerScroll}
                className="premium-card-dark rounded-xl p-8 group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#D4A843]/10 flex items-center justify-center mb-5 group-hover:bg-[#D4A843]/20 transition-colors">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-extrabold font-display text-white mb-3">{cap.title}</h3>
                <p className="text-sm text-slate-400 font-body leading-relaxed">
                  {coreCapabilityDescriptions[cap.title] ?? cap.description}
                </p>
              </motion.div>
            );
          })}
        </div>
        <SectionScrollArrow sectionId="landing-core-capabilities" />
      </div>
    </section>
  );
}

function SeeItInAction() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section id="landing-see-it-in-action" ref={ref as React.Ref<HTMLElement>} className="relative bg-[#0a0e1a] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading dark subtitle="Full screening cycle in 60 seconds">See It In Action</PremiumHeading>

        <motion.div
          custom={0}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUp}
          role="img"
          aria-label="Demo video placeholder. Demo video coming soon."
          className="relative mx-auto flex aspect-video max-w-4xl flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-[#050810] px-6 shadow-2xl shadow-black/40"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(rgba(212,168,67,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.15) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-amber-500/35 bg-[#D4A843]/10 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
              <Play className="h-14 w-14 translate-x-1 text-amber-400" strokeWidth={1.25} fill="currentColor" aria-hidden />
            </div>
            <p className="text-center font-display text-sm font-semibold tracking-wide text-slate-400">Demo Video Coming Soon</p>
          </div>
        </motion.div>
        <SectionScrollArrow sectionId="landing-see-it-in-action" />
      </div>
    </section>
  );
}

function ComparisonSection() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section id="landing-comparison" ref={ref as React.Ref<HTMLElement>} className="bg-[#060a16] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading dark subtitle="Why intelligent screening outperforms legacy approaches">How It Compares</PremiumHeading>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <div className="premium-card-dark rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-5 px-8 text-slate-400 font-bold font-display text-base">Feature</th>
                  <th className="text-center py-5 px-8 text-slate-400 font-bold font-display text-base">Traditional</th>
                  <th className="text-center py-5 px-8 text-amber-400 font-bold font-display text-base">TradeScreenAI</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4.5 px-8 text-slate-300 font-body text-[0.9375rem]">{row.feature}</td>
                    <td className="py-4.5 px-8 text-center">
                      {typeof row.traditional === "boolean" ? (
                        row.traditional ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-slate-500 font-body">{row.traditional}</span>
                      )}
                    </td>
                    <td className="py-4.5 px-8 text-center">
                      {typeof row.tradescreen === "boolean" ? (
                        row.tradescreen ? <Check className="w-5 h-5 text-amber-400 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-amber-400 font-bold font-body">{row.tradescreen}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        <SectionScrollArrow sectionId="landing-comparison" />
      </div>
    </section>
  );
}

const performanceBenchmarkRows = [
  { metric: "Detection Rate", tradescreen: "97%", manual: "~60%", rules: "~78%" },
  { metric: "Cyrillic variant detection", tradescreen: "95%+", manual: "~15%", rules: "~20%" },
  { metric: "False positive rate", tradescreen: "~8%", manual: "~25%", rules: "~34%" },
  { metric: "Screening time (40 vendors)", tradescreen: "<2 min", manual: "~2 hours", rules: "~15 min" },
  { metric: "AI reasoning per decision", tradescreen: "Yes", manual: "None", rules: "None" },
] as const;

function PerformanceBenchmarksSection() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section
      id="landing-performance"
      ref={ref as React.Ref<HTMLElement>}
      className="relative border-t border-slate-800/50 bg-[#0a0e1a] py-16 md:py-24"
      aria-labelledby="performance-benchmarks-heading"
    >
      <div className="max-w-6xl mx-auto px-4">
        <p className="mb-3 text-center font-data text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500/65">
          Performance Benchmarks
        </p>
        <PremiumHeading
          dark
          subtitle="Benchmark results on controlled test dataset of 100 vendor records including 7 known sanctioned entities"
        >
          <span id="performance-benchmarks-heading">Measured Performance</span>
        </PremiumHeading>

        <div className="mb-8 grid grid-cols-1 gap-5 md:mb-10 md:grid-cols-3">
          <motion.div
            custom={0}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="premium-card-dark rounded-xl border border-amber-500/20 p-7 text-center shadow-lg shadow-[#D4A843]/20 transition-colors hover:border-amber-500/35"
          >
            <div className="mb-2 font-data text-5xl font-extrabold tabular-nums text-amber-400 md:text-6xl">97%</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide">Detection Rate</div>
          </motion.div>
          <motion.div
            custom={1}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="premium-card-dark rounded-xl border border-emerald-500/20 p-7 text-center shadow-lg shadow-emerald-500/5 transition-colors hover:border-emerald-500/35"
          >
            <div className="mb-2 font-data text-5xl font-extrabold tabular-nums text-emerald-400 md:text-6xl">~8%</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide">False Positive Rate</div>
          </motion.div>
          <motion.div
            custom={2}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="premium-card-dark rounded-xl border border-amber-500/20 p-7 text-center shadow-lg shadow-[#D4A843]/20 transition-colors hover:border-amber-500/35"
          >
            <div className="mb-2 font-data text-5xl font-extrabold tabular-nums text-amber-400 md:text-6xl">&lt;2 min</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide leading-snug">
              Processing Time
              <span className="block text-xs font-normal text-slate-500 font-body mt-1.5 tracking-normal">40 vendors</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="premium-card-dark rounded-xl overflow-hidden border border-slate-700/40 mb-8"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/40">
                  <th className="text-left py-5 px-6 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Metric</th>
                  <th className="text-center py-5 px-4 text-amber-400 font-bold font-display text-xs uppercase tracking-wider">TradeScreenAI</th>
                  <th className="text-center py-5 px-4 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Manual Review</th>
                  <th className="text-center py-5 px-4 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Rule-Based Tools</th>
                </tr>
              </thead>
              <tbody>
                {performanceBenchmarkRows.map((row) => (
                  <tr key={row.metric} className="border-b border-slate-800/60 hover:bg-slate-800/25 transition-colors">
                    <td className="py-4 px-6 text-slate-300 font-body font-medium">{row.metric}</td>
                    <td className="py-4 px-4 text-center text-amber-400 font-bold font-data">{row.tradescreen}</td>
                    <td className="py-4 px-4 text-center text-slate-500 font-body">{row.manual}</td>
                    <td className="py-4 px-4 text-center text-slate-500 font-body">{row.rules}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <p className="text-center text-xs text-slate-500 font-body leading-relaxed max-w-2xl mx-auto px-2">
          Results based on controlled experimental datasets. Real-world performance may vary.
        </p>
        <SectionScrollArrow sectionId="landing-performance" />
      </div>
    </section>
  );
}

function DataSourcesSection() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section id="landing-data-sources" ref={ref as React.Ref<HTMLElement>} className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading dark subtitle="Comprehensive coverage across major international sanctions programs">Trusted Data Sources</PremiumHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dataSources.map((source, i) => (
            <motion.a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              custom={i}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              className="premium-card-dark group block cursor-pointer rounded-xl p-6 text-center"
            >
              <div className="mb-3 text-5xl">{source.flag}</div>
              <h3 className="text-xl font-extrabold font-display text-white mb-2 group-hover:text-amber-400 transition-colors">{source.name}</h3>
              <p className="text-xs text-slate-500 font-body mb-5 leading-relaxed">{source.fullName}</p>
              <div className="text-3xl font-extrabold font-data text-amber-400">
                <CountUpNumber value={source.count} />
              </div>
              <div className="text-xs text-slate-500 font-body mt-1.5">entities</div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-600 group-hover:text-amber-400 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Official Source</span>
              </div>
            </motion.a>
          ))}
        </div>
        <SectionScrollArrow sectionId="landing-data-sources" />
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section id="landing-privacy" className="bg-[#060a16] py-14 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <PremiumHeading dark subtitle="Transparency and responsible use">Data Privacy & Disclaimer</PremiumHeading>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Data Privacy */}
          <div className="premium-card-dark rounded-xl p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-extrabold font-display text-white">Data Privacy</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-400 font-body leading-relaxed">
              <p>This prototype provides AI-assisted analysis to support human review. All screening data is processed locally in the browser.</p>
              <p>No vendor names, screening results, or uploaded documents are stored, transmitted to external servers, or retained after the session ends.</p>
              <p>All sanctions list data is sourced from publicly available government databases (OFAC, EU, UN, UK OFSI).</p>
            </div>
          </div>
          {/* Terms of Use */}
          <div className="premium-card-dark rounded-xl p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#D4A843]/10">
                <GraduationCap className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-extrabold font-display text-white">Terms of Use</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-400 font-body leading-relaxed">
              <p>TradeScreen AI is an academic research prototype developed at Atlantis University.</p>
              <p>For educational use only — not a commercial compliance tool. This system is not a substitute for professional legal or compliance advice.</p>
              <p>Results should be verified by qualified compliance professionals before any business decisions are made.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

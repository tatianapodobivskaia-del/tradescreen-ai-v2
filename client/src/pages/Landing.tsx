// @ts-nocheck
/*
 * LANDING PAGE — TradeScreenAI
 * Design: Intelligence Command Center — dark cinematic (#0a0e1a)
 * Premium: enlarged spacing, stronger headings, premium cards, glow effects
 * Typography: Inter display + JetBrains Mono data
 */
import { useState, useEffect, useRef, type CSSProperties } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CountUpNumber, AcademicBadge, ScanningLine } from "@/components/shared";
import TopNavbar from "@/components/TopNavbar";
import HeroNetworkAnimation from '../components/HeroNetworkAnimation';
import {
  heroStats, whyItMattersStats, howItWorksSteps, coreCapabilities,
  dataSources
} from "@/lib/mockData";
import { fetchSanctionsApiHealth, formatSanctionsListHealthTimestamp } from "@/lib/api";
import {
  DollarSign, Users, AlertTriangle, TrendingUp, Upload, Search, FileText,
  Shield, Languages, ScanLine, Brain, BarChart3, Database,
  ArrowRight, ChevronDown, ChevronUp, Github, Linkedin, Lock, ExternalLink, GraduationCap, Play,
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

const howItWorksStepDescriptions = [
  "Drop a vendor list, CSV, or trade document",
  "AI checks all name variations across 4 sanctions lists",
  "Get risk score, confidence level, and recommended action",
] as const;

const comparisonRows = [
  { feature: "Screening speed (40 vendors)", manual: "2–4 hours", rules: "~15 min", tradescreen: "<2 min" },
  { feature: "Detection rate", manual: "~60%", rules: "~78%", tradescreen: "97%" },
  { feature: "Cyrillic name variants", manual: "Limited", rules: "~20%", tradescreen: "95%+" },
  { feature: "False positive rate", manual: "~25%", rules: "~34%", tradescreen: "~8%" },
  { feature: "AI reasoning per decision", manual: "None", rules: "None", tradescreen: "Yes" },
  { feature: "Document scanning", manual: "Manual review", rules: "Basic OCR", tradescreen: "4-agent AI pipeline" },
  { feature: "Audit trail", manual: "Spreadsheets", rules: "Basic logs", tradescreen: "Structured reports" },
] as const;

const fadeUpOnLoad = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: "easeOut" },
  }),
};

const fadeUpInView = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      ease: "easeOut",
    },
  }),
};

const LANDING_SECTION_ORDER = [
  "landing-hero",
  "landing-why-it-matters",
  "how-it-works",
  "landing-core-capabilities",
  "landing-see-it-in-action",
  "landing-comparison",
  "landing-data-sources",
  "landing-performance",
  "landing-privacy",
] as const;

const heroDifferentiatorGlow: CSSProperties = {
  textShadow:
    "0 0 26px rgba(34, 211, 238, 0.28), 0 0 52px rgba(56, 189, 248, 0.16), 0 0 92px rgba(14, 165, 233, 0.08)",
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
      className="rounded-full p-2 text-slate-500 transition-colors hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
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
function PremiumHeading({
  children,
  subtitle,
  dark,
  label,
}: {
  children: React.ReactNode;
  subtitle?: string;
  dark?: boolean;
  label?: string;
}) {
  return (
    <div className="mb-9 text-center md:mb-12">
      {label && (
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpInView}
          custom={0}
          className="mb-3 text-center font-data text-sm font-bold uppercase tracking-[0.2em] text-cyan-400/80"
        >
          {label}
        </motion.p>
      )}
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUpInView}
        custom={label ? 1 : 0}
        className={`font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] ${dark ? "text-white" : "text-slate-900"}`}
      >
        {children}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpInView}
          custom={label ? 3 : 2}
          className={`mt-3 text-xl md:text-2xl section-subtitle ${dark ? "section-subtitle-dark" : ""}`}
        >
          {subtitle}
        </motion.p>
      )}
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
      <TopNavbar variant="dark" />
      {/* ===== HERO ===== */}
      <section id="landing-hero" className="relative flex min-h-screen items-center justify-center pt-20">
        <HeroNetworkAnimation />
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-[#0a0e1a]/20 to-[#0a0e1a]" />
        </div>
        <ScanningLine />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center md:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpOnLoad}
            custom={0.2}
          >
            <AcademicBadge className="mb-6 border-cyan-400/30 text-cyan-300" />
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUpOnLoad}
            custom={0.4}
            className="mb-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            AI-Powered Sanctions Screening
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUpOnLoad}
            custom={0.6}
            style={heroDifferentiatorGlow}
            className="mx-auto mb-5 max-w-4xl font-display text-2xl font-bold leading-snug tracking-tight text-cyan-200 sm:text-3xl md:text-4xl md:leading-tight"
          >
            Find Risks Hidden in Name Variations Across Languages
          </motion.p>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUpOnLoad}
            custom={0.8}
            className="mx-auto mb-10 max-w-3xl font-body text-lg leading-relaxed text-slate-100 sm:text-xl md:text-2xl md:leading-relaxed"
          >
            See What Others Miss — <span className="font-semibold text-cyan-300">in 60 Seconds</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
            className="mb-10 flex flex-col items-center gap-2"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-cyan-400/25 bg-[#0B162A]/85 px-6 py-3.5 shadow-[0_0_34px_rgba(56,189,248,0.16)] backdrop-blur-sm sm:px-8 sm:py-4.5">
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-cyan-300" />
              <span className="text-center font-body text-sm font-semibold text-cyan-100 sm:text-left">
                Screening <span className="font-data text-cyan-300">{heroStats.totalEntities.toLocaleString()}</span> entities across OFAC, EU, UN & UK OFSI
                <span className="mx-2 text-slate-500">•</span>
                Updated every 6 hours
              </span>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpOnLoad}
            custom={1.2}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <Link
              href="/app/screening"
              className="group inline-flex items-center gap-2.5 rounded-lg border border-cyan-300/30 bg-cyan-300 px-6 py-3 text-base font-semibold text-[#071020] shadow-[0_10px_26px_rgba(56,189,248,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              Start Screening
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/app/live-demo"
              className="inline-flex items-center gap-2.5 rounded-lg border border-cyan-300/35 bg-[#0B162A]/72 px-6 py-3 text-base font-semibold text-cyan-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/60 hover:bg-[#0E1B31]"
            >
              <Play className="h-5 w-5 shrink-0 fill-current" strokeWidth={2} />
              Watch Demo
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
          className="fixed bottom-6 right-6 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/35 bg-[#0a0e1a]/95 text-cyan-200 shadow-lg shadow-black/40 backdrop-blur-sm transition-colors hover:border-cyan-300/60 hover:bg-cyan-400/10"
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
      <LandingFooter />
    </div>
  );
}

function WhyItMatters() {
  return (
    <section
      id="landing-why-it-matters"
      className="relative py-16 md:py-24"
      style={{ backgroundImage: `url(${PATTERN_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[#0a0e1a]/90" />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <PremiumHeading
          dark
          label="WHY IT MATTERS"
          subtitle="The challenge of sanctions compliance grows more complex every year"
        >
          Comprehensive Coverage, <span className="text-cyan-300">Unmatched Accuracy</span>
        </PremiumHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {whyItMattersStats.map((stat, i) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUpInView}
                className="premium-card-dark rounded-xl p-6 text-center group"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-400/10 transition-colors group-hover:bg-cyan-400/20">
                  <Icon className="w-7 h-7 text-cyan-300" />
                </div>
                <WhyItMattersStatCount value={stat.value} />
                <div className="mb-2 text-base font-extrabold tracking-wide text-slate-100 uppercase">{stat.label}</div>
                <div className="text-sm font-medium text-slate-300 font-body">{stat.sublabel}</div>
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
  return (
    <section
      id="how-it-works"
      className="relative bg-[#060a16] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading
          dark
          label="HOW IT WORKS"
          subtitle="Three steps from vendor name to compliance decision"
        >
          Three Simple Steps to <span className="text-cyan-300">Complete Compliance</span>
        </PremiumHeading>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {howItWorksSteps.map((step, i) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUpInView}
                className="relative"
              >
                <div className="premium-card-dark h-full rounded-xl p-7 text-center group">
                  <div className="absolute right-6 top-4 font-data text-7xl font-extrabold text-cyan-400/10">{step.step}</div>
                  <div
                    className="mx-auto mb-5 flex items-center justify-center rounded-2xl bg-cyan-400/10 transition-colors group-hover:bg-cyan-400/20"
                    style={{ width: "4.5rem", height: "4.5rem" }}
                  >
                    <Icon className="h-9 w-9 text-cyan-300" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-extrabold text-white">{step.title}</h3>
                  <p className="text-base font-medium text-slate-200 font-body leading-relaxed">
                    {howItWorksStepDescriptions[i] ?? step.description}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-7 h-7 text-cyan-400/30" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        <SectionScrollArrow sectionId="how-it-works" />
      </div>
    </section>
  );
}

function CoreCapabilities() {
  return (
    <section id="landing-core-capabilities" className="relative py-16 md:py-24">
      <ScanningLine />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <PremiumHeading
          dark
          label="CORE CAPABILITIES"
          subtitle="Purpose-built for sanctions compliance intelligence"
        >
          <span>Enterprise-Grade Features,</span>
          <span className="block text-cyan-300">Research Innovation</span>
        </PremiumHeading>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coreCapabilities.map((cap, i) => {
            const Icon = iconMap[cap.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUpInView}
                className="premium-card-dark rounded-xl p-8 group"
              >
                <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-5 group-hover:bg-cyan-400/20 transition-colors">
                  <Icon className="w-6 h-6 text-cyan-300" />
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
  return (
    <section id="landing-see-it-in-action" className="relative bg-[#0a0e1a] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading
          dark
          label="SEE IT IN ACTION"
          subtitle="Full screening cycle in 60 seconds"
        >
          Watch How TradeScreen AI <span className="text-cyan-300">Finds Hidden Risks</span>
        </PremiumHeading>

        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpInView}
          role="img"
          aria-label="Demo video placeholder. Demo video coming soon."
          className="relative mx-auto flex aspect-video max-w-4xl flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-[#050810] px-6 shadow-2xl shadow-black/40"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(rgba(34,211,238,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
              <Play className="h-14 w-14 translate-x-1 text-cyan-300" strokeWidth={1.25} fill="currentColor" aria-hidden />
            </div>
            <p className="text-center font-display text-sm font-semibold tracking-wide text-slate-400">See the full screening cycle — from upload to compliance report</p>
          </div>
        </motion.div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/app/live-demo"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-[#0B162A]/72 px-6 py-3 text-sm font-bold text-cyan-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/60 hover:bg-[#0E1B31]"
          >
            <Play className="h-4 w-4 fill-current" />
            Watch Full Demo
          </Link>
        </div>
        <SectionScrollArrow sectionId="landing-see-it-in-action" />
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section id="landing-comparison" className="bg-[#060a16] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading
          dark
          label="COMPARISON"
          subtitle="Why intelligent screening outperforms legacy approaches"
        >
          TradeScreen AI vs <span className="text-cyan-300">Traditional Systems</span>
        </PremiumHeading>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpInView}
          custom={0}
        >
          <div className="premium-card-dark rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-5 px-8 text-slate-400 font-bold font-display text-base">Feature</th>
                  <th className="text-center py-5 px-8 text-slate-400 font-bold font-display text-base">Manual Review</th>
                  <th className="text-center py-5 px-8 text-slate-400 font-bold font-display text-base">Rule-Based Tools</th>
                  <th className="text-center py-5 px-8 text-cyan-300 font-bold font-display text-base">TradeScreen AI</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4.5 px-8 text-slate-200 font-semibold font-body text-[0.9375rem]">{row.feature}</td>
                    <td className="py-4.5 px-8 text-center text-slate-400 font-body">{row.manual}</td>
                    <td className="py-4.5 px-8 text-center text-slate-400 font-body">{row.rules}</td>
                    <td className="py-4.5 px-8 text-center text-cyan-300 font-semibold font-body">{row.tradescreen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">* TradeScreen AI metrics based on controlled test dataset</p>
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
  return (
    <section
      id="landing-performance"
      className="relative border-t border-slate-800/50 bg-[#0a0e1a] py-16 md:py-24"
      aria-labelledby="performance-benchmarks-heading"
    >
      <div className="max-w-6xl mx-auto px-4">
        <PremiumHeading
          dark
          label="PERFORMANCE BENCHMARKS"
          subtitle="Benchmark results on controlled test dataset of 100 vendor records including 7 known sanctioned entities"
        >
          <span id="performance-benchmarks-heading">
            Measured Results, <span className="text-cyan-300">Proven Performance</span>
          </span>
        </PremiumHeading>

        <div className="mb-8 grid grid-cols-1 gap-5 md:mb-10 md:grid-cols-3">
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpInView}
            className="premium-card-dark rounded-xl border border-cyan-400/20 p-7 text-center shadow-lg shadow-cyan-500/15 transition-colors hover:border-cyan-400/35"
          >
            <div className="mb-2 font-data text-7xl font-black tabular-nums text-cyan-200 md:text-8xl" style={{ textShadow: '0 0 30px rgba(34,211,238,0.3)' }}>97%</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide">Detection Rate</div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
              <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300" />
            </div>
          </motion.div>
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpInView}
            className="premium-card-dark rounded-xl border border-emerald-500/20 p-7 text-center shadow-lg shadow-emerald-500/5 transition-colors hover:border-emerald-500/35"
          >
            <div className="mb-2 font-data text-7xl font-black tabular-nums text-emerald-300 md:text-8xl" style={{ textShadow: '0 0 30px rgba(34,211,238,0.3)' }}>8%</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide">False Positive Rate</div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
              <div className="h-full w-[8%] rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300" />
            </div>
          </motion.div>
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpInView}
            className="premium-card-dark rounded-xl border border-cyan-400/20 p-7 text-center shadow-lg shadow-cyan-500/15 transition-colors hover:border-cyan-400/35"
          >
            <div className="mb-2 font-data text-7xl font-black tabular-nums text-cyan-200 md:text-8xl" style={{ textShadow: '0 0 30px rgba(34,211,238,0.3)' }}>2min</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide leading-snug">
              Processing Time
              <span className="block text-xs font-normal text-slate-500 font-body mt-1.5 tracking-normal">40 vendors</span>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-800">
              <div className="h-full w-[33%] rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpInView}
          custom={1}
          className="premium-card-dark rounded-xl overflow-hidden border border-slate-700/40 mb-8"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/40">
                  <th className="text-left py-5 px-6 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Metric</th>
                  <th className="text-center py-5 px-4 text-cyan-300 font-bold font-display text-xs uppercase tracking-wider">TradeScreenAI</th>
                  <th className="text-center py-5 px-4 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Manual Review</th>
                  <th className="text-center py-5 px-4 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Rule-Based Tools</th>
                </tr>
              </thead>
              <tbody>
                {performanceBenchmarkRows.map((row) => (
                  <tr key={row.metric} className="border-b border-slate-800/60 py-5 hover:bg-slate-800/25 transition-colors">
                    <td className="px-6 text-slate-300 font-body font-medium">{row.metric}</td>
                    <td className="px-4 text-center text-base text-cyan-300 font-bold font-data">{row.tradescreen}</td>
                    <td className="px-4 text-center text-slate-500 font-body">{row.manual}</td>
                    <td className="px-4 text-center text-slate-500 font-body">{row.rules}</td>
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
  const [trustStripLabel, setTrustStripLabel] = useState(
    "Last updated: checking connection... • Updated every 6 hours"
  );
  const [activeSource, setActiveSource] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncHealthTimestamp = async () => {
      try {
        const data = await fetchSanctionsApiHealth();
        if (!data) throw new Error("health unavailable");
        const ts = data?.ts;
        if (ts === undefined || ts === null) throw new Error("timestamp missing");
        const formatted = formatSanctionsListHealthTimestamp(ts);
        if (!formatted) throw new Error("invalid timestamp");
        if (!cancelled) {
          setTrustStripLabel(`Last updated: ${formatted} • Updated every 6 hours`);
        }
      } catch {
        if (!cancelled) {
          setTrustStripLabel("Last updated: checking connection... • Updated every 6 hours");
        }
      }
    };

    void syncHealthTimestamp();
    const intervalId = window.setInterval(syncHealthTimestamp, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const sourceHighlight = (name: string, idx: number) => {
    const base = "transition-all duration-300 hover:scale-[1.02]";
    if (/OFAC|US/i.test(name) || idx === 0) {
      return `${base} border-blue-400/20 bg-red-400/[0.02] hover:border-red-300/45 hover:bg-gradient-to-br hover:from-red-500/18 hover:to-blue-500/20 hover:shadow-[0_0_40px_rgba(239,68,68,0.24),0_0_30px_rgba(59,130,246,0.18)]`;
    }
    if (/EU/i.test(name) || idx === 1) {
      return `${base} border-blue-400/25 bg-blue-400/[0.04] hover:border-blue-300/55 hover:bg-blue-500/18 hover:shadow-[0_0_36px_rgba(59,130,246,0.28)]`;
    }
    if (/UN/i.test(name) || idx === 2) {
      return `${base} border-cyan-300/25 bg-cyan-300/[0.04] hover:border-cyan-200/55 hover:bg-cyan-400/20 hover:shadow-[0_0_36px_rgba(34,211,238,0.28)]`;
    }
    if (/UK|OFSI/i.test(name) || idx === 3) {
      return `${base} border-indigo-300/20 bg-indigo-300/[0.03] hover:border-indigo-200/45 hover:bg-gradient-to-br hover:from-red-500/14 hover:to-indigo-500/20 hover:shadow-[0_0_34px_rgba(99,102,241,0.24),0_0_24px_rgba(239,68,68,0.14)]`;
    }
    return `${base} border-cyan-400/15 bg-cyan-400/[0.02]`;
  };

  return (
    <section id="landing-data-sources" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <PremiumHeading
          dark
          label="TRUSTED DATA SOURCES"
          subtitle="Comprehensive coverage across major international sanctions programs"
        >
          Official Sanctions Lists, <span className="text-cyan-300">Always Current</span>
        </PremiumHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dataSources.map((source, i) => (
            <motion.a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={() => setActiveSource((prev) => (prev === i ? null : i))}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUpInView}
              className={`premium-card-dark group block cursor-pointer rounded-xl p-6 text-center ${sourceHighlight(source.name, i)}${activeSource === i ? '!border-2 !border-cyan-300 !shadow-[0_0_40px_rgba(34,211,238,0.35)]' : ''}`}
            >
              <div className="mb-3 text-5xl">{source.flag}</div>
              <h3 className="text-xl font-extrabold font-display text-white mb-2 group-hover:text-cyan-300 transition-colors">{source.name}</h3>
              <p className="text-xs text-slate-500 font-body mb-5 leading-relaxed">{source.fullName}</p>
              <div className="text-3xl font-extrabold font-data text-cyan-300">
                <CountUpNumber value={source.count} />
              </div>
              <div className="text-xs text-slate-500 font-body mt-1.5">entities</div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-600 group-hover:text-cyan-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Official Source</span>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="mx-auto mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 status-dot" />
          <span>{trustStripLabel}</span>
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
              <div className="w-11 h-11 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-cyan-300" />
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
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400/10">
                <GraduationCap className="h-5 w-5 text-cyan-300" />
              </div>
              <h3 className="text-lg font-extrabold font-display text-white">Terms of Use</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-400 font-body leading-relaxed">
              <p>TradeScreen AI is an academic research prototype developed as academic research.</p>
              <p>For educational use only — not a commercial compliance tool. This system is not a substitute for professional legal or compliance advice.</p>
              <p>Results should be verified by qualified compliance professionals before any business decisions are made.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const footerColumns = [
    { title: "Prototype", links: [
      { label: "Screening", href: "/app/screening" },
      { label: "Document Scanner", href: "/app/scanner" },
      { label: "Cyrillic Engine", href: "/app/cyrillic" },
    ]},
    { title: "Research", links: [
      { label: "Reports", href: "/app/reports" },
      { label: "Architecture", href: "/app/architecture" },
    ]},
    { title: "About", links: [
      { label: "About", href: "/app/about" },
    ]},
    { title: "Legal", links: [
      { label: "Privacy Policy", href: "/app/privacy" },
      { label: "Terms of Service", href: "/app/terms" },
      { label: "Disclaimer", href: "/app/disclaimer" },
    ]},
  ] as const;

  return (
    <footer id="landing-footer" className="border-t border-slate-800 bg-[#050810]" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-800/80 pb-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20">
                <Shield className="h-4 w-4 text-cyan-400" />
              </span>
              <span className="text-white">TradeScreen</span>
              <span className="text-cyan-400">AI</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              AI-powered sanctions screening for financial compliance. Find risks hidden in name variations across languages.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: Linkedin, href: "#" },
                { Icon: Github, href: "#" },
              ].map(({ Icon, href }) => (
                <a
                  key={Icon.displayName || Icon.name}
                  href={href}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith("/app") || item.href === "/" ? (
                      <Link
                        href={item.href}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 pt-6 text-xs text-slate-500 md:flex-row md:items-center">
          <p>Academic Research Prototype</p>
          <p>© 2026 Tatiana Podobivskaia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

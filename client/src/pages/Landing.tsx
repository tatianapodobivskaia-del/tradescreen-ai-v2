/*
 * LANDING PAGE — TradeScreenAI
 * Design: Intelligence Command Center — dark cinematic (#0a0e1a)
 * Premium: enlarged spacing, stronger headings, premium cards, glow effects
 * Typography: Inter display + JetBrains Mono data
 */
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
  ArrowRight, ChevronDown, Lock, ExternalLink, GraduationCap, Play,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  DollarSign, Users, AlertTriangle, TrendingUp, Upload, Search, FileText,
  Shield, Languages, ScanLine, Brain, BarChart3, Database,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/hero-globe-Hs5QvnPaBrKy3WbVNY2vHm.webp";
const PATTERN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/data-pattern-M5u9jMgYtxdMLTqSeDkH66.webp";

/* ===== SECTION HEADING — premium version ===== */
function PremiumHeading({ children, subtitle, dark }: { children: React.ReactNode; subtitle?: string; dark?: boolean }) {
  return (
    <div className="text-center mb-16 md:mb-20">
      <h2 className={`section-heading ${dark ? "text-white" : "text-slate-900"}`}>{children}</h2>
      {subtitle && <p className={`mt-4 section-subtitle ${dark ? "section-subtitle-dark" : ""}`}>{subtitle}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-[#0a0e1a] text-white overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center">
        <HeroNetworkAnimation />
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-[#0a0e1a]/20 to-[#0a0e1a]" />
        </div>
        <ScanningLine />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 py-36">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <AcademicBadge className="border-cyan-500/30 text-cyan-400 mb-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-extrabold font-display tracking-tight leading-[1.05] mb-8"
          >
            <span className="text-cyan-400">AI-Powered</span><br />
            Sanctions Screening
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-slate-400 font-body max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Multi-list compliance intelligence with Cyrillic transliteration and AI deep analysis
          </motion.p>

          {/* Entity counter with AI glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.7 }}
            className="ai-glow-dark inline-flex items-center gap-4 px-8 py-4 rounded-full mb-14"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm text-slate-400 font-body">Monitoring</span>
            <CountUpNumber value={heroStats.totalEntities} className="text-3xl font-bold text-cyan-400" />
            <span className="text-sm text-slate-400 font-body">sanctioned entities</span>
          </motion.div>

          {/* Premium CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link href="/app/screening" className="btn-premium btn-premium-primary group flex items-center gap-2.5 text-base">
              Start Screening
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/app/architecture" className="btn-premium btn-premium-outline flex items-center gap-2.5 text-base">
              Explore Prototype
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-7 h-7 text-slate-500 animate-bounce" />
        </motion.div>
      </section>

      {/* ===== WHY IT MATTERS ===== */}
      <WhyItMatters />
      <HowItWorks />
      <CoreCapabilities />
      <SeeItInAction />
      <ComparisonSection />
      <DataSourcesSection />
      <PerformanceBenchmarksSection />
      <PrivacySection />
      <Footer variant="dark" />
    </div>
  );
}

function WhyItMatters() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="relative py-32 md:py-44" style={{ backgroundImage: `url(${PATTERN_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-[#0a0e1a]/90" />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <PremiumHeading dark subtitle="The challenge of sanctions compliance grows more complex every year">Why It Matters</PremiumHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyItMattersStats.map((stat, i) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="premium-card-dark rounded-xl p-8 text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="text-4xl md:text-5xl font-extrabold font-data text-white mb-3">{stat.value}</div>
                <div className="text-sm font-bold text-slate-200 mb-1.5 tracking-wide uppercase">{stat.label}</div>
                <div className="text-xs text-slate-500 font-body">{stat.sublabel}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="relative py-32 md:py-44 bg-[#060a16]">
      <div className="max-w-6xl mx-auto px-4">
        <PremiumHeading dark subtitle="Three steps from vendor name to compliance decision">How It Works</PremiumHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {howItWorksSteps.map((step, i) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="relative"
              >
                <div className="premium-card-dark rounded-xl p-10 text-center h-full group">
                  <div className="text-7xl font-extrabold font-data text-cyan-500/8 absolute top-4 right-6">{step.step}</div>
                  <div className="w-18 h-18 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-8 group-hover:bg-cyan-500/20 transition-colors" style={{ width: "4.5rem", height: "4.5rem" }}>
                    <Icon className="w-9 h-9 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-extrabold font-display text-white mb-4">{step.title}</h3>
                  <p className="text-sm text-slate-400 font-body leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-7 h-7 text-cyan-500/30" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CoreCapabilities() {
  const { isInView, ref } = useInView(0.15);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="relative py-32 md:py-44">
      <ScanningLine />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <PremiumHeading dark subtitle="Purpose-built for sanctions compliance intelligence">Core Capabilities</PremiumHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreCapabilities.map((cap, i) => {
            const Icon = iconMap[cap.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="premium-card-dark rounded-xl p-8 group"
              >
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-extrabold font-display text-white mb-3">{cap.title}</h3>
                <p className="text-sm text-slate-400 font-body leading-relaxed">{cap.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const seeItInActionSteps = [
  { title: "Upload Document", Icon: Upload },
  { title: "AI Screens 4 Lists", Icon: Search },
  { title: "Get Compliance Report", Icon: FileText },
] as const;

function SeeItInAction() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="relative py-32 md:py-44 bg-[#0a0e1a]">
      <div className="max-w-6xl mx-auto px-4">
        <PremiumHeading dark subtitle="Full screening cycle in 60 seconds">See It In Action</PremiumHeading>

        <motion.div
          custom={0}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUp}
          role="img"
          aria-label="Demo video placeholder. Demo video coming soon."
          className="relative mx-auto flex max-w-4xl flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-[#050810] px-6 shadow-2xl shadow-black/40 aspect-video"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(rgba(34,211,238,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-cyan-500/35 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
              <Play className="h-14 w-14 translate-x-1 text-cyan-400" strokeWidth={1.25} fill="currentColor" aria-hidden />
            </div>
            <p className="text-center text-sm font-semibold tracking-wide text-slate-400 font-display">
              Demo Video Coming Soon
            </p>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {seeItInActionSteps.map((step, i) => {
            const StepIcon = step.Icon;
            return (
              <motion.div
                key={step.title}
                custom={i + 1}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="premium-card-dark rounded-xl border border-cyan-500/10 p-8 text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10">
                  <StepIcon className="h-7 w-7 text-cyan-400" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="text-base font-extrabold font-display text-white">{step.title}</h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="py-32 md:py-44 bg-[#060a16]">
      <div className="max-w-6xl mx-auto px-4">
        <PremiumHeading dark subtitle="Why intelligent screening outperforms legacy approaches">How It Compares</PremiumHeading>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <div className="premium-card-dark rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-5 px-8 text-slate-400 font-bold font-display text-base">Feature</th>
                  <th className="text-center py-5 px-8 text-slate-400 font-bold font-display text-base">Traditional</th>
                  <th className="text-center py-5 px-8 text-cyan-400 font-bold font-display text-base">TradeScreenAI</th>
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
                        row.tradescreen ? <Check className="w-5 h-5 text-cyan-400 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-cyan-400 font-bold font-body">{row.tradescreen}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
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
      ref={ref as React.Ref<HTMLElement>}
      className="relative py-32 md:py-44 border-t border-slate-800/50 bg-[#0a0e1a]"
      aria-labelledby="performance-benchmarks-heading"
    >
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-[11px] font-bold tracking-[0.2em] uppercase text-cyan-500/65 mb-4 font-data">
          Performance Benchmarks
        </p>
        <PremiumHeading
          dark
          subtitle="Benchmark results on controlled test dataset of 100 vendor records including 7 known sanctioned entities"
        >
          <span id="performance-benchmarks-heading">Measured Performance</span>
        </PremiumHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 md:mb-16">
          <motion.div
            custom={0}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="premium-card-dark rounded-xl p-10 text-center border border-cyan-500/20 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/35 transition-colors"
          >
            <div className="text-5xl md:text-6xl font-extrabold font-data text-cyan-400 mb-3 tabular-nums">97%</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide">Detection Rate</div>
          </motion.div>
          <motion.div
            custom={1}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="premium-card-dark rounded-xl p-10 text-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/35 transition-colors"
          >
            <div className="text-5xl md:text-6xl font-extrabold font-data text-emerald-400 mb-3 tabular-nums">~8%</div>
            <div className="text-sm font-bold text-slate-200 font-display tracking-wide">False Positive Rate</div>
          </motion.div>
          <motion.div
            custom={2}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="premium-card-dark rounded-xl p-10 text-center border border-cyan-500/20 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/35 transition-colors"
          >
            <div className="text-5xl md:text-6xl font-extrabold font-data text-cyan-400 mb-3 tabular-nums">&lt;2 min</div>
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
                  <th className="text-center py-5 px-4 text-cyan-400 font-bold font-display text-xs uppercase tracking-wider">TradeScreenAI</th>
                  <th className="text-center py-5 px-4 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Manual Review</th>
                  <th className="text-center py-5 px-4 text-slate-400 font-bold font-display text-xs uppercase tracking-wider">Rule-Based Tools</th>
                </tr>
              </thead>
              <tbody>
                {performanceBenchmarkRows.map((row) => (
                  <tr key={row.metric} className="border-b border-slate-800/60 hover:bg-slate-800/25 transition-colors">
                    <td className="py-4 px-6 text-slate-300 font-body font-medium">{row.metric}</td>
                    <td className="py-4 px-4 text-center text-cyan-400 font-bold font-data">{row.tradescreen}</td>
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
      </div>
    </section>
  );
}

function DataSourcesSection() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="py-32 md:py-44">
      <div className="max-w-6xl mx-auto px-4">
        <PremiumHeading dark subtitle="Comprehensive coverage across major international sanctions programs">Trusted Data Sources</PremiumHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
              className="premium-card-dark rounded-xl p-8 text-center group cursor-pointer block"
            >
              <div className="text-5xl mb-5">{source.flag}</div>
              <h3 className="text-xl font-extrabold font-display text-white mb-2 group-hover:text-cyan-400 transition-colors">{source.name}</h3>
              <p className="text-xs text-slate-500 font-body mb-5 leading-relaxed">{source.fullName}</p>
              <div className="text-3xl font-extrabold font-data text-cyan-400">
                <CountUpNumber value={source.count} />
              </div>
              <div className="text-xs text-slate-500 font-body mt-1.5">entities</div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-600 group-hover:text-cyan-400 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Official Source</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="py-28 md:py-36 bg-[#060a16]">
      <div className="max-w-4xl mx-auto px-4">
        <PremiumHeading dark subtitle="Transparency and responsible use">Data Privacy & Disclaimer</PremiumHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Data Privacy */}
          <div className="premium-card-dark rounded-xl p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-cyan-400" />
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
          <div className="premium-card-dark rounded-xl p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
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

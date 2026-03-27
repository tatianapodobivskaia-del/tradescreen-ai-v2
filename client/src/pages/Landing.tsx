/*
 * LANDING PAGE — TradeScreenAI
 * Design: Intelligence Command Center — dark cinematic (#0a0e1a)
 * Signature: scanning lines, radar pulses, cyan accents, Space Grotesk display
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useCountUp";
import { CountUpNumber, AcademicBadge, Footer, SectionTitle, ScanningLine } from "@/components/shared";
import {
  heroStats, whyItMattersStats, howItWorksSteps, coreCapabilities,
  comparisonData, dataSources, researcherInfo
} from "@/lib/mockData";
import {
  DollarSign, Users, AlertTriangle, TrendingUp, Upload, Search, FileText,
  Shield, Languages, ScanLine, Brain, BarChart3, Database, Check, X,
  Linkedin, Github, ArrowRight, ChevronDown, Lock, ExternalLink
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  DollarSign, Users, AlertTriangle, TrendingUp, Upload, Search, FileText,
  Shield, Languages, ScanLine, Brain, BarChart3, Database,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/hero-globe-Hs5QvnPaBrKy3WbVNY2vHm.webp";
const SCAN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/hero-scanning-a8e3T43DcX5n4EgZCMoAup.webp";
const PATTERN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663475700687/iRAGVzbCvCbP6GpuZZXXiJ/data-pattern-M5u9jMgYtxdMLTqSeDkH66.webp";

export default function Landing() {
  return (
    <div className="bg-[#0a0e1a] text-white overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-[#0a0e1a]/20 to-[#0a0e1a]" />
        </div>
        <ScanningLine />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-32">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <AcademicBadge className="border-cyan-500/30 text-cyan-400 mb-8" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tight leading-[1.1] mb-6"
          >
            <span className="text-cyan-400">AI-Powered</span><br />
            Sanctions Screening
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-slate-400 font-body max-w-2xl mx-auto mb-8"
          >
            Multi-list compliance intelligence with Cyrillic transliteration and GPT-4o deep analysis
          </motion.p>

          {/* Entity counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.7 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm text-slate-400 font-body">Monitoring</span>
            <CountUpNumber value={heroStats.totalEntities} className="text-2xl font-bold text-cyan-400" />
            <span className="text-sm text-slate-400 font-body">sanctioned entities</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/app/screening" className="group flex items-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-[#0a0e1a] font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40">
              Start Screening
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/app" className="flex items-center gap-2 px-8 py-3.5 border border-slate-600 hover:border-cyan-500/50 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-300">
              Explore Prototype
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-slate-500 animate-bounce" />
        </motion.div>
      </section>

      {/* ===== WHY IT MATTERS ===== */}
      <WhyItMatters />

      {/* ===== HOW IT WORKS ===== */}
      <HowItWorks />

      {/* ===== CORE CAPABILITIES ===== */}
      <CoreCapabilities />

      {/* ===== COMPARISON TABLE ===== */}
      <ComparisonSection />

      {/* ===== TRUSTED DATA SOURCES ===== */}
      <DataSourcesSection />

      {/* ===== ABOUT RESEARCHER ===== */}
      <ResearcherSection />

      {/* ===== DATA PRIVACY ===== */}
      <PrivacySection />

      <Footer variant="dark" />
    </div>
  );
}

function WhyItMatters() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="relative py-24 md:py-32" style={{ backgroundImage: `url(${PATTERN_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-[#0a0e1a]/90" />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <SectionTitle dark subtitle="The cost of compliance failure is rising exponentially">Why It Matters</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyItMattersStats.map((stat, i) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="glass-card-dark rounded-xl p-6 text-center group hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold font-data text-white mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-300 mb-1">{stat.label}</div>
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
    <section ref={ref as React.Ref<HTMLElement>} className="relative py-24 md:py-32 bg-[#060a16]">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle dark subtitle="Three steps from vendor name to compliance decision">How It Works</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div className="glass-card-dark rounded-xl p-8 text-center h-full group hover:border-cyan-500/30 transition-all duration-300">
                  <div className="text-6xl font-bold font-data text-cyan-500/10 absolute top-4 right-6">{step.step}</div>
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500/20 transition-colors">
                    <Icon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 font-body leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-cyan-500/40" />
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
    <section ref={ref as React.Ref<HTMLElement>} className="relative py-24 md:py-32">
      <ScanningLine />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <SectionTitle dark subtitle="Purpose-built for sanctions compliance intelligence">Core Capabilities</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreCapabilities.map((cap, i) => {
            const Icon = iconMap[cap.icon];
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="glass-card-dark rounded-xl p-6 group hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold font-display text-white mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-400 font-body leading-relaxed">{cap.description}</p>
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
  return (    <section ref={ref as React.Ref<HTMLElement>} className="py-24 md:py-32 bg-[#060a16]">
        <div className="max-w-6xl mx-auto px-4">
        <SectionTitle dark subtitle="Why intelligent screening outperforms legacy approaches">How It Compares</SectionTitle>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <div className="glass-card-dark rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-6 text-slate-400 font-semibold font-display">Feature</th>
                  <th className="text-center py-4 px-6 text-slate-400 font-semibold font-display">Traditional</th>
                  <th className="text-center py-4 px-6 text-cyan-400 font-semibold font-display">TradeScreenAI</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-6 text-slate-300 font-body">{row.feature}</td>
                    <td className="py-3.5 px-6 text-center">
                      {typeof row.traditional === "boolean" ? (
                        row.traditional ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-slate-500 font-body">{row.traditional}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {typeof row.tradescreen === "boolean" ? (
                        row.tradescreen ? <Check className="w-4 h-4 text-cyan-400 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />
                      ) : (
                        <span className="text-cyan-400 font-semibold font-body">{row.tradescreen}</span>
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

function DataSourcesSection() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle dark subtitle="Comprehensive coverage across major international sanctions programs">Trusted Data Sources</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataSources.map((source, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              className="glass-card-dark rounded-xl p-6 text-center group hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{source.flag}</div>
              <h3 className="text-lg font-bold font-display text-white mb-1">{source.name}</h3>
              <p className="text-xs text-slate-500 font-body mb-4 leading-relaxed">{source.fullName}</p>
              <div className="text-2xl font-bold font-data text-cyan-400">
                <CountUpNumber value={source.count} />
              </div>
              <div className="text-xs text-slate-500 font-body mt-1">entities</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResearcherSection() {
  const { isInView, ref } = useInView(0.2);
  return (
    <section ref={ref as React.Ref<HTMLElement>} className="py-24 md:py-32 bg-[#060a16]">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle dark>About the Researcher</SectionTitle>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <div className="glass-card-dark rounded-xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold font-display text-white mb-4">{researcherInfo.name}</h3>
                <div className="space-y-3 mb-6">
                  {researcherInfo.education.map((edu, i) => (
                    <div key={i} className="text-sm font-body">
                      <div className="text-slate-300 font-medium">{edu.degree}</div>
                      <div className="text-slate-500">{edu.institution}, {edu.location}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <a href={researcherInfo.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-sm">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                  <a href={researcherInfo.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-sm">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                </div>
              </div>
              <div className="md:w-72">
                <div className="rounded-xl border border-slate-700/50 p-6 bg-slate-800/30">
                  <h4 className="text-sm font-semibold font-display text-slate-400 uppercase tracking-wider mb-4">Research & Writing</h4>
                  <p className="text-sm text-slate-500 font-body italic">Coming soon — articles on sanctions compliance, Cyrillic transliteration challenges, and AI in trade finance.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold font-display text-white">Data Privacy</h3>
        </div>
        <p className="text-sm text-slate-400 font-body leading-relaxed max-w-xl mx-auto">
          This academic research prototype processes all data locally in the browser. No vendor names, screening results, or uploaded documents are stored, transmitted to external servers, or retained after the session ends. All sanctions list data is sourced from publicly available government databases.
        </p>
      </div>
    </section>
  );
}

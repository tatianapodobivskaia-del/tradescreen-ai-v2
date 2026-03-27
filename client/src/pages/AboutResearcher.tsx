/*
 * ABOUT RESEARCHER — Professional standalone page
 * Design: Clean fintech profile with strong typography hierarchy
 * Includes: Profile, Education, Publications, Research Focus, Connect, Disclaimer
 */
import { motion } from "framer-motion";
import { researcherInfo } from "@/lib/mockData";
import { User, GraduationCap, Linkedin, Github, BookOpen, MapPin, Shield, ExternalLink, FileText, Award } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const publications = [
  {
    title: "AI-Powered Multi-List Sanctions Screening with Cyrillic Transliteration",
    type: "Capstone Project",
    venue: "Atlantis University — Master of Science in Information Technology",
    year: "2026",
    description: "A comprehensive research prototype demonstrating two-pass AI architecture combining in-browser fuzzy matching with GPT-4o deep analysis for sanctions compliance screening across OFAC, EU, UN, and UK OFSI databases.",
  },
  {
    title: "Cyrillic Name Transliteration Challenges in International Sanctions Compliance",
    type: "Research Paper",
    venue: "Atlantis University",
    year: "2026",
    description: "Analysis of transliteration inconsistencies across ISO 9, ICAO, BGN/PCGN, and informal standards, and their impact on sanctions screening accuracy for Russian, Ukrainian, and Belarusian names.",
  },
  {
    title: "Vision AI Document Analysis for Trade Compliance",
    type: "Technical Report",
    venue: "Atlantis University",
    year: "2026",
    description: "A four-agent AI pipeline using GPT-4o Vision for automated extraction and risk assessment of trade documents including invoices, bills of lading, and certificates of origin.",
  },
];

export default function AboutResearcher() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">About the Researcher</h1>
        <p className="text-base text-slate-500 font-body mt-2 leading-relaxed">
          Background, credentials, and research behind TradeScreenAI
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeIn}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400" />
          <div className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                <User className="w-9 h-9 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">{researcherInfo.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm font-medium text-cyan-600 font-body">TradeScreenAI Creator</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm text-slate-500 font-body">Miami, FL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Education */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeIn}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <GraduationCap className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold font-display text-slate-900">Education</h3>
          </div>
          <div className="space-y-4">
            {researcherInfo.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800 font-display">{edu.degree}</h4>
                  <p className="text-sm text-slate-600 font-body mt-0.5">{edu.institution}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400 font-body">{edu.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Publications */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeIn}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <FileText className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold font-display text-slate-900">Publications & Research</h3>
          </div>
          <div className="space-y-5">
            {publications.map((pub, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] font-semibold text-slate-800 font-display leading-snug">{pub.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-data bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                        {pub.type}
                      </span>
                      <span className="text-xs text-slate-400 font-data">{pub.year}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-body mt-1">{pub.venue}</p>
                    <p className="text-sm text-slate-500 font-body mt-2 leading-relaxed">{pub.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Research Focus */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeIn}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2.5 mb-5">
            <BookOpen className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold font-display text-slate-900">Research Focus</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Sanctions Compliance", desc: "Multi-list screening methodologies and regulatory frameworks across OFAC, EU, UN, and UK OFSI databases." },
              { title: "Cyrillic Transliteration", desc: "Challenges in name matching across ISO 9, ICAO, BGN/PCGN, and informal transliteration standards." },
              { title: "AI in RegTech", desc: "Applications of large language models and computer vision in regulatory technology and trade finance." },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="text-sm font-bold font-display text-slate-800 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 font-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Connect */}
      <motion.div custom={5} initial="hidden" animate="visible" variants={fadeIn}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-lg font-bold font-display text-slate-900 mb-5">Connect</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={researcherInfo.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#0A66C2] text-white font-medium text-sm hover:bg-[#004182] transition-colors shadow-sm"
            >
              <Linkedin className="w-4.5 h-4.5" />
              LinkedIn Profile
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href={researcherInfo.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-slate-800 text-white font-medium text-sm hover:bg-slate-900 transition-colors shadow-sm"
            >
              <Github className="w-4.5 h-4.5" />
              GitHub Repository
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href="https://www.tradescreenai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50/50 transition-all"
            >
              <Shield className="w-4.5 h-4.5" />
              TradeScreenAI.com
              <ExternalLink className="w-3.5 h-3.5 opacity-40" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={fadeIn}>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-6">
          <p className="text-sm text-amber-700 font-body leading-relaxed">
            <span className="font-semibold">Academic Disclaimer:</span> TradeScreen AI is an academic research prototype developed at Atlantis University. For educational use only — not a commercial compliance tool. This system is not a substitute for professional legal or compliance advice.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

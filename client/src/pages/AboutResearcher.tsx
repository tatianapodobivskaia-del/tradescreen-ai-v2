/*
 * ABOUT RESEARCHER — Tatiana Podobivskaia profile, education, links
 */
import { motion } from "framer-motion";
import { researcherInfo } from "@/lib/mockData";
import { User, GraduationCap, Linkedin, Github, BookOpen, MapPin } from "lucide-react";

export default function AboutResearcher() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">About the Researcher</h1>
        <p className="text-sm text-slate-500 font-body mt-1">Background and credentials</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center shrink-0">
            <User className="w-10 h-10 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 mb-1">{researcherInfo.name}</h2>
            <p className="text-sm text-slate-500 font-body">Sanctions Compliance Researcher & Developer</p>
          </div>
        </div>
      </motion.div>

      {/* Education */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Education</h3>
        </div>
        <div className="space-y-4">
          {researcherInfo.education.map((edu, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50/50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 font-display">{edu.degree}</h4>
                <p className="text-sm text-slate-600 font-body">{edu.institution}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400 font-body">{edu.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold font-display text-slate-900 mb-4">Connect</h3>
        <div className="flex gap-3">
          <a
            href={researcherInfo.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-500/30 hover:bg-cyan-50/30 transition-all text-sm font-medium"
          >
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
          <a
            href={researcherInfo.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-500/30 hover:bg-cyan-50/30 transition-all text-sm font-medium"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
        </div>
      </motion.div>

      {/* Research & Writing */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-semibold font-display text-slate-900">Research & Writing</h3>
        </div>
        <div className="p-6 rounded-lg border border-dashed border-slate-200 text-center">
          <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-body italic">
            Coming soon — articles on sanctions compliance, Cyrillic transliteration challenges in trade finance, and AI applications in regulatory technology.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

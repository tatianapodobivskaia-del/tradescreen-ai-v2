import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, ShieldAlert, Cpu } from "lucide-react";

export default function AnimatedScreeningDemo() {
  // Step 0: Initial empty state
  // Step 1: Typing "Gazprom"
  // Step 2: "Scanning..."
  // Step 3: Result Appears
  // Step 4: AI Analysis Types out
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const targetText = "Gazprom";

  useEffect(() => {
    let timer: number;
    let sequenceTimeout: number;

    const runSequence = () => {
      setStep(0);
      setTypedText("");

      // Step 1: Type text
      setTimeout(() => setStep(1), 500);
      
      let typedLength = 0;
      const typeInterval = setInterval(() => {
        typedLength++;
        setTypedText(targetText.slice(0, typedLength));
        if (typedLength === targetText.length) {
          clearInterval(typeInterval);
          // Step 2: Scanning
          setTimeout(() => setStep(2), 500);
          // Step 3: Result
          setTimeout(() => setStep(3), 2000);
          // Step 4: AI Analysis
          setTimeout(() => setStep(4), 3000);
        }
      }, 100);

      // Loop after 10s
      sequenceTimeout = window.setTimeout(runSequence, 10000);
      
      return () => {
        clearInterval(typeInterval);
      };
    };

    runSequence();

    return () => {
      clearTimeout(sequenceTimeout);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#0B1221] to-[#050810] shadow-2xl shadow-cyan-900/20 overflow-hidden text-left font-body">
      {/* Fake Header */}
      <div className="flex px-4 py-3 border-b border-slate-800/80 items-center justify-between bg-[#080d19]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <div className="w-3 h-3 rounded-full bg-slate-700" />
        </div>
        <div className="text-xs font-data text-slate-500 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-500" />
          Live Screening Node
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8 min-h-[360px] md:min-h-[420px] flex flex-col gap-6">
        
        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-[#0f172a]/50 border border-slate-700/50 rounded-xl px-4 py-3 shadow-inner">
          <Search className="w-5 h-5 text-cyan-400/50" />
          <div className="text-lg font-data font-semibold text-white tracking-wide">
            {typedText}
            {step < 2 && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2.5 h-5 ml-1 bg-cyan-400 translate-y-0.5"
              />
            )}
          </div>
          <div className="ml-auto text-xs font-mono text-slate-500 uppercase">Input Entity</div>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="popLayout">
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-6 rounded-xl border border-cyan-500/20 bg-cyan-950/10 px-5 py-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-data text-slate-400">Match Found</div>
                  <div className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                    {targetText}
                    {step === 2 && <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm font-data text-slate-400">Composite Score</div>
                  <div className="text-3xl font-data font-black text-cyan-300">
                    {step === 2 ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                      >
                        --
                      </motion.span>
                    ) : (
                      "98"
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center w-32 border-l border-slate-700/50 pl-6 object-cover">
                  {step === 2 ? (
                     <div className="h-8 w-24 rounded-full bg-slate-800 animate-pulse" />
                  ) : (
                     <motion.div
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1, boxShadow: "0 0 20px rgba(239,68,68,0.4)" }}
                       className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1.5 flex items-center gap-2"
                     >
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-xs font-bold text-red-400 uppercase tracking-wider">High Risk</span>
                     </motion.div>
                  )}
                </div>
              </div>

              {/* AI Analysis Box */}
              {step >= 4 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 px-5 py-5 overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold font-data text-indigo-300 uppercase tracking-widest">AI Deep Analysis</span>
                  </div>
                  <div className="text-sm md:text-base text-slate-300 leading-relaxed font-mono">
                    <TypewriterText text="Gazprom is a globally sanctioned entity present on the OFAC SDN and EU consolidated lists. The name match is exact across Latin and Cyrillic script translations. Recommendation: BLOCK transaction immediately." />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [text]);

  return <span>{displayed}<span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-400 animate-pulse" /></span>;
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, ShieldAlert, Cpu, Play } from "lucide-react";

export default function AnimatedScreeningDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const targetText = "Gazprom";

  useEffect(() => {
    if (!isPlaying) return;
    
    let sequenceTimeout: number;
    let typeInterval: number;

    const runSequence = () => {
      setStep(0);
      setTypedText("");

      setTimeout(() => setStep(1), 500);
      
      let typedLength = 0;
      typeInterval = window.setInterval(() => {
        typedLength++;
        setTypedText(targetText.slice(0, typedLength));
        if (typedLength === targetText.length) {
          clearInterval(typeInterval);
          setTimeout(() => setStep(2), 500);
          setTimeout(() => setStep(3), 2000);
          setTimeout(() => setStep(4), 3000);
        }
      }, 100);

      sequenceTimeout = window.setTimeout(runSequence, 11000);
    };

    runSequence();

    return () => {
      clearInterval(typeInterval);
      clearTimeout(sequenceTimeout);
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-left font-body">
      
      {!isPlaying && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
           <button 
             onClick={() => setIsPlaying(true)}
             className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-cyan-400 bg-cyan-100/90 shadow-xl transition-transform hover:scale-105 active:scale-95"
           >
              <Play className="h-14 w-14 translate-x-1 text-cyan-600" strokeWidth={1.25} fill="currentColor" />
           </button>
           <span className="mt-4 font-display font-semibold text-slate-700">Click to Play Demo</span>
        </div>
      )}

      {/* Fake Header */}
      <div className="flex px-4 py-3 border-b border-slate-200 items-center justify-between bg-slate-50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <div className="w-3 h-3 rounded-full bg-slate-300" />
        </div>
        <div className="text-xs font-data text-slate-500 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
          Live Screening Node
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8 min-h-[360px] md:min-h-[420px] flex flex-col gap-6">
        
        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-4 py-3 shadow-sm">
          <Search className="w-5 h-5 text-slate-400" />
          <div className="text-lg font-data font-semibold text-slate-800 tracking-wide">
            {typedText}
            {isPlaying && step < 2 && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2.5 h-5 ml-1 bg-cyan-500 translate-y-0.5"
              />
            )}
          </div>
          <div className="ml-auto text-xs font-mono text-slate-400 uppercase">Input Entity</div>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="popLayout">
          {isPlaying && step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-data text-slate-500">Match Found</div>
                  <div className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                    {targetText}
                    {step === 2 && <Activity className="w-5 h-5 text-cyan-600 animate-pulse" />}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm font-data text-slate-500">Composite Score</div>
                  <div className="text-3xl font-data font-black text-cyan-600">
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

                <div className="flex items-center justify-center w-32 border-l border-slate-200 pl-6">
                  {step === 2 ? (
                     <div className="h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
                  ) : (
                     <motion.div
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1, boxShadow: "0 0 15px rgba(239,68,68,0.2)" }}
                       className="rounded-full bg-red-100 border border-red-200 px-3 py-1.5 flex items-center gap-2"
                     >
                       <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                       <span className="text-xs font-bold text-red-700 uppercase tracking-wider">High Risk</span>
                     </motion.div>
                  )}
                </div>
              </div>

              {/* AI Analysis Box */}
              {step >= 4 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-5 py-5 overflow-hidden relative shadow-sm"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold font-data text-indigo-700 uppercase tracking-widest">AI Deep Analysis</span>
                  </div>
                  <div className="text-sm md:text-base text-slate-800 leading-relaxed font-mono">
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
    const t = window.setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [text]);

  return <span>{displayed}<span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-500 animate-pulse" /></span>;
}

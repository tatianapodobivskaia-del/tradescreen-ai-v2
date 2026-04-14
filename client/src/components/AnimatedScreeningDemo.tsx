import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, ShieldAlert, CheckCircle2, Play, Languages, FileSearch, Cpu } from "lucide-react";

const variants = [
  "Shcherbakov", "Scherbakov", "Chtcherbakov", "Schtscherbakow", 
  "Sjtsjerbakov", "Szczerbakow", "Sczcerbakov", "Şçerbakov", 
  "Shcerbakov", "Ščerbakov", "Shtcherbakov", "Shchyerbakov",
  "Chcherbakov", "Shcherbacov", "Schsherbakov", "Stcherbakov",
  "Šerbakov", "Shcherbakoff", "Scherbakoff", "Chtcherbakoff"
];

export default function AnimatedScreeningDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [timeMs, setTimeMs] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    
    let startTime = Date.now();
    let frameId: number;

    const tick = () => {
      const now = Date.now();
      const elapsed = (now - startTime) % 15000;
      setTimeMs(elapsed);

      if (elapsed < 5000) setPhase(1);
      else if (elapsed < 10000) setPhase(2);
      else setPhase(3);

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
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

      {/* Header */}
      <div className="flex px-4 py-3 border-b border-slate-200 items-center justify-between bg-slate-50 relative overflow-hidden">
        <div className="flex gap-2 relative z-10">
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <div className="w-3 h-3 rounded-full bg-slate-300" />
        </div>
        <div className="text-xs font-data text-slate-500 flex items-center gap-2 relative z-10 transition-colors">
          {phase === 1 && <Languages className="w-3.5 h-3.5 text-indigo-500" />}
          {phase === 2 && <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />}
          {phase === 3 && <FileSearch className="w-3.5 h-3.5 text-violet-500" />}
          <span className="min-w-[150px] text-right">
            {phase === 1 ? "Cyrillic Transliteration" : phase === 2 ? "Live Screening Engine" : phase === 3 ? "Multi-Agent Scanner" : "Ready"}
          </span>
        </div>
        {/* Progress Bar inside Header */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-slate-200 w-full">
            <div className="h-full bg-cyan-400 transition-all duration-75 ease-linear" style={{ width: `${(timeMs / 15000) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 min-h-[400px] md:min-h-[440px] flex flex-col relative bg-slate-50">
        <AnimatePresence mode="wait">
          {phase === 1 && <Phase1Transliteration key="p1" timeMs={timeMs} />}
          {phase === 2 && <Phase2Screening key="p2" timeMs={timeMs - 5000} />}
          {phase === 3 && <Phase3Agents key="p3" timeMs={timeMs - 10000} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Phase1Transliteration({ timeMs }: { timeMs: number }) {
  // 0 - 1000ms: Typing 
  // 1000ms: Grid pops in
  const target = "Щербаков";
  const typedLength = Math.min(Math.floor(timeMs / 100), target.length);
  const showGrid = timeMs > 1200;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col h-full gap-6">
      <div className="flex items-center gap-3 bg-white border border-indigo-200 rounded-xl px-4 py-3 shadow-sm">
        <Languages className="w-5 h-5 text-indigo-400" />
        <div className="text-xl font-data font-semibold text-slate-800 tracking-wide">
          {target.slice(0, typedLength)}
          {timeMs < 1500 && (
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-2.5 h-5 ml-1 bg-indigo-500 translate-y-0.5" />
          )}
        </div>
        <div className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">CYRILLIC SOURCE</div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <AnimatePresence>
          {showGrid && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
               <div className="flex justify-between items-end pb-2 border-b border-slate-200">
                 <h3 className="font-display font-bold text-slate-700 text-lg">Generated Latin Orthographies</h3>
                 <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full animate-pulse">One name, 20 spellings</span>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {variants.map((v, i) => {
                   const visible = timeMs > 1200 + i * 40;
                   return (
                     <motion.div
                       key={v}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
                       className="bg-white border border-slate-200 text-slate-600 font-data text-sm py-1.5 px-3 rounded shadow-sm flex items-center gap-2"
                     >
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                       {v}
                     </motion.div>
                   )
                 })}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Phase2Screening({ timeMs }: { timeMs: number }) {
  // 0 - 2000ms: Screening progress bar
  // 2000ms+: Result
  const scanning = timeMs < 1800;
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex flex-col h-full gap-8 justify-center">
      {scanning ? (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
           <ShieldAlert className="w-16 h-16 text-cyan-500 animate-bounce" />
           <div className="text-center font-display font-semibold text-slate-700 text-2xl">
              Screening 45,296 entities...
           </div>
           <div className="w-full max-w-md h-3 bg-slate-200 rounded-full overflow-hidden">
             <div className="h-full bg-cyan-500 transition-all duration-[100ms] ease-linear" style={{ width: `${Math.min((timeMs / 1800) * 100, 100)}%` }} />
           </div>
           <div className="text-sm font-data font-semibold text-slate-500 text-center h-5 tracking-wide">
              {timeMs > 200 && <span>OFAC SDN... </span>}
              {timeMs > 600 && <span>EU Consolidated... </span>}
              {timeMs > 1000 && <span>UN Security Council... </span>}
              {timeMs > 1400 && <span>UK OFSI...</span>}
           </div>
        </div>
      ) : (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-4 w-full justify-center">
          <div className="rounded-2xl border border-slate-300 bg-white shadow-xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-[100px] -z-0" />
               <div className="grid grid-cols-[1fr_auto] gap-4 relative z-10">
                  <div>
                    <div className="text-sm font-data font-bold tracking-widest text-slate-400 uppercase mb-1">Direct Match Found</div>
                    <div className="text-3xl font-display font-extrabold text-slate-900 mb-1">SBERBANK OF RUSSIA</div>
                    <div className="flex gap-2 mt-3 text-sm flex-wrap">
                      <span className="bg-red-50 border border-red-100 text-red-700 px-3 py-1 rounded-md font-mono font-bold shadow-sm">OFAC SDN</span>
                      <span className="bg-red-50 border border-red-100 text-red-700 px-3 py-1 rounded-md font-mono font-bold shadow-sm">EU Consolidated</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-6xl font-data font-black text-red-600 drop-shadow-sm flex items-start gap-1">
                       94<span className="text-2xl text-red-400 mt-1.5">/100</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded border border-red-200 uppercase text-xs tracking-wider animate-pulse">High Risk</span>
                      <span className="bg-red-600 text-white font-bold px-3 py-1 rounded uppercase text-xs tracking-wider shadow-md">BLOCK</span>
                    </div>
                  </div>
               </div>
          </div>
          
          {timeMs > 2400 && (
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
              <div className="text-sm text-slate-800 leading-relaxed font-mono">
                <TypewriterText text="Sberbank is explicitly listed on OFAC SDN and EU Consolidated lists. Recommendation: BLOCK transaction." />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

const agents = [
  { icon: ScanLine, name: "Vision Agent", msg: "Extracted 3 entities from document", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  { icon: Languages, name: "Transliteration Agent", msg: "Generated Cyrillic cross-variants", color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
  { icon: Search, name: "Risk Agent", msg: "Screened against 45,296 entities", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { icon: ShieldAlert, name: "Action Agent", msg: "1 blocked, 1 flagged, 1 cleared", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
];
import { ScanLine } from "lucide-react";

function Phase3Agents({ timeMs }: { timeMs: number }) {
  // Cards appear at 500, 1200, 1900, 2600.
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full gap-4">
       <div className="text-center font-display font-bold text-slate-800 text-xl mb-2">Autonomous Document Intelligence</div>
       <div className="grid grid-rows-4 gap-3 flex-1">
          {agents.map((agent, i) => {
            const visible = timeMs > 500 + i * 800;
            const ActIcon = agent.icon;
            return (
              <AnimatePresence key={agent.name}>
                {visible && (
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className={`flex items-center gap-4 rounded-xl border ${agent.border} ${agent.bg} px-5 py-3 shadow-sm`}
                  >
                     <div className={`p-2 bg-white rounded-lg border ${agent.border}`}>
                       <ActIcon className={`w-5 h-5 ${agent.color}`} />
                     </div>
                     <div className="flex flex-col">
                       <span className={`font-data text-xs font-bold uppercase tracking-wider ${agent.color}`}>{agent.name}</span>
                       <span className="font-body text-sm font-semibold text-slate-700">{agent.msg}</span>
                     </div>
                     <div className="ml-auto">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </motion.div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
       </div>
    </motion.div>
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

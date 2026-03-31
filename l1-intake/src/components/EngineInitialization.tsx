import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Activity, Shield, Terminal, Command } from 'lucide-react';

interface EngineInitializationProps {
  onComplete: () => void;
}

const cliLogs = [
  "SYSTEM_BOOT: OK",
  "NEURAL_CORE: ONLINE",
  "COGNITION: SYNCING...",
  "AGENT_LOGIC: ALIGNING",
  "POWER_LEVEL: 100%",
  "SECURE_LINK: ESTABLISHED",
  "INTEL_NODE: SYNCHRONIZED"
];

export default function EngineInitialization({ onComplete }: EngineInitializationProps) {
  const [progress, setProgress] = useState(0);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  useEffect(() => {
    let currentLog = 0;
    const logInterval = setInterval(() => {
      if (currentLog < cliLogs.length) {
        setDisplayedLogs(old => [...old.slice(-4), cliLogs[currentLog]]);
        currentLog++;
      } else {
        clearInterval(logInterval);
      }
    }, 1000); // Slower logs for the 7.5s duration

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.33; // ~7.5 seconds total
      });
    }, 100);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(30px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/60 rounded-full blur-[140px] pointer-events-none" />
      
      {/* IMPROVED BRAIN MARGINS & DENSITY */}
      <div className="relative w-80 h-80 mb-20 flex items-center justify-center bg-white rounded-full border border-slate-50 shadow-[0_0_80px_rgba(59,130,246,0.04)] p-16">
        <div className="relative w-full h-full">
           <Brain size={144} className="absolute inset-0 mx-auto text-slate-100" strokeWidth={0.8} />
           
           <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 128 128">
              <defs>
                <filter id="nodeGlow">
                  <feGaussianBlur stdDeviation="1.5" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              
              {[...Array(24)].map((_, i) => {
                const angle = (i / 24) * Math.PI * 2;
                const r = 25 + (i % 4) * 8;
                const x = 64 + Math.cos(angle) * r;
                const y = 64 + Math.sin(angle) * (r * 0.85);
                
                return (
                  <motion.circle
                    key={`node-${i}`}
                    cx={x} cy={y}
                    r={1.2}
                    fill="#3b82f6"
                    filter="url(#nodeGlow)"
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: progress > (i * 4) ? [1, 2, 1] : 0,
                      opacity: progress > (i * 4) ? 1 : 0
                    }}
                    transition={{ 
                      scale: { duration: 2.5, repeat: Infinity, delay: i * 0.12 },
                      opacity: { duration: 0.3 }
                    }}
                  />
                );
              })}
           </svg>

           {progress > 98 && (
             <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1.5, opacity: 1 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
             >
                <Zap className="text-blue-500 fill-blue-500 shadow-blue-500 drop-shadow-lg" size={48} />
             </motion.div>
           )}
        </div>
      </div>

      <div className="max-w-sm w-full space-y-8 relative z-10 px-6">
        <div className="text-center space-y-2">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-1">Architectural Boot Sequence</h3>
          <div className="flex items-center justify-center gap-4">
             <div className="h-[2px] flex-1 bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
             </div>
             <span className="text-[12px] font-mono font-black text-slate-800 tracking-tighter tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* CRAYISH CLI TERMINAL - UPDATED */}
        <div className="bg-slate-100 rounded-2xl p-6 shadow-sm border border-slate-200/50 font-mono text-[10px] leading-relaxed group">
          <div className="flex items-center gap-1.5 mb-4 border-b border-slate-200 pb-3">
             <div className="flex gap-1.5 pr-4 border-r border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
             </div>
             <span className="ml-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
               <Terminal size={12} className="text-blue-500" /> core_initialize.log
             </span>
          </div>
          
          <div className="space-y-2 text-slate-600 min-h-[90px] font-medium">
             {displayedLogs.map((log, i) => (
               <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                 <span className="text-blue-500/30 font-black">❯</span>
                 <span className={log.includes('OK') || log.includes('100%') ? 'text-blue-800 font-black' : ''}>{log}</span>
               </motion.div>
             ))}
             {progress < 100 && (
               <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 h-3.5 bg-blue-500/40 inline-block align-middle" />
             )}
          </div>
        </div>

        <div className="flex justify-between items-center px-4 pt-4 opacity-40">
            {[
                { icon: Activity, label: 'COGNITION', value: progress > 90 ? 'ACTIVE' : 'READY' },
                { icon: Zap, label: 'POWER', value: '100%' },
                { icon: Shield, label: 'VAULT', value: 'SECURE' }
            ].map((spec) => (
                <div key={spec.label} className="flex flex-col items-center gap-1.5">
                    <spec.icon size={14} className="text-slate-400" />
                    <span className="text-[7px] font-black uppercase tracking-tighter">{spec.label}</span>
                    <span className="text-[9px] font-black text-slate-800">{spec.value}</span>
                </div>
            ))}
        </div>
      </div>

      <footer className="fixed bottom-12 flex items-center gap-3 opacity-10">
         <Command size={14} className="text-slate-800" />
         <span className="text-[8px] font-black text-slate-800 uppercase tracking-[0.4em]">Engine Protocol v5.1</span>
      </footer>
    </motion.div>
  );
}

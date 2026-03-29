import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, X } from 'lucide-react';

interface SyntheticGenerationProps {
    onComplete: (data: any) => void;
}

const BASE_STEPS = [
    "Analyzing organizational structure...",
    "Scanning department topology...",
    "Mapping existing audit coverage...",
    "Identifying workforce gaps...",
];

export default function SyntheticGeneration({ onComplete }: SyntheticGenerationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [apiData, setApiData] = useState<any>(null);
    const [apiReady, setApiReady] = useState(false);
    const [apiError, setApiError] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState<string[]>(BASE_STEPS);
    const [fadingOut, setFadingOut] = useState(false);

    // 1. Fetch API
    useEffect(() => {
        let cancelled = false;

        fetch('http://localhost:3000/api/synthesize-workforce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_id: 1, preview: true })
        })
            .then(res => {
                if (!res.ok) throw new Error("API failed");
                return res.json();
            })
            .then(data => {
                if (cancelled) return;
                setApiData(data);

                // Build dynamic steps from real data
                const emps = data.syntheticEmployees || [];
                const diags = data.syntheticDiagnostics || [];
                const depts: Record<string, number> = {};
                emps.forEach((e: any) => {
                    const d = e.department_name || e.department_id || 'Unknown';
                    depts[d] = (depts[d] || 0) + 1;
                });

                const dynamicSteps = [
                    ...BASE_STEPS,
                    ...Object.entries(depts).map(([name, count]) =>
                        `Drafting ${count} new role${count > 1 ? 's' : ''} for ${name}...`
                    ),
                    `Completing ${diags.filter((d: any) => d.type === 'worker').length} self-audits...`,
                    `Completing ${diags.filter((d: any) => d.type === 'supervisor').length} supervisor audits...`,
                    `Generating ${emps.length} synthetic employee profiles...`,
                    "Finalizing synthetic workforce...",
                ];

                setSteps(dynamicSteps);
                setApiReady(true);
            })
            .catch(err => {
                console.error(err);
                if (!cancelled) {
                    setApiError(true);
                }
            });

        return () => { cancelled = true; };
    }, []);

    // 2. Progress + step cycling
    useEffect(() => {
        if (apiError) return;

        const TOTAL_DURATION = 6000; // 6 seconds minimum
        const TICK = 50;
        let elapsed = 0;

        const interval = setInterval(() => {
            elapsed += TICK;

            // Progress: ease-out curve
            const rawProgress = Math.min(elapsed / TOTAL_DURATION, 1);
            // If API isn't ready yet and we're past 85%, slow down
            const cappedProgress = (!apiReady && rawProgress > 0.85) ? 0.85 : rawProgress;
            setProgress(cappedProgress);

            // Step cycling based on progress
            const totalSteps = steps.length;
            const newIdx = Math.min(
                Math.floor(cappedProgress * totalSteps),
                totalSteps - 1
            );
            setStepIndex(newIdx);

            // Complete when both API is ready and animation is done
            if (cappedProgress >= 1 && apiReady) {
                clearInterval(interval);
                setProgress(1);
                setStepIndex(steps.length - 1);

                // Hold for a beat then fade out
                setTimeout(() => {
                    setFadingOut(true);
                    setTimeout(() => {
                        onComplete(apiData);
                    }, 800);
                }, 600);
            }
        }, TICK);

        return () => clearInterval(interval);
    }, [apiReady, apiError, steps, apiData, onComplete]);

    // If API ready but progress was capped, push it to 100%
    useEffect(() => {
        if (apiReady && progress >= 0.85 && progress < 1) {
            const push = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 1) { clearInterval(push); return 1; }
                    return Math.min(prev + 0.02, 1);
                });
            }, 40);
            return () => clearInterval(push);
        }
    }, [apiReady, progress]);

    const percentage = Math.round(progress * 100);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: fadingOut ? 0 : 1 }}
            transition={{ duration: fadingOut ? 0.8 : 0.5 }}
            className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center font-sans overflow-hidden"
        >
            {/* High-end ambient background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.08)_0%,_transparent_60%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.1)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-xl px-12">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-16">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative mb-6"
                    >
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                        <div className="relative bg-slate-900/50 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl shadow-2xl">
                            <BrainCircuit className="text-emerald-400" size={32} />
                        </div>
                    </motion.div>
                    
                    <h2 className="text-sm font-bold text-emerald-500/60 tracking-[0.4em] uppercase mb-1">
                        Neural Core
                    </h2>
                    <h1 className="text-3xl font-light text-white tracking-widest uppercase">
                        Synthesis <span className="font-black text-emerald-400">Active</span>
                    </h1>
                </div>

                {/* Progress Visualizer */}
                <div className="relative mb-8">
                    {/* Big Percentage Backdrop */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-[0.03] select-none pointer-events-none">
                        <span className="text-[140px] font-black italic text-white leading-none">
                            {percentage}
                        </span>
                    </div>

                    <div className="relative text-center mb-6">
                        <span className="text-6xl font-black tabular-nums text-white tracking-tighter decoration-emerald-500/20 underline underline-offset-8">
                            {percentage}
                        </span>
                        <span className="text-2xl font-black text-emerald-400 ml-2">%</span>
                    </div>

                    {/* Smart Progress Bar */}
                    <div className="relative h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/5 backdrop-blur-xl">
                        {/* Base fill */}
                        <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-100 ease-out"
                            style={{
                                width: `${percentage}%`,
                                background: 'linear-gradient(90deg, #065f46, #10b981)',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                            }}
                        />
                        
                        {/* Scanning Line Effect */}
                        {percentage > 0 && percentage < 100 && (
                            <motion.div 
                                className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                animate={{ 
                                    left: ['-20%', '120%'] 
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    ease: "linear" 
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* AI Agent Console / Terminal */}
                <div className="relative">
                    <div className="absolute -top-3 left-4 z-20 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md backdrop-blur-md">
                         <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            AI Agent in Action
                         </span>
                    </div>
                    
                    <div className="h-44 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 p-6 font-mono text-[11px] overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
                        
                        <div className="space-y-1.5 opacity-80">
                            {steps.slice(0, stepIndex + 1).slice(-6).map((step, idx, arr) => (
                                <motion.div 
                                    key={step + idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: idx === arr.length - 1 ? 1 : 0.4, x: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-emerald-500/50 shrink-0 select-none">&gt;</span>
                                    <span className={`${idx === arr.length - 1 ? 'text-emerald-400' : 'text-slate-400'} leading-relaxed`}>
                                        {step}
                                        {idx < arr.length - 1 && <span className="ml-2 text-[10px] opacity-40 uppercase">[Done]</span>}
                                        {idx === arr.length - 1 && (
                                            <motion.span 
                                                animate={{ opacity: [0, 1] }} 
                                                transition={{ repeat: Infinity, duration: 0.8 }} 
                                                className="inline-block w-1.5 h-3.5 bg-emerald-500/50 ml-2 align-middle" 
                                            />
                                        )}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Scanline Effect overlay for terminal */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                            Compute Grid Attached
                        </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.1em]">
                        v2.4.0 Synthesis
                    </div>
                </div>
            </div>

            {/* Error State */}
            {apiError && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-slate-950/90 backdrop-blur-xl"
                >
                    <div className="bg-slate-900 border border-rose-500/30 p-12 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50" />
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                             <X size={32} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2 tracking-tight">Neural Link Failed</h3>
                        <p className="text-slate-400 text-xs mb-8 leading-relaxed font-medium">
                            The synthesis engine encountered an unexpected interruption while generating the workforce profiles.
                        </p>
                        <button 
                            onClick={() => onComplete(null)}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                        >
                            Return to Intake
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}



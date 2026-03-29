import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, ArrowRight } from 'lucide-react';



const TopValueLeaks: React.FC<{ data: any }> = ({ data }) => {
  const [selectedLeak, setSelectedLeak] = React.useState<any | null>(null);
  const workerDiags = data?.all_diagnostics?.filter((d: any) => d.type === 'worker') || [];
  
  const leaks = React.useMemo(() => {
    const activityMap: Record<string, { totalTime: number; dept: string; count: number }> = {};
    
    workerDiags.forEach((r: any) => {
        const details = r.activityDetails || [];
        details.forEach((act: any) => {
            if (act.contrib === 'Low') {
                const name = act.name || 'Untitled';
                if (!activityMap[name]) activityMap[name] = { totalTime: 0, dept: r.dept || 'General', count: 0 };
                activityMap[name].totalTime += act.percentTime || 0;
                activityMap[name].count++;
            }
        });
    });

    return Object.entries(activityMap)
        .map(([name, info]) => ({
            id: name,
            dept: info.dept,
            issue: name,
            waste: Math.round(info.totalTime / workerDiags.length),
            value: `$${Math.round((info.totalTime / 100) * 120)}k`, 
            urgency: info.totalTime / workerDiags.length > 30 ? 'Immediate' : 'High',
            color: info.totalTime / workerDiags.length > 30 ? '#f43f5e' : '#fb923c'
        }))
        .sort((a, b) => b.waste - a.waste)
        .slice(0, 5);
  }, [workerDiags]);

  if (workerDiags.length === 0 || leaks.length === 0) return (
    <div className="rounded-2xl p-10 text-center border border-dashed border-white/10" style={{ background: 'var(--bg-card)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-xs text-white/40 uppercase tracking-widest">Awaiting Value Leak Diagnostics...</p>
    </div>
  );

  return (
    <div className="rounded-2xl h-full flex flex-col relative"
      style={{ overflow: 'visible', background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #f43f5e', boxShadow: 'var(--shadow-md)' }}>
  
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 relative z-10 rounded-t-2xl"
        style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2">
          <TrendingDown size={13} style={{ color: '#f43f5e' }} />
          <span className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Top Value Leaks</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/30 uppercase font-mono">Total Risk</span>
            <span className="badge badge-red font-mono" style={{ fontSize: 13 }}>−${leaks.reduce((acc, l) => acc + parseInt(l.value.replace(/\$/g,'').replace('k','')), 0)}k <span className="opacity-40 ml-0.5 text-[10px]">/ yr</span></span>
        </div>
      </div>
  
      {/* Table header */}
      <div className="grid px-5 py-2 relative z-10" style={{ gridTemplateColumns: '28px 1fr 100px 72px 70px', gap: '0 12px', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-card)' }}>
        {['#', 'Identified Friction', 'Time Waste', 'Cap. Loss', ''].map((h, i) => (
          <span key={i} className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{h}</span>
        ))}
      </div>
  
      {/* Rows */}
      <div className="flex-1">
        {leaks.map((l, i) => (
            <motion.div
            key={l.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="group grid items-center px-5 py-4 cursor-help border-b border-white/[0.03] last:border-0 relative hover:z-[50] transition-colors"
            style={{ 
                gridTemplateColumns: '28px 1fr 100px 72px 70px', 
                gap: '0 12px',
                background: 'var(--bg-card)' 
            }}
            >
            {/* Rank */}
            <span className="text-[10px] font-mono text-white/20">{String(i + 1).padStart(2, '0')}</span>
    
            {/* Issue */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold"
                style={{ background: 'rgba(255,255,255,0.03)', color: l.color, border: `1px solid ${l.color}25`, fontFamily: 'var(--font-mono)' }}>
                {l.dept.slice(0,2).toUpperCase()}
                </div>
                <div className="min-w-0">
                <p className="text-[13px] font-bold text-white/90 truncate tracking-tight">{l.issue}</p>
                <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">{l.dept}</p>
                </div>
            </div>
    
            {/* Waste bar */}
            <div>
                <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold font-mono" style={{ color: l.color }}>{l.waste}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${l.waste}%` }} 
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    style={{ background: l.color }}
                />
                </div>
            </div>
    
            {/* Value (Cap Loss) */}
            <div className="text-right">
                <span className="text-[11px] font-black font-mono" style={{ color: '#f43f5e' }}>{l.value}</span>
                <p className="text-[8px] text-white/20 uppercase font-bold">Drain</p>
            </div>
    
            {/* Action */}
            <button
                onClick={() => setSelectedLeak(l)}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/20 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer ml-auto"
            >
                <ArrowRight size={14} />
            </button>

            {/* HOVER TOOLTIP — Intelligently positioned */}
            <div className={`absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[100] ${i === 0 ? 'top-full mt-2' : '-top-12'}`}>
                <div className="bg-[#0e1525] border border-white/10 rounded-lg px-4 py-2.5 shadow-2xl min-w-[300px] backdrop-blur-xl">
                    <p className="text-[11px] leading-relaxed text-white/80 text-center font-body">
                        You are currently paying <span className="text-white font-bold font-mono">{l.value}</span> per year in salaries for effort that the employees themselves say is producing minimal value.
                    </p>
                    {/* Triangle pointer */}
                    <div className={`absolute left-1/2 w-2 h-2 rotate-45 bg-[#0e1525] border-white/10 -translate-x-1/2 ${i === 0 ? '-top-1 border-l border-t' : '-bottom-1 border-r border-b'}`} />
                </div>
            </div>
            </motion.div>
        ))}
      </div>

      {/* RESOLVE MODAL */}
      <AnimatePresence>
        {selectedLeak && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-sm bg-[#0e1525] border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${selectedLeak.color}15`, border: `1px solid ${selectedLeak.color}30` }}>
                            <TrendingDown size={20} style={{ color: selectedLeak.color }} />
                        </div>
                        <button onClick={() => setSelectedLeak(null)} className="text-white/20 hover:text-white cursor-pointer transition-colors">
                            <ArrowRight size={18} className="rotate-180" />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 font-display">Strategic Resolution</h3>
                    <p className="text-sm text-white/60 leading-relaxed font-body">
                        If you can automate or streamline just the <span className="text-white font-bold">"{selectedLeak.issue}"</span> process within <span className="text-white font-bold">{selectedLeak.dept}</span> (e.g., moving from meetings to a shared dashboard), you would essentially recapture <span className="text-white font-bold">{selectedLeak.value}</span> in value.
                    </p>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <button onClick={() => setSelectedLeak(null)} 
                            className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all cursor-pointer">
                            Acknowledge Opportunity
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
;

export default TopValueLeaks;

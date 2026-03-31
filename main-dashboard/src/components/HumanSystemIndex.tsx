import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useIntakeData from '../hooks/useIntakeData';

const colorFor = (score: number) =>
  score >= 75 ? '#34d399' : score >= 55 ? '#fb923c' : '#f43f5e';

const HumanSystemIndex: React.FC = () => {
  const { data } = useIntakeData();

  const stats = useMemo(() => {
    const workers = (data?.all_diagnostics || []).filter((d: any) => d.type === 'worker');
    if (workers.length === 0) return null;

    const avg = (key: string, path: string = 'p1') =>
      workers.reduce((s: number, d: any) => s + (d[path]?.[key] || 0), 0) / workers.length;

    // Efficiency — inverse of low-criticality time
    let lowCritTime = 0, totalTime = 0;
    workers.forEach((d: any) => {
      (d.activityDetails || []).forEach((a: any) => {
        totalTime += (a.percentTime || 0);
        if (a.criticality === 'Low') lowCritTime += (a.percentTime || 0);
      });
    });
    const lowCritPct = totalTime > 0 ? (lowCritTime / totalTime) * 100 : 0;
    const efficiency  = Math.round(100 - lowCritPct);
    const alignment   = Math.round((avg('targetClarity') / 10) * 100);
    const capability  = Math.round(((10 - avg('capGap')) / 10) * 100);
    const energy      = Math.round(((10 - avg('burnout')) / 10) * 100);
    const execution   = Math.round((avg('orgHealth') / 10) * 100);

    // Overall HSI — same formula as TopKpiRow for consistency
    const avgMeaning = (avg('orgHealth') + avg('targetClarity')) / 2;
    const avgEnergy  = 10 - avg('burnout');
    const avgSust    = 10 - avg('capGap');
    const hsi = Math.round(((avgMeaning + avgEnergy + avgSust) / 30) * 100);

    // Tag counts — real threshold crossings
    const efficiencyReveals = workers.filter((d: any) => {
      let lc = 0, tot = 0;
      (d.activityDetails || []).forEach((a: any) => {
        tot += a.percentTime || 0;
        if (a.criticality === 'Low') lc += a.percentTime || 0;
      });
      return tot > 0 && lc / tot > 0.25;
    }).length;

    const alignmentGaps  = workers.filter((d: any) => (d.p1?.targetClarity || 0) < 5).length;
    const burnoutSignals = workers.filter((d: any) => (d.p1?.burnout || 0) > 6).length;
    const opportunities  = workers.filter((d: any) => (d.p1?.orgHealth || 0) >= 7 && (d.p1?.capGap || 0) <= 3).length;

    return { hsi, efficiency, alignment, capability, energy, execution,
             efficiencyReveals, alignmentGaps, burnoutSignals, opportunities,
             total: workers.length };
  }, [data]);

  if (!stats) return null;

  const hsiColor  = colorFor(stats.hsi);
  const hsiStatus = stats.hsi >= 80 ? 'Optimal · system stable'
    : stats.hsi >= 65 ? 'Stable — rising tension detected'
    : stats.hsi >= 50 ? 'Stressed — intervention needed'
    : 'Critical — immediate action required';

  const dimensions = [
    { label: 'Efficiency',  score: stats.efficiency,  color: colorFor(stats.efficiency) },
    { label: 'Alignment',   score: stats.alignment,   color: colorFor(stats.alignment) },
    { label: 'Capability',  score: stats.capability,  color: colorFor(stats.capability) },
    { label: 'Energy',      score: stats.energy,      color: colorFor(stats.energy) },
    { label: 'Execution',   score: stats.execution,   color: colorFor(stats.execution) },
  ];

  const tags = [
    { 
      label: `${stats.efficiencyReveals} efficiency reveals`, 
      value: stats.efficiencyReveals,
      color: '#f43f5e', 
      bg: 'rgba(244,63,94,0.10)',   
      border: 'rgba(244,63,94,0.22)',
      tooltip: 'Workers spending >25% time on low-value tasks — indicates process inefficiencies and wasted resources'
    },
    { 
      label: `${stats.alignmentGaps} alignment gaps`,  
      value: stats.alignmentGaps,       
      color: '#fb923c', 
      bg: 'rgba(251,146,60,0.08)',  
      border: 'rgba(251,146,60,0.20)',
      tooltip: 'Workers unclear about goals or priorities — leads to duplicated effort and missed targets'
    },
    { 
      label: `${stats.burnoutSignals} burnout signals`,       
      value: stats.burnoutSignals,
      color: '#818cf8', 
      bg: 'rgba(129,140,248,0.08)', 
      border: 'rgba(129,140,248,0.20)',
      tooltip: 'Workers showing high stress or exhaustion — risk of turnover, errors, and health issues'
    },
    { 
      label: `${stats.opportunities} opportunities`,  
      value: stats.opportunities,        
      color: '#34d399', 
      bg: 'rgba(52,211,153,0.08)',  
      border: 'rgba(52,211,153,0.20)',
      tooltip: 'High-performing, healthy workers ready for growth — untapped potential for scaling'
    },
  ].sort((a, b) => b.value - a.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-2)',
        borderLeft: `3px solid ${hsiColor}`,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ── Card header ── */}
      <div className="flex items-start justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-1)' }}>
        <span className="text-sm font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}>
          Human System Index
        </span>
        <span className="text-[10px] text-right"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
          {stats.total} workers · live
        </span>
      </div>

      {/* ── Card body ── */}
      <div className="px-6 py-6 flex flex-col gap-5 flex-1">

        {/* Score - Premium Style */}
        <div className="flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative p-8 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${hsiColor}08 0%, ${hsiColor}03 100%)`,
              border: `1px solid ${hsiColor}20`,
              boxShadow: `0 0 40px ${hsiColor}10, inset 0 0 30px ${hsiColor}08`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative z-10 text-center"
            >
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 56,
                fontWeight: 800,
                background: `linear-gradient(180deg, ${hsiColor} 0%, ${hsiColor}cc 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                letterSpacing: '-3px',
                textShadow: `0 0 30px ${hsiColor}40`,
              }}>
                {stats.hsi}
              </span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-px w-6" style={{ background: `${hsiColor}40` }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 500,
                  color: `${hsiColor}99`,
                  letterSpacing: '0.15em',
                }}>
                  HSI
                </span>
                <div className="h-px w-6" style={{ background: `${hsiColor}40` }} />
              </div>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${hsiColor}15 0%, transparent 60%)`,
              }}
            />
          </motion.div>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-[10px] font-medium px-3 py-1.5 rounded-full"
            style={{ 
              fontFamily: 'var(--font-display)', 
              color: hsiColor,
              background: `${hsiColor}12`,
              border: `1px solid ${hsiColor}25`,
              letterSpacing: '0.02em',
            }}>
            {hsiStatus}
          </span>
        </div>

        {/* Dimension bars */}
        <div className="space-y-3">
          {dimensions.map((d, i) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-[11px] w-20 shrink-0"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {d.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                <motion.div
                  className="h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${d.score}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: d.color, boxShadow: `0 0 6px ${d.color}55` }}
                />
              </div>
              <span className="text-[12px] font-bold w-7 text-right shrink-0"
                style={{ fontFamily: 'var(--font-display)', color: d.color }}>
                {d.score}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-1)' }} />

        {/* Tag pills */}
        <div className="flex flex-col gap-3">
          {tags.map(t => (
            <div key={t.label} className="relative group">
              <span
                className="text-[10px] font-semibold px-3 py-1.5 rounded-full self-start cursor-help block"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: t.color,
                  background: t.bg,
                  border: `1px solid ${t.border}`,
                }}
              >
                {t.label}
              </span>
              <div className="absolute left-0 bottom-full mb-2 px-3 py-2 rounded-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-normal"
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  maxWidth: '240px',
                }}>
                {t.tooltip}
                <div className="absolute left-3 -bottom-1 w-2 h-2 rotate-45" style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
};

export default HumanSystemIndex;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Lock, Zap, ArrowDown, X, Users } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

const CrisisProximityIndex: React.FC = () => {
  const [hoveredFactor,  setHoveredFactor]  = useState<string | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const { data } = useIntakeData();

  const diags       = (data?.all_diagnostics || []) as any[];
  const workers     = diags.filter(d => d.type === 'worker');
  const supervisors = diags.filter(d => d.type === 'supervisor');
  const all         = [...workers, ...supervisors];

  /* ── Raw severity scores (0–100) ── */
  const avgBurnout   = all.length > 0     ? all.reduce((s, d) => s + (d.p1?.burnout || 0), 0) / all.length : 0;
  const burnoutScore = (avgBurnout / 5) * 100;
  const avgCapGap    = workers.length > 0 ? workers.reduce((s, d) => s + (d.p1?.capGap || 0), 0) / workers.length : 0;
  const capGapScore  = (avgCapGap / 10) * 100;
  const overloadPct  = workers.length > 0 ? (workers.filter(d => (d.p1?.weeklyHrs || 0) > 45).length / workers.length) * 100 : 0;
  const avgLegacy    = workers.length > 0 ? workers.reduce((s, d) => s + (d.p1?.legacyBurden || 0), 0) / workers.length : 0;
  const supWithEnth  = supervisors.filter(s => s.p3?.enthusiasm !== undefined);
  const avgEnth      = supWithEnth.length > 0 ? supWithEnth.reduce((s, d) => s + (d.p3?.enthusiasm || 0), 0) / supWithEnth.length : 12;
  const enthScore    = Math.max(0, 100 - (avgEnth / 25) * 100);

  const baseScore = diags.length > 0
    ? Math.round(burnoutScore * 0.35 + capGapScore * 0.25 + overloadPct * 0.15 + avgLegacy * 0.15 + enthScore * 0.10)
    : 0;

  /* ── Per-factor contribution, impact & severity for radar positioning ── */
  const burnoutContrib  = Math.round(burnoutScore * 0.35);
  const capGapContrib   = Math.round(capGapScore  * 0.25);
  const overloadContrib = Math.round(overloadPct  * 0.15);
  const legacyContrib   = Math.round(avgLegacy    * 0.15);
  const enthContrib     = Math.round(enthScore     * 0.10);

  const FACTORS = baseScore > 0
    ? [
        { id: 'burnout',  label: 'Burnout Cluster',      pct: Math.round((burnoutContrib  / baseScore) * 100), impact: burnoutContrib,  color: '#f43f5e', severity: burnoutScore },
        { id: 'capgap',   label: 'Capability Gap',        pct: Math.round((capGapContrib   / baseScore) * 100), impact: capGapContrib,   color: '#f43f5e', severity: capGapScore  },
        { id: 'overload', label: 'Workforce Overload',    pct: Math.round((overloadContrib / baseScore) * 100), impact: overloadContrib, color: '#fb923c', severity: overloadPct  },
        { id: 'legacy',   label: 'Legacy Work Burden',    pct: Math.round((legacyContrib   / baseScore) * 100), impact: legacyContrib,   color: '#38bdf8', severity: avgLegacy    },
        { id: 'enthus',   label: 'Low Engagement Signal', pct: Math.round((enthContrib     / baseScore) * 100), impact: enthContrib,     color: '#a78bfa', severity: enthScore    },
      ].sort((a, b) => b.pct - a.pct)
    : [];

  /* ── Timeline ── */
  const d1 = baseScore > 70 ? 30 : baseScore > 45 ? 47  : 90;
  const d2 = baseScore > 70 ? 55 : baseScore > 45 ? 90  : 150;
  const m3 = baseScore > 70 ? 3  : baseScore > 45 ? 5   : 9;
  const m4 = baseScore > 70 ? 5  : baseScore > 45 ? 7   : 12;

  const futureMonth = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const TIMELINE = [
    { time: `${d1}d`,        desc: 'Burnout cluster peaks',  color: '#fb923c' },
    { time: `${d2}d`,        desc: 'First resignation risk', color: '#f97316' },
    { time: futureMonth(m3), desc: 'HSI drops below 60',     color: '#f43f5e' },
    { time: futureMonth(m4), desc: 'Talent exodus risk',      color: '#dc2626' },
  ];

  /* ── What-if score ── */
  const hovImpact        = hoveredFactor ? (FACTORS.find(f => f.id === hoveredFactor)?.impact || 0) : 0;
  const prospectiveScore = baseScore - hovImpact;

  /* ── Status ── */
  const statusLabel = baseScore > 70 ? 'CRITICAL' : baseScore > 45 ? 'ESCALATED' : baseScore > 25 ? 'MONITORED' : 'STABLE';
  const statusColor = baseScore > 70 ? '#f43f5e'  : baseScore > 45 ? '#fb923c'   : baseScore > 25 ? '#38bdf8'   : '#34d399';

  const footerCopy = baseScore > 70
    ? 'BOARD ALERT: Systemic burnout velocity has exceeded core safety limits. Crisis threshold imminent.'
    : baseScore > 45
    ? 'BOARD NOTICE: Multiple risk indicators are converging. Executive attention required this quarter.'
    : baseScore > 25
    ? 'Moderate stress signals detected across the organisation. Proactive intervention recommended.'
    : 'System health is stable. Continue current monitoring cadence.';

  /* ── Affected employees per factor ── */
  const getAffectedEmployees = (factorId: string) => {
    switch (factorId) {
      case 'burnout':
        return [...workers, ...supervisors]
          .filter(d => (d.p1?.burnout || 0) > 0)
          .sort((a, b) => (b.p1?.burnout || 0) - (a.p1?.burnout || 0))
          .slice(0, 8)
          .map(d => ({ name: d.employee_name || '—', value: +(d.p1?.burnout || 0).toFixed(1), max: 5, unit: '/5' }));
      case 'capgap':
        return workers
          .filter(d => (d.p1?.capGap || 0) > 0)
          .sort((a, b) => (b.p1?.capGap || 0) - (a.p1?.capGap || 0))
          .slice(0, 8)
          .map(d => ({ name: d.employee_name || '—', value: +(d.p1?.capGap || 0).toFixed(1), max: 10, unit: '/10' }));
      case 'overload':
        return workers
          .filter(d => (d.p1?.weeklyHrs || 0) > 45)
          .sort((a, b) => (b.p1?.weeklyHrs || 0) - (a.p1?.weeklyHrs || 0))
          .slice(0, 8)
          .map(d => ({ name: d.employee_name || '—', value: Math.round(d.p1?.weeklyHrs || 0), max: 80, unit: 'hrs' }));
      case 'legacy':
        return workers
          .filter(d => (d.p1?.legacyBurden || 0) > 0)
          .sort((a, b) => (b.p1?.legacyBurden || 0) - (a.p1?.legacyBurden || 0))
          .slice(0, 8)
          .map(d => ({ name: d.employee_name || '—', value: +(d.p1?.legacyBurden || 0).toFixed(1), max: 10, unit: '/10' }));
      case 'enthus':
        return supervisors
          .filter(d => d.p3?.enthusiasm !== undefined)
          .sort((a, b) => (a.p3?.enthusiasm || 0) - (b.p3?.enthusiasm || 0))
          .slice(0, 8)
          .map(d => ({ name: d.employee_name || '—', value: +(d.p3?.enthusiasm || 0).toFixed(1), max: 25, unit: '/25' }));
      default:
        return [];
    }
  };

  /* ── Radar dot positioning ── */
  // severity 0–100: higher = more dangerous = closer to center
  const radarDist = (severity: number) => Math.max(10, Math.min(68, 10 + (1 - severity / 100) * 58));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-1)',
        borderLeft: `3px solid ${statusColor}`,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}>
            <Lock size={9} style={{ color: '#a78bfa' }} />
            <span className="text-[8.5px] font-bold tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>
              Private CEO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertOctagon size={14} style={{ color: statusColor }} />
            <span className="text-sm font-bold text-white uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}>
              Crisis Proximity Index
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
          style={{ background: `${statusColor}1a`, border: `1px solid ${statusColor}4d`, color: statusColor, fontFamily: 'var(--font-display)' }}
        >
          Priority Response Plan
        </motion.button>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-0 divide-x" style={{ borderColor: 'var(--border-1)' }}>

        {/* ── LEFT: Proximity Radar ── */}
        <div className="flex flex-col items-center justify-center px-4 py-6 gap-3">
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
            <defs>
              {/* Radial glow at center */}
              <radialGradient id="cpiCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={statusColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={statusColor} stopOpacity="0"    />
              </radialGradient>
            </defs>

            {/* Zone fills */}
            <circle cx="100" cy="100" r="75" fill="rgba(244,63,94,0.035)" />
            <circle cx="100" cy="100" r="50" fill="rgba(251,146,60,0.04)"  />
            <circle cx="100" cy="100" r="25" fill="rgba(52,211,153,0.07)"  />

            {/* Rings */}
            <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(244,63,94,0.22)"   strokeWidth="0.75" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(251,146,60,0.18)"  strokeWidth="0.75" />
            <circle cx="100" cy="100" r="25" fill="none" stroke="rgba(52,211,153,0.25)"  strokeWidth="0.75" />

            {/* Grid cross */}
            <line x1="100" y1="20"  x2="100" y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="20"  y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="47"  y1="47"  x2="153" y2="153" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
            <line x1="153" y1="47"  x2="47"  y2="153" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />

            {/* Zone labels */}
            <text x="100" y="18"  fontSize="6" fill="rgba(244,63,94,0.5)"  textAnchor="middle" fontFamily="var(--font-mono)">CRITICAL</text>
            <text x="100" y="44"  fontSize="6" fill="rgba(251,146,60,0.45)" textAnchor="middle" fontFamily="var(--font-mono)">CAUTION</text>
            <text x="100" y="69"  fontSize="6" fill="rgba(52,211,153,0.4)"  textAnchor="middle" fontFamily="var(--font-mono)">SAFE</text>

            {/* ── Orbiting scan dot ── */}
            <motion.g
              style={{ transformOrigin: '100px 100px' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              <circle cx="100" cy="25" r="2" fill={statusColor} opacity="0.55"
                style={{ filter: `drop-shadow(0 0 4px ${statusColor})` }} />
            </motion.g>

            {/* Center glow */}
            <circle cx="100" cy="100" r="28" fill="url(#cpiCenterGlow)" />

            {/* ── Factor dots ── */}
            {FACTORS.map((f, i) => {
              const angleDeg = i * 72 - 90;
              const angleRad = angleDeg * (Math.PI / 180);
              const dist     = radarDist(f.severity);
              const x        = 100 + dist * Math.cos(angleRad);
              const y        = 100 + dist * Math.sin(angleRad);
              const isHov    = hoveredFactor === f.id;
              const isDimmed = hoveredFactor !== null && !isHov;
              const labelAnchor = x > 103 ? 'start' : x < 97 ? 'end' : 'middle';
              const labelOffX   = x > 103 ? 9 : x < 97 ? -9 : 0;
              const labelOffY   = x > 97 && x < 103 ? (y < 100 ? -8 : 10) : 3;

              return (
                <motion.g
                  key={f.id}
                  onMouseEnter={() => setHoveredFactor(f.id)}
                  onMouseLeave={() => setHoveredFactor(null)}
                  style={{ cursor: 'pointer' }}
                  animate={{ opacity: isDimmed ? 0.25 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Ping ring */}
                  <motion.circle
                    cx={x} cy={y} r={5}
                    fill="none" stroke={f.color} strokeWidth="1"
                    initial={{ r: 5, opacity: 0.65 }}
                    animate={{ r: [5, 13, 5], opacity: [0.65, 0, 0.65] }}
                    transition={{ duration: 2.4 + i * 0.35, repeat: Infinity, ease: 'easeOut', delay: i * 0.55 }}
                  />
                  {/* Dot */}
                  <motion.circle
                    cx={x} cy={y}
                    animate={{ r: isHov ? 6.5 : 4.5 }}
                    transition={{ duration: 0.15 }}
                    fill={f.color}
                    opacity={isHov ? 1 : 0.8}
                    style={{ filter: isHov ? `drop-shadow(0 0 5px ${f.color})` : undefined }}
                  />
                  {/* Hover label */}
                  <AnimatePresence>
                    {isHov && (
                      <motion.text
                        x={x + labelOffX} y={y + labelOffY}
                        fontSize="7.5" fill="white"
                        textAnchor={labelAnchor}
                        fontFamily="var(--font-mono)"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        -{f.impact}pts
                      </motion.text>
                    )}
                  </AnimatePresence>
                </motion.g>
              );
            })}

            {/* Centre hub */}
            <motion.circle
              cx="100" cy="100" r="8"
              fill="none" stroke={statusColor} strokeWidth="1"
              animate={{ r: [8, 14, 8], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle cx="100" cy="100" r="5"   fill={statusColor} />
            <circle cx="100" cy="100" r="2.5" fill="white" opacity="0.9" />
          </svg>

          {/* Score display */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <motion.p
                key={prospectiveScore}
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="text-[48px] font-bold leading-none tracking-tighter"
                style={{ fontFamily: 'var(--font-mono)', color: hoveredFactor ? '#34d399' : statusColor }}
              >
                {prospectiveScore}
              </motion.p>
              {hoveredFactor && (
                <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center text-[#34d399] font-bold text-xs">
                  <ArrowDown size={14} />{hovImpact}
                </motion.div>
              )}
            </div>
            <div className="mt-2 px-3 py-1 rounded-lg inline-block transition-all duration-300"
              style={{
                background: hoveredFactor ? 'rgba(52,211,153,0.1)' : `${statusColor}26`,
                border: `1px solid ${hoveredFactor ? 'rgba(52,211,153,0.3)' : statusColor + '59'}`,
              }}>
              <span className="text-[10px] font-bold tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: hoveredFactor ? '#34d399' : statusColor }}>
                {hoveredFactor ? 'PROSPECTIVE' : statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Factors + Timeline ── */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-bold tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                PREDICTIVE "WHAT-IF" MODELING
              </p>
              <Zap size={10} className="text-amber-400" />
            </div>
            <div className="space-y-2.5">
              {FACTORS.map((f, i) => {
                const isSelected = selectedFactor === f.id;
                return (
                  <motion.div
                    key={f.id}
                    onMouseEnter={() => setHoveredFactor(f.id)}
                    onMouseLeave={() => setHoveredFactor(null)}
                    onClick={() => setSelectedFactor(isSelected ? null : f.id)}
                    className="cursor-pointer group relative p-1 -m-1 rounded-md transition-colors"
                    animate={{ background: isSelected ? `${f.color}12` : 'transparent' }}
                    style={{ border: isSelected ? `1px solid ${f.color}30` : '1px solid transparent', borderRadius: 6 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <motion.div
                          className="rounded-full shrink-0"
                          animate={{ width: isSelected ? 5 : 0, opacity: isSelected ? 1 : 0 }}
                          style={{ height: 5, background: f.color }}
                        />
                        <span className="text-[10px] transition-colors group-hover:text-white"
                          style={{ fontFamily: 'var(--font-body)', color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                          {f.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          {hoveredFactor === f.id && !isSelected && (
                            <motion.span
                              initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                              className="text-[9px] font-bold text-[#34d399]">
                              Resolve: -{f.impact}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <span className="text-[10px] font-bold shrink-0"
                          style={{ fontFamily: 'var(--font-mono)', color: f.color }}>
                          {f.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: f.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${f.pct}%`, opacity: hoveredFactor && hoveredFactor !== f.id ? 0.3 : 1 }}
                        transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pre-Mortem Timeline / Affected Employees toggle */}
          <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 12, position: 'relative', minHeight: 120 }}>
            <AnimatePresence mode="wait">
              {selectedFactor ? (() => {
                const sel   = FACTORS.find(f => f.id === selectedFactor)!;
                const emps  = getAffectedEmployees(selectedFactor);
                return (
                  <motion.div key="employees"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Users size={9} style={{ color: sel.color }} />
                        <p className="text-[9px] font-bold tracking-widest uppercase"
                          style={{ fontFamily: 'var(--font-display)', color: sel.color }}>
                          {sel.label}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFactor(null)}
                        className="flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
                        style={{ width: 16, height: 16 }}
                      >
                        <X size={9} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                    {emps.length === 0 ? (
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No data available for this factor.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {emps.map((emp, i) => {
                          const pct = Math.round((emp.value / emp.max) * 100);
                          return (
                            <motion.div key={emp.name}
                              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.2 }}
                              className="flex items-center gap-2"
                            >
                              <div className="shrink-0 rounded-full"
                                style={{ width: 5, height: 5, background: sel.color, opacity: 0.7 }} />
                              <span className="text-[10px] truncate flex-1"
                                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                                {emp.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="rounded-full overflow-hidden" style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.07)' }}>
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: sel.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(pct, 100)}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.04 }}
                                  />
                                </div>
                                <span className="text-[9px] font-bold"
                                  style={{ fontFamily: 'var(--font-mono)', color: sel.color, minWidth: 28, textAlign: 'right' }}>
                                  {emp.value}{emp.unit}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })() : (
                <motion.div key="timeline"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                >
                  <p className="text-[9px] font-bold tracking-widest mb-3"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                    PROJECTED SYSTEM FAILURE POINTS
                  </p>
                  <div className="space-y-2.5">
                    {TIMELINE.map((t, i) => (
                      <motion.div key={t.time} className="flex items-center gap-2"
                        initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07, duration: 0.25 }}>
                        <div className="rounded-full shrink-0" style={{ width: 7, height: 7, background: t.color }} />
                        <span className="text-[10px] font-bold shrink-0"
                          style={{ fontFamily: 'var(--font-mono)', color: t.color, minWidth: 52 }}>
                          {t.time}
                        </span>
                        <span className="text-[10px]"
                          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
                          {t.desc}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-[8.5px] mt-3" style={{ color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>
                    ↑ Click a factor above to see affected team members
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        whileHover={{ background: `${statusColor}0d` }}
        className="px-6 py-4 flex items-center justify-between cursor-pointer"
        style={{ borderTop: '1px solid var(--border-1)', background: `${statusColor}08` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
          <p className="text-[11px] font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {footerCopy}
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: statusColor }}>
          Mitigate Risks <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>→</motion.span>
        </span>
      </motion.div>
    </motion.div>
  );
};

export default CrisisProximityIndex;

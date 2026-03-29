import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronLeft, ChevronRight, X, Building2, TrendingUp, AlertCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Department {
  name: string;
  score: number;       // Now generic score (severity for vulnerabilities, strength for synergies)
  metric: string;      // impact (cost) or yield (value)
}

interface PrimaryCorrelation {
  type: 'vulnerability' | 'synergy';
  signalA: { label: string; color: string };
  signalB: { label: string; color: string };
  diagnosis: string;
  diagnosisColor: string;
  confidence: number;
  departments: Department[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PRIMARIES: PrimaryCorrelation[] = [
  // ══ VULNERABILITIES ══
  {
    type: 'vulnerability',
    signalA: { label: 'TIME ↑',     color: '#f43f5e' },
    signalB: { label: 'FRICTION ↑', color: '#fb923c' },
    diagnosis: 'BROKEN PROCESS SIGNATURE',
    diagnosisColor: '#f43f5e',
    confidence: 94,
    departments: [
      { name: 'Engineering',      score: 88, metric: '$340K/yr loss' },
      { name: 'Operations',       score: 76, metric: '$210K/yr loss' },
      { name: 'Product',          score: 61, metric: '$140K/yr loss' },
    ],
  },
  {
    type: 'vulnerability',
    signalA: { label: 'BURNOUT ↑',   color: '#f43f5e' },
    signalB: { label: 'ALIGNMENT ↓', color: '#fb923c' },
    diagnosis: 'LEADERSHIP DISCONNECT',
    diagnosisColor: '#fb923c',
    confidence: 87,
    departments: [
      { name: 'Operations',       score: 91, metric: '$420K/yr risk' },
      { name: 'Customer Success', score: 79, metric: '$190K/yr risk' },
      { name: 'Sales',            score: 63, metric: '$155K/yr risk' },
    ],
  },
  {
    type: 'vulnerability',
    signalA: { label: 'TRUST ↓', color: '#f43f5e' },
    signalB: { label: 'VOICE ↓', color: '#a78bfa' },
    diagnosis: 'PSYCHOLOGICAL UNSAFETY',
    diagnosisColor: '#a78bfa',
    confidence: 83,
    departments: [
      { name: 'Operations',       score: 89, metric: '$380K/yr churn' },
      { name: 'Engineering',      score: 74, metric: '$200K/yr churn' },
    ],
  },

  // ══ SYNERGIES ══
  {
    type: 'synergy',
    signalA: { label: 'ALIGNMENT ↑', color: '#34d399' },
    signalB: { label: 'AUTONOMY ↑',  color: '#0ea5e9' },
    diagnosis: 'STRATEGIC VELOCITY HUB',
    diagnosisColor: '#34d399',
    confidence: 91,
    departments: [
      { name: 'Product Strategy', score: 94, metric: '24% faster cycle' },
      { name: 'R&D Lab',         score: 88, metric: '3.1x innovation' },
      { name: 'Growth Ops',      score: 72, metric: '18% yield ↑' },
    ],
  },
  {
    type: 'synergy',
    signalA: { label: 'TRUST ↑', color: '#0ea5e9' },
    signalB: { label: 'VOICE ↑', color: '#34d399' },
    diagnosis: 'PSYCHOLOGICAL SAFETY ENGINE',
    diagnosisColor: '#0ea5e9',
    confidence: 96,
    departments: [
      { name: 'Engineering Squad A', score: 98, metric: 'Zero silent fails' },
      { name: 'Leadership Core',     score: 92, metric: 'Rapid pivot ability' },
      { name: 'Design Team',         score: 84, metric: 'High-risk bets ok' },
    ],
  },
  {
    type: 'synergy',
    signalA: { label: 'ENERGY ↑',  color: '#22d3ee' },
    signalB: { label: 'VALUE ↑',   color: '#34d399' },
    diagnosis: 'PEAK PERFORMANCE CLUSTER',
    diagnosisColor: '#22d3ee',
    confidence: 88,
    departments: [
      { name: 'Sales West',       score: 95, metric: '$1.4M efficiency' },
      { name: 'Solutions Eng',    score: 89, metric: '92% NPS record' },
      { name: 'Customer Success', score: 76, metric: 'Durable loyalty' },
    ],
  },
];

const CYCLE_MS = 6000;

const SignalCorrelationMap: React.FC = () => {
  const [mode, setMode]             = useState<'vulnerability' | 'synergy'>('vulnerability');
  const [activeIdx, setActiveIdx]   = useState(0);
  const [paused, setPaused]         = useState(false);
  const [drillOpen, setDrillOpen]   = useState(false);
  const [direction, setDirection]   = useState(1);

  const filtered = useMemo(() => PRIMARIES.filter(p => p.type === mode), [mode]);
  const total = filtered.length;
  const corr = filtered[activeIdx] || filtered[0];

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setActiveIdx(idx);
    setDrillOpen(false);
  }, []);

  const prev = () => goTo((activeIdx - 1 + total) % total, -1);
  const next = () => goTo((activeIdx + 1) % total, 1);

  // Auto-cycle
  useEffect(() => {
    if (paused || drillOpen) return;
    const id = setInterval(() => {
      setDirection(1);
      setActiveIdx(i => (i + 1) % total);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [paused, drillOpen, total]);

  // Reset index when mode changes
  useEffect(() => {
    setActiveIdx(0);
    setDrillOpen(false);
  }, [mode]);

  const scoreColor = (s: number, type: string) => 
    type === 'vulnerability' 
      ? (s >= 80 ? '#f43f5e' : s >= 60 ? '#fb923c' : '#34d399')
      : (s >= 80 ? '#34d399' : s >= 60 ? '#0ea5e9' : '#94a3b8');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-1)',
        borderTop: `2px solid ${mode === 'synergy' ? '#34d399' : '#f43f5e'}`,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-3">
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setMode('vulnerability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${mode === 'vulnerability' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner' : 'text-white/30 hover:text-white/60'}`}
            >
              <AlertCircle size={10} />
              VULNERABILITY
            </button>
            <button
              onClick={() => setMode('synergy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${mode === 'synergy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' : 'text-white/30 hover:text-white/60'}`}
            >
              <TrendingUp size={10} />
              SYNERGY
            </button>
          </div>
        </div>

        {/* Indicators and Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
            <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: mode === 'synergy' ? '#34d399' : '#f43f5e' }} />
            <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase">LIVE CORRELATION ENGINE</span>
          </div>
          
          <div className="flex items-center gap-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="flex items-center gap-1">
              {filtered.map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all duration-300" 
                  style={{ width: i === activeIdx ? 16 : 4, background: i === activeIdx ? (mode === 'synergy' ? '#34d399' : '#f43f5e') : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prev} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 text-white/40 cursor-pointer transition-colors"><ChevronLeft size={16} /></button>
              <button onClick={next} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 text-white/40 cursor-pointer transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${mode}-${activeIdx}`}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 40, scale: 0.98 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 0.98 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Primary Signal Pair */}
            <div className="flex items-center justify-between gap-6 mb-10">
              {/* Signal A */}
              <div className="flex-1 rounded-2xl p-6 text-center relative overflow-hidden" 
                style={{ background: `${corr.signalA.color}08`, border: `1px solid ${corr.signalA.color}15` }}>
                <div className="absolute top-0 left-0 w-full h-[1px] opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${corr.signalA.color}, transparent)` }} />
                <p className="text-[10px] eyebrow text-white/30 mb-2">PRIMARY SIGNAL</p>
                <p className="text-xl font-bold tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-display)' }}>{corr.signalA.label}</p>
              </div>

              {/* Central Visual Connector */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="mb-2">
                  <svg width="120" height="40" viewBox="0 0 120 40">
                    <motion.path
                      d="M 10 20 Q 60 0 110 20"
                      fill="none"
                      stroke={corr.diagnosisColor}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      animate={{ strokeDashoffset: [0, -20] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.circle r="4" fill={corr.diagnosisColor} animate={{ cx: [10, 110], cy: [20, 0, 20] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeIn' }}>
                      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                    </motion.circle>
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                  <Zap size={16} style={{ color: corr.diagnosisColor }} />
                </div>
              </div>

              {/* Signal B */}
              <div className="flex-1 rounded-2xl p-6 text-center relative overflow-hidden" 
                style={{ background: `${corr.signalB.color}08`, border: `1px solid ${corr.signalB.color}15` }}>
                <div className="absolute top-0 left-0 w-full h-[1px] opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${corr.signalB.color}, transparent)` }} />
                <p className="text-[10px] eyebrow text-white/30 mb-2">CORRELATING SIGNAL</p>
                <p className="text-xl font-bold tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-display)' }}>{corr.signalB.label}</p>
              </div>
            </div>

            {/* Diagnosis Core */}
            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] eyebrow text-white/40 mb-1 uppercase tracking-widest">{mode === 'synergy' ? 'SYNERGY SIGNATURE' : 'DIAGNOSTIC SIGNATURE'}</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{corr.diagnosis}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] eyebrow text-white/40 mb-1 uppercase tracking-widest">Confidence</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: mode === 'synergy' ? '#34d399' : '#fb923c', fontFamily: 'var(--font-mono)' }}>{corr.confidence}%</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                <motion.div className="h-full" style={{ background: corr.diagnosisColor }} initial={{ width: 0 }} animate={{ width: `${corr.confidence}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
              </div>
            </div>

            {/* Department Impacts / Yields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {corr.departments.map((dept, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-white opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-wider">{dept.name}</span>
                    <Building2 size={12} className="text-white/20" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold font-mono" style={{ color: scoreColor(dept.score, mode) }}>{dept.score}</span>
                    <span className="text-[9px] eyebrow opacity-40 uppercase tracking-widest">index</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                    <motion.div className="h-full" style={{ background: scoreColor(dept.score, mode) }} initial={{ width: 0 }} animate={{ width: `${dept.score}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                  <p className="text-[10px] font-bold tracking-tight uppercase" style={{ color: mode === 'synergy' ? '#34d399' : '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                    {dept.metric}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Narrative Footer */}
      <div className="px-8 py-5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
        <p className="text-[11px] text-white/40 leading-relaxed max-w-lg">
          {mode === 'synergy' 
            ? "Identifying high-leverage synergy clusters. These patterns represent organizational competitive advantages where dual positive signals create exponential value creation."
            : "Identifying systemic vulnerability signatures. These correlations reveal hidden risks where coupled negative signals create friction, time leaks, or cultural degradation clusters."}
        </p>
        <button onClick={() => setDrillOpen(!drillOpen)} className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest transition-all">
          Generate Full Link Analysis
        </button>
      </div>
    </motion.div>
  );
};

export default SignalCorrelationMap;

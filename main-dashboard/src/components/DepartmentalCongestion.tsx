import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

/* ── Tube geometry ───────────────────────────────────────── */
const TW   = 54;
const TH   = 178;
const TY   = 84;
const TBOT = TY + TH;
const TRX  = 9;

/* ── Bubble params ───────────────────────────────────────── */
const BUBBLE_PARAMS = [
  [{ xo: -13, delay: 0,    dur: 2.4, r: 2.0 }, { xo:  6, delay: 0.95, dur: 1.85, r: 1.3 }, { xo: -4, delay: 1.7,  dur: 2.7, r: 1.7 }],
  [{ xo:   8, delay: 0.3,  dur: 2.1, r: 1.5 }, { xo: -9, delay: 1.1,  dur: 2.55, r: 2.1 }, { xo:  3, delay: 1.9,  dur: 1.9, r: 1.2 }],
  [{ xo:  -5, delay: 0.15, dur: 2.6, r: 1.8 }, { xo: 11, delay: 0.75, dur: 1.95, r: 1.4 }, { xo: -2, delay: 1.5,  dur: 2.3, r: 2.0 }],
  [{ xo:  10, delay: 0.5,  dur: 2.2, r: 1.6 }, { xo: -7, delay: 1.3,  dur: 2.7,  r: 1.2 }, { xo:  4, delay: 2.0,  dur: 1.8, r: 1.9 }],
  [{ xo:  -9, delay: 0.2,  dur: 2.5, r: 1.3 }, { xo:  5, delay: 1.05, dur: 2.0,  r: 2.0 }, { xo: -1, delay: 1.8,  dur: 2.4, r: 1.5 }],
];

/* ── Dept raw metrics (for insight engine) ───────────────── */
interface DeptMetrics {
  dept:         string;
  load:         number;
  color:        string;
  critical:     boolean;
  avgBurnout:   number;   // 0–10
  avgCapGap:    number;   // 0–10
  avgLegacy:    number;   // 0–10
  avgClarity:   number;   // 0–10
  avgOrgHealth: number;   // 0–10
  count:        number;
}

/* ── Insight generator ───────────────────────────────────── */
interface Insight {
  headline: string;
  body:     string;
  color:    string;
  icon:     'up' | 'down' | 'flat';
}

const generateDeptInsight = (m: DeptMetrics, withLegacy: boolean): Insight => {
  // Pattern 1: burnout is dominant driver
  if (m.avgBurnout >= 7 && m.avgBurnout >= m.avgCapGap && (!withLegacy || m.avgBurnout >= m.avgLegacy)) {
    return {
      headline: 'Burnout is the primary congestion driver',
      body: `Average burnout of ${m.avgBurnout.toFixed(1)}/10 in ${m.dept} is compressing output capacity. People are working at or beyond sustainable limits. Reducing workload or headcount pressure is the most direct lever.`,
      color: '#f43f5e',
      icon: 'down',
    };
  }

  // Pattern 2: legacy burden choking the dept (only when toggle is on)
  if (withLegacy && m.avgLegacy >= 7 && m.avgLegacy >= m.avgBurnout) {
    return {
      headline: 'Legacy burden is throttling throughput',
      body: `Legacy systems score ${m.avgLegacy.toFixed(1)}/10 — the highest pressure signal in ${m.dept}. Significant time is lost to maintenance, workarounds, and technical debt rather than value-generating work.`,
      color: '#fb923c',
      icon: 'down',
    };
  }

  // Pattern 3: capability gap + high load = skills mismatch under pressure
  if (m.avgCapGap >= 6 && m.load > 80) {
    return {
      headline: 'Skills mismatch under high load',
      body: `${m.dept} is operating at ${m.load}% load with a capability gap of ${m.avgCapGap.toFixed(1)}/10. People are being asked to deliver beyond their current skill level, which multiplies errors and slows throughput.`,
      color: '#fb923c',
      icon: 'down',
    };
  }

  // Pattern 4: low clarity cascading to congestion
  if (m.avgClarity <= 4 && m.load > 70) {
    return {
      headline: 'Unclear direction is amplifying workload',
      body: `Direction clarity in ${m.dept} sits at only ${m.avgClarity.toFixed(1)}/10. When people don't know what matters most, they work on everything — creating artificial congestion from priority confusion rather than genuine capacity shortage.`,
      color: '#fbbf24',
      icon: 'flat',
    };
  }

  // Pattern 5: all signals moderate — systemic overcommitment
  if (m.load > 100 && m.avgBurnout < 6 && m.avgCapGap < 6) {
    return {
      headline: 'Volume overcommitment — not a people problem',
      body: `${m.dept} shows ${m.load}% load without dominant individual stressors. The team is capable but simply has too much on. This is a resource allocation or project intake problem, not a capability or engagement issue.`,
      color: '#fb923c',
      icon: 'down',
    };
  }

  // Pattern 6: healthy dept, low load
  if (m.load <= 70 && m.avgBurnout <= 4 && m.avgOrgHealth >= 6) {
    return {
      headline: 'Operating well within capacity',
      body: `${m.dept} is one of the healthier departments in the system — ${m.load}% load with low burnout and solid org health. This is a potential source of capacity for cross-departmental support if other teams are under pressure.`,
      color: '#34d399',
      icon: 'up',
    };
  }

  // Pattern 7: moderate burnout + moderate legacy — compound friction (only when toggle is on)
  if (withLegacy && m.avgBurnout >= 5 && m.avgLegacy >= 5) {
    return {
      headline: 'Compound friction — burnout meets legacy drag',
      body: `${m.dept} shows moderate burnout (${m.avgBurnout.toFixed(1)}/10) and legacy burden (${m.avgLegacy.toFixed(1)}/10) simultaneously. Neither alone is critical, but together they create a friction loop that erodes capacity over time.`,
      color: '#fbbf24',
      icon: 'flat',
    };
  }

  // Default: load-based generic
  const level = m.load > 100 ? 'critically overloaded' : m.load > 80 ? 'under elevated pressure' : 'within manageable range';
  return {
    headline: `${m.dept} is ${level}`,
    body: `Load index of ${m.load}% reflects combined burnout, capability gap, and legacy pressure. ${m.load > 80 ? 'Monitor closely for deterioration.' : 'No immediate action required.'}`,
    color: m.color,
    icon: m.load > 80 ? 'down' : 'flat',
  };
};

/* ── Component ───────────────────────────────────────────── */
const DepartmentalCongestion: React.FC = () => {
  const { data } = useIntakeData();
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [includesLegacy, setIncludesLegacy] = useState(true);

  const { deptLoads, statCards, hasData } = useMemo(() => {
    const diags = data?.all_diagnostics || [];
    const workers = diags.filter((d: any) => d.type === 'worker');

    if (workers.length === 0) {
      return { deptLoads: [], statCards: [], hasData: false };
    }

    const deptMap: Record<string, {
      totalBurnout: number; totalCapGap: number; totalLegacy: number;
      totalClarity: number; totalOrgHealth: number; count: number;
    }> = {};

    workers.forEach((w: any) => {
      const dept = w.department_name || w.dept || 'General';
      const shortDept = dept.slice(0, 4).toUpperCase();
      if (!deptMap[shortDept]) deptMap[shortDept] = { totalBurnout: 0, totalCapGap: 0, totalLegacy: 0, totalClarity: 0, totalOrgHealth: 0, count: 0 };
      const p1 = w.payload?.p1 || w.p1 || {};
      deptMap[shortDept].totalBurnout   += (p1.burnout       || 2);
      deptMap[shortDept].totalCapGap    += (p1.capGap        || p1.capabilityGap || 5);
      deptMap[shortDept].totalLegacy    += (p1.legacyBurden  || 3);
      deptMap[shortDept].totalClarity   += (p1.targetClarity || 5);
      deptMap[shortDept].totalOrgHealth += (p1.orgHealth     || 5);
      deptMap[shortDept].count++;
    });

    const loads: DeptMetrics[] = Object.entries(deptMap).map(([dept, vals]) => {
      const n            = vals.count;
      const avgBurnout   = vals.totalBurnout   / n;
      const avgCapGap    = vals.totalCapGap    / n;
      const avgLegacy    = vals.totalLegacy    / n;
      const avgClarity   = vals.totalClarity   / n;
      const avgOrgHealth = vals.totalOrgHealth / n;

      // Formula: burnout(35%) + capGap(25%) + legacyBurden(25%, toggleable) + clarity-penalty(15%)
      const clarityPenalty = Math.max(0, (5 - avgClarity) * 2);
      const load = Math.round(
        50 +
        avgBurnout      * 9 +
        (avgCapGap - 5) * 4 +
        (includesLegacy ? (avgLegacy - 3) * 5 : 0) +
        clarityPenalty
      );

      const clamped = Math.min(150, Math.max(30, load));
      return {
        dept, count: n,
        load: clamped,
        color:    clamped > 100 ? '#f43f5e' : clamped > 75 ? '#fb923c' : '#38bdf8',
        critical: clamped > 100,
        avgBurnout, avgCapGap, avgLegacy, avgClarity, avgOrgHealth,
      };
    }).sort((a, b) => b.load - a.load);

    const contentionScore = loads.length > 0
      ? (loads.reduce((s, l) => s + l.load, 0) / loads.length / 10).toFixed(1)
      : '0.0';

    // Replace fake Peak Time with the highest-load dept name
    const hotDept = loads[0]?.dept ?? '—';

    const updatedStatCards = [
      { label: 'Contention Score', value: `${contentionScore} / 10`,                                        color: '#f43f5e' },
      { label: 'Hotspot Dept',     value: hotDept,                                                          color: '#fb923c' },
      { label: 'Affected Depts',   value: `${loads.length} Departments`,                                    color: '#38bdf8' },
      { label: 'Resolution',       value: parseFloat(contentionScore) > 7 ? 'Urgent Action' : 'Monitor',   color: '#34d399' },
    ];

    return { deptLoads: loads, statCards: updatedStatCards, hasData: true };
  }, [data, includesLegacy]);

  const hoveredInsight = useMemo(() => {
    if (!hoveredDept) return null;
    const m = deptLoads.find(d => d.dept === hoveredDept);
    return m ? generateDeptInsight(m, includesLegacy) : null;
  }, [hoveredDept, deptLoads, includesLegacy]);

  if (!hasData) {
    return (
      <div className="rounded-2xl p-12 text-center border border-dashed border-white/10" style={{ background: 'var(--bg-card)' }}>
        <p className="text-xs text-white/40 uppercase tracking-widest">Awaiting Departmental Data...</p>
      </div>
    );
  }

  const displayTubes = deptLoads.slice(0, 5);
  const n = displayTubes.length;
  const SVG_W = 640;
  const tubeSpacing = SVG_W / (n + 1);
  const tubeX = (i: number) => tubeSpacing * (i + 1);
  const capacityLineY = TBOT - TH * (100 / 150);
  const hasCritical = displayTubes.some(d => d.critical);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #f43f5e', boxShadow: 'var(--shadow-lg)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
            <AlertTriangle size={13} style={{ color: '#f43f5e' }} />
          </div>
          <div>
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Departmental Congestion Analysis
            </span>
            <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>— Capacity pressure map</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Legacy burden toggle */}
          <button
            onClick={() => setIncludesLegacy(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background:  includesLegacy ? 'rgba(251,146,60,0.1)'       : 'rgba(255,255,255,0.04)',
              border:      includesLegacy ? '1px solid rgba(251,146,60,0.3)' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            {/* Pill switch */}
            <div className="relative w-7 h-3.5 rounded-full transition-colors duration-200"
              style={{ background: includesLegacy ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.12)' }}>
              <motion.div
                className="absolute top-0.5 w-2.5 h-2.5 rounded-full"
                animate={{ left: includesLegacy ? 'calc(100% - 12px)' : '2px' }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: includesLegacy ? '#fb923c' : 'rgba(255,255,255,0.35)' }}
              />
            </div>
            <span className="text-[9px] font-bold whitespace-nowrap"
              style={{ fontFamily: 'var(--font-mono)', color: includesLegacy ? '#fb923c' : 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
              Legacy Burden
            </span>
          </button>
          <span className="text-[9px] font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            CROSS-DEPARTMENTAL LOAD INTENSITY
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr' }}>

        {/* ── Pressure tube canvas ── */}
        <div className="relative" style={{ background: '#040810', borderRight: '1px solid var(--border-1)' }}>
          <div className="absolute top-4 left-5 z-10 pointer-events-none">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>
              PRESSURE LOAD MAP
            </p>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
              Per-department capacity utilisation
            </p>
          </div>

          <svg viewBox={`0 0 ${SVG_W} 340`} width="100%" style={{ display: 'block' }}>
            <defs>
              {displayTubes.map((d, i) => {
                const c1 = d.load > 100 ? '#fb923c' : d.load > 75 ? '#fbbf24' : '#34d399';
                const c2 = d.load > 100 ? '#f43f5e' : d.load > 75 ? '#fb923c' : '#38bdf8';
                return (
                  <linearGradient key={i} id={`fluid-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={c1} stopOpacity="0.92" />
                    <stop offset="100%" stopColor={c2} stopOpacity="1"    />
                  </linearGradient>
                );
              })}
              {displayTubes.map((_, i) => {
                const cx = tubeX(i);
                return (
                  <clipPath key={i} id={`tubeClip-${i}`}>
                    <rect x={cx - TW / 2} y={TY} width={TW} height={TH} rx={TRX} ry={TRX} />
                  </clipPath>
                );
              })}
              <filter id="tubeGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* 100% capacity line */}
            {n > 1 && (
              <>
                <line x1={tubeX(0) - TW / 2 - 6} y1={capacityLineY} x2={tubeX(n - 1) + TW / 2 + 6} y2={capacityLineY}
                  stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="4 5" />
                <text x={tubeX(0) - TW / 2 - 10} y={capacityLineY}
                  textAnchor="end" dominantBaseline="middle" fontSize="7.5" fontFamily="var(--font-mono)" fill="rgba(255,255,255,0.28)">
                  100%
                </text>
              </>
            )}

            {/* Per-tube */}
            {displayTubes.map((d, i) => {
              const cx       = tubeX(i);
              const fillPct  = Math.min(d.load / 150, 1);
              const fy       = TBOT - TH * fillPct;
              const col      = d.load > 100 ? '#f43f5e' : d.load > 75 ? '#fb923c' : '#38bdf8';
              const bubbles  = BUBBLE_PARAMS[i] ?? BUBBLE_PARAMS[0];

              return (
                <g key={d.dept}>
                  {d.critical && (
                    <motion.rect x={cx - TW / 2 - 5} y={TY - 5} width={TW + 10} height={TH + 10} rx={TRX + 5} ry={TRX + 5}
                      fill="none"
                      animate={{ stroke: ['#f43f5e', '#fb923c', '#f43f5e'], strokeOpacity: [0.35, 0.65, 0.35], strokeWidth: [1.5, 2.5, 1.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      filter="url(#tubeGlow)"
                    />
                  )}
                  <rect x={cx - TW / 2} y={TY} width={TW} height={TH} rx={TRX} fill="#050c18" />
                  <g clipPath={`url(#tubeClip-${i})`}>
                    <motion.rect x={cx - TW / 2} width={TW}
                      initial={{ y: TBOT, height: 0 }}
                      animate={{ y: fy, height: TH * fillPct }}
                      transition={{ duration: 1.15, delay: 0.2 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                      fill={`url(#fluid-${i})`} opacity={0.82}
                    />
                    <motion.rect x={cx - TW / 2 + 3} width={6}
                      initial={{ y: TBOT, height: 0 }}
                      animate={{ y: fy + 6, height: Math.max(0, TH * fillPct - 14) }}
                      transition={{ duration: 1.15, delay: 0.2 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                      fill="rgba(255,255,255,0.08)" rx={3}
                    />
                    <motion.ellipse cx={cx} rx={TW / 2 - 3} ry={3.5}
                      fill="rgba(255,255,255,0.22)"
                      animate={{ cy: [fy + 1.5, fy - 2, fy + 3, fy - 1, fy + 1.5] }}
                      transition={{ duration: 4 + i * 0.45, repeat: Infinity, ease: 'easeInOut', delay: i * 0.28 }}
                    />
                    {d.load > 65 && bubbles.map((b, bi) => (
                      <motion.circle key={bi} cx={cx + b.xo} r={b.r}
                        fill="rgba(255,255,255,0.28)"
                        animate={{ cy: [TBOT - 4, fy + 8], opacity: [0, 0.55, 0.55, 0] }}
                        transition={{ duration: b.dur, delay: b.delay + i * 0.2, repeat: Infinity, ease: 'easeOut', times: [0, 0.18, 0.82, 1] }}
                      />
                    ))}
                  </g>
                  <rect x={cx - TW / 2} y={TY} width={TW} height={TH} rx={TRX}
                    fill="none" stroke={d.critical ? col : 'rgba(255,255,255,0.1)'} strokeWidth={d.critical ? 1.5 : 1}
                  />
                  <line x1={cx - TW / 2} y1={TBOT - TH * 0.33} x2={cx - TW / 2 - 4} y2={TBOT - TH * 0.33}
                    stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                  {d.critical && (
                    <motion.text x={cx} y={TY - 22} textAnchor="middle"
                      fontSize="7.5" fontWeight="700" fontFamily="var(--font-mono)"
                      fill="#f43f5e" letterSpacing="0.1em"
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ duration: 1.1, repeat: Infinity }}>
                      OVERFLOW
                    </motion.text>
                  )}
                  <motion.text x={cx} y={d.critical ? TY - 9 : TY - 11} textAnchor="middle"
                    fontSize="15" fontWeight="800" fontFamily="var(--font-display)" fill={col}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.14, duration: 0.4 }}>
                    {d.load}%
                  </motion.text>
                  <text x={cx} y={TBOT + 18} textAnchor="middle"
                    fontSize="10.5" fontWeight="700" fontFamily="var(--font-display)"
                    fill={d.critical ? col : 'rgba(255,255,255,0.55)'} letterSpacing="0.12em">
                    {d.dept}
                  </text>
                </g>
              );
            })}

            {hasCritical && (
              <g>
                <motion.circle cx={32} cy={317} r={4} fill="#f43f5e"
                  animate={{ opacity: [1, 0.3, 1], r: [4, 5.5, 4] }} transition={{ duration: 1.1, repeat: Infinity }} />
                <motion.circle cx={32} cy={317} r={4} fill="none" stroke="#f43f5e"
                  animate={{ r: [5, 13], opacity: [0.45, 0], strokeWidth: [1.2, 0.2] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }} />
                <text x={46} y={317} dominantBaseline="middle" fontSize="9" fontWeight="700"
                  fontFamily="var(--font-display)" fill="#f43f5e" letterSpacing="0.08em">
                  CAPACITY BREACH DETECTED
                </text>
                <text x={46} y={329} fontSize="8" fontFamily="var(--font-body)" fill="rgba(255,255,255,0.25)">
                  One or more departments operating above sustainable threshold.
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* ── Stats + insight panel ── */}
        <div className="flex flex-col" style={{ background: 'var(--bg-card)' }}>
          <div className="p-5 space-y-4 flex-1">

            {/* Department load bars */}
            <div>
              <p className="text-[9px] font-bold tracking-[0.16em] mb-3.5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                DEPARTMENT LOAD INDEX
              </p>
              <div className="space-y-2.5">
                {deptLoads.map((d, i) => (
                  <motion.div key={d.dept}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.09, duration: 0.4 }}
                    onMouseEnter={() => setHoveredDept(d.dept)}
                    onMouseLeave={() => setHoveredDept(null)}
                    className="cursor-default"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold tracking-wide transition-colors duration-150"
                          style={{
                            fontFamily: 'var(--font-display)',
                            color: hoveredDept === d.dept ? d.color : d.critical ? d.color : 'var(--text-secondary)',
                            textDecoration: hoveredDept === d.dept ? 'underline' : 'none',
                            textUnderlineOffset: '3px',
                          }}
                        >
                          {d.dept}
                        </span>
                        {d.critical && (
                          <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', fontFamily: 'var(--font-mono)', border: '1px solid rgba(244,63,94,0.2)' }}>
                            OVER CAPACITY
                          </span>
                        )}
                      </div>
                      <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: d.color }}>
                        {d.load}%
                      </span>
                    </div>
                    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.load / 150) * 100}%` }}
                        transition={{ duration: 1.0, delay: 0.25 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background: d.critical
                            ? 'linear-gradient(90deg, #f43f5e 0%, #fb923c 100%)'
                            : 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)',
                          boxShadow: d.critical ? '0 0 8px rgba(244,63,94,0.4)' : '0 0 6px rgba(56,189,248,0.25)',
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border-1)' }} />

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[8px] uppercase tracking-wider mb-1"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {s.label}
                  </p>
                  <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: s.color }}>
                    {s.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Hover insight panel ── */}
          <div style={{ borderTop: '1px solid var(--border-1)', minHeight: 0 }}>
            <AnimatePresence mode="wait">
              {hoveredInsight ? (
                <motion.div
                  key={hoveredDept ?? 'insight'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4"
                  style={{ borderLeft: `3px solid ${hoveredInsight.color}` }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    {hoveredInsight.icon === 'up'   && <TrendingUp  size={10} style={{ color: hoveredInsight.color, flexShrink: 0 }} />}
                    {hoveredInsight.icon === 'down'  && <TrendingDown size={10} style={{ color: hoveredInsight.color, flexShrink: 0 }} />}
                    {hoveredInsight.icon === 'flat'  && <Minus        size={10} style={{ color: hoveredInsight.color, flexShrink: 0 }} />}
                    <span className="text-[11px] font-bold leading-tight"
                      style={{ fontFamily: 'var(--font-display)', color: hoveredInsight.color }}>
                      {hoveredInsight.headline}
                    </span>
                  </div>
                  <p className="text-[9.5px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.5)' }}>
                    {hoveredInsight.body}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3 flex items-center gap-1.5"
                >
                  <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.18)' }}>
                    hover a department for insight
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentalCongestion;

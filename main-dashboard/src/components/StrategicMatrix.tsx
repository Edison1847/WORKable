import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────── */
interface Bubble {
  id: string;
  lines: string[];
  dept: string;
  value: string;
  confidence: string;
  detail: string;
  quad: 'qw' | 'si' | 'em' | 'dp';
  cx: number; cy: number; r: number;
  color: string; glow: string; fillA: string; fillB: string;
  trend: 'up' | 'down' | 'flat';
}

const BUBBLES: Bubble[] = [
  /* Quick Wins — top-left */
  {
    id: 'qw1', lines: ['Eliminate', 'Low-Value Work'], dept: 'Finance', value: '$148k', confidence: '82%',
    detail: 'Immediately eliminate low-ROI activities consuming 22% of Finance capacity.',
    quad: 'qw', cx: 182, cy: 168, r: 54,
    color: '#34d399', glow: 'rgba(52,211,153,0.5)', fillA: '#1a4a3a', fillB: '#0d2e24',
    trend: 'up',
  },
  {
    id: 'qw2', lines: ['Re-scope', 'Targets'], dept: 'Sales', value: '$85k', confidence: '78%',
    detail: 'Realign Sales targets to achievable benchmarks — reduces friction fatigue.',
    quad: 'qw', cx: 352, cy: 118, r: 37,
    color: '#34d399', glow: 'rgba(52,211,153,0.4)', fillA: '#173d30', fillB: '#0c2620',
    trend: 'up',
  },
  /* Strategic Investment — top-right */
  {
    id: 'si1', lines: ['Human Capital', 'Redeployment'], dept: 'People', value: '$210k', confidence: '74%',
    detail: 'Strategic reallocation of top talent to highest-value functions. Long-term compounding ROI.',
    quad: 'si', cx: 800, cy: 172, r: 60,
    color: '#fb923c', glow: 'rgba(251,146,60,0.5)', fillA: '#4a2e12', fillB: '#2e1c0a',
    trend: 'up',
  },
  {
    id: 'si2', lines: ['Finance Workflow', 'Redesign'], dept: 'Operations', value: '$120k', confidence: '71%',
    detail: 'End-to-end redesign of approval chains. High upfront cost, strong 18-mo payback.',
    quad: 'si', cx: 610, cy: 122, r: 42,
    color: '#fb923c', glow: 'rgba(251,146,60,0.4)', fillA: '#3d2510', fillB: '#261709',
    trend: 'flat',
  },
  /* Easy Maintenance — bottom-left */
  {
    id: 'em1', lines: ['Monitor', 'Signals'], dept: 'All Teams', value: '$42k', confidence: '88%',
    detail: 'Keep existing monitoring cadence. Minimal effort, stable baseline value.',
    quad: 'em', cx: 175, cy: 370, r: 28,
    color: '#38bdf8', glow: 'rgba(56,189,248,0.4)', fillA: '#0c2e42', fillB: '#071c2a',
    trend: 'flat',
  },
  {
    id: 'em2', lines: ['Clarify', 'Goals'], dept: 'Management', value: '$64k', confidence: '84%',
    detail: 'Structured goal-clarity sessions. Low cost, removes ambiguity driving shadow work.',
    quad: 'em', cx: 330, cy: 342, r: 36,
    color: '#38bdf8', glow: 'rgba(56,189,248,0.4)', fillA: '#0e3248', fillB: '#08202e',
    trend: 'up',
  },
  /* Deprioritise — bottom-right */
  {
    id: 'dp1', lines: ['Automate', 'Process'], dept: 'Engineering', value: '$64k', confidence: '58%',
    detail: 'Automation initiative with high complexity. Low confidence at this stage — revisit Q3.',
    quad: 'dp', cx: 618, cy: 358, r: 36,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', fillA: '#1e2836', fillB: '#131a24',
    trend: 'down',
  },
  {
    id: 'dp2', lines: ['Secondary', 'Redesigns'], dept: 'Engineering', value: '$30k', confidence: '52%',
    detail: 'Non-critical design changes with unclear ROI. Defer until bandwidth allows.',
    quad: 'dp', cx: 772, cy: 338, r: 27,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.25)', fillA: '#1a2232', fillB: '#10172a',
    trend: 'down',
  },
];

const QUADS = {
  qw: { label: 'Quick Wins',           color: '#34d399', fill: 'rgba(52,211,153,0.025)' },
  si: { label: 'Strategic Investment', color: '#fb923c', fill: 'rgba(251,146,60,0.025)' },
  em: { label: 'Easy Maintenance',     color: '#38bdf8', fill: 'rgba(56,189,248,0.025)' },
  dp: { label: 'Deprioritise',         color: '#f43f5e', fill: 'rgba(244,63,94,0.025)' },
};

/* Computed per-quadrant totals */
const QUAD_TOTALS = (['qw', 'si', 'em', 'dp'] as const).reduce((acc, q) => {
  const bs = BUBBLES.filter(b => b.quad === q);
  const total = bs.reduce((s, b) => s + parseInt(b.value.replace(/[$k]/g, '')), 0);
  acc[q] = { count: bs.length, total: `$${total}k` };
  return acc;
}, {} as Record<string, { count: number; total: string }>);

/* Each bubble floats at its own rhythm — unique dx, dy, duration, and start phase */
const FLOAT: Record<string, { dx: number; dy: number; dur: number; phase: number }> = {
  qw1: { dx: 4, dy: 6, dur: 9.6, phase: 0.0 },
  qw2: { dx: -3, dy: 5, dur: 8.4, phase: 1.1 },
  si1: { dx: 5, dy: 7, dur: 11.2, phase: 0.5 },
  si2: { dx: -4, dy: 5, dur: 9.0, phase: 1.8 },
  em1: { dx: 3, dy: 4, dur: 7.8, phase: 0.7 },
  em2: { dx: -2, dy: 5, dur: 9.4, phase: 2.2 },
  dp1: { dx: 3, dy: 4, dur: 8.6, phase: 1.4 },
  dp2: { dx: -3, dy: 3, dur: 7.4, phase: 0.3 },
};

/* Pulse ring — staggered start so they fire at different times */
const PULSE_DELAY: Record<string, number> = {
  qw1: 1.0, qw2: 2.4, si1: 0.4, si2: 3.1,
  em1: 1.7, em2: 0.8, dp1: 2.0, dp2: 3.5,
};

/* ─── Layout constants ───────────────────────────────────── */
const VB_W = 960, VB_H = 490;
const PAD  = { l: 72, r: 40, t: 52, b: 50 };
const CW   = VB_W - PAD.l - PAD.r;
const CH   = VB_H - PAD.t - PAD.b;
const MX   = PAD.l + CW / 2;
const MY   = PAD.t + CH / 2;

/* ─── Ambient particles — deterministic positions ──────── */
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: PAD.l + 12 + ((i * 61 + 17) % (CW - 24)),
  y: PAD.t + 12 + ((i * 43 + 7)  % (CH - 24)),
  dist: 70  + ((i * 37) % 120),
  dur:  10  + ((i * 3)  % 10),
  delay: (i * 1.37) % 9,
  blue: i % 3 === 0,   // some are blue-tinted, rest neutral
}));

/* ─── Trend arrow helper ─────────────────────────────────── */
const TrendArrow: React.FC<{ cx: number; cy: number; r: number; trend: 'up' | 'down' | 'flat' }> = ({ cx, cy, r, trend }) => {
  const ax = cx + r * 0.66;
  const ay = cy - r * 0.64;
  const s = 4.5;
  if (trend === 'up') return (
    <g opacity="0.82">
      <circle cx={ax} cy={ay} r="6.5" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.22)" strokeWidth="0.6" />
      <path d={`M${ax - s},${ay + s * 0.7} L${ax},${ay - s * 0.9} L${ax + s},${ay + s * 0.7}`}
        fill="none" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  if (trend === 'down') return (
    <g opacity="0.82">
      <circle cx={ax} cy={ay} r="6.5" fill="rgba(244,63,94,0.12)" stroke="rgba(244,63,94,0.22)" strokeWidth="0.6" />
      <path d={`M${ax - s},${ay - s * 0.7} L${ax},${ay + s * 0.9} L${ax + s},${ay - s * 0.7}`}
        fill="none" stroke="#f43f5e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  return (
    <g opacity="0.65">
      <circle cx={ax} cy={ay} r="6.5" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.18)" strokeWidth="0.6" />
      <line x1={ax - s} y1={ay} x2={ax + s} y2={ay} stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx={ax - s * 0.5} cy={ay} r="0.8" fill="#94a3b8" />
      <circle cx={ax + s * 0.5} cy={ay} r="0.8" fill="#94a3b8" />
    </g>
  );
};

/* ─── Component ─────────────────────────────────────────── */
const StrategicMatrix: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const hovB = BUBBLES.find(b => b.id === hovered) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-lg)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <LayoutGrid size={13} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Strategic ROI Matrix
            </span>
            <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>— Interactive opportunity map</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {(['qw','si','em','dp'] as const).map(q => (
            <div key={q} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: QUADS[q].color, boxShadow: `0 0 4px ${QUADS[q].color}` }} />
              <span className="text-[9px] font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                {QUADS[q].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SVG Canvas ── */}
      <div className="relative" style={{ background: '#060a14' }}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" style={{ display: 'block' }}>
          <defs>
            {/* Radial gradients per bubble */}
            {BUBBLES.map(b => (
              <radialGradient key={`g-${b.id}`} id={`g-${b.id}`} cx="40%" cy="35%" r="65%">
                <stop offset="0%"   stopColor={b.fillA} />
                <stop offset="100%" stopColor={b.fillB} />
              </radialGradient>
            ))}

            {/* Scan line gradient — fades top & bottom */}
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(56,189,248,0)" />
              <stop offset="25%"  stopColor="rgba(56,189,248,0.25)" />
              <stop offset="50%"  stopColor="rgba(56,189,248,0.45)" />
              <stop offset="75%"  stopColor="rgba(56,189,248,0.25)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0)" />
            </linearGradient>
            <linearGradient id="scanTrailGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(56,189,248,0)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.06)" />
            </linearGradient>

            {/* Glow filters */}
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="bubbleGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="centerGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Clip to chart area */}
            <clipPath id="chartClip">
              <rect x={PAD.l} y={PAD.t} width={CW} height={CH} />
            </clipPath>
          </defs>

          {/* ── Quadrant fills ── */}
          <rect x={PAD.l} y={PAD.t}  width={CW/2} height={CH/2} fill={QUADS.qw.fill} />
          <rect x={MX}    y={PAD.t}  width={CW/2} height={CH/2} fill={QUADS.si.fill} />
          <rect x={PAD.l} y={MY}     width={CW/2} height={CH/2} fill={QUADS.em.fill} />
          <rect x={MX}    y={MY}     width={CW/2} height={CH/2} fill={QUADS.dp.fill} />

          {/* ── Dot grid ── */}
          <g clipPath="url(#chartClip)" opacity="0.3">
            {Array.from({ length: Math.floor(CW / 32) }, (_, xi) =>
              Array.from({ length: Math.floor(CH / 32) }, (_, yi) => (
                <circle key={`d${xi}-${yi}`}
                  cx={PAD.l + 16 + xi * 32} cy={PAD.t + 16 + yi * 32}
                  r="1" fill="rgba(255,255,255,0.09)" />
              ))
            )}
          </g>

          {/* ══ AMBIENT PARTICLE DRIFT — tiny dots floating upward ══ */}
          <g clipPath="url(#chartClip)">
            {PARTICLES.map(p => (
              <motion.circle
                key={`p-${p.id}`}
                cx={p.x}
                r={0.8}
                fill={p.blue ? 'rgba(56,189,248,0.7)' : 'rgba(255,255,255,0.6)'}
                animate={{
                  cy: [p.y, p.y - p.dist],
                  opacity: [0, 0.055, 0.055, 0],
                }}
                transition={{
                  duration: p.dur,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'linear',
                  times: [0, 0.12, 0.85, 1],
                }}
              />
            ))}
          </g>

          {/* ── Chart border ── */}
          <rect x={PAD.l} y={PAD.t} width={CW} height={CH}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* ══ DIVIDER LINES — clearly visible ══ */}
          {/* Soft glow halos */}
          <line x1={MX}    y1={PAD.t}    x2={MX}         y2={PAD.t+CH} stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
          <line x1={PAD.l} y1={MY}       x2={PAD.l+CW}   y2={MY}       stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
          {/* Main visible lines */}
          <line x1={MX}    y1={PAD.t}    x2={MX}         y2={PAD.t+CH}
            stroke="rgba(255,255,255,0.28)" strokeWidth="1" filter="url(#lineGlow)" />
          <line x1={PAD.l} y1={MY}       x2={PAD.l+CW}   y2={MY}
            stroke="rgba(255,255,255,0.28)" strokeWidth="1" filter="url(#lineGlow)" />
          {/* Tick marks along axes */}
          {[0.25, 0.5, 0.75].map(t => (
            <g key={t}>
              <line x1={PAD.l + CW * t} y1={MY - 4} x2={PAD.l + CW * t} y2={MY + 4}
                stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1={MX - 4} y1={PAD.t + CH * t} x2={MX + 4} y2={PAD.t + CH * t}
                stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </g>
          ))}

          {/* ── Intersection centre marker ── */}
          <motion.circle cx={MX} cy={MY} r={12}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            animate={{ r: [12, 18, 12], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            filter="url(#centerGlow)" />
          <circle cx={MX} cy={MY} r="5" fill="#0b1220" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
          <circle cx={MX} cy={MY} r="2" fill="rgba(255,255,255,0.55)" />

          {/* ══ RADAR SCAN LINE — sweeps left → right continuously ══ */}
          <g clipPath="url(#chartClip)">
            {/* Trailing wash */}
            <motion.rect
              y={PAD.t} height={CH} width={60}
              fill="url(#scanTrailGrad)"
              animate={{ x: [PAD.l - 60, PAD.l + CW + 60] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
            />
            {/* Leading edge */}
            <motion.line
              y1={PAD.t} y2={PAD.t + CH}
              stroke="url(#scanGrad)" strokeWidth="1.5"
              animate={{ x1: [PAD.l, PAD.l + CW + 2], x2: [PAD.l, PAD.l + CW + 2] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
            />
          </g>

          {/* ── Axis arrows & labels ── */}
          <defs>
            <marker id="arrowR" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto">
              <path d="M0,1 L7,3.5 L0,6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </marker>
            <marker id="arrowU" markerWidth="7" markerHeight="7" refX="3.5" refY="0" orient="auto">
              <path d="M1,7 L3.5,0 L6,7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </marker>
          </defs>
          <line x1={PAD.l} y1={PAD.t+CH+22} x2={PAD.l+CW} y2={PAD.t+CH+22}
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" markerEnd="url(#arrowR)" />
          <line x1={PAD.l-22} y1={PAD.t+CH} x2={PAD.l-22} y2={PAD.t}
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" markerEnd="url(#arrowU)" />
          <text x={PAD.l+CW/2} y={VB_H-5} textAnchor="middle" fontSize="9"
            fontFamily="var(--font-display)" fontWeight="700" fill="rgba(255,255,255,0.22)" letterSpacing="0.12em">
            IMPLEMENTATION COST (LOW → HIGH)
          </text>
          <text x={22} y={PAD.t+CH/2} textAnchor="middle" fontSize="9"
            fontFamily="var(--font-display)" fontWeight="700" fill="rgba(255,255,255,0.22)" letterSpacing="0.12em"
            transform={`rotate(-90,22,${PAD.t+CH/2})`}>
            VALUE / ROI (HIGH → LOW)
          </text>

          {/* ── Quadrant corner labels ── */}
          <text x={PAD.l+14} y={PAD.t+20} fontSize="9.5" fontFamily="var(--font-display)" fontWeight="700"
            fill={QUADS.qw.color} opacity="0.75" letterSpacing="0.1em">QUICK WINS</text>
          <text x={VB_W-PAD.r-14} y={PAD.t+20} fontSize="9.5" fontFamily="var(--font-display)" fontWeight="700"
            fill={QUADS.si.color} opacity="0.75" textAnchor="end" letterSpacing="0.1em">STRATEGIC INVESTMENT</text>
          <text x={PAD.l+14} y={PAD.t+CH-10} fontSize="9.5" fontFamily="var(--font-display)" fontWeight="700"
            fill={QUADS.em.color} opacity="0.75" letterSpacing="0.1em">EASY MAINTENANCE</text>
          <text x={VB_W-PAD.r-14} y={PAD.t+CH-10} fontSize="9.5" fontFamily="var(--font-display)" fontWeight="700"
            fill={QUADS.dp.color} opacity="0.75" textAnchor="end" letterSpacing="0.1em">DEPRIORITISE</text>

          {/* ══ QUADRANT ROI TOTALS — below each label ══ */}
          <text x={PAD.l+14} y={PAD.t+34} fontSize="8" fontFamily="var(--font-mono)"
            fill={QUADS.qw.color} opacity="0.45" letterSpacing="0.04em">
            {QUAD_TOTALS.qw.count} actions · {QUAD_TOTALS.qw.total}
          </text>
          <text x={VB_W-PAD.r-14} y={PAD.t+34} fontSize="8" fontFamily="var(--font-mono)"
            fill={QUADS.si.color} opacity="0.45" textAnchor="end" letterSpacing="0.04em">
            {QUAD_TOTALS.si.count} actions · {QUAD_TOTALS.si.total}
          </text>
          <text x={PAD.l+14} y={PAD.t+CH-24} fontSize="8" fontFamily="var(--font-mono)"
            fill={QUADS.em.color} opacity="0.45" letterSpacing="0.04em">
            {QUAD_TOTALS.em.count} actions · {QUAD_TOTALS.em.total}
          </text>
          <text x={VB_W-PAD.r-14} y={PAD.t+CH-24} fontSize="8" fontFamily="var(--font-mono)"
            fill={QUADS.dp.color} opacity="0.45" textAnchor="end" letterSpacing="0.04em">
            {QUAD_TOTALS.dp.count} actions · {QUAD_TOTALS.dp.total}
          </text>

          {/* ══ BUBBLES ══ */}
          {BUBBLES.map((b, i) => {
            const isHov = hovered === b.id;
            const flt = FLOAT[b.id];

            return (
              /* Layer 1: Entrance — scales in from 0 once */
              <motion.g key={b.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.55, delay: 0.12 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${b.cx}px ${b.cy}px` }}
              >
                {/* Layer 2: Float loop — gentle multi-directional drift */}
                <motion.g
                  animate={{ 
                    x: [0, flt.dx, -flt.dx * 0.5, flt.dx * 0.2, 0],
                    y: [0, -flt.dy, flt.dy * 0.4, -flt.dy * 0.2, 0] 
                  }}
                  transition={{ 
                    duration: flt.dur, 
                    repeat: Infinity, 
                    ease: 'easeInOut', 
                    delay: flt.phase, 
                    times: [0, 0.3, 0.55, 0.8, 1] 
                  }}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(b.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Ambient glow fill (blurred, behind everything) */}
                  <motion.circle cx={b.cx} cy={b.cy}
                    fill={b.color}
                    animate={{ r: isHov ? b.r + 18 : b.r + 10, opacity: isHov ? 0.14 : 0.07 }}
                    transition={{ duration: 0.3 }}
                    filter="url(#bubbleGlow)"
                  />

                  {/* Pulsing ring — periodic emanation */}
                  <motion.circle cx={b.cx} cy={b.cy}
                    fill="none" stroke={b.color}
                    animate={{ r: [b.r + 2, b.r + 26], opacity: [0.55, 0], strokeWidth: [1.2, 0.2] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.8, ease: 'easeOut', delay: PULSE_DELAY[b.id] }}
                  />

                  {/* Hover ring */}
                  <motion.circle cx={b.cx} cy={b.cy}
                    fill="none" stroke={b.color}
                    animate={{ r: isHov ? b.r + 12 : b.r + 6, opacity: isHov ? 0.5 : 0.14, strokeWidth: isHov ? 1.2 : 0.8 }}
                    transition={{ duration: 0.25 }}
                  />

                  {/* Main bubble body */}
                  <motion.circle cx={b.cx} cy={b.cy}
                    fill={`url(#g-${b.id})`} stroke={b.color}
                    animate={{ r: isHov ? b.r * 1.05 : b.r, strokeWidth: isHov ? 1.5 : 0.9, strokeOpacity: isHov ? 0.85 : 0.5 }}
                    transition={{ duration: 0.25 }}
                  />

                  {/* Inner highlight arc */}
                  <clipPath id={`clip-${b.id}`}>
                    <circle cx={b.cx} cy={b.cy} r={b.r} />
                  </clipPath>
                  <circle cx={b.cx - b.r * 0.18} cy={b.cy - b.r * 0.26} r={b.r * 0.52}
                    fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"
                    clipPath={`url(#clip-${b.id})`} />

                  {/* Label text lines */}
                  {b.lines.map((line, li) => (
                    <text key={li}
                      x={b.cx}
                      y={b.cy - (b.lines.length - 1) * 6.5 + li * 13}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={b.r > 44 ? 10 : b.r > 30 ? 9 : 8}
                      fontFamily="var(--font-display)" fontWeight="600"
                      fill="rgba(255,255,255,0.9)" letterSpacing="0.04em"
                    >{line}</text>
                  ))}

                  {/* Value (monospaced, colour-matched) */}
                  <text x={b.cx} y={b.cy + b.lines.length * 6.5 + 3}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={b.r > 44 ? 11 : 9} fontFamily="var(--font-mono)" fontWeight="400"
                    fill={b.color} opacity="0.9"
                  >{b.value}</text>

                  {/* Dept label below small bubbles */}
                  {b.r < 32 && (
                    <text x={b.cx} y={b.cy + b.r + 14}
                      textAnchor="middle" fontSize="7.5"
                      fontFamily="var(--font-display)" fontWeight="600"
                      fill="rgba(255,255,255,0.28)" letterSpacing="0.07em"
                    >{b.dept.toUpperCase()}</text>
                  )}

                  {/* ── Trend arrow (top-right of bubble) ── */}
                  <TrendArrow cx={b.cx} cy={b.cy} r={b.r} trend={b.trend} />
                </motion.g>
              </motion.g>
            );
          })}

          {/* Size footnote */}
          <text x={VB_W-PAD.r} y={PAD.t-13} textAnchor="end" fontSize="8.5"
            fontFamily="var(--font-body)" fill="rgba(255,255,255,0.15)" letterSpacing="0.04em">
            Size reflects financial impact &amp; confidence
          </text>
        </svg>

        {/* ── Hover tooltip panel ── */}
        <AnimatePresence>
          {hovB && (
            <motion.div
              key={hovB.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 rounded-xl pointer-events-none"
              style={{
                background: 'rgba(6,10,20,0.96)',
                border: `1px solid ${hovB.color}44`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px ${hovB.color}18`,
                backdropFilter: 'blur(24px)',
                minWidth: 360, maxWidth: 540,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: hovB.color, boxShadow: `0 0 10px ${hovB.color}` }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {hovB.lines.join(' ')}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hovB.dept}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      background: hovB.trend === 'up' ? 'rgba(52,211,153,0.12)' : hovB.trend === 'down' ? 'rgba(244,63,94,0.12)' : 'rgba(148,163,184,0.1)',
                      color: hovB.trend === 'up' ? '#34d399' : hovB.trend === 'down' ? '#f43f5e' : '#94a3b8',
                    }}>
                    {hovB.trend === 'up' ? '↑ Improving' : hovB.trend === 'down' ? '↓ Declining' : '→ Stable'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{hovB.detail}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-center">
                  <p className="data-md" style={{ color: hovB.color }}>{hovB.value}</p>
                  <p className="eyebrow mt-0.5">Recoverable</p>
                </div>
                <div className="text-center">
                  <p className="data-md text-white">{hovB.confidence}</p>
                  <p className="eyebrow mt-0.5">Confidence</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid var(--border-1)', background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-5">
          {(['qw','si','em','dp'] as const).map(q => (
            <div key={q} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full"
                style={{ background: QUADS[q].color, boxShadow: `0 0 5px ${QUADS[q].color}66` }} />
              <span className="text-[10px] font-semibold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                {QUADS[q].label}
              </span>
              <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {QUAD_TOTALS[q].total}
              </span>
            </div>
          ))}
        </div>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          8 actions · $763k total recoverable
        </span>
      </div>
    </motion.div>
  );
};

export default StrategicMatrix;

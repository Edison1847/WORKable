import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Users, Zap, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────── */
interface Process {
  id: number;
  name: string;
  dept: string;
  hsi: number;
  revenue: string;
  revenueRaw: number;   // for sorting/styling
  people: number;
  friction: number;
  steps: string[];
  trend: 'up' | 'down' | 'flat';
  trendDelta: string;
  insight: string;
}

const PROCESSES: Process[] = [
  {
    id: 1, name: 'Enterprise Sales Cycle', dept: 'Sales', hsi: 91,
    revenue: '$4.2M', revenueRaw: 4.2,
    people: 12, friction: 1,
    steps: ['Prospect', 'Qualify', 'Propose', 'Negotiate', 'Close'],
    trend: 'up', trendDelta: '+3.2',
    insight: 'Highest-performing process. Seamless CRM integration drives consistency.',
  },
  {
    id: 2, name: 'Customer Onboarding Flow', dept: 'Operations', hsi: 84,
    revenue: '$2.8M', revenueRaw: 2.8,
    people: 9, friction: 2,
    steps: ['Intake', 'Verify', 'Configure', 'Train', 'Launch'],
    trend: 'up', trendDelta: '+1.8',
    insight: 'Strong performance. Minor delays at Verify step reducing score by ~4pts.',
  },
  {
    id: 3, name: 'Product Release Pipeline', dept: 'Engineering', hsi: 73,
    revenue: '$3.1M', revenueRaw: 3.1,
    people: 14, friction: 3,
    steps: ['Design', 'Build', 'Test', 'Review', 'Deploy'],
    trend: 'flat', trendDelta: '−0.4',
    insight: 'Bottleneck at Review gate adds avg 2.3 days. Process redesign recommended.',
  },
];

const hsiColor = (hsi: number) =>
  hsi >= 85 ? '#34d399' : hsi >= 70 ? '#38bdf8' : hsi >= 58 ? '#fb923c' : '#f43f5e';

const hsiLabel = (hsi: number) =>
  hsi >= 85 ? 'Excellent' : hsi >= 70 ? 'Good' : hsi >= 58 ? 'At Risk' : 'Critical';

/* ─── Mini chain SVG ────────────────────────────────────── */
const MiniChain: React.FC<{ steps: string[]; color: string; active: boolean }> = ({ steps, color, active }) => {
  const W = 480, H = 52, NODE_R = 9;
  const spacing = (W - NODE_R * 2) / (steps.length - 1);
  const nodes = steps.map((s, i) => ({ x: NODE_R + i * spacing, label: s }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <filter id={`cpGlow-${color.replace('#','')}`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* ── Connection lines ── */}
      {nodes.slice(0, -1).map((n, i) => {
        const nx = nodes[i + 1].x;
        return (
          <g key={i}>
            {/* Base ghost */}
            <line x1={n.x + NODE_R} y1={18} x2={nx - NODE_R} y2={18}
              stroke={color} strokeWidth="1" opacity="0.1" />
            {/* Animated dashes */}
            <motion.line
              x1={n.x + NODE_R} y1={18} x2={nx - NODE_R} y2={18}
              stroke={color} strokeWidth="1.2" opacity={active ? 0.55 : 0.25}
              strokeDasharray="5 4"
              animate={{ strokeDashoffset: [0, -18] }}
              transition={{ duration: 1.1 + i * 0.05, repeat: Infinity, ease: 'linear' }}
            />
          </g>
        );
      })}

      {/* ── Animated particle ── */}
      <motion.circle
        r={3}
        fill={color}
        filter={`url(#cpGlow-${color.replace('#','')})`}
        animate={{
          cx: nodes.map(n => n.x),
          cy: nodes.map(() => 18),
          opacity: [0, 0.9, 0.9, 0.9, 0.9, 0],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 0.8,
          times: [0, 0.08, 0.35, 0.62, 0.9, 1],
        }}
      />

      {/* ── Nodes ── */}
      {nodes.map((n, i) => {
        const isFirst = i === 0;
        const isLast  = i === nodes.length - 1;
        const nodeColor = isFirst ? color : isLast ? color + '55' : 'rgba(255,255,255,0.06)';
        const strokeC   = isFirst ? color : isLast ? color : color + '44';
        const strokeW   = isFirst || isLast ? 1.5 : 0.8;
        const strokeOp  = isFirst ? 0.85 : isLast ? 0.55 : 0.3;

        return (
          <g key={i}>
            {/* Glow behind first/last */}
            {(isFirst || isLast) && (
              <circle cx={n.x} cy={18} r={NODE_R + 6}
                fill={color} opacity="0.05" />
            )}
            {/* Node circle */}
            <motion.circle cx={n.x} cy={18} r={NODE_R}
              fill={nodeColor}
              stroke={strokeC}
              strokeWidth={strokeW}
              strokeOpacity={strokeOp}
              animate={isFirst ? {
                strokeOpacity: [0.7, 1, 0.7],
                r: [NODE_R, NODE_R + 1, NODE_R],
              } : {}}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Step number inside */}
            <text x={n.x} y={18} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontFamily="var(--font-mono)" fontWeight="600"
              fill={isFirst ? 'white' : isLast ? color : 'rgba(255,255,255,0.4)'}>
              {i + 1}
            </text>
            {/* Label below */}
            <text x={n.x} y={38} textAnchor="middle"
              fontSize="7.5" fontFamily="var(--font-display)" fontWeight="600"
              fill={isFirst ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.22)'}
              letterSpacing="0.04em">
              {n.label.length > 8 ? n.label.slice(0, 8) + '…' : n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Component ─────────────────────────────────────────── */
const TopProcesses: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-1)',
        borderLeft: '2px solid #38bdf8',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <GitBranch size={13} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Top 3 Processes
            </span>
            <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>— Top 3 ranked by Human System Index</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#34d399', boxShadow: '0 0 5px #34d399' }} />
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>Excellent ≥85</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#38bdf8' }} />
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>Good 70–84</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#fb923c' }} />
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>At Risk 58–69</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f43f5e' }} />
            <span className="text-[9px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>Critical &lt;58</span>
          </div>
        </div>
      </div>

      {/* ── Process list ── */}
      <div className="px-6 py-5">
        <div className="relative">

          {/* ── Animated spine ── */}
          <motion.div
            className="absolute"
            style={{
              left: 27, top: 28, bottom: 28, width: 1.5,
              background: 'repeating-linear-gradient(to bottom, rgba(56,189,248,0.28) 0px, rgba(56,189,248,0.28) 5px, transparent 5px, transparent 12px)',
              backgroundSize: '100% 17px',
            }}
            animate={{ backgroundPositionY: [0, 17] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />

          {/* ── Process rows ── */}
          <div className="space-y-3.5">
            {PROCESSES.map((p, i) => {
              const color  = hsiColor(p.hsi);
              const isOpen = expanded === p.id;
              const TrendIcon = p.trend === 'up' ? TrendingUp : p.trend === 'down' ? TrendingDown : Minus;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4"
                >
                  {/* ── Rank + HSI Badge ── */}
                  <div className="shrink-0 relative z-10 flex flex-col items-center justify-center"
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: `radial-gradient(circle at 38% 32%, ${color}1a, #080c14 70%)`,
                      border: `1.5px solid ${color}55`,
                      boxShadow: `0 0 18px ${color}22`,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: color, opacity: 0.65, lineHeight: 1 }}>
                      {String(p.id).padStart(2, '0')}
                    </span>
                    <motion.span
                      style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color, lineHeight: 1.1 }}
                      animate={{ opacity: [0.85, 1, 0.85] }}
                      transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    >
                      {p.hsi}
                    </motion.span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 6.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                      HSI
                    </span>
                  </div>

                  {/* ── Process card ── */}
                  <motion.div
                    className="flex-1 rounded-2xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${color}06 0%, transparent 60%)`,
                      border: `1px solid ${color}20`,
                      borderLeft: `2px solid ${color}55`,
                      cursor: 'pointer',
                    }}
                    whileHover={{ borderColor: color + '44', boxShadow: `0 0 20px ${color}0d` }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                  >
                    {/* Card header row */}
                    <div className="flex items-start justify-between px-4 pt-3.5 pb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[13px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            {p.name}
                          </span>
                          <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              background: `${color}14`,
                              color: color,
                              border: `1px solid ${color}28`,
                            }}>
                            {hsiLabel(p.hsi)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.dept}</span>
                          <span style={{ color: 'var(--border-1)' }}>·</span>
                          <div className="flex items-center gap-1">
                            <Users size={9} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.people} people</span>
                          </div>
                          <span style={{ color: 'var(--border-1)' }}>·</span>
                          <div className="flex items-center gap-1">
                            <Zap size={9} style={{ color: p.friction >= 4 ? '#f43f5e' : p.friction >= 2 ? '#fb923c' : '#34d399' }} />
                            <span className="text-[10px]"
                              style={{ color: p.friction >= 4 ? '#f43f5e' : p.friction >= 2 ? '#fb923c' : '#34d399' }}>
                              {p.friction} friction pt{p.friction !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue + trend */}
                      <div className="flex items-start gap-3 shrink-0 ml-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-[11px] font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                              {p.revenue}
                            </span>
                            <span className="text-[8px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                              /yr
                            </span>
                          </div>
                          <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Revenue</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1"
                            style={{ color: p.trend === 'up' ? '#34d399' : p.trend === 'down' ? '#f43f5e' : '#94a3b8' }}>
                            <TrendIcon size={10} />
                            <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)' }}>{p.trendDelta}</span>
                          </div>
                          <span className="text-[7.5px]" style={{ color: 'var(--text-muted)' }}>vs last qtr</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                          <ChevronDown size={13} />
                        </motion.div>
                      </div>
                    </div>

                    {/* Mini workflow chain */}
                    <div className="px-4 pb-1">
                      <MiniChain steps={p.steps} color={color} active={isOpen} />
                    </div>

                    {/* HSI progress bar */}
                    <div className="px-4 pb-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] tracking-wider uppercase"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                          HSI Score
                        </span>
                        <span className="text-[8px]" style={{ fontFamily: 'var(--font-mono)', color }}>
                          {p.hsi} / 100
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${p.hsi}%` }}
                          transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            background: `linear-gradient(90deg, ${color}55, ${color})`,
                            boxShadow: `0 0 8px ${color}55`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ── Expanded insight ── */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden', borderTop: `1px solid ${color}18` }}
                        >
                          <div className="px-4 py-3 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {p.insight}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid var(--border-1)', background: 'rgba(0,0,0,0.15)' }}>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          3 processes · 35 people · avg HSI{' '}
          <span style={{ color: hsiColor(Math.round(PROCESSES.reduce((s, p) => s + p.hsi, 0) / PROCESSES.length)) }}>
            {Math.round(PROCESSES.reduce((s, p) => s + p.hsi, 0) / PROCESSES.length)}
          </span>
        </span>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Total revenue:{' '}
          <span className="text-white">
            ${PROCESSES.reduce((s, p) => s + p.revenueRaw, 0).toFixed(1)}M
          </span>
        </span>
      </div>
    </motion.div>
  );
};

export default TopProcesses;

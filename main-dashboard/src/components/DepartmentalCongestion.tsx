import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/* ─── Data ───────────────────────────────────────────────── */
interface Node { id: string; label: string; x: number; y: number; r: number; load: number; isBottleneck: boolean; }
interface Edge { from: string; to: string; direction: 'in' | 'out'; }

const NODES: Node[] = [
  { id: 'ops',   label: 'OPS',   x: 310, y: 150, r: 58, load: 142, isBottleneck: true  },
  { id: 'sales', label: 'SALES', x: 100, y: 150, r: 40, load: 78,  isBottleneck: false },
  { id: 'eng',   label: 'ENG',   x: 195, y: 66,  r: 35, load: 62,  isBottleneck: false },
  { id: 'mkt',   label: 'MKT',   x: 490, y: 74,  r: 37, load: 44,  isBottleneck: false },
  { id: 'fin',   label: 'FIN',   x: 490, y: 234, r: 37, load: 38,  isBottleneck: false },
];

const EDGES: Edge[] = [
  { from: 'sales', to: 'ops', direction: 'in'  },
  { from: 'eng',   to: 'ops', direction: 'in'  },
  { from: 'ops',   to: 'mkt', direction: 'out' },
  { from: 'ops',   to: 'fin', direction: 'out' },
];

const DEPT_LOADS = [
  { dept: 'OPS',   load: 142, color: '#f43f5e', critical: true  },
  { dept: 'SALES', load: 78,  color: '#fb923c', critical: false },
  { dept: 'ENG',   load: 62,  color: '#fb923c', critical: false },
  { dept: 'MKT',   load: 44,  color: '#38bdf8', critical: false },
  { dept: 'FIN',   load: 38,  color: '#38bdf8', critical: false },
];

const STAT_CARDS = [
  { label: 'Contention Score', value: '8.4 / 10',       color: '#f43f5e' },
  { label: 'Peak Time',        value: '09:45 EST',       color: '#fb923c' },
  { label: 'Affected Depts',   value: '4 Departments',   color: '#38bdf8' },
  { label: 'Resolution',       value: 'Process Redesign', color: '#34d399' },
];

const getNode = (id: string) => NODES.find(n => n.id === id)!;

/* ─── Edge geometry helper ───────────────────────────────── */
const edgePoints = (e: Edge) => {
  const f = getNode(e.from), t = getNode(e.to);
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  return { x1: f.x + ux * f.r, y1: f.y + uy * f.r, x2: t.x - ux * t.r, y2: t.y - uy * t.r };
};

/* ─── Component ─────────────────────────────────────────── */
const DepartmentalCongestion: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="rounded-2xl overflow-hidden"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-1)',
      borderLeft: '2px solid #f43f5e',
      boxShadow: 'var(--shadow-lg)',
    }}
  >
    {/* ── Header ── */}
    <div className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertTriangle size={13} style={{ color: '#f43f5e' }} />
        </div>
        <div>
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Departmental Congestion Analysis
          </span>
          <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>— Bottleneck topology</span>
        </div>
      </div>
      <span className="text-[9px] font-bold tracking-[0.2em]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        CROSS-DEPARTMENTAL LOAD INTENSITY
      </span>
    </div>

    {/* ── Body ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr' }}>

      {/* ── Graph canvas ── */}
      <div className="relative" style={{ background: '#040810', borderRight: '1px solid var(--border-1)' }}>

        {/* Map sub-header */}
        <div className="absolute top-4 left-5 z-10 pointer-events-none">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>
            ANONYMOUS BOTTLENECK MAP
          </p>
          <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
            Heuristic Resource Conflict Detection
          </p>
        </div>

        <svg viewBox="0 0 640 308" width="100%" style={{ display: 'block' }}>
          <defs>
            <radialGradient id="dcOpsGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(244,63,94,0.45)" />
              <stop offset="55%"  stopColor="rgba(244,63,94,0.12)" />
              <stop offset="100%" stopColor="rgba(244,63,94,0)" />
            </radialGradient>
            <radialGradient id="dcNodeGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%"   stopColor="#0c2038" />
              <stop offset="100%" stopColor="#050c18" />
            </radialGradient>
            <radialGradient id="dcOpsBody" cx="38%" cy="32%" r="68%">
              <stop offset="0%"   stopColor="#1a0810" />
              <stop offset="100%" stopColor="#0a0306" />
            </radialGradient>
            <filter id="dcBloom" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="dcParticle" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
            <filter id="dcNodeGlowF" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Edges ── */}
          {EDGES.map((e, i) => {
            const { x1, y1, x2, y2 } = edgePoints(e);
            const isIn = e.direction === 'in';
            const col = isIn ? '#f43f5e' : '#38bdf8';
            return (
              <g key={i}>
                {/* Static base */}
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={col} strokeWidth="0.6" opacity="0.12" />
                {/* Animated dashes */}
                <motion.line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={col} strokeWidth="1.4" opacity="0.55"
                  strokeDasharray="6 5"
                  animate={{ strokeDashoffset: isIn ? [0, -22] : [0, 22] }}
                  transition={{ duration: isIn ? 1.4 : 1.9, repeat: Infinity, ease: 'linear' }}
                />
              </g>
            );
          })}

          {/* ── Signal particles ── */}
          {EDGES.flatMap((e, ei) => {
            const { x1, y1, x2, y2 } = edgePoints(e);
            const isIn = e.direction === 'in';
            const col = isIn ? '#f43f5e' : '#38bdf8';
            const dur = isIn ? 1.7 : 2.2;
            return [0, 1, 2].map(pi => (
              <motion.circle key={`pc-${ei}-${pi}`}
                r={isIn ? 2.4 : 2}
                fill={col}
                filter="url(#dcParticle)"
                animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 1, 0] }}
                transition={{ duration: dur, delay: pi * 0.62 + ei * 0.28, repeat: Infinity, ease: 'linear', times: [0, 0.08, 0.92, 1] }}
              />
            ));
          })}

          {/* ── OPS bottleneck node ── */}
          {(() => {
            const o = getNode('ops');
            return (
              <g>
                {/* Atmospheric radial glow */}
                <motion.circle cx={o.x} cy={o.y}
                  fill="url(#dcOpsGlow)"
                  animate={{ r: [88, 118, 88], opacity: [0.75, 1, 0.75] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Bloom halo */}
                <motion.circle cx={o.x} cy={o.y} r={o.r + 6}
                  fill="rgba(244,63,94,0.18)"
                  animate={{ opacity: [0.18, 0.36, 0.18] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  filter="url(#dcBloom)"
                />
                {/* Emanating ripple rings (3 staggered) */}
                {[0, 1, 2].map(ri => (
                  <motion.circle key={ri} cx={o.x} cy={o.y}
                    fill="none" stroke="#f43f5e"
                    animate={{ r: [o.r + 4, o.r + 56], opacity: [0.45, 0], strokeWidth: [1.8, 0.2] }}
                    transition={{ duration: 2.6, delay: ri * 0.88, repeat: Infinity, ease: 'easeOut' }}
                  />
                ))}
                {/* Node body */}
                <circle cx={o.x} cy={o.y} r={o.r} fill="url(#dcOpsBody)" />
                {/* Animated stroke ring */}
                <motion.circle cx={o.x} cy={o.y} r={o.r}
                  fill="none"
                  animate={{ stroke: ['#f43f5e', '#fb923c', '#f43f5e'], strokeWidth: [2, 2.8, 2], strokeOpacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Inner highlight arc */}
                <circle cx={o.x - o.r * 0.18} cy={o.y - o.r * 0.24} r={o.r * 0.5}
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                {/* Label */}
                <text x={o.x} y={o.y - 7} textAnchor="middle" dominantBaseline="middle"
                  fontSize="16" fontWeight="800" fontFamily="var(--font-display)"
                  fill="#f43f5e" letterSpacing="0.12em">OPS</text>
                <text x={o.x} y={o.y + 11} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fontFamily="var(--font-mono)" fill="rgba(244,63,94,0.65)">
                  142%
                </text>
              </g>
            );
          })()}

          {/* ── Satellite nodes ── */}
          {NODES.filter(n => !n.isBottleneck).map((n, i) => (
            <motion.g key={n.id}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            >
              {/* Subtle node ambient glow */}
              <circle cx={n.x} cy={n.y} r={n.r + 10}
                fill="rgba(56,189,248,0.03)" filter="url(#dcNodeGlowF)" />
              {/* Body */}
              <circle cx={n.x} cy={n.y} r={n.r} fill="url(#dcNodeGrad)" />
              {/* Breathing stroke */}
              <motion.circle cx={n.x} cy={n.y} r={n.r}
                fill="none" stroke="#38bdf8"
                animate={{ strokeOpacity: [0.45, 0.8, 0.45], strokeWidth: [1, 1.5, 1] }}
                transition={{ duration: 2.8 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              />
              {/* Label */}
              <text x={n.x} y={n.y - 5} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="700" fontFamily="var(--font-display)"
                fill="rgba(255,255,255,0.88)" letterSpacing="0.1em">{n.label}</text>
              <text x={n.x} y={n.y + 8} textAnchor="middle" dominantBaseline="middle"
                fontSize="8.5" fontFamily="var(--font-mono)" fill="rgba(56,189,248,0.6)">
                {n.load}%
              </text>
            </motion.g>
          ))}

          {/* ── Critical alert (bottom-right of graph) ── */}
          <g>
            <motion.circle cx={568} cy={248} r={4.5} fill="#f43f5e"
              animate={{ opacity: [1, 0.25, 1], r: [4.5, 6, 4.5] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle cx={568} cy={248} r={4.5}
              fill="none" stroke="#f43f5e"
              animate={{ r: [5, 14], opacity: [0.5, 0], strokeWidth: [1.2, 0.2] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
            />
            <text x={582} y={248} dominantBaseline="middle"
              fontSize="9.5" fontWeight="700" fontFamily="var(--font-display)"
              fill="#f43f5e" letterSpacing="0.09em">CRITICAL BOTTLENECK DETECTED</text>
            <text x={582} y={263}
              fontSize="8" fontFamily="var(--font-body)"
              fill="rgba(255,255,255,0.28)">Operations node exceeds threshold by 42%.</text>
            <text x={582} y={274}
              fontSize="8" fontFamily="var(--font-body)"
              fill="rgba(255,255,255,0.28)">Resource contention peak at 09:45 EST.</text>
          </g>
        </svg>
      </div>

      {/* ── Stats panel ── */}
      <div className="p-5 space-y-4" style={{ background: 'var(--bg-card)' }}>

        {/* Department load bars */}
        <div>
          <p className="text-[9px] font-bold tracking-[0.16em] mb-3.5"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
            DEPARTMENT LOAD INDEX
          </p>
          <div className="space-y-3">
            {DEPT_LOADS.map((d, i) => (
              <motion.div key={d.dept}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.4 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wide"
                      style={{ fontFamily: 'var(--font-display)', color: d.critical ? d.color : 'var(--text-secondary)' }}>
                      {d.dept}
                    </span>
                    {d.critical && (
                      <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', fontFamily: 'var(--font-mono)', border: '1px solid rgba(244,63,94,0.2)' }}>
                        OVER CAPACITY
                      </span>
                    )}
                  </div>
                  <span className="text-[10px]"
                    style={{ fontFamily: 'var(--font-mono)', color: d.color }}>
                    {d.load}%
                  </span>
                </div>
                {/* Track */}
                <div className="relative h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {/* Capacity marker at 100% */}
                  {d.load > 100 && (
                    <div className="absolute top-0 bottom-0 w-px"
                      style={{ left: `${(100 / Math.max(...DEPT_LOADS.map(x => x.load))) * 100}%`, background: 'rgba(255,255,255,0.2)' }} />
                  )}
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.load / 150) * 100}%` }}
                    transition={{ duration: 1.0, delay: 0.25 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      background: `linear-gradient(90deg, ${d.color}66, ${d.color})`,
                      boxShadow: `0 0 8px ${d.color}44`,
                    }}
                  />
                </div>
                {d.critical && (
                  <p className="text-right mt-0.5 text-[8px]"
                    style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e', opacity: 0.65 }}>
                    +{d.load - 100}% over capacity
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-1)' }} />

        {/* Stat mini-cards */}
        <div className="grid grid-cols-2 gap-2">
          {STAT_CARDS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className="rounded-xl p-3"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}1a` }}>
              <p className="text-[8px] mb-1 uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                {s.label}
              </p>
              <p className="text-[11px] font-bold leading-tight"
                style={{ fontFamily: 'var(--font-mono)', color: s.color }}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export default DepartmentalCongestion;

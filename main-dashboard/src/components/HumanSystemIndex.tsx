import React from 'react';
import { motion } from 'framer-motion';

const dimensions = [
  { label: 'Efficiency',  score: 65, color: '#f43f5e' },
  { label: 'Alignment',   score: 58, color: '#fb923c' },
  { label: 'Capability',  score: 81, color: '#34d399' },
  { label: 'Energy',      score: 62, color: '#fb923c' },
  { label: 'Execution',   score: 74, color: '#34d399' },
];

const tags = [
  { label: '18 efficiency reveals', color: '#f43f5e', bg: 'rgba(244,63,94,0.10)',   border: 'rgba(244,63,94,0.22)' },
  { label: '11 alignment gaps',     color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.20)' },
  { label: '7 burnout signals',     color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.20)' },
  { label: '5 opportunities',       color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.20)' },
];

const HumanSystemIndex: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.08 }}
    className="rounded-2xl overflow-hidden flex flex-col"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-2)',
      borderLeft: '3px solid #38bdf8',
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
        240 employees · Q1 2026
      </span>
    </div>

    {/* ── Card body ── */}
    <div className="px-6 py-6 flex flex-col gap-6 flex-1">

      {/* Score */}
      <div>
        <div className="flex items-baseline gap-2.5">
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 60,
            fontWeight: 800,
            color: '#fb923c',
            lineHeight: 1,
            letterSpacing: '-2px',
          }}>
            72
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.18)',
          }}>
            / 100
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#fb923c', boxShadow: '0 0 6px #fb923c',
            display: 'inline-block', flexShrink: 0,
          }} />
          <span className="text-[12px] font-bold"
            style={{ fontFamily: 'var(--font-display)', color: '#fb923c' }}>
            Stable — rising tension detected
          </span>
        </div>
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
      <div className="flex flex-col gap-2">
        {tags.map(t => (
          <span key={t.label}
            className="text-[10px] font-semibold px-3 py-1.5 rounded-full self-start"
            style={{
              fontFamily: 'var(--font-display)',
              color: t.color,
              background: t.bg,
              border: `1px solid ${t.border}`,
            }}>
            {t.label}
          </span>
        ))}
      </div>

    </div>
  </motion.div>
);

export default HumanSystemIndex;

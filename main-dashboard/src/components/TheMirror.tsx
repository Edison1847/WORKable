import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Lock } from 'lucide-react';

interface DimensionRow {
  label: string;
  leaderScore: number;
  teamScore: number;
  gap: number;
  gapColor: string;
  note?: string;
}

const DIMENSIONS: DimensionRow[] = [
  { label: 'Workload Distribution', leaderScore: 5.8, teamScore: 7.9, gap: 2.1, gapColor: '#fb923c' },
  { label: 'Role Clarity',          leaderScore: 6.4, teamScore: 4.2, gap: 2.2, gapColor: '#fb923c', note: 'LEADER OVERESTIMATES' },
  { label: 'Growth Opportunity',    leaderScore: 7.2, teamScore: 4.8, gap: 2.4, gapColor: '#f43f5e', note: 'LEADER OVERESTIMATES' },
  { label: 'Recognition Culture',   leaderScore: 6.8, teamScore: 5.1, gap: 1.7, gapColor: '#fb923c' },
  { label: 'Team Cohesion',         leaderScore: 7.5, teamScore: 6.9, gap: 0.6, gapColor: '#34d399', note: 'CLOSE' },
];

/* Compute which side is higher — determines bar colours */
const GapRow: React.FC<{ dim: DimensionRow; index: number }> = ({ dim, index }) => {
  const max = 10;
  const leaderPct = (dim.leaderScore / max) * 100;
  const teamPct   = (dim.teamScore / max) * 100;
  const leaderHigher = dim.leaderScore >= dim.teamScore;

  return (
    <motion.div
      className="py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.09, duration: 0.38 }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
        >
          {dim.label}
        </span>
        <div className="flex items-center gap-2">
          {dim.note && (
            <span
              className="text-[8px] font-bold tracking-widest px-2 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                color: dim.gapColor,
                background: `${dim.gapColor}18`,
                border: `1px solid ${dim.gapColor}35`,
              }}
            >
              {dim.note}
            </span>
          )}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              fontFamily: 'var(--font-mono)',
              color: dim.gapColor,
              background: `${dim.gapColor}18`,
              border: `1px solid ${dim.gapColor}35`,
            }}
          >
            GAP: {dim.gap.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid items-center gap-3" style={{ gridTemplateColumns: '35% 30% 35%' }}>
        {/* Leadership score */}
        <div className="text-right">
          <p className="text-[9px] mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Leadership Reports
          </p>
          <p
            className="text-[18px] font-bold"
            style={{
              fontFamily: 'var(--font-mono)',
              color: leaderHigher ? dim.gapColor : '#38bdf8',
            }}
          >
            {dim.leaderScore.toFixed(1)}
          </p>
        </div>

        {/* Gap bar */}
        <div className="flex flex-col gap-1">
          {/* Leader bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: leaderHigher ? dim.gapColor : '#38bdf8' }}
              initial={{ width: 0 }}
              animate={{ width: `${leaderPct}%` }}
              transition={{ duration: 0.9, delay: 0.3 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          {/* Team bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: leaderHigher ? '#38bdf8' : dim.gapColor }}
              initial={{ width: 0 }}
              animate={{ width: `${teamPct}%` }}
              transition={{ duration: 0.9, delay: 0.35 + index * 0.09, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Team score */}
        <div className="text-left">
          <p className="text-[9px] mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Data Shows
          </p>
          <p
            className="text-[18px] font-bold"
            style={{
              fontFamily: 'var(--font-mono)',
              color: leaderHigher ? '#38bdf8' : dim.gapColor,
            }}
          >
            {dim.teamScore.toFixed(1)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const TheMirror: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="rounded-2xl overflow-hidden"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-1)',
      borderLeft: '2px solid #a78bfa',
      boxShadow: 'var(--shadow-lg)',
    }}
  >
    {/* Header */}
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid var(--border-1)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.25)',
          }}
        >
          <Lock size={9} style={{ color: '#a78bfa' }} />
          <span
            className="text-[8.5px] font-bold tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}
          >
            Private CEO Insight
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={14} style={{ color: '#a78bfa' }} />
          <span
            className="text-sm font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The Mirror
          </span>
        </div>
      </div>
      <span
        className="text-[10px]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
      >
        Leadership perception vs. what data shows
      </span>
    </div>

    {/* Legend */}
    <div
      className="flex items-center gap-6 px-6 py-3"
      style={{ borderBottom: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-1.5 rounded-full" style={{ background: '#38bdf8' }} />
        <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Team Data
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-1.5 rounded-full" style={{ background: '#fb923c' }} />
        <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Leadership Report
        </span>
      </div>
      <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        Scale: 1–10
      </span>
    </div>

    {/* Dimension rows */}
    <div className="px-6">
      {DIMENSIONS.map((dim, i) => (
        <GapRow key={dim.label} dim={dim} index={i} />
      ))}
    </div>

    {/* Note */}
    <div
      className="px-6 py-4"
      style={{ borderTop: '1px solid var(--border-1)', background: 'rgba(167,139,250,0.04)' }}
    >
      <p
        className="text-[10px] leading-relaxed"
        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
      >
        Leader consistently overestimates Role Clarity and Growth Opportunity vs. team experience.{' '}
        <span className="font-semibold" style={{ color: '#f43f5e' }}>Intervention recommended.</span>
      </p>
    </div>
  </motion.div>
);

export default TheMirror;

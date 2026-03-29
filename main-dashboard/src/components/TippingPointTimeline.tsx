import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

interface EventMarker {
  x: number;
  label: string;
  title: string;
  color: string;
  ripple: boolean;
}

const EVENTS: EventMarker[] = [
  { x: 60,  label: 'TODAY',   title: 'Baseline',        color: '#38bdf8', ripple: false },
  { x: 220, label: '47 days', title: 'Burnout Peak',    color: '#fb923c', ripple: true  },
  { x: 390, label: '78 days', title: 'Resignation Wave',color: '#f97316', ripple: true  },
  { x: 560, label: '~Q3',     title: 'HSI < 60',        color: '#f43f5e', ripple: true  },
  { x: 780, label: '~Q4',     title: 'Talent Exodus',   color: '#dc2626', ripple: false },
];

const CHIPS = [
  { label: '47 days — Burnout Peak',   color: '#fb923c' },
  { label: '78 days — Resignations',   color: '#f97316' },
  { label: '~Q3 — HSI Breach',         color: '#f43f5e' },
  { label: '~Q4 — Exodus Risk',        color: '#dc2626' },
];

const TippingPointTimeline: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="rounded-2xl overflow-hidden w-full"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-1)',
      borderLeft: '2px solid #f43f5e',
      boxShadow: 'var(--shadow-lg)',
    }}
  >
    {/* Header */}
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid var(--border-1)' }}
    >
      <div className="flex items-center gap-2">
        <TrendingDown size={14} style={{ color: '#f43f5e' }} />
        <span
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Tipping Point Projector
        </span>
      </div>
      <span
        className="text-[10px]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
      >
        If current trajectory holds unchanged
      </span>
    </div>

    {/* SVG Timeline */}
    <div className="px-4 pt-6 pb-2">
      <svg
        viewBox="0 0 900 160"
        fill="none"
        className="w-full"
        style={{ height: 160, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="timelineGrad" x1="60" y1="0" x2="860" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(56,189,248,0.4)" />
            <stop offset="100%" stopColor="rgba(220,38,38,0.8)" />
          </linearGradient>
        </defs>

        {/* Base line */}
        <motion.line
          x1="60" y1="80" x2="860" y2="80"
          stroke="url(#timelineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Event markers */}
        {EVENTS.map((ev, i) => (
          <g key={ev.label}>
            {/* Vertical tick */}
            <motion.line
              x1={ev.x} y1="60" x2={ev.x} y2="100"
              stroke={ev.color}
              strokeWidth="1.5"
              opacity="0.6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            />

            {/* Ripple rings (for middle events) */}
            {ev.ripple && (
              <>
                <motion.circle
                  cx={ev.x} cy={80} r={8}
                  stroke={ev.color}
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ r: 8, opacity: 0.6 }}
                  animate={{ r: 24, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 1 + i * 0.4,
                    ease: 'easeOut',
                  }}
                />
                <motion.circle
                  cx={ev.x} cy={80} r={8}
                  stroke={ev.color}
                  strokeWidth="1"
                  fill="none"
                  initial={{ r: 8, opacity: 0.4 }}
                  animate={{ r: 18, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 1.3 + i * 0.4,
                    ease: 'easeOut',
                  }}
                />
              </>
            )}

            {/* Circle */}
            <motion.circle
              cx={ev.x} cy={80} r={8}
              fill={ev.color}
              opacity={0.9}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${ev.x}px 80px` }}
            />

            {/* Pulsing inner dot */}
            <motion.circle
              cx={ev.x} cy={80} r={3}
              fill="white"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />

            {/* Label above */}
            <motion.text
              x={ev.x} y={52}
              textAnchor="middle"
              fontSize="10"
              fill={ev.color}
              fontFamily="var(--font-mono)"
              fontWeight="700"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 52 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              {ev.label}
            </motion.text>

            {/* Title below */}
            <motion.text
              x={ev.x} y={114}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(255,255,255,0.5)"
              fontFamily="var(--font-body)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              {ev.title}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>

    {/* Assumption note */}
    <div className="px-6 pb-2">
      <p
        className="text-[9px] text-center"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
      >
        Assumption: No intervention implemented. Trajectory based on current signal velocity.
      </p>
    </div>

    {/* Footer chips */}
    <div
      className="flex flex-wrap items-center gap-2 px-6 py-3"
      style={{ borderTop: '1px solid var(--border-1)' }}
    >
      {CHIPS.map((c) => (
        <div
          key={c.label}
          className="px-3 py-1 rounded-lg"
          style={{
            background: `${c.color}18`,
            border: `1px solid ${c.color}40`,
          }}
        >
          <span
            className="text-[9.5px] font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: c.color }}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default TippingPointTimeline;

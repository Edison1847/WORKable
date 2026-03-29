import React from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';

const metrics = [
  {
    label: 'Perceived Team Capacity',
    gap: 31,
    bars: [
      { label: 'Manager Expectation', pct: 85, color: '#38bdf8' },
      { label: 'Actual Reality',       pct: 54, color: '#fb923c' },
    ],
  },
  {
    label: 'Process Friction Visibility',
    gap: 42,
    bars: [
      { label: 'Actual Reality',     pct: 78, color: '#fb923c' },
      { label: 'Manager Visibility', pct: 36, color: '#38bdf8' },
    ],
  },
];

const PerceptionGap: React.FC = () => (
  <div className="rounded-2xl p-5 h-full flex flex-col"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #38bdf8', boxShadow: 'var(--shadow-md)' }}>

    {/* Header */}
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <Users size={13} style={{ color: '#38bdf8' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Supervisor–Subordinate Gap</span>
      </div>
      <div className="flex items-center gap-1 badge badge-blue">
        <AlertCircle size={9} />
        High Variance
      </div>
    </div>

    <div className="space-y-7 flex-1">
      {metrics.map((m, mi) => (
        <div key={mi}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{m.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="data-sm" style={{ color: '#f43f5e' }}>{m.gap}%</span>
              <span className="eyebrow">gap</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {m.bars.map((b, bi) => (
              <div key={bi}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="dot" style={{ width: 5, height: 5, borderRadius: '50%', display: 'inline-block', background: b.color, boxShadow: `0 0 4px ${b.color}` }} />
                    <span className="eyebrow">{b.label}</span>
                  </div>
                  <span className="data-sm" style={{ color: b.color }}>{b.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ duration: 0.75, delay: mi * 0.2 + bi * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ background: b.color, boxShadow: `0 0 8px ${b.color}44` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gap visualiser */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${m.bars[1].color}44, transparent)` }} />
            <span className="text-[9px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>↕ {m.gap}pp delta</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, ${m.bars[0].color}44, transparent)` }} />
          </div>
        </div>
      ))}

      {/* Insight */}
      <div className="rounded-xl p-3.5"
        style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-semibold text-white">Insight: </span>
          Managers consistently underestimate friction and overestimate capacity, creating an{' '}
          <span className="font-semibold text-white">Expectation Delta</span> that sustains the Chronic Overload Loop.
        </p>
      </div>
    </div>
  </div>
);

export default PerceptionGap;

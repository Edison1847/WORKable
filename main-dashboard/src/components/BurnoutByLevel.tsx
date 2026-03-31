import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle } from 'lucide-react';

interface Level {
  label: string;
  pct: number;
  industry: number;
  color: string;
  trend: string;
  note: string;
}

const BurnoutByLevel: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([
    { label: 'Executive',       pct: 28, industry: 22, color: '#fb923c', trend: '+3pp',  note: 'Elevated' },
    { label: 'Mid-Management',  pct: 41, industry: 35, color: '#f97316', trend: '+6pp',  note: 'High Risk' },
    { label: 'Frontline',       pct: 67, industry: 48, color: '#f43f5e', trend: '+11pp', note: 'Critical' },
  ]);

  useEffect(() => {
    fetch('http://localhost:3000/api/culture/burnout-by-level')
      .then(res => res.json())
      .then(data => {
        if (data.levels) {
          setLevels(data.levels);
        }
      })
      .catch(err => console.error('Failed to fetch burnout data:', err));
  }, []);

  return (
  <div className="rounded-2xl overflow-hidden h-full"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #f43f5e', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <Flame size={13} style={{ color: '#f43f5e' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Burnout by Org Level</span>
      </div>
      <span className="badge" style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.22)' }}>vs Industry Norm</span>
    </div>

    <div className="p-5 space-y-5">
      {levels.map((l, i) => (
        <motion.div key={l.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{l.label}</span>
            <div className="flex items-center gap-2">
              <span className="data-sm" style={{ color: l.color }}>{l.pct}%</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md"
                style={{ fontFamily: 'var(--font-mono)', background: `${l.color}14`, color: l.color, border: `1px solid ${l.color}30` }}>
                ▲ {l.trend}
              </span>
              <span className="text-[9px] font-bold" style={{ color: l.color }}>{l.note}</span>
            </div>
          </div>

          <div className="relative h-5 rounded-lg overflow-visible" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}>
            <motion.div className="absolute top-0 left-0 h-full rounded-lg"
              initial={{ width: 0 }} animate={{ width: `${l.pct}%` }}
              transition={{ duration: 1, delay: i * 0.12, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${l.color}70, ${l.color})`, boxShadow: `0 0 10px ${l.color}44` }} />
            {/* Industry benchmark marker */}
            <div className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full"
              style={{ left: `${l.industry}%`, background: 'rgba(255,255,255,0.5)', zIndex: 10 }} />
          </div>

          <div className="flex justify-between mt-1.5">
            <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Industry avg: {l.industry}%</span>
            <span className="eyebrow" style={{ color: l.color }}>+{l.pct - l.industry}pp above norm</span>
          </div>
        </motion.div>
      ))}

      {/* Alert summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="flex items-start gap-2.5 rounded-xl p-3"
        style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.18)' }}>
        <AlertTriangle size={13} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 1 }} />
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-bold text-white">Frontline burnout at 67%</span> — 19pp above industry and accelerating.
          Operational capacity loss reaches critical threshold within{' '}
          <span style={{ color: '#f43f5e' }}>2 audit cycles</span> at current rate.
        </p>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Industry benchmark line</span>
        </div>
      </div>
    </div>
  </div>
  );
};

export default BurnoutByLevel;

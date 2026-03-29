import React from 'react';
import { motion } from 'framer-motion';
import { Brain, DollarSign } from 'lucide-react';

const categories = [
  { label: 'Strategic Work',     current: 12, optimal: 30, color: '#34d399', icon: '▲' },
  { label: 'Deep / Creative',    current: 18, optimal: 28, color: '#38bdf8', icon: '▲' },
  { label: 'Collaborative Work', current: 15, optimal: 20, color: '#a78bfa', icon: '▲' },
  { label: 'Meetings',           current: 31, optimal: 15, color: '#fb923c', icon: '▼' },
  { label: 'Internal Friction',  current: 24, optimal: 4,  color: '#f43f5e', icon: '▼' },
  { label: 'Admin & Overhead',   current: 11, optimal: 3,  color: '#f97316', icon: '▼' },
  { label: 'Recovery / Idle',    current: 4,  optimal: 8,  color: '#94a3b8', icon: '○' },
];

const totalWaste = categories.filter(c => c.current > c.optimal).reduce((s, c) => s + (c.current - c.optimal), 0);

const CognitiveEconomyModel: React.FC = () => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #a78bfa', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <Brain size={13} style={{ color: '#a78bfa' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Cognitive Economy Model</span>
      </div>
      <div className="flex items-center gap-2">
        <DollarSign size={11} style={{ color: '#f43f5e' }} />
        <span className="text-sm font-bold" style={{ color: '#f43f5e', fontFamily: 'var(--font-display)' }}>$2.1M</span>
        <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>cognitive waste / yr</span>
      </div>
    </div>

    <div className="p-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Cognitive Capacity Allocation (%)</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)' }} />
                <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Optimal</span>
              </div>
            </div>
          </div>
          {categories.map((c, i) => {
            const isWaste = c.current > c.optimal;
            return (
              <motion.div key={c.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-white" style={{ fontFamily: 'var(--font-display)' }}>{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold" style={{ color: c.color, fontFamily: 'var(--font-mono)' }}>{c.current}%</span>
                    {isWaste && (
                      <span className="text-[8px]" style={{ color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                        +{c.current - c.optimal}pp waste
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {/* Optimal ghost */}
                  <div className="absolute top-0 left-0 h-full rounded-lg"
                    style={{ width: `${c.optimal}%`, background: 'rgba(255,255,255,0.07)', border: '1px dashed rgba(255,255,255,0.15)' }} />
                  {/* Current */}
                  <motion.div className="absolute top-0 left-0 h-full rounded-lg"
                    initial={{ width: 0 }} animate={{ width: `${c.current}%` }}
                    transition={{ duration: 0.9, delay: i * 0.07, ease: 'easeOut' }}
                    style={{
                      background: isWaste
                        ? `linear-gradient(90deg, ${c.color}60, ${c.color})`
                        : `linear-gradient(90deg, ${c.color}50, ${c.color}80)`,
                      boxShadow: isWaste ? `0 0 8px ${c.color}44` : undefined,
                      maxWidth: '100%',
                    }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right: summary cards */}
        <div className="space-y-3">
          <div className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)' }}>
            <p className="text-[28px] font-black" style={{ color: '#f43f5e', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{totalWaste}%</p>
            <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>Cognitive Waste</p>
            <p className="eyebrow mt-1" style={{ color: 'var(--text-muted)' }}>of total capacity</p>
          </div>

          <div className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <p className="text-[24px] font-black" style={{ color: '#a78bfa', fontFamily: 'var(--font-display)', lineHeight: 1 }}>30%</p>
            <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>Strategic Deficit</p>
            <p className="eyebrow mt-1" style={{ color: 'var(--text-muted)' }}>only 12% on strategy<br />optimal: 30%</p>
          </div>

          <div className="rounded-xl p-4"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
            <p className="eyebrow mb-2" style={{ color: '#34d399' }}>Recovery Potential</p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Eliminating friction & excess meetings frees{' '}
              <span className="font-bold text-white">41% cognitive capacity</span> for strategic and creative work.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CognitiveEconomyModel;

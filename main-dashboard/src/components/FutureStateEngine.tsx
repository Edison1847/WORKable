import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Telescope, AlertTriangle, TrendingDown, Clock, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const projections = [
  { label: 'Now',   hsi: 61, cpi: 48, burnout: 41, trust: 48 },
  { label: '+30d',  hsi: 58, cpi: 54, burnout: 46, trust: 44 },
  { label: '+60d',  hsi: 54, cpi: 61, burnout: 52, trust: 39 },
  { label: '+90d',  hsi: 49, cpi: 68, burnout: 59, trust: 33 },
];

const signals = [
  { key: 'hsi',     label: 'HSI Score',          color: '#38bdf8', direction: 'down', critical: 50, unit: '' },
  { key: 'cpi',     label: 'Crisis Proximity',   color: '#f43f5e', direction: 'up',   critical: 60, unit: '' },
  { key: 'burnout', label: 'Burnout Risk',        color: '#fb923c', direction: 'up',   critical: 55, unit: '%' },
  { key: 'trust',   label: 'Trust Index',         color: '#a78bfa', direction: 'down', critical: 35, unit: '' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-3 py-2.5 space-y-1" style={{ background: '#1a1a2e', border: '1px solid rgba(244,63,94,0.3)', fontSize: 10 }}>
        <p className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
            {signals.find(s => s.key === p.name)?.label}: {p.value}{signals.find(s => s.key === p.name)?.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const FutureStateEngine: React.FC = () => {
  const [activeSignal, setActiveSignal] = useState('cpi');
  const sig = signals.find(s => s.key === activeSignal)!;
  const current = projections[0][activeSignal as keyof typeof projections[0]] as number;
  const at90 = projections[3][activeSignal as keyof typeof projections[0]] as number;
  const isBad = sig.direction === 'up' ? at90 >= sig.critical : at90 <= sig.critical;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #f43f5e', boxShadow: 'var(--shadow-md)' }}>

      {/* Hero header */}
      <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(251,146,60,0.05) 100%)', borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Telescope size={14} style={{ color: '#f43f5e' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Future State Engine</span>
          <span className="badge ml-auto" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }}>If Nothing Changes</span>
        </div>
        <motion.p className="text-[22px] font-black leading-tight mt-2"
          style={{ fontFamily: 'var(--font-display)', color: '#f43f5e' }}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Crisis Proximity crosses 60
          <span className="text-white"> in 47 days.</span>
        </motion.p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Based on current signal trajectories with no intervention. The window to change this outcome is <span className="font-semibold text-white">now open</span>.
        </p>
      </div>

      <div className="p-5">
        {/* Signal selector */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {signals.map(s => (
            <button key={s.key}
              onClick={() => setActiveSignal(s.key)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                background: activeSignal === s.key ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                color: activeSignal === s.key ? s.color : 'var(--text-muted)',
                border: `1px solid ${activeSignal === s.key ? s.color + '40' : 'var(--border-1)'}`,
              }}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={projections} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id={`fse-${activeSignal}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={sig.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={sig.color} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={sig.critical}
                  stroke={sig.color} strokeDasharray="4 3" opacity={0.7}
                  label={{ value: 'Critical threshold', position: 'right', fontSize: 7, fill: sig.color }} />
                <Area type="monotone" dataKey={activeSignal} stroke={sig.color} strokeWidth={2.5}
                  fill={`url(#fse-${activeSignal})`}
                  dot={{ fill: sig.color, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: sig.color, stroke: 'rgba(0,0,0,0.3)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Right: 30/60/90 cards */}
          <div className="space-y-2">
            {projections.slice(1).map((p, i) => {
              const val = p[activeSignal as keyof typeof p] as number;
              const crossesCritical = sig.direction === 'up' ? val >= sig.critical : val <= sig.critical;
              return (
                <motion.div key={p.label}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{
                    background: crossesCritical ? `${sig.color}10` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${crossesCritical ? sig.color + '30' : 'var(--border-1)'}`,
                  }}>
                  <div className="shrink-0 text-center w-12">
                    <p className="text-[10px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{p.label}</p>
                    <Clock size={9} style={{ color: 'var(--text-muted)', margin: '2px auto 0' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-black" style={{ color: crossesCritical ? sig.color : 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                      {val}{sig.unit}
                    </p>
                    {crossesCritical && (
                      <p className="text-[8px] font-bold" style={{ color: sig.color, fontFamily: 'var(--font-mono)' }}>⚠ CRITICAL</p>
                    )}
                  </div>
                  <ChevronRight size={10} style={{ color: crossesCritical ? sig.color : 'var(--text-muted)' }} />
                </motion.div>
              );
            })}

            {/* Bottom CTA */}
            <div className="rounded-xl p-3 mt-1" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-bold" style={{ color: '#34d399' }}>This future is preventable.</span>{' '}
                Peer Playbook shows what similar organisations did when this signal fired.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureStateEngine;

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

const data = [
  { cycle: 'C1', trust: 72, projected: null },
  { cycle: 'C2', trust: 68, projected: null },
  { cycle: 'C3', trust: 63, projected: null },
  { cycle: 'C4', trust: 59, projected: null },
  { cycle: 'C5', trust: 52, projected: null },
  { cycle: 'C6', trust: 48, projected: 48 },
  { cycle: 'C7', trust: null, projected: 41 },
  { cycle: 'C8', trust: null, projected: 33 },
  { cycle: 'C9', trust: null, projected: 25 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-2.5 py-2" style={{ background: '#1a1a2e', border: '1px solid rgba(251,146,60,0.3)', fontSize: 10 }}>
        <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        {payload.map((p: any) => (
          p.value != null && (
            <p key={p.name} style={{ color: p.name === 'trust' ? '#34d399' : '#fb923c', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {p.name === 'trust' ? 'Actual' : 'Projected'}: {p.value}
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

const TrustDecayCurve: React.FC = () => (
  <div className="rounded-2xl overflow-hidden h-full"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #fb923c', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <ShieldAlert size={13} style={{ color: '#fb923c' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Trust Decay Curve</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>−24pts</span>
        <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>over 6 cycles</span>
      </div>
    </div>

    <div className="p-5">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Current Trust', value: '48', color: '#fb923c', unit: '/100' },
          { label: 'Decay Rate',    value: '4.8', color: '#f43f5e', unit: 'pts/cycle' },
          { label: 'Critical In',   value: '2', color: '#f43f5e', unit: 'cycles' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3 text-center"
            style={{ background: `${k.color}08`, border: `1px solid ${k.color}1a` }}>
            <p className="data-md" style={{ color: k.color }}>{k.value}<span className="text-[9px] ml-0.5" style={{ color: 'var(--text-muted)' }}>{k.unit}</span></p>
            <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb923c" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#fb923c" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="cycle" tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={35} stroke="rgba(244,63,94,0.5)" strokeDasharray="4 3" label={{ value: 'Critical', position: 'right', fontSize: 8, fill: '#f43f5e' }} />
          <Area type="monotone" dataKey="trust" stroke="#34d399" strokeWidth={2} fill="url(#trustGrad)" connectNulls={false} dot={{ fill: '#34d399', r: 3 }} />
          <Area type="monotone" dataKey="projected" stroke="#fb923c" strokeWidth={2} strokeDasharray="5 3" fill="url(#projGrad)" connectNulls dot={{ fill: '#fb923c', r: 2 }} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Projection insight */}
      <div className="flex items-start gap-2 mt-4 rounded-xl p-3"
        style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.18)' }}>
        <Clock size={11} style={{ color: '#fb923c', flexShrink: 0, marginTop: 1 }} />
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          At 4.8pts decay per cycle, trust crosses the{' '}
          <span className="font-semibold text-white">critical threshold (35)</span> in approximately 2 audit cycles.
          Below 35, collective cooperation collapses faster than individual signals suggest.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2px] rounded" style={{ background: '#34d399' }} />
          <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2px] rounded" style={{ background: '#fb923c', borderTop: '2px dashed #fb923c' }} />
          <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Projected</span>
        </div>
      </div>
    </div>
  </div>
);

export default TrustDecayCurve;

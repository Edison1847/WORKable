import React from 'react';
import { motion } from 'framer-motion';
import { Star, AlertOctagon, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

const data = [
  { cycle: 'C1', internal: 61, external: 72 },
  { cycle: 'C2', internal: 65, external: 70 },
  { cycle: 'C3', internal: 68, external: 65 },
  { cycle: 'C4', internal: 71, external: 61 },
  { cycle: 'C5', internal: 74, external: 59 },
];

const gap = data[data.length - 1].internal - data[data.length - 1].external; // +15

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-2.5 py-2 space-y-1" style={{ background: '#1a1a2e', border: '1px solid rgba(56,189,248,0.3)', fontSize: 10 }}>
        <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.name === 'internal' ? '#34d399' : '#f43f5e', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {p.name === 'internal' ? 'Internal HSI' : 'External Sentiment'}: {p.value}
          </p>
        ))}
        {payload.length === 2 && payload[0].value != null && payload[1].value != null && (
          <p style={{ color: '#fb923c', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            Gap: {payload[0].value - payload[1].value > 0 ? '+' : ''}{payload[0].value - payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const EmployerBrandHealth: React.FC = () => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #38bdf8', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <Star size={13} style={{ color: '#38bdf8' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Employer Brand Health</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>HC-BRD-001</span>
      </div>
      <span className="badge" style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.22)' }}>Divergence Alert</span>
    </div>

    <div className="p-5">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Internal HSI',  value: '74', color: '#34d399', sub: '▲ +4.2 cycle' },
          { label: 'Ext. Sentiment', value: '59', color: '#f43f5e', sub: '▼ −1.1 cycle' },
          { label: 'Brand Gap',     value: `+${gap}`, color: '#fb923c', sub: 'Widening ↑' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3 text-center"
            style={{ background: `${k.color}08`, border: `1px solid ${k.color}1a` }}>
            <p className="data-md" style={{ color: k.color }}>{k.value}</p>
            <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
            <p className="text-[8px] mt-0.5" style={{ color: k.color, fontFamily: 'var(--font-mono)' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="cycle" tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[50, 90]} tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="internal" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 3 }} name="internal" />
          <Line type="monotone" dataKey="external" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', r: 3 }} name="external" />
        </LineChart>
      </ResponsiveContainer>

      {/* Insight */}
      <div className="flex items-start gap-2 mt-4 rounded-xl p-3"
        style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.18)' }}>
        <AlertOctagon size={11} style={{ color: '#fb923c', flexShrink: 0, marginTop: 1 }} />
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Internal culture is <span className="font-semibold text-white">genuinely strengthening</span>, yet external perception contradicts it — driven by{' '}
          <span className="font-semibold" style={{ color: '#fb923c' }}>Role Ambiguity signals</span> reaching public review platforms.
          A widening gap is a leading indicator of{' '}
          <span className="font-semibold text-white">recruitment difficulty in 2–3 quarters</span>.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2px] rounded" style={{ background: '#34d399' }} />
          <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Internal HSI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2px] rounded" style={{ background: '#f43f5e' }} />
          <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>External Sentiment</span>
        </div>
      </div>
    </div>
  </div>
);

export default EmployerBrandHealth;

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const gen = (trend: 'up' | 'down' | 'flat', v: number) => {
  let c = 50;
  return Array.from({ length: 20 }, () => {
    c += trend === 'up' ? Math.random() * v : trend === 'down' ? -Math.random() * v : (Math.random() - .5) * v;
    return { value: Math.max(5, c) };
  });
};

const signals = [
  { id: 'time',       name: 'Time Allocation',    value: '38%',  status: 'High Waste', color: '#f43f5e', trend: 'up'   as const, data: gen('up', 4) },
  { id: 'value',      name: 'Value Score',         value: '4.2',  status: 'Critical',   color: '#f43f5e', trend: 'down' as const, data: gen('down', 2) },
  { id: 'motivation', name: 'Motivation Index',    value: '64%',  status: 'Stable',     color: '#38bdf8', trend: 'flat' as const, data: gen('flat', 3) },
  { id: 'control',    name: 'Control / Friction',  value: 'High', status: 'Elevated',   color: '#fb923c', trend: 'up'   as const, data: gen('up', 5) },
  { id: 'blockers',   name: 'Systemic Blockers',   value: '18',   status: 'Rising',     color: '#fb923c', trend: 'up'   as const, data: gen('up', 3) },
];

const TrendIcon = ({ trend, color }: { trend: 'up' | 'down' | 'flat'; color: string }) => {
  if (trend === 'up')   return <ArrowUpRight   size={11} style={{ color }} />;
  if (trend === 'down') return <ArrowDownRight  size={11} style={{ color }} />;
  return <Minus size={11} style={{ color: 'var(--text-muted)' }} />;
};

const SignalPulseStrip: React.FC = () => (
  <div className="space-y-1.5">
    {signals.map((s, i) => (
      <motion.div
        key={s.id}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-1)',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = `${s.color}28`;
          el.style.background = 'var(--bg-elevated)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--border-1)';
          el.style.background = 'var(--bg-card)';
        }}
      >
        {/* Left colour strip */}
        <div className="shrink-0 w-1 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${s.color}, ${s.color}44)`, boxShadow: `0 0 6px ${s.color}55` }} />

        {/* Label + value */}
        <div className="w-32 shrink-0">
          <p className="eyebrow mb-0.5">{s.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="data-md text-white">{s.value}</span>
            <div className="flex items-center gap-0.5">
              <TrendIcon trend={s.trend} color={s.color} />
              <span className="text-[10px] font-semibold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.status}</span>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex-1 opacity-40 group-hover:opacity-90 transition-opacity" style={{ height: 36 }}>
          <ResponsiveContainer width="100%" height={36}>
            <LineChart data={s.data}>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Line type="monotone" dataKey="value" stroke={s.color} strokeWidth={1.5} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Drill-down CTA */}
        <button
          className="shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-2)',
            color: 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${s.color}55`; el.style.color = s.color; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border-2)'; el.style.color = 'var(--text-secondary)'; }}
        >
          Drill-down →
        </button>
      </motion.div>
    ))}
  </div>
);

export default SignalPulseStrip;

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

const metrics = [
  { label: 'Wasted salary / year',      value: '$14.2M', sub: '14.8% of salary budget',      color: '#f87171' },
  { label: 'Revenue uplift potential',   value: '$21.6M', sub: 'If high-value work resourced', color: '#34d399' },
  { label: 'Attrition risk cost',        value: '$4.8M',  sub: '4 high performers at risk',   color: '#fbbf24' },
  { label: 'Cost of inaction / mo',      value: '$1.18M', sub: 'If no action taken now',       color: '#f87171' },
];

const trendData = [
  { dim: 'Efficiency', a1: 55, a2: 58, a3: 62, a4: 65 },
  { dim: 'Alignment',  a1: 48, a2: 52, a3: 55, a4: 58 },
  { dim: 'Capability', a1: 72, a2: 76, a3: 78, a4: 81 },
  { dim: 'Energy',     a1: 54, a2: 57, a3: 60, a4: 62 },
  { dim: 'Execution',  a1: 65, a2: 68, a3: 71, a4: 74 },
];

const auditColors = ['#60a5fa', '#fbbf24', '#f87171', '#34d399'];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-2)',
      borderRadius: 8,
      padding: '8px 12px',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'white', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map(p => (
        <p key={p.name} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: p.color }}>
          {p.name.toUpperCase()}: {p.value}
        </p>
      ))}
    </div>
  );
};

const FinancialImpactModel: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.12 }}
    className="rounded-2xl overflow-hidden flex flex-col"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-2)',
      borderLeft: '3px solid #34d399',
      boxShadow: 'var(--shadow-md)',
    }}
  >
    {/* ── Card header ── */}
    <div className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid var(--border-1)' }}>
      <span className="text-sm font-bold text-white"
        style={{ fontFamily: 'var(--font-display)' }}>
        Financial Impact Model
      </span>
      <div className="flex items-center gap-1.5">
        <Star size={10} style={{ color: '#fbbf24' }} />
        <span className="text-[10px]"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Based on salary bands · Financial models
        </span>
      </div>
    </div>

    {/* ── Card body ── */}
    <div className="px-6 py-6 flex flex-col gap-5 flex-1">

      {/* 2×2 metric grid */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="rounded-xl p-3.5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)' }}>
            <p className="eyebrow mb-2">{m.label}</p>
            <p className="text-[22px] font-bold leading-none mb-1.5"
              style={{ fontFamily: 'var(--font-display)', color: m.color, letterSpacing: '-0.5px' }}>
              {m.value}
            </p>
            <p className="text-[10px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {m.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Total recoverable */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl px-4 py-4"
        style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)' }}>
        <p className="eyebrow mb-2" style={{ color: '#34d399' }}>Total recoverable value</p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 26,
          fontWeight: 700,
          color: '#34d399',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}>
          $35.8M{' '}
          <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.65 }}>/ year</span>
        </p>
        <p className="text-[10px] mt-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Wasted salary + revenue uplift combined
        </p>
      </motion.div>

      {/* HSI Trend */}
      <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 16 }}>
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">HSI Trend — Last 4 Audits</p>
          <div className="flex items-center gap-2">
            {['A1', 'A2', 'A3', 'A4'].map((a, i) => (
              <div key={a} className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: auditColors[i] }} />
                <span className="text-[9px]"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {a}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={84}>
          <BarChart data={trendData} barSize={5} barGap={1} barCategoryGap="28%">
            <XAxis
              dataKey="dim"
              tick={{ fontFamily: 'var(--font-body)', fontSize: 9, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="a1" name="a1" fill={auditColors[0]} radius={[2, 2, 0, 0]} />
            <Bar dataKey="a2" name="a2" fill={auditColors[1]} radius={[2, 2, 0, 0]} />
            <Bar dataKey="a3" name="a3" fill={auditColors[2]} radius={[2, 2, 0, 0]} />
            <Bar dataKey="a4" name="a4" fill={auditColors[3]} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </motion.div>
);

export default FinancialImpactModel;

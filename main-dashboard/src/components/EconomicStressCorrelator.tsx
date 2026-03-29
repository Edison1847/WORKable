import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Globe, Building2 } from 'lucide-react';
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const data = [
  { month: 'Oct', macro: 42, internal: 71, orgSpecific: 29 },
  { month: 'Nov', macro: 48, internal: 68, orgSpecific: 31 },
  { month: 'Dec', macro: 61, internal: 63, orgSpecific: 36 },
  { month: 'Jan', macro: 59, internal: 60, orgSpecific: 39 },
  { month: 'Feb', macro: 54, internal: 58, orgSpecific: 42 },
  { month: 'Mar', macro: 52, internal: 54, orgSpecific: 46 },
];

const latestMacro = data[data.length - 1].macro;
const latestInternal = data[data.length - 1].internal;
const orgShare = Math.round((data[data.length - 1].orgSpecific / (100 - (100 - latestInternal))) * 100);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-3 py-2.5 space-y-1" style={{ background: '#1a1a2e', border: '1px solid rgba(56,189,248,0.3)', fontSize: 10 }}>
        <p className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
        {payload.map((p: any) => p.value != null && (
          <p key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
            {p.name === 'macro' ? 'Macro Stress' : p.name === 'internal' ? 'Wellbeing Signal' : 'Org-Specific Stress'}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EconomicStressCorrelator: React.FC = () => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #38bdf8', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <BarChart2 size={13} style={{ color: '#38bdf8' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Economic Stress Correlator</span>
      </div>
      <span className="badge" style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.22)' }}>Macro vs Internal</span>
    </div>

    <div className="p-5">
      {/* Attribution split */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.2)' }}>
          <p className="text-[24px] font-black" style={{ color: '#38bdf8', fontFamily: 'var(--font-display)', lineHeight: 1 }}>66%</p>
          <p className="text-[9px] mt-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>Economy-Driven</p>
          <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)' }}>External cause</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <p className="text-[24px] font-black" style={{ color: '#f43f5e', fontFamily: 'var(--font-display)', lineHeight: 1 }}>34%</p>
          <p className="text-[9px] mt-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>Org-Specific</p>
          <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)' }}>Fixable internally</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.2)' }}>
          <p className="text-[24px] font-black" style={{ color: '#fb923c', fontFamily: 'var(--font-display)', lineHeight: 1 }}>↑</p>
          <p className="text-[9px] mt-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>Org Share Growing</p>
          <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)' }}>+4pp last cycle</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="macro" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" strokeWidth={1.5} name="macro" />
          <Line type="monotone" dataKey="internal" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 3 }} name="internal" />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Insight */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.16)' }}>
          <Globe size={11} style={{ color: '#38bdf8', flexShrink: 0, marginTop: 1 }} />
          <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Economic headwinds account for <span className="font-bold text-white">66%</span> of current wellbeing decline. Not a management failure — a market condition.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.16)' }}>
          <Building2 size={11} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 1 }} />
          <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The remaining <span className="font-bold text-white">34%</span> is org-specific and growing. Intervention here yields direct ROI independent of macro conditions.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default EconomicStressCorrelator;

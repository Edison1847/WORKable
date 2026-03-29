import React from 'react';
import { motion } from 'framer-motion';
import { VolumeX, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const velocityData = [
  { cycle: 'C1', velocity: -2 },
  { cycle: 'C2', velocity: 1  },
  { cycle: 'C3', velocity: 4  },
  { cycle: 'C4', velocity: 8  },
  { cycle: 'C5', velocity: 12 },
  { cycle: 'C6', velocity: 9  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const val = payload[0].value;
    return (
      <div className="rounded-lg px-2.5 py-2" style={{ background: '#1a1a2e', border: '1px solid rgba(167,139,250,0.3)', fontSize: 10 }}>
        <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p style={{ color: val > 0 ? '#f43f5e' : '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {val > 0 ? '+' : ''}{val}pp velocity
        </p>
      </div>
    );
  }
  return null;
};

// SVG arc gauge for suppression index
const SuppressArc: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const startAngle = -210;
  const sweep = 240;
  const angle = startAngle + (pct / 100) * sweep;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const trackEnd = { x: cx + r * Math.cos(toRad(startAngle + sweep)), y: cy + r * Math.sin(toRad(startAngle + sweep)) };
  const trackStart = { x: cx + r * Math.cos(toRad(startAngle)), y: cy + r * Math.sin(toRad(startAngle)) };
  const fillEnd = { x: cx + r * Math.cos(toRad(angle)), y: cy + r * Math.sin(toRad(angle)) };
  const largeArcFlag = sweep > 180 ? 1 : 0;
  const fillLarge = (pct / 100) * sweep > 180 ? 1 : 0;
  return (
    <svg width={140} height={110} style={{ overflow: 'visible' }}>
      <path d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${trackEnd.x} ${trackEnd.y}`}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${fillLarge} 1 ${fillEnd.x} ${fillEnd.y}`}
        fill="none" stroke="url(#vsGrad)" strokeWidth={10} strokeLinecap="round" />
      <defs>
        <linearGradient id="vsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={22} fontWeight={800} fill="#f43f5e" fontFamily="var(--font-display)">{pct}%</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize={8} fill="var(--text-muted)" fontFamily="var(--font-mono)">SUPPRESSED</text>
    </svg>
  );
};

const VoiceSuppression: React.FC = () => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #f43f5e', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <VolumeX size={13} style={{ color: '#f43f5e' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Voice Suppression</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="badge" style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.22)' }}>Accelerating</span>
        <span className="badge" style={{ background: 'rgba(167,139,250,0.08)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.22)' }}>Q11 Longitudinal</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-0">
      {/* Index */}
      <div className="p-5 flex flex-col items-center justify-center" style={{ borderRight: '1px solid var(--border-1)' }}>
        <p className="eyebrow mb-2" style={{ color: 'var(--text-muted)' }}>Suppression Index</p>
        <SuppressArc pct={54} />
        <p className="text-[10px] text-center mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          54% of authentic sentiment<br />goes unexpressed
        </p>
      </div>

      {/* Velocity */}
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={11} style={{ color: '#fb923c' }} />
          <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>Suppression Velocity (pp/cycle)</p>
        </div>
        <p className="text-[10px] mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Rate of change <span className="font-semibold text-white">+9pp</span> in latest cycle — accelerating, not stabilising.
        </p>
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={velocityData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="cycle" tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="velocity" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>

        {/* Alert */}
        <div className="flex items-start gap-1.5 mt-3 rounded-lg p-2.5"
          style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.16)' }}>
          <AlertTriangle size={10} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 1 }} />
          <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Pre-crisis suppression velocity benchmark: <span className="font-bold" style={{ color: '#f43f5e' }}>+7pp</span>. Current: +9pp. Intervention required.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default VoiceSuppression;

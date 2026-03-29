import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const subScores = [
  { label: 'Psychological Safety', score: 72, benchmark: 65, trend: +4,  color: '#34d399' },
  { label: 'Experimentation Rate',  score: 58, benchmark: 61, trend: -2,  color: '#fb923c' },
  { label: 'Learning Velocity',     score: 61, benchmark: 58, trend: +3,  color: '#38bdf8' },
  { label: 'Idea-to-Action Flow',   score: 74, benchmark: 60, trend: +8,  color: '#a78bfa' },
  { label: 'Cross-Team Collision',  score: 43, benchmark: 55, trend: -5,  color: '#f43f5e' },
];

const overall = Math.round(subScores.reduce((s, x) => s + x.score, 0) / subScores.length);

// SVG radial gauge
const RadialGauge: React.FC<{ value: number; size?: number }> = ({ value, size = 130 }) => {
  const r = 48;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const startAngle = -210;
  const sweep = 240;
  const angle = startAngle + (value / 100) * sweep;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const arcPath = (start: number, end: number) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)),   y: cy + r * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const zones = [
    { start: -210, end: -130, color: '#f43f5e40' },
    { start: -130, end: -50,  color: '#fb923c40' },
    { start: -50,  end: 30,   color: '#34d39940' },
  ];

  const color = value >= 65 ? '#34d399' : value >= 45 ? '#fb923c' : '#f43f5e';

  return (
    <svg width={size} height={size - 10} style={{ overflow: 'visible' }}>
      {/* Zone segments */}
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.start, z.end)} fill="none" stroke={z.color} strokeWidth={10} strokeLinecap="butt" />
      ))}
      {/* Track */}
      <path d={arcPath(-210, 30)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} strokeLinecap="round" />
      {/* Fill */}
      <path d={arcPath(-210, angle)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
      {/* Value */}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={26} fontWeight={900} fill={color} fontFamily="var(--font-display)">{value}</text>
      <text x={cx} y={cy + 19} textAnchor="middle" fontSize={8} fill="var(--text-muted)" fontFamily="var(--font-mono)">/100</text>
    </svg>
  );
};

const InnovationPotential: React.FC = () => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #a78bfa', boxShadow: 'var(--shadow-md)' }}>

    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <Lightbulb size={13} style={{ color: '#a78bfa' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Innovation Potential</span>
      </div>
      <span className="badge" style={{ background: 'rgba(167,139,250,0.08)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.22)' }}>Top 23% of Sector</span>
    </div>

    <div className="p-5">
      <div className="grid grid-cols-5 gap-4">
        {/* Gauge */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <RadialGauge value={overall} />
          <div className="text-center mt-1">
            <p className="text-[10px] font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>Overall Score</p>
            <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)' }}>Industry avg: 58</p>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="col-span-3 space-y-3">
          {subScores.map((s, i) => {
            const vsIndustry = s.score - s.benchmark;
            const TIcon = s.trend > 0 ? TrendingUp : s.trend < 0 ? TrendingDown : Minus;
            const tColor = s.trend > 0 ? '#34d399' : s.trend < 0 ? '#f43f5e' : '#94a3b8';
            return (
              <motion.div key={s.label} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-white" style={{ fontFamily: 'var(--font-display)' }}>{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <TIcon size={9} style={{ color: tColor }} />
                    <span className="text-[9px] font-bold" style={{ color: s.color, fontFamily: 'var(--font-mono)' }}>{s.score}</span>
                    <span className="text-[8px]" style={{ color: vsIndustry >= 0 ? '#34d399' : '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                      {vsIndustry >= 0 ? '+' : ''}{vsIndustry}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {/* Benchmark marker */}
                  <div className="absolute top-0 bottom-0 w-px" style={{ left: `${s.benchmark}%`, background: 'rgba(255,255,255,0.3)' }} />
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08 }}
                    style={{ background: `linear-gradient(90deg, ${s.color}60, ${s.color})`, maxWidth: '100%' }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottleneck alert */}
      <div className="rounded-xl p-3 mt-4" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.18)' }}>
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-bold text-white">Cross-Team Collision</span> at 43 (industry: 55) is the primary innovation bottleneck.
          Teams are not colliding enough to spark novel combinations. Structural intervention required.
        </p>
      </div>
    </div>
  </div>
);

export default InnovationPotential;

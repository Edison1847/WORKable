import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, AlertTriangle, Info } from 'lucide-react';

const cohorts = [
  {
    origin: 'Ex-FinTech Startup',
    headcount: 11,
    spreading: 28,
    intensity: 92,
    color: '#f43f5e',
    level: 'CRITICAL',
    trait: 'Hustle / burnout tolerance spreading',
    x: 55, y: 38,
    r: 46,
  },
  {
    origin: 'Ex-Goldman Sachs',
    headcount: 23,
    spreading: 41,
    intensity: 74,
    color: '#fb923c',
    level: 'HIGH',
    trait: 'Hierarchy compliance, low autonomy signalling',
    x: 22, y: 55,
    r: 58,
  },
  {
    origin: 'Ex-Big4 Consulting',
    headcount: 18,
    spreading: 12,
    intensity: 32,
    color: '#38bdf8',
    level: 'LOW',
    trait: 'Structured process mindset — contained',
    x: 78, y: 62,
    r: 44,
  },
  {
    origin: 'Ex-Government',
    headcount: 8,
    spreading: 3,
    intensity: 14,
    color: '#34d399',
    level: 'CONTAINED',
    trait: 'Risk-averse patterns — not spreading',
    x: 38, y: 78,
    r: 28,
  },
  {
    origin: 'Ex-Corp Banking',
    headcount: 16,
    spreading: 6,
    intensity: 22,
    color: '#a78bfa',
    level: 'LOW',
    trait: 'Compliance-first mindset — minimal spread',
    x: 80, y: 30,
    r: 36,
  },
];

const levelColor: Record<string, string> = {
  CRITICAL: '#f43f5e',
  HIGH: '#fb923c',
  LOW: '#38bdf8',
  CONTAINED: '#34d399',
};

const CulturalContagionDNA: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #f43f5e', boxShadow: 'var(--shadow-md)' }}>

      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2">
          <Dna size={13} style={{ color: '#f43f5e' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Cultural Contagion DNA</span>
        </div>
        <span className="badge" style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.22)' }}>NLP Pattern Analysis</span>
      </div>

      <div className="p-5">
        <p className="text-[10px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Behavioural signal patterns from cohorts who joined from the same previous employer — and whether those patterns are
          <span className="font-semibold text-white"> spreading to colleagues</span> who did not come from that employer.
          Bubble size = cohort headcount. Colour intensity = contagion spread radius.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bubble map */}
          <div className="relative rounded-xl overflow-hidden" style={{ height: 240, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-1)' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Grid */}
              {[25, 50, 75].map(v => (
                <React.Fragment key={v}>
                  <line x1={v} y1={0} x2={v} y2={100} stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
                  <line x1={0} y1={v} x2={100} y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
                </React.Fragment>
              ))}
              {cohorts.map((c, i) => (
                <g key={i} style={{ cursor: 'pointer' }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  {/* Pulse ring for critical */}
                  {c.level === 'CRITICAL' && (
                    <circle cx={c.x} cy={c.y} r={c.r * 0.28 + 6} fill="none" stroke={c.color} strokeWidth={0.5} opacity={0.3}>
                      <animate attributeName="r" values={`${c.r * 0.28 + 4};${c.r * 0.28 + 10};${c.r * 0.28 + 4}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Spread ring */}
                  <circle cx={c.x} cy={c.y} r={c.r * 0.28 + 3}
                    fill={`${c.color}08`}
                    stroke={`${c.color}25`}
                    strokeWidth={0.5}
                    strokeDasharray="1.5 1" />
                  {/* Core bubble */}
                  <circle cx={c.x} cy={c.y} r={c.r * 0.22}
                    fill={hovered === i ? `${c.color}40` : `${c.color}20`}
                    stroke={c.color}
                    strokeWidth={hovered === i ? 1.2 : 0.7} />
                  {/* Label */}
                  <text x={c.x} y={c.y - 1} textAnchor="middle" fontSize={3.2} fill="white" fontFamily="var(--font-display)" fontWeight={700}>
                    {c.headcount}
                  </text>
                  <text x={c.x} y={c.y + 3.5} textAnchor="middle" fontSize={2.4} fill={c.color} fontFamily="var(--font-mono)">
                    →{c.spreading}
                  </text>
                </g>
              ))}
            </svg>
            <div className="absolute bottom-2 right-2">
              <Info size={10} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Legend / list */}
          <div className="space-y-2">
            {cohorts.map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                className="rounded-xl p-2.5 cursor-pointer transition-all"
                style={{
                  background: hovered === i ? `${c.color}12` : `${c.color}06`,
                  border: `1px solid ${c.color}${hovered === i ? '35' : '18'}`,
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{c.origin}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{ fontFamily: 'var(--font-mono)', background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30` }}>
                    {c.level}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>{c.headcount} in cohort</span>
                  <span className="text-[9px]" style={{ color: c.color, fontFamily: 'var(--font-mono)' }}>→ spreading to {c.spreading} colleagues</span>
                </div>
                <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.trait}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Critical alert */}
        <div className="flex items-start gap-2 mt-4 rounded-xl p-3"
          style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.18)' }}>
          <AlertTriangle size={11} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 1 }} />
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-bold text-white">Ex-FinTech cohort</span> (11 people) is driving burnout-tolerant behaviour across
            <span className="font-bold" style={{ color: '#f43f5e' }}> 28 colleagues</span> — a 2.5× contagion ratio.
            Intervention at source prevents systemic cultural drift.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CulturalContagionDNA;

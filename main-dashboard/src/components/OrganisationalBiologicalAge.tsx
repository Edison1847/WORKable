import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Heart, Zap, Wind, Dna, FlaskConical,
  AlertTriangle, TrendingDown, TrendingUp, Clock,
  ShieldCheck, Pill, ChevronRight, Info
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

// ─── Data ────────────────────────────────────────────────────────────────────

const chronAge = 12;   // years
const bioAge   = 8;    // years
const agingRate = 0.67;

const markers = [
  {
    bio: 'VO2 Max',
    org: 'Adaptive Capacity',
    signal: 'Nudge acceptance × signal improvement rate',
    score: 78,
    weight: 0.25,
    color: '#34d399',
    icon: Wind,
    trend: +4,
    code: 'HC-ADP-001',
    desc: 'Speed of response to change. High VO2 max orgs recover from disruption 2.3× faster.',
  },
  {
    bio: 'Telomere Length',
    org: 'Recovery Reserve',
    signal: 'HC-WEL-002 × Q10 sustainability',
    score: 61,
    weight: 0.20,
    color: '#38bdf8',
    icon: Heart,
    trend: -6,
    code: 'HC-WEL-002',
    desc: 'Protective capacity — how much stress the org can absorb before permanent damage. Declining.',
  },
  {
    bio: 'Cellular Senescence',
    org: 'Burnout Density',
    signal: 'HC-WEL-001 at critical threshold',
    score: 34,
    weight: 0.20,
    color: '#f43f5e',
    icon: Activity,
    trend: -12,
    code: 'HC-WEL-001',
    desc: 'Non-functioning people who remain and spread disengagement. Senescence burden doubled last cycle.',
  },
  {
    bio: 'Epigenetic Clock',
    org: 'Entropy Rate',
    signal: 'HC-ENT-001 rate of change',
    score: 55,
    weight: 0.15,
    color: '#fb923c',
    icon: Dna,
    trend: -8,
    code: 'HC-ENT-001',
    desc: 'True rate of organisational ageing — signal incoherence accumulation. Independent of headcount or revenue.',
  },
  {
    bio: 'Inflammatory Markers',
    org: 'Friction Load',
    signal: 'Q9 severity × headcount × frequency',
    score: 42,
    weight: 0.10,
    color: '#f97316',
    icon: Zap,
    trend: -5,
    code: 'HC-FRC-001',
    desc: 'Chronic systemic stress. Sustained high friction produces the organisational equivalent of CRP elevation.',
  },
  {
    bio: 'Neuroplasticity',
    org: 'Learning Loop Velocity',
    signal: 'L4 action state bridge timing',
    score: 71,
    weight: 0.10,
    color: '#a78bfa',
    icon: FlaskConical,
    trend: +7,
    code: 'HC-LRN-001',
    desc: 'Capacity to rewire and learn from interventions. Speed from nudge acceptance to measurable improvement.',
  },
];

const healthScore = markers.reduce((s, m) => s + m.score * m.weight, 0);
const computedBioAge = (chronAge * (1 - (healthScore - 50) / 100)).toFixed(1);

const historicalData = [
  { cycle: 'C1', bioAge: 10.2, chronAge: 10, agingRate: 0.85 },
  { cycle: 'C2', bioAge: 9.8,  chronAge: 10.5, agingRate: 0.78 },
  { cycle: 'C3', bioAge: 9.1,  chronAge: 11,   agingRate: 0.72 },
  { cycle: 'C4', bioAge: 8.6,  chronAge: 11.5, agingRate: 0.69 },
  { cycle: 'C5', bioAge: 8.0,  chronAge: 12,   agingRate: 0.67 },
];

const radarData = markers.map(m => ({ subject: m.bio.split(' ')[0], score: m.score, fullMark: 100 }));

const interventions = [
  {
    action: 'Reduce Senescence Burden by 15%',
    method: 'Exit or redeploy the top 8 chronically disengaged individuals. Prevent inflammation spread.',
    bioYearsSaved: 1.4,
    color: '#34d399',
    urgency: 'High',
  },
  {
    action: 'Restore Telomere Reserve',
    method: 'Mandatory recovery buffer policy + reduced meeting cognitive load. Target HC-WEL-002 above 70.',
    bioYearsSaved: 0.9,
    color: '#38bdf8',
    urgency: 'Medium',
  },
  {
    action: 'Lower Inflammatory Load',
    method: 'Eliminate top 3 friction sources from Q9. Each friction point removed adds 0.2 biological years.',
    bioYearsSaved: 0.6,
    color: '#a78bfa',
    urgency: 'Medium',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const AgingRateGauge: React.FC<{ rate: number }> = ({ rate }) => {
  const cx = 80; const cy = 80; const r = 60;
  const toRad = (d: number) => d * Math.PI / 180;
  const zones = [
    { start: -200, end: -120, color: '#34d399', label: 'Younger' },
    { start: -120, end: -40,  color: '#fb923c', label: 'Neutral' },
    { start: -40,  end: 40,   color: '#f43f5e', label: 'Aging Fast' },
  ];
  const arc = (s: number, e: number) => {
    const p1 = { x: cx + r * Math.cos(toRad(s)), y: cy + r * Math.sin(toRad(s)) };
    const p2 = { x: cx + r * Math.cos(toRad(e)), y: cy + r * Math.sin(toRad(e)) };
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${p2.x} ${p2.y}`;
  };
  // Needle: rate 0→0 maps to -200, rate 2→40
  const needleAngle = -200 + (rate / 2) * 240;
  const needleEnd = { x: cx + (r - 12) * Math.cos(toRad(needleAngle)), y: cy + (r - 12) * Math.sin(toRad(needleAngle)) };
  const color = rate < 1 ? '#34d399' : rate < 1.35 ? '#fb923c' : '#f43f5e';

  return (
    <svg width={160} height={120} style={{ overflow: 'visible' }}>
      {zones.map((z, i) => (
        <path key={i} d={arc(z.start, z.end)} fill="none" stroke={z.color} strokeWidth={12} strokeLinecap="butt" opacity={0.3} />
      ))}
      <path d={arc(-200, needleAngle)} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="white" />
      {/* Value */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={20} fontWeight={900} fill={color} fontFamily="var(--font-display)">{rate}×</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize={7.5} fill="var(--text-muted)" fontFamily="var(--font-mono)">AGEING RATE</text>
      {/* Zone labels */}
      <text x={cx - 60} y={cy + 10} textAnchor="middle" fontSize={6} fill="#34d399" fontFamily="var(--font-mono)">Younger</text>
      <text x={cx + 60} y={cy + 10} textAnchor="middle" fontSize={6} fill="#f43f5e" fontFamily="var(--font-mono)">Aging</text>
      <text x={cx} y={cy - 48} textAnchor="middle" fontSize={6} fill="#fb923c" fontFamily="var(--font-mono)">1×</text>
      {/* Danger threshold tick */}
      {(() => {
        const ta = -200 + (1.35 / 2) * 240;
        const tp = { x: cx + (r - 18) * Math.cos(toRad(ta)), y: cy + (r - 18) * Math.sin(toRad(ta)) };
        const tp2 = { x: cx + r * Math.cos(toRad(ta)), y: cy + r * Math.sin(toRad(ta)) };
        return <line x1={tp.x} y1={tp.y} x2={tp2.x} y2={tp2.y} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="2 1" />;
      })()}
    </svg>
  );
};

const MarkerTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-2.5 py-2 space-y-1" style={{ background: '#1a1a2e', border: '1px solid rgba(167,139,250,0.3)', fontSize: 10 }}>
        <p style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color ?? '#a78bfa', fontFamily: 'var(--font-mono)' }}>
            {p.name === 'bioAge' ? 'Biological Age' : p.name === 'chronAge' ? 'Chronological Age' : 'Ageing Rate'}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────

const OrganisationalBiologicalAge: React.FC = () => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const m = selectedMarker !== null ? markers[selectedMarker] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

      {/* ── HERO REVELATION ─────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(56,189,248,0.08) 50%, rgba(52,211,153,0.06) 100%)', border: '1px solid rgba(167,139,250,0.25)', boxShadow: '0 0 40px rgba(167,139,250,0.1)' }}>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 50%, #38bdf8 0%, transparent 50%)',
        }} />

        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)' }}>
              <Dna size={14} style={{ color: '#a78bfa' }} />
            </div>
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Organisational Biological Age</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded ml-1" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>HC-BIO-001</span>
            <span className="ml-auto badge" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>Decelerating ↓</span>
          </div>

          {/* The revelation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-[13px] mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                  NO BOARD HAS HEARD THIS SENTENCE BEFORE.
                </p>
                <p className="text-[28px] font-black leading-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  <span style={{ color: '#a78bfa' }}>This {chronAge}-year-old organisation</span>
                  <span className="text-white"> has the biological age of </span>
                  <span style={{ color: '#34d399' }}>{bioAge} years.</span>
                </p>
                <p className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                  It is{' '}
                  <span className="font-black text-white">33% younger than its years</span>
                  {' '}— but its senescence burden{' '}
                  <span style={{ color: '#f43f5e' }}>doubled last quarter.</span>
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: 480 }}>
                  Grounded in Horvath's epigenetic clock, cellular senescence research, and VO₂ max methodology —
                  applied to six organisational biomarkers. If the ageing rate reaches{' '}
                  <span className="font-bold" style={{ color: '#f43f5e' }}>1.35×</span>,
                  this organisation will exhaust its recovery reserve within{' '}
                  <span className="font-bold text-white">3 audit cycles</span>.
                </p>
              </motion.div>
            </div>

            {/* Age comparison */}
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Chronological', value: chronAge, unit: 'yrs', color: '#94a3b8', sub: 'Founded age' },
                  { label: 'Biological',    value: bioAge,   unit: 'yrs', color: '#34d399', sub: 'Functional age' },
                  { label: 'Ageing Rate',   value: agingRate, unit: '×', color: '#38bdf8', sub: 'Decelerating ↓' },
                  { label: 'Youth Surplus', value: 4,        unit: 'yrs', color: '#a78bfa', sub: 'Years of reserve' },
                ].map((k, i) => (
                  <motion.div key={k.label}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.08 }}
                    className="rounded-xl p-3 text-center"
                    style={{ background: `${k.color}10`, border: `1px solid ${k.color}28` }}>
                    <p className="text-[22px] font-black" style={{ color: k.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {k.value}<span className="text-[14px]">{k.unit}</span>
                    </p>
                    <p className="text-[9px] font-bold mt-1 text-white" style={{ fontFamily: 'var(--font-display)' }}>{k.label}</p>
                    <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.sub}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: AGING RATE + RECOVERY RESERVE + SENESCENCE ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Ageing Rate Gauge */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #38bdf8', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={13} style={{ color: '#38bdf8' }} />
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Ageing Rate Gauge</span>
          </div>
          <div className="flex justify-center">
            <AgingRateGauge rate={agingRate} />
          </div>
          <div className="space-y-2 mt-2">
            {[
              { range: '< 1.0×', meaning: 'Org younger than its years',    color: '#34d399' },
              { range: '1.0–1.35×', meaning: 'Neutral — watch closely',    color: '#fb923c' },
              { range: '> 1.35×', meaning: 'Critical — exhaustion ahead',  color: '#f43f5e' },
            ].map(z => (
              <div key={z.range} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: z.color }} />
                <span className="text-[9px] font-bold" style={{ color: z.color, fontFamily: 'var(--font-mono)', minWidth: 56 }}>{z.range}</span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{z.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Reserve */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #f43f5e', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={13} style={{ color: '#f43f5e' }} />
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Recovery Reserve</span>
          </div>

          <div className="text-center mb-4">
            <p className="text-[36px] font-black" style={{ color: '#fb923c', fontFamily: 'var(--font-display)', lineHeight: 1 }}>61%</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>of reserve remaining</p>
          </div>

          {/* Depleting bar */}
          <div className="relative h-6 rounded-xl overflow-hidden mb-3" style={{ background: 'rgba(244,63,94,0.1)' }}>
            <motion.div className="h-full rounded-xl"
              initial={{ width: '100%' }} animate={{ width: '61%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ background: 'linear-gradient(90deg, #34d399, #fb923c)', position: 'relative' }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.3) 8px, rgba(0,0,0,0.3) 9px)' }} />
            </motion.div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Reserve depleted</span>
              <span className="text-[10px] font-bold" style={{ color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>39%</span>
            </div>
            <div className="flex justify-between">
              <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Exhaustion at current rate</span>
              <span className="text-[10px] font-bold" style={{ color: '#fb923c', fontFamily: 'var(--font-mono)' }}>~6 cycles</span>
            </div>
            <div className="flex justify-between">
              <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>If senescence unaddressed</span>
              <span className="text-[10px] font-bold" style={{ color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>~3 cycles</span>
            </div>
          </div>

          <div className="mt-3 rounded-lg p-2.5" style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.18)' }}>
            <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Reserve depletion is <span className="font-bold" style={{ color: '#f43f5e' }}>accelerating</span> — senescence burden doubled last cycle, consuming reserve 1.8× faster than baseline.
            </p>
          </div>
        </div>

        {/* Senescence Burden */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #fb923c', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} style={{ color: '#fb923c' }} />
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Senescence Burden</span>
          </div>

          <div className="text-center mb-4">
            <motion.p className="text-[36px] font-black" style={{ color: '#fb923c', fontFamily: 'var(--font-display)', lineHeight: 1 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>24%</motion.p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>burned-out but still present</p>
          </div>

          <div className="space-y-3">
            {[
              { cycle: 'C4', val: 12, label: 'Prior baseline' },
              { cycle: 'C5', val: 18, label: 'Last cycle' },
              { cycle: 'C6', val: 24, label: 'Current' },
            ].map((r, i) => (
              <div key={r.cycle}>
                <div className="flex justify-between mb-1">
                  <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>{r.cycle} — {r.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: i === 2 ? '#f43f5e' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{r.val}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${r.val * 2}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    style={{ background: i === 2 ? '#f43f5e' : '#fb923c80', maxWidth: '100%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg p-2.5" style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Cellular senescence <span className="font-bold text-white">doubled in 2 cycles</span> — from 12% to 24%.
              Senescent individuals spread disengagement to 2.1× their direct network.
            </p>
          </div>
        </div>
      </div>

      {/* ── ROW 3: 6 BIOLOGICAL MARKERS ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-md)' }}>

        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <div className="flex items-center gap-2">
            <FlaskConical size={13} style={{ color: '#a78bfa' }} />
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>The 6 Biological Markers</span>
          </div>
          <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Grounded in Horvath's Epigenetic Clock methodology</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Radar */}
            <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} />
                  <Radar name="Score" dataKey="score" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Marker cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {markers.map((marker, i) => {
                const Icon = marker.icon;
                const isSelected = selectedMarker === i;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="rounded-xl p-3.5 cursor-pointer transition-all"
                    style={{
                      background: isSelected ? `${marker.color}12` : `${marker.color}07`,
                      border: `1px solid ${marker.color}${isSelected ? '35' : '1a'}`,
                      boxShadow: isSelected ? `0 0 14px ${marker.color}20` : undefined,
                    }}
                    onClick={() => setSelectedMarker(isSelected ? null : i)}>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Icon size={11} style={{ color: marker.color }} />
                        <span className="text-[9px] font-bold" style={{ color: marker.color, fontFamily: 'var(--font-mono)' }}>{marker.bio}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {marker.trend > 0 ? <TrendingUp size={9} style={{ color: '#34d399' }} /> : <TrendingDown size={9} style={{ color: '#f43f5e' }} />}
                        <span className="text-[8px]" style={{ color: marker.trend > 0 ? '#34d399' : '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                          {marker.trend > 0 ? '+' : ''}{marker.trend}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-[20px] font-black" style={{ color: marker.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{marker.score}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{marker.org}</p>
                      </div>
                      <span className="text-[8px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        wt: {(marker.weight * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${marker.score}%` }}
                        transition={{ duration: 0.9, delay: i * 0.08 }}
                        style={{ background: marker.color, maxWidth: '100%' }} />
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                          <p className="text-[9px] mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{marker.desc}</p>
                          <p className="text-[8px] mt-1.5" style={{ fontFamily: 'var(--font-mono)', color: marker.color }}>{marker.signal}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 4: HISTORICAL TRAJECTORY + CRISIS HORIZON ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Historical trajectory */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #38bdf8', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
            <Clock size={13} style={{ color: '#38bdf8' }} />
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Biological Age Trajectory</span>
          </div>
          <div className="p-5">
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Biological age has been <span className="font-semibold text-white">declining consistently</span> — the organisation is getting functionally younger. The gap between the two lines is your longevity advantage.
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={historicalData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="cycle" tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 15]} tick={{ fontSize: 8, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<MarkerTooltip />} />
                <Line type="monotone" dataKey="chronAge" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="chronAge" />
                <Line type="monotone" dataKey="bioAge" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 3 }} name="bioAge" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-[2px]" style={{ background: '#34d399' }} />
                <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Biological age</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-[2px]" style={{ background: 'rgba(255,255,255,0.25)', borderTop: '2px dashed rgba(255,255,255,0.25)' }} />
                <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Chronological age</span>
              </div>
            </div>
          </div>
        </div>

        {/* Crisis Horizon + Longevity Prescription */}
        <div className="space-y-4">
          {/* Crisis horizon */}
          <div className="rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(251,146,60,0.06) 100%)', border: '1px solid rgba(244,63,94,0.25)', boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={13} style={{ color: '#f43f5e' }} />
              <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Crisis Horizon</span>
            </div>
            <p className="text-[15px] font-bold leading-snug mb-3" style={{ color: 'var(--text-secondary)' }}>
              At current ageing rate{' '}
              <span style={{ color: '#fb923c' }}>+0.09×/cycle</span>,
              the critical threshold of{' '}
              <span className="text-white">1.35×</span>
              {' '}is reached in{' '}
              <span style={{ color: '#f43f5e' }} className="font-black text-[18px]">7 cycles.</span>
            </p>
            <div className="relative h-6 rounded-xl overflow-hidden mb-3" style={{ background: 'rgba(244,63,94,0.08)' }}>
              {/* Current position */}
              <div className="absolute top-0 h-full rounded-xl"
                style={{ width: `${(agingRate / 1.35) * 100}%`, background: 'linear-gradient(90deg, #34d399, #fb923c)', maxWidth: '100%' }} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: `${(agingRate / 1.35) * 100}%` }} />
              <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2">
                <span className="text-[8px] font-bold" style={{ color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>1.35×</span>
              </div>
            </div>
            <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Beyond 1.35× the org exhausts recovery reserve faster than it can replenish. Intervention cost at that stage is{' '}
              <span className="font-bold" style={{ color: '#f43f5e' }}>4.7× higher</span> than intervention cost today.
            </p>
          </div>
        </div>
      </div>

      {/* ── ROW 5: LONGEVITY PRESCRIPTION ───────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #34d399', boxShadow: 'var(--shadow-md)' }}>

        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <Pill size={13} style={{ color: '#34d399' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Longevity Prescription</span>
          <span className="eyebrow ml-auto" style={{ color: 'var(--text-muted)' }}>Interventions that reduce biological age</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {interventions.map((iv, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-xl p-4"
                style={{ background: `${iv.color}07`, border: `1px solid ${iv.color}20` }}>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ fontFamily: 'var(--font-mono)', background: `${iv.color}14`, color: iv.color, border: `1px solid ${iv.color}28` }}>
                    {iv.urgency} Priority
                  </span>
                  <ChevronRight size={11} style={{ color: iv.color }} />
                </div>

                <p className="text-[12px] font-bold text-white mb-2 leading-snug" style={{ fontFamily: 'var(--font-display)' }}>{iv.action}</p>
                <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{iv.method}</p>

                <div className="rounded-lg p-2.5 text-center" style={{ background: `${iv.color}10`, border: `1px solid ${iv.color}20` }}>
                  <p className="text-[18px] font-black" style={{ color: iv.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>−{iv.bioYearsSaved} yrs</p>
                  <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>biological age reduction</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Combined impact */}
          <div className="mt-4 rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(90deg, rgba(52,211,153,0.08) 0%, rgba(167,139,250,0.06) 100%)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <ShieldCheck size={20} style={{ color: '#34d399', flexShrink: 0 }} />
            <div>
              <p className="text-[13px] font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Combined prescription saves{' '}
                <span style={{ color: '#34d399' }}>2.9 biological years</span>
                {' '}and moves ageing rate from 0.67× to an estimated{' '}
                <span style={{ color: '#34d399' }}>0.52×</span>.
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Achieving all three interventions within 2 cycles adds an estimated{' '}
                <span className="font-semibold text-white">6–8 additional high-performance cycles</span>
                {' '}before recovery reserve requires replenishment.
              </p>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default OrganisationalBiologicalAge;

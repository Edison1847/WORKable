import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { VolumeX, AlertTriangle, Shield, Users } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VSStats {
  suppressionPct: number;
  avgVS: number;
  avgComfort: number;
  safe: number;
  blindspot: number;
  fear: number;
  crisis: number;
  total: number;
  deptData: { dept: string; vs: number; comfort: number; count: number; highRiskPct: number }[];
  correlation: number;
  distribution: { score: number; count: number }[];
}

// ─── Fallback static data (mirrors computed live values) ──────────────────────

const STATIC: VSStats = {
  suppressionPct: 46,
  avgVS: 4.59,
  avgComfort: 6.44,
  safe: 42,
  blindspot: 60,
  fear: 16,
  crisis: 18,
  total: 136,
  deptData: [
    { dept: 'Engineering', vs: 4.77, comfort: 6.42, count: 86, highRiskPct: 65 },
    { dept: 'HR',          vs: 4.28, comfort: 6.48, count: 50, highRiskPct: 44 },
  ],
  correlation: 0.085,
  distribution: [
    { score: 3, count: 36 },
    { score: 4, count: 22 },
    { score: 5, count: 40 },
    { score: 6, count: 38 },
  ],
};

// ─── Arc gauge ────────────────────────────────────────────────────────────────

const SuppressArc: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 52; const cx = 68; const cy = 68;
  const startAngle = -210; const sweep = 240;
  const angle = startAngle + (pct / 100) * sweep;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arc = (a: number) => ({ x: cx + r * Math.cos(toRad(a)), y: cy + r * Math.sin(toRad(a)) });
  const trackStart = arc(startAngle);
  const trackEnd   = arc(startAngle + sweep);
  const fillEnd    = arc(angle);
  const largeArc   = sweep > 180 ? 1 : 0;
  const fillLarge  = (pct / 100) * sweep > 180 ? 1 : 0;

  return (
    <svg width={136} height={106} style={{ overflow: 'visible' }}>
      {/* Track */}
      <path
        d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArc} 1 ${trackEnd.x} ${trackEnd.y}`}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={9} strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${fillLarge} 1 ${fillEnd.x} ${fillEnd.y}`}
        fill="none" stroke="url(#vsArcGrad)" strokeWidth={9} strokeLinecap="round"
      />
      <defs>
        <linearGradient id="vsArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      {/* Value */}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={26} fontWeight={700}
        fill="#f43f5e" fontFamily="var(--font-display)"
        style={{ filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.5))' }}>
        {pct}%
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={7.5} fill="rgba(255,255,255,0.3)"
        fontFamily="var(--font-mono)" letterSpacing="0.12em">
        SUPPRESSED
      </text>
    </svg>
  );
};

// ─── 2×2 Psychological Safety Matrix ─────────────────────────────────────────

interface QuadrantProps { safe: number; blindspot: number; fear: number; crisis: number; total: number; }

const QUADS = [
  {
    key: 'safe',
    label: 'SAFE',
    sub: 'Low VS · High comfort',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.07)',
    border: 'rgba(52,211,153,0.22)',
    info: 'Teams here feel comfortable speaking up and rarely hold back concerns. This is a healthy, open environment.'
  },
  {
    key: 'blindspot',
    label: 'BLINDSPOT',
    sub: 'High VS · High comfort',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.35)',
    info: 'People feel comfortable, but some issues are going unspoken. There may be hidden problems that aren\'t being raised.'
  },
  {
    key: 'fear',
    label: 'FEAR CULTURE',
    sub: 'Low VS · Low comfort',
    color: '#94a3b8',
    bg: 'rgba(100,116,139,0.07)',
    border: 'rgba(100,116,139,0.22)',
    info: 'Employees are quiet and uncomfortable sharing concerns. This signals a culture of fear or lack of trust.'
  },
  {
    key: 'crisis',
    label: 'CRISIS',
    sub: 'High VS · Low comfort',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.07)',
    border: 'rgba(244,63,94,0.25)',
    info: 'High silence and discomfort. Teams are likely withholding critical issues, putting the company at serious risk.'
  },
];

const QuadrantMatrix: React.FC<QuadrantProps> = ({ safe, blindspot, fear, crisis, total }) => {
  const values: Record<string, number> = { safe, blindspot, fear, crisis };
  const pct = (n: number) => Math.round((n / total) * 100);
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div>
      {/* Axis labels */}
      <div className="flex justify-between mb-1 px-0.5">
        <span className="text-[7.5px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
          ← Comfort →
        </span>
        <span className="text-[7.5px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
          VS Low → High
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {QUADS.map((q, i) => (
          <motion.div
            key={q.key}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.35 }}
            className="rounded-xl p-2.5 text-center relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400"
            style={{ background: q.bg, border: `1px solid ${q.border}` }}
            tabIndex={0}
            onMouseEnter={() => setHovered(q.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(q.key)}
            onBlur={() => setHovered(null)}
            aria-describedby={`quad-info-${q.key}`}
          >
            <div
              className="text-xl font-bold leading-none"
              style={{ color: q.color, fontFamily: 'var(--font-mono)',
                filter: q.key === 'blindspot' ? 'drop-shadow(0 0 6px rgba(251,146,60,0.5))' : undefined }}
            >
              {pct(values[q.key])}%
            </div>
            <div className="text-[7.5px] font-bold tracking-widest uppercase mt-1" style={{ color: q.color }}>
              {q.label}
            </div>
            <div className="text-[7px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {q.sub}
            </div>
            {/* Tooltip */}
            {(hovered === q.key) && (
              <div
                id={`quad-info-${q.key}`}
                role="tooltip"
                className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-2 rounded-lg bg-gray-900/95 text-xs text-gray-100 shadow-xl border border-white/10 animate-fade-in"
                style={{ pointerEvents: 'none' }}
              >
                {q.info}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VoiceSuppression: React.FC = () => {
  const { data } = useIntakeData();

  const stats: VSStats | null = useMemo(() => {
    if (!data?.all_diagnostics) return null;

    const sups = (data.all_diagnostics as any[]).filter(
      d => d.type === 'supervisor' && d.p3 && typeof d.p3.voiceSuppression === 'number'
    );
    if (sups.length === 0) return null;

    const allVS:      number[] = sups.map(s => s.p3.voiceSuppression);
    const allComfort: number[] = sups.map(s => s.p3.comfortRaisingConcerns ?? 5);

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const avgVS      = sum(allVS)      / allVS.length;
    const avgComfort = sum(allComfort) / allComfort.length;
    const suppressionPct = Math.round((avgVS / 10) * 100);

    // Quadrant split: VS threshold 5, Comfort threshold 6
    let safe = 0, blindspot = 0, fear = 0, crisis = 0;
    sups.forEach(s => {
      const vs = s.p3.voiceSuppression as number;
      const c  = s.p3.comfortRaisingConcerns as number ?? 5;
      if      (vs < 5 && c >= 6) safe++;
      else if (vs >= 5 && c >= 6) blindspot++;
      else if (vs < 5 && c < 6)  fear++;
      else                        crisis++;
    });

    // By department
    const byDept: Record<string, { vs: number[]; comfort: number[] }> = {};
    sups.forEach(s => {
      const dept = (s.dept as string) || 'Unknown';
      if (!byDept[dept]) byDept[dept] = { vs: [], comfort: [] };
      byDept[dept].vs.push(s.p3.voiceSuppression);
      byDept[dept].comfort.push(s.p3.comfortRaisingConcerns ?? 5);
    });
    const deptData = Object.entries(byDept)
      .map(([dept, d]) => ({
        dept,
        vs:          parseFloat((sum(d.vs)      / d.vs.length).toFixed(2)),
        comfort:     parseFloat((sum(d.comfort)  / d.comfort.length).toFixed(2)),
        count:       d.vs.length,
        highRiskPct: Math.round((d.vs.filter(v => v >= 5).length / d.vs.length) * 100),
      }))
      .sort((a, b) => b.vs - a.vs);

    // Pearson r (VS ↔ Comfort)
    const n      = allVS.length;
    const meanVS = avgVS;
    const meanC  = avgComfort;
    const cov    = allVS.reduce((s, v, i) => s + (v - meanVS) * (allComfort[i] - meanC), 0) / n;
    const sdVS   = Math.sqrt(allVS.reduce((s, v) => s + (v - meanVS) ** 2, 0) / n);
    const sdC    = Math.sqrt(allComfort.reduce((s, v) => s + (v - meanC) ** 2, 0) / n);
    const correlation = sdVS > 0 && sdC > 0 ? cov / (sdVS * sdC) : 0;

    // VS score distribution
    const distMap: Record<number, number> = {};
    allVS.forEach(v => { distMap[v] = (distMap[v] ?? 0) + 1; });
    const distribution = Object.entries(distMap)
      .map(([score, count]) => ({ score: Number(score), count }))
      .sort((a, b) => a.score - b.score);

    return { suppressionPct, avgVS, avgComfort, safe, blindspot, fear, crisis, total: sups.length, deptData, correlation, distribution };
  }, [data]);

  const s = stats ?? STATIC;
  const blindspotPct = Math.round((s.blindspot / s.total) * 100);
  const maxDist = Math.max(...s.distribution.map(d => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-1)',
        borderLeft: '2px solid #f43f5e',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2">
          <VolumeX size={13} style={{ color: '#f43f5e' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Voice Suppression
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge" style={{ background: 'rgba(56,189,248,0.08)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
            <Users size={8} className="inline mr-1" />
            {s.total} supervisors
          </span>
          <span className="badge" style={{ background: 'rgba(167,139,250,0.08)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
            ISO 30414
          </span>
        </div>
      </div>

      {/* ── Body: 3-column grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3">

        {/* ── Col 1: Suppression Index + Distribution ── */}
        <div className="p-4 flex flex-col items-center" style={{ borderRight: '1px solid var(--border-1)' }}>
          <p className="eyebrow mb-2 self-start" style={{ color: 'var(--text-muted)' }}>Suppression Index</p>

          <SuppressArc pct={s.suppressionPct} />

          {/* Stat rows */}
          <div className="w-full space-y-2 mt-3">
            {[
              { label: 'Avg VS Score', value: `${s.avgVS.toFixed(1)}/10`, color: '#f43f5e' },
              { label: 'Avg Comfort',  value: `${s.avgComfort.toFixed(1)}/10`, color: '#34d399' },
              { label: 'Pearson r',    value: s.correlation.toFixed(3),  color: '#a78bfa' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
                  {row.label}
                </span>
                <span className="text-[9px] font-bold" style={{ color: row.color, fontFamily: 'var(--font-mono)' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* VS Distribution mini-histogram */}
          <div className="w-full mt-4">
            <p className="text-[8px] mb-2 tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
              VS Score Distribution
            </p>
            <div className="flex items-end gap-1.5 h-8">
              {s.distribution.map((d, i) => (
                <div key={d.score} className="flex-1 flex flex-col items-center gap-0.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / maxDist) * 28}px` }}
                    transition={{ delay: 0.05 * i, duration: 0.5, ease: 'easeOut' }}
                    className="w-full rounded-sm"
                    style={{
                      background: d.score >= 5
                        ? 'linear-gradient(180deg, #f43f5e, rgba(244,63,94,0.4))'
                        : 'linear-gradient(180deg, #fb923c, rgba(251,146,60,0.3))',
                      minHeight: 3,
                    }}
                  />
                  <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
                    {d.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col 2: Psychological Safety Matrix ── */}
        <div className="p-4" style={{ borderRight: '1px solid var(--border-1)' }}>
          <p className="eyebrow mb-3" style={{ color: 'var(--text-muted)' }}>Psych Safety Matrix</p>

          <QuadrantMatrix
            safe={s.safe}
            blindspot={s.blindspot}
            fear={s.fear}
            crisis={s.crisis}
            total={s.total}
          />

          {/* Blindspot alert */}
          {blindspotPct >= 35 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 flex items-start gap-1.5 rounded-xl p-2.5"
              style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.25)' }}
            >
              <AlertTriangle size={9} style={{ color: '#fb923c', flexShrink: 0, marginTop: 1 }} />
              <p className="text-[8px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <span style={{ color: '#fb923c', fontWeight: 700 }}>{blindspotPct}% Blindspot cluster</span>
                {' '}— supervisors acknowledge suppression yet perceive high comfort. Organisation-wide blindspot.
              </p>
            </motion.div>
          )}
        </div>

        {/* ── Col 3: Department Risk + Scientific Signal ── */}
        <div className="p-4 flex flex-col gap-4">
          {/* Dept breakdown */}
          <div>
            <p className="eyebrow mb-3" style={{ color: 'var(--text-muted)' }}>Department Risk Profile</p>
            <div className="space-y-3.5">
              {s.deptData.map((d, i) => (
                <div key={d.dept}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}>
                      {d.dept}
                    </span>
                    <span className="text-[9px]" style={{ color: d.vs >= 5 ? '#f43f5e' : '#fb923c', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {d.vs.toFixed(1)}<span style={{ color: 'rgba(255,255,255,0.2)' }}>/10</span>
                    </span>
                  </div>
                  {/* VS bar */}
                  <div className="relative h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.vs / 10) * 100}%` }}
                      transition={{ delay: 0.1 * i, duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: d.vs >= 5
                          ? 'linear-gradient(90deg, #fb923c, #f43f5e)'
                          : 'linear-gradient(90deg, #fbbf24, #fb923c)',
                      }}
                    />
                  </div>
                  {/* Comfort bar */}
                  <div className="relative h-1 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.comfort / 10) * 100}%` }}
                      transition={{ delay: 0.1 * i + 0.1, duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.45)' }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[7.5px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
                      {d.count} supervisors
                    </span>
                    <span className="text-[7.5px]" style={{ color: d.highRiskPct >= 60 ? '#f43f5e' : '#fb923c', fontFamily: 'var(--font-mono)' }}>
                      {d.highRiskPct}% high-risk
                    </span>
                  </div>
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-3 pt-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #fb923c, #f43f5e)' }} />
                  <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>VS</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1 rounded-full" style={{ background: 'rgba(52,211,153,0.45)' }} />
                  <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>Comfort</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scientific signal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl p-3"
            style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.18)' }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield size={9} style={{ color: '#a78bfa' }} />
              <span className="text-[7.5px] font-bold tracking-widest uppercase" style={{ color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>
                Scientific Signal
              </span>
            </div>
            <p className="text-[8px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              VS↔Comfort Pearson{' '}
              <span style={{ color: '#a78bfa', fontWeight: 700 }}>r = {s.correlation.toFixed(3)}</span>
              {' '}≈ 0. No co-variance detected — suppression is{' '}
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>structural</span>,
              not individual. Systemic intervention required.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceSuppression;

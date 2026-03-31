import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

type Trend = 'up' | 'down' | 'flat';

const gen = (trend: Trend, v: number) => {
  let c = 50;
  return Array.from({ length: 20 }, () => {
    c += trend === 'up' ? Math.random() * v : trend === 'down' ? -Math.random() * v : (Math.random() - .5) * v;
    return { value: Math.max(5, c) };
  });
};

const TrendIcon = ({ trend, color }: { trend: Trend; color: string }) => {
  if (trend === 'up')   return <ArrowUpRight   size={11} style={{ color }} />;
  if (trend === 'down') return <ArrowDownRight  size={11} style={{ color }} />;
  return <Minus size={11} style={{ color: 'var(--text-muted)' }} />;
};

const SignalPulseStrip: React.FC = () => {
  const { data } = useIntakeData();

  const signals = useMemo(() => {
    const workers = (data?.all_diagnostics || []).filter((d: any) => d.type === 'worker');
    if (workers.length === 0) return null;

    const avg = (key: string, path: string = 'p1') =>
      workers.reduce((s: number, d: any) => s + (d[path]?.[key] || 0), 0) / workers.length;

    // Time Allocation — % of time on low-criticality work
    let lowCritTime = 0, highCritTime = 0, totalTime = 0;
    workers.forEach((d: any) => {
      (d.activityDetails || []).forEach((a: any) => {
        totalTime += (a.percentTime || 0);
        if (a.criticality === 'Low')  lowCritTime  += (a.percentTime || 0);
        if (a.criticality === 'High') highCritTime += (a.percentTime || 0);
      });
    });
    const lowCritPct  = totalTime > 0 ? Math.round((lowCritTime / totalTime) * 100) : 0;
    const highCritPct = totalTime > 0 ? (highCritTime / totalTime) : 0;
    const timeTrend: Trend = lowCritPct > 25 ? 'up' : lowCritPct < 15 ? 'down' : 'flat';

    // Value Score — composite of high-value time + org health (0–10 scale)
    const avgOrgHealth = avg('orgHealth');
    const valueScore   = ((highCritPct * 5) + (avgOrgHealth / 10) * 5);
    const valueStr     = valueScore.toFixed(1);
    const valueTrend: Trend = valueScore < 4 ? 'down' : valueScore > 6 ? 'up' : 'flat';

    // Motivation Index — p4.enthusiasm max 21 days
    const avgEnth       = avg('enthusiasm', 'p4');
    const motivationPct = Math.round((avgEnth / 21) * 100);
    const motivTrend: Trend = motivationPct > 70 ? 'up' : motivationPct < 50 ? 'down' : 'flat';

    // Control / Friction — legacy burden (higher = more friction)
    const avgLegacy   = avg('legacyBurden');
    const legacyPct   = Math.round((avgLegacy / 10) * 100);
    const frictionTrend: Trend = legacyPct > 50 ? 'up' : 'flat';

    // Systemic Blockers — workers with stacked burnout + capability gap
    const blockerCount = workers.filter(
      (d: any) => (d.p1?.burnout || 0) > 6 && (d.p1?.capGap || 0) > 5
    ).length;
    const blockerTrend: Trend = blockerCount > workers.length * 0.2 ? 'up' : 'flat';

    return [
      {
        id: 'time', name: 'Time Allocation', value: `${lowCritPct}%`,
        status: lowCritPct > 25 ? 'High Waste' : lowCritPct > 15 ? 'Moderate' : 'Efficient',
        color:  lowCritPct > 25 ? '#f43f5e'    : lowCritPct > 15 ? '#fb923c'   : '#34d399',
        trend: timeTrend, data: gen(timeTrend, 4),
      },
      {
        id: 'value', name: 'Value Score', value: valueStr,
        status: valueScore < 4 ? 'Critical' : valueScore < 6 ? 'Moderate' : 'Strong',
        color:  valueScore < 4 ? '#f43f5e'  : valueScore < 6 ? '#fb923c'   : '#34d399',
        trend: valueTrend, data: gen(valueTrend, 2),
      },
      {
        id: 'motivation', name: 'Motivation Index', value: `${motivationPct}%`,
        status: motivationPct > 70 ? 'Optimal'  : motivationPct > 50 ? 'Stable'  : 'Depleted',
        color:  motivationPct > 70 ? '#34d399'  : motivationPct > 50 ? '#38bdf8' : '#f43f5e',
        trend: motivTrend, data: gen(motivTrend, 3),
      },
      {
        id: 'control', name: 'Control / Friction',
        value:  legacyPct > 60 ? 'High' : legacyPct > 40 ? 'Moderate' : 'Low',
        status: legacyPct > 60 ? 'Elevated' : legacyPct > 40 ? 'Moderate' : 'Low',
        color:  legacyPct > 60 ? '#fb923c'  : legacyPct > 40 ? '#fb923c'  : '#34d399',
        trend: frictionTrend, data: gen(frictionTrend, 5),
      },
      {
        id: 'blockers', name: 'Systemic Blockers', value: `${blockerCount}`,
        status: blockerCount > workers.length * 0.3 ? 'Rising'   : blockerCount > 0 ? 'Moderate' : 'Low',
        color:  blockerCount > workers.length * 0.3 ? '#fb923c'  : blockerCount > 0 ? '#fb923c'   : '#34d399',
        trend: blockerTrend, data: gen(blockerTrend, 3),
      },
    ];
  }, [data]);

  if (!signals) return null;

  return (
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
};

export default SignalPulseStrip;

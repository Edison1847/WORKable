import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import useIntakeData from '../hooks/useIntakeData';

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
};

const FinancialImpactModel: React.FC = () => {
  const { data } = useIntakeData();

  const metrics = useMemo(() => {
    const workers = (data?.all_diagnostics || []).filter((d: any) => d.type === 'worker');
    if (workers.length === 0) {
      return [
        { label: 'Wasted salary / year', value: '$14.2M', sub: '14.8% of salary budget', color: '#f87171', isMock: false },
        { label: 'Revenue uplift potential', value: '$21.6M', sub: 'If high-value work resourced', color: '#34d399', isMock: true },
        { label: 'Attrition risk cost', value: '$4.8M', sub: '4 high performers at risk', color: '#fbbf24', isMock: false },
        { label: 'Cost of inaction / mo', value: '$1.18M', sub: 'If no action taken now', color: '#f87171', isMock: true },
      ];
    }

    const avgSalary = 85000;
    const avgCostToReplace = 1.5;

    let wastedSalarySum = 0;
    let atRiskCount = 0;

    workers.forEach((w: any) => {
      const capGap = w.p1?.capGap || w.payload?.p1?.capGap || 0;
      let lowCritTime = 0;
      let totalTime = 0;
      (w.activityDetails || []).forEach((a: any) => {
        totalTime += a.percentTime || 0;
        if (a.criticality === 'Low') lowCritTime += a.percentTime || 0;
      });
      const lowCritPct = totalTime > 0 ? lowCritTime / totalTime : 0;
      const efficiency = 100 - (lowCritPct * 100);

      if (capGap > 3 || efficiency < 60) {
        const wastePct = Math.max(0, (capGap / 10) * 0.5 + (1 - efficiency / 100) * 0.5);
        wastedSalarySum += avgSalary * wastePct;
      }

      const burnout = w.p1?.burnout || w.payload?.p1?.burnout || 0;
      const orgHealth = w.p1?.orgHealth || w.payload?.p1?.orgHealth || 5;
      const isHighPerformer = orgHealth >= 7 && (w.p1?.targetClarity || 5) >= 6;

      if (burnout >= 6 && isHighPerformer) {
        atRiskCount++;
      }
    });

    const wastedSalary = formatCurrency(wastedSalarySum);
    const wastedPct = Math.round((wastedSalarySum / (workers.length * avgSalary)) * 100);
    const attritionCost = formatCurrency(atRiskCount * avgSalary * avgCostToReplace);

    return [
      { label: 'Wasted salary / year', value: wastedSalary, sub: `${wastedPct}% of salary budget`, color: '#f87171', isMock: false,
        tooltip: wastedSalarySum > 0 ? `Estimated ${wastedPct}% of annual salary budget lost to inefficiencies and capability gaps` : 'No significant waste detected' },
      { label: 'Revenue uplift potential', value: '$21.6M', sub: 'If high-value work resourced', color: '#34d399', isMock: true,
        tooltip: 'Projected revenue if low-efficiency time is redirected to high-value activities (illustrative)' },
      { label: 'Attrition risk cost', value: attritionCost, sub: `${atRiskCount} high performers at risk`, color: '#fbbf24', isMock: false,
        tooltip: atRiskCount > 0 ? `Cost to replace ${atRiskCount} high performers at risk (1.5x annual salary each)` : 'No high-performers at risk detected' },
      { label: 'Cost of inaction / mo', value: '$1.18M', sub: 'If no action taken now', color: '#f87171', isMock: true,
        tooltip: 'Projected monthly cost if issues remain unaddressed (illustrative)' },
    ];
  }, [data]);

  const totalRecoverable = useMemo(() => {
    const wasted = metrics.find(m => m.label === 'Wasted salary / year');
    const uplift = metrics.find(m => m.label === 'Revenue uplift potential');
    if (!wasted || !uplift) return { value: '$35.8M', isMock: true };

    const wastedVal = parseFloat(wasted.value.replace(/[M,K]/g, '')) * (wasted.value.includes('M') ? 1000000 : 1000);
    const upliftVal = parseFloat(uplift.value.replace(/[M,K]/g, '')) * (uplift.value.includes('M') ? 1000000 : 1000);

    return { value: formatCurrency(wastedVal + upliftVal), isMock: true };
  }, [metrics]);

  const trendData = [
    { dim: 'Efficiency', a1: 55, a2: 58, a3: 62, a4: 65 },
    { dim: 'Alignment',  a1: 48, a2: 52, a3: 55, a4: 58 },
    { dim: 'Capability', a1: 72, a2: 76, a3: 78, a4: 81 },
    { dim: 'Energy',     a1: 54, a2: 57, a3: 60, a4: 62 },
    { dim: 'Execution',  a1: 65, a2: 68, a3: 71, a4: 74 },
  ];

  const auditColors = ['#60a5fa', '#fbbf24', '#f87171', '#34d399'];

  return (
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
            className="rounded-xl p-3.5 relative group"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)' }}>
            {m.isMock && (
              <span className="absolute top-2 right-2 text-[7px] font-semibold px-2 py-0.5 rounded"
                style={{ 
                  background: 'rgba(251,191,36,0.12)', 
                  color: '#fbbf24',
                  border: '1px solid rgba(251,191,36,0.25)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em'
                }}>
                Illustrative
              </span>
            )}
            <p className="eyebrow mb-2">{m.label}</p>
            <p className="text-[22px] font-bold leading-none mb-1.5"
              style={{ fontFamily: 'var(--font-display)', color: m.color, letterSpacing: '-0.5px' }}>
              {m.value}
            </p>
            <p className="text-[10px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {m.sub}
            </p>
            
            {/* Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 px-3 py-2 rounded-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                maxWidth: '240px',
              }}>
              {m.tooltip}
              <div className="absolute left-3 -bottom-1 w-2 h-2 rotate-45" style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total recoverable */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl px-4 py-4 relative"
        style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)' }}>
        <span className="absolute top-3 right-3 text-[7px] font-semibold px-2 py-0.5 rounded"
          style={{ 
            background: 'rgba(251,191,36,0.12)', 
            color: '#fbbf24',
            border: '1px solid rgba(251,191,36,0.25)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em'
          }}>
          Illustrative
        </span>
        <p className="eyebrow mb-2" style={{ color: '#34d399' }}>Total recoverable value</p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 26,
          fontWeight: 700,
          color: '#34d399',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}>
          {totalRecoverable.value}{' '}
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
            <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderRadius: 8, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
        />
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
};

export default FinancialImpactModel;

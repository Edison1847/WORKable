import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Info, AlertTriangle, TrendingUp, TrendingDown, Zap, Target, Shield, Brain } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

/* ── Cell colour helpers ──────────────────────────────────── */
const cellBg = (value: number, invert = false) => {
  const isPositive = invert ? value > 0 : value > 0;
  const abs = Math.abs(value);
  if (isPositive) {
    return abs > 1.5 ? 'rgba(52,211,153,0.38)' : abs > 0.6 ? 'rgba(52,211,153,0.22)' : 'rgba(52,211,153,0.10)';
  }
  return abs > 1.5 ? 'rgba(244,63,94,0.38)' : abs > 0.6 ? 'rgba(244,63,94,0.22)' : 'rgba(244,63,94,0.10)';
};

const cellText = (value: number, invert = false) => {
  const isPositive = invert ? value > 0 : value > 0;
  if (Math.abs(value) < 0.05) return 'rgba(255,255,255,0.35)';
  return isPositive ? '#4ade80' : '#f87171';
};

/* ── Column definitions ───────────────────────────────────── */
const COLUMNS = [
  { key: 'delegation',  label: 'Delegation Clarity',  unit: '',  invert: false },
  { key: 'alignment',   label: 'Alignment',            unit: '',  invert: false },
  { key: 'engagement',  label: 'Team Engagement',      unit: '',  invert: false },
  { key: 'stress',      label: 'Team Stress Burden',   unit: '%', invert: true  },
] as const;

type ColKey = typeof COLUMNS[number]['key'];

/* ── Insight engine types ─────────────────────────────────── */
interface InsightSignal {
  icon:  React.ReactNode;
  label: string;
  value: string;
  color: string;
}

interface Insight {
  headline:       string;
  headlineColor:  string;
  signals:        InsightSignal[];
  recommendation: string;
  recColor:       string;
}

interface ManagerRow {
  label:         string;
  delegation:    number;
  alignment:     number;
  engagement:    number;
  stress:        number;
  // raw metrics for insight generation
  burnout:       number;
  targetClarity: number;
  orgHealth:     number;
  enthusiasm:    number;
  capGap:        number;
  mei:           number;
}

/* ── Dynamic insight generator ───────────────────────────── */
const generateInsight = (m: ManagerRow): Insight => {
  const signals: InsightSignal[] = [];

  // Energy / Burnout signal
  const burnoutPct = Math.round((m.burnout / 10) * 100);
  signals.push({
    icon:  <Zap size={9} />,
    label: 'Burnout level',
    value: `${burnoutPct}%`,
    color: m.burnout >= 7 ? '#f87171' : m.burnout >= 4 ? '#fbbf24' : '#4ade80',
  });

  // Direction clarity signal
  const clarityPct = Math.round((m.targetClarity / 10) * 100);
  signals.push({
    icon:  <Target size={9} />,
    label: 'Direction clarity',
    value: `${clarityPct}%`,
    color: m.targetClarity >= 7 ? '#4ade80' : m.targetClarity >= 4 ? '#fbbf24' : '#f87171',
  });

  // Capability gap signal
  const capScore = Math.round(((10 - m.capGap) / 10) * 100);
  signals.push({
    icon:  <Brain size={9} />,
    label: 'Capability fit',
    value: `${capScore}%`,
    color: m.capGap <= 3 ? '#4ade80' : m.capGap <= 6 ? '#fbbf24' : '#f87171',
  });

  // Org health signal
  const healthPct = Math.round((m.orgHealth / 10) * 100);
  signals.push({
    icon:  <Shield size={9} />,
    label: 'Team health',
    value: `${healthPct}%`,
    color: m.orgHealth >= 7 ? '#4ade80' : m.orgHealth >= 4 ? '#38bdf8' : '#f87171',
  });

  // ── Headline + recommendation logic ──────────────────────
  // Priority: most critical pattern wins

  // Pattern: exhausted but high-performing
  if (m.burnout >= 7 && m.orgHealth >= 7) {
    return {
      headline:      'Overextended high-performer',
      headlineColor: '#fbbf24',
      signals,
      recommendation: 'Reduce load now — sustained burnout at this level predicts departure within 90 days despite strong output.',
      recColor: '#fbbf24',
    };
  }

  // Pattern: disengaged + burned out
  if (m.burnout >= 7 && m.enthusiasm < 10) {
    return {
      headline:      'Critical disengagement signal',
      headlineColor: '#f87171',
      signals,
      recommendation: 'Immediate 1:1 intervention required. Low enthusiasm combined with high burnout is the leading indicator of quiet quitting.',
      recColor: '#f87171',
    };
  }

  // Pattern: low clarity cascading to team
  if (m.targetClarity <= 3 && m.delegation < 0) {
    return {
      headline:      'Direction vacuum — cascading to team',
      headlineColor: '#f87171',
      signals,
      recommendation: 'Manager lacks clear targets. Without clarity at this level, team alignment collapses. CEO should reset objectives directly.',
      recColor: '#f87171',
    };
  }

  // Pattern: high cap gap
  if (m.capGap >= 7) {
    return {
      headline:      'Significant capability gap detected',
      headlineColor: '#fb923c',
      signals,
      recommendation: 'Role requirements outpace current capability. Consider structured upskilling or role re-scoping before performance degrades further.',
      recColor: '#fb923c',
    };
  }

  // Pattern: strong performer — above avg on all dims
  if (m.delegation > 0.5 && m.alignment > 0.5 && m.engagement > 0 && m.stress > 0) {
    return {
      headline:      'Above-baseline across all dimensions',
      headlineColor: '#4ade80',
      signals,
      recommendation: 'Strong candidate for expanded scope, cross-team mentorship, or lead role in strategic initiatives.',
      recColor: '#4ade80',
    };
  }

  // Pattern: high engagement but low alignment
  if (m.enthusiasm >= 15 && m.orgHealth < 5) {
    return {
      headline:      'Motivated but structurally constrained',
      headlineColor: '#38bdf8',
      signals,
      recommendation: 'High engagement is being absorbed by system friction. Removing structural blockers would unlock disproportionate output.',
      recColor: '#38bdf8',
    };
  }

  // Pattern: low engagement, decent scores elsewhere
  if (m.enthusiasm < 8 && m.burnout < 5) {
    return {
      headline:      'Low motivation — disengagement risk',
      headlineColor: '#fb923c',
      signals,
      recommendation: 'Burnout is not the driver here — this is motivational drift. Explore role meaning, growth trajectory, and recognition signals.',
      recColor: '#fb923c',
    };
  }

  // Pattern: moderate on all — stable but plateau
  if (m.mei >= 45 && m.mei <= 65) {
    return {
      headline:      'Stable — plateau risk emerging',
      headlineColor: '#38bdf8',
      signals,
      recommendation: 'Performance is steady but flat. Without active development, this profile tends to drift toward passive disengagement over 6–12 months.',
      recColor: '#38bdf8',
    };
  }

  // Pattern: low MEI overall
  if (m.mei < 45) {
    return {
      headline:      'Multi-factor underperformance',
      headlineColor: '#f87171',
      signals,
      recommendation: 'No single root cause — burnout, clarity, and capability gaps compound each other. Prioritise the highest-scoring blocker first.',
      recColor: '#f87171',
    };
  }

  // Default: healthy
  return {
    headline:      'Performing within healthy range',
    headlineColor: '#4ade80',
    signals,
    recommendation: 'Monitor engagement signals and clarity scores as workload scales. No immediate intervention required.',
    recColor: '#4ade80',
  };
};

/* ── Insight panel sub-component ─────────────────────────── */
const InsightPanel: React.FC<{ active: { row: ManagerRow; insight: Insight } | null }> = ({ active }) => (
  <div className="px-6">
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key={active.row.label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 rounded-xl p-4"
          style={{
            background:  'rgba(255,255,255,0.03)',
            border:      `1px solid ${active.insight.headlineColor}22`,
            borderLeft:  `3px solid ${active.insight.headlineColor}`,
          }}
        >
          {/* Headline + MEI */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              {active.insight.headlineColor === '#f87171'
                ? <AlertTriangle size={11} style={{ color: active.insight.headlineColor, flexShrink: 0 }} />
                : active.insight.headlineColor === '#4ade80'
                ? <TrendingUp size={11} style={{ color: active.insight.headlineColor, flexShrink: 0 }} />
                : <TrendingDown size={11} style={{ color: active.insight.headlineColor, flexShrink: 0 }} />
              }
              <span className="text-[12px] font-bold" style={{ fontFamily: 'var(--font-display)', color: active.insight.headlineColor }}>
                {active.insight.headline}
              </span>
              <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>
                · {active.row.label}
              </span>
            </div>
            {(() => {
              const meiPct = Math.round(active.row.mei);
              const meiColor = meiPct >= 70 ? '#4ade80' : meiPct >= 50 ? '#fbbf24' : '#f87171';
              return (
                <div className="shrink-0 px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: `${meiColor}15`, border: `1px solid ${meiColor}30` }}>
                  <span className="text-[9px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>MEI</span>
                  <span className="text-[14px] font-bold leading-none" style={{ fontFamily: 'var(--font-mono)', color: meiColor }}>{meiPct}</span>
                </div>
              );
            })()}
          </div>
          {/* Signal pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {active.insight.signals.map((sig, si) => (
              <div key={si} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: `${sig.color}12`, border: `1px solid ${sig.color}25` }}>
                <span style={{ color: sig.color }}>{sig.icon}</span>
                <span className="text-[9px]" style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.45)' }}>{sig.label}</span>
                <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: sig.color }}>{sig.value}</span>
              </div>
            ))}
          </div>
          {/* Recommendation */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ background: `${active.insight.recColor}09`, border: `1px solid ${active.insight.recColor}18` }}>
            <span className="text-[8px] font-bold uppercase tracking-widest shrink-0 mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: active.insight.recColor }}>Action</span>
            <p className="text-[10px] leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.55)' }}>{active.insight.recommendation}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ── Hierarchy rank ──────────────────────────────────────── */
const roleRank = (role: string): number => {
  const r = (role || '').toLowerCase();
  if (r.includes('chief') || r.includes('head') || r.includes('director') || r.includes('vp') || r.includes('president')) return 4;
  if (r.includes('senior') || r.includes('lead'))   return 3;
  if (r.includes('manager'))                         return 2;
  if (r.includes('junior') || r.includes('associate') || r.includes('engineer')) return 1;
  return 0;
};

/* ── Component ───────────────────────────────────────────── */
const ManagerEffectivenessScore: React.FC = () => {
  const { data } = useIntakeData();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const rows: ManagerRow[] | null = useMemo(() => {
    const allDiags = (data?.all_diagnostics || []) as any[];
    const supervisors = allDiags.filter((d: any) => d.type === 'supervisor');
    if (supervisors.length === 0) return null;

    const isOperations = (dept: string) => (dept || '').toLowerCase().includes('operation');

    const byDept: Record<string, any[]> = {};
    supervisors.forEach((s: any) => {
      const dept = s.dept || 'Unknown';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(s);
    });

    const selected: any[] = [];
    Object.entries(byDept).forEach(([dept, members]) => {
      if (isOperations(dept)) {
        selected.push(...members);
      } else {
        const top = members.reduce((best, m) =>
          roleRank(m.supervisorRole) >= roleRank(best.supervisorRole) ? m : best
        );
        selected.push(top);
      }
    });

    const computeMei = (s: any) => {
      const selfHealth   = Math.round((5 - Math.min(s.p1?.burnout || 0, 5)) / 5 * 100);
      const clarityScore = Math.round(Math.min(s.p1?.targetClarity || 0, 10) / 10 * 100);
      const capScore     = Math.round((10 - Math.min(s.p1?.capGap || 0, 10)) / 10 * 100);
      const engScore     = Math.round(Math.min(s.p3?.enthusiasm || 10, 25) / 25 * 100);
      const focusScore   = Math.max(0, Math.round(100 - Math.min(s.p3?.meetingsVsFocus || 50, 100)));
      return selfHealth * 0.25 + clarityScore * 0.25 + capScore * 0.15 + engScore * 0.20 + focusScore * 0.15;
    };

    const raw = selected.map((s: any) => ({
      targetClarity: (s.p1?.targetClarity || 0) as number,
      orgHealth:     (s.p1?.orgHealth     || 0) as number,
      enthusiasm:    (s.p3?.enthusiasm    || 0) as number,
      burnout:       (s.p1?.burnout       || 0) as number,
      capGap:        (s.p1?.capGap        || 0) as number,
      mei:           computeMei(s),
    }));

    const n = raw.length;
    const avgClarity   = raw.reduce((s, m) => s + m.targetClarity, 0) / n;
    const avgOrgHealth = raw.reduce((s, m) => s + m.orgHealth, 0) / n;
    const avgEnth      = raw.reduce((s, m) => s + m.enthusiasm, 0) / n;
    const avgBurnout   = raw.reduce((s, m) => s + m.burnout, 0) / n;

    const sorted = raw.slice().sort((a, b) => b.mei - a.mei);
    const top5    = sorted.slice(0, 5);
    const bottom5 = sorted.slice(-5);
    const display = sorted.length <= 10 ? sorted : [...top5, ...bottom5];

    return display.map((m, i) => ({
      label:         `MANAGER ${String.fromCharCode(65 + i)}`,
      delegation:    parseFloat((m.targetClarity - avgClarity).toFixed(1)),
      alignment:     parseFloat((m.orgHealth     - avgOrgHealth).toFixed(1)),
      engagement:    parseFloat((m.enthusiasm    - avgEnth).toFixed(1)),
      stress:        parseFloat(((avgBurnout - m.burnout) / 10 * 20).toFixed(1)),
      burnout:       m.burnout,
      targetClarity: m.targetClarity,
      orgHealth:     m.orgHealth,
      enthusiasm:    m.enthusiasm,
      capGap:        m.capGap,
      mei:           m.mei,
    }));
  }, [data]);

  const renderCell = (row: ManagerRow, col: typeof COLUMNS[number]) => {
    const val = row[col.key as ColKey] as number;
    const isStress = col.key === 'stress';
    const isPositive = col.invert ? val > 0 : val > 0;
    const fmt = isStress
      ? `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
      : `${val >= 0 ? '+' : ''}${val.toFixed(1)}`;
    const footnote = isStress ? (isPositive ? '(multipliers)' : '(warning)') : null;

    return (
      <td key={col.key} className="py-0.5 px-0.5">
        <div
          className="rounded-md px-2.5 py-2 flex items-center justify-center gap-1"
          style={{ background: cellBg(val, col.invert), minHeight: 34 }}
        >
          <span
            className="text-[13px] font-bold leading-none"
            style={{ fontFamily: 'var(--font-mono)', color: cellText(val, col.invert) }}
          >
            {fmt}
          </span>
          {footnote && (
            <span
              className="text-[9px] font-medium leading-none"
              style={{ fontFamily: 'var(--font-mono)', color: cellText(val, col.invert), opacity: 0.65 }}
            >
              {footnote}
            </span>
          )}
        </div>
      </td>
    );
  };

  const activeInsight = useMemo(() => {
    if (!hoveredLabel || !rows) return null;
    const row = rows.find(r => r.label === hoveredLabel);
    return row ? { row, insight: generateInsight(row) } : null;
  }, [hoveredLabel, rows]);

  if (!rows) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="rounded-2xl overflow-hidden"
      onMouseLeave={() => setHoveredLabel(null)}
      style={{
        background: 'var(--bg-card)',
        border:     '1px solid var(--border-1)',
        borderLeft: '3px solid #2dd4bf',
        boxShadow:  'var(--shadow-lg)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-1)', background: 'rgba(45,212,191,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <Lock size={12} style={{ color: '#2dd4bf' }} />
          <span className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
            PRIVATE CEO INSIGHT: MANAGER EFFECTIVENESS SCORE
          </span>
          <span
            className="text-[8.5px] font-bold px-2 py-0.5 rounded-full"
            style={{ fontFamily: 'var(--font-mono)', color: '#2dd4bf', background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.25)', letterSpacing: '0.06em' }}
          >
            ANONYMISED
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Info size={9} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)' }}>
            hover row for insight
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="px-6 py-5 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th style={{ width: 130 }} />
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="text-center pb-2 px-0.5"
                  style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em', verticalAlign: 'bottom' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 5 && (
              <tr aria-hidden>
                <td colSpan={5} className="pb-1 pt-0">
                  <div className="flex items-center gap-2">
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <span className="text-[8px] font-bold tracking-widest uppercase px-2" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}>top 5</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                  </div>
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <React.Fragment key={row.label}>
                {i === 5 && rows.length > 5 && (
                  <tr aria-hidden>
                    <td colSpan={5} className="py-1">
                      <div className="flex items-center gap-2">
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <span className="text-[8px] font-bold tracking-widest uppercase px-2" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}>lowest 5</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                      </div>
                    </td>
                  </tr>
                )}
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
                  onMouseEnter={() => setHoveredLabel(row.label)}
                  style={{ cursor: 'default' }}
                >
                  <td className="py-0.5 pr-3">
                    <span className="text-[11px] font-bold tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.65)' }}>
                      {row.label}
                    </span>
                  </td>
                  {COLUMNS.map(col => renderCell(row, col))}
                </motion.tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Insight panel (outside table — no layout shift) ── */}
      <InsightPanel active={activeInsight} />

      {/* ── Footer ── */}
      <div className="px-6 pb-5">
        <div style={{ height: 1, background: 'var(--border-1)', marginBottom: 12 }} />
        <p className="text-[9px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.22)' }}>
          Scores shown as deviation from team baseline. Stress burden shown as productivity-impact multiplier (positive = below-avg burnout).
          Managers anonymised for executive review · Live diagnostic sync
        </p>
      </div>
    </motion.div>
  );
};

export default ManagerEffectivenessScore;

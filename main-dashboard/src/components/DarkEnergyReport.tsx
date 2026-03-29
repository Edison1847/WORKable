import React from 'react';
import { motion } from 'framer-motion';
import { ScanEye } from 'lucide-react';

interface DarkForce {
  title: string;
  severity: number;
  severityLabel: string;
  description: string;
  sources: string[];
  departments: string[];
  color: string;
}

const FORCES: DarkForce[] = [
  {
    title: 'VOICE SUPPRESSION',
    severity: 74,
    severityLabel: 'High',
    description:
      'Employees consistently self-censor disagreement in cross-functional settings. Q11 response entropy shows systematic opinion suppression.',
    sources: ['Q11 entropy', 'Meeting cadence patterns'],
    departments: ['Engineering', 'Operations'],
    color: '#f43f5e',
  },
  {
    title: 'AMBIENT FEAR CULTURE',
    severity: 61,
    severityLabel: 'Moderate-High',
    description:
      'Punitive attribution detected — teams assign blame to individuals for systemic failures. Creates psychological safety deficit.',
    sources: ['Q9 friction language', 'NLP open-response analysis'],
    departments: ['Finance', 'Operations'],
    color: '#fb923c',
  },
  {
    title: 'ROLE AMBIGUITY ACCUMULATION',
    severity: 52,
    severityLabel: 'Moderate',
    description:
      '43% of workers cannot clearly define their decision-making authority boundaries. Accumulating since Q2.',
    sources: ['Control signal Q7+Q8', 'Delegation clarity patterns'],
    departments: ['All departments'],
    color: '#a78bfa',
  },
  {
    title: 'CHRONIC FRICTION TOLERANCE',
    severity: 82,
    severityLabel: 'Critical',
    description:
      'Workers have normalised systemic blockers. Friction no longer triggers escalation — a dangerous adaptive pattern.',
    sources: ['Q9 trend (8 cycles)', 'Time-signal correlation'],
    departments: ['Engineering', 'Operations', 'Finance'],
    color: '#dc2626',
  },
];

/* Small semicircle arc showing severity level */
const SeverityArc: React.FC<{ severity: number; color: string }> = ({ severity, color }) => {
  /* semicircle: 180° arc. We map severity 0-100 onto that arc.
     cx=24, cy=24, r=18, start at 180° (left) sweeping to 0° (right) */
  const r   = 18;
  const cx  = 24;
  const cy  = 24;
  /* Background: full 180° arc path */
  /* Active: partial arc proportional to severity */
  const startAngle  = Math.PI;   // 180°
  const totalAngle  = Math.PI;   // sweep 180°
  const activeAngle = (severity / 100) * totalAngle;
  const endAngle    = startAngle - activeAngle; // counter‑clockwise (SVG y is down, so subtract)

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = activeAngle > Math.PI ? 1 : 0;

  return (
    <svg width="48" height="30" viewBox="0 0 48 30" fill="none">
      {/* background */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* active */}
      <motion.path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
};

const ForceCard: React.FC<{ force: DarkForce; index: number }> = ({ force, index }) => {
  const isCritical = force.severity >= 70;

  return (
    <motion.div
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: `${force.color}0a`,
        border: `1px solid ${force.color}28`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Pulsing glow for severity >= 70 */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: `${force.color}10` }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
        />
      )}

      <div className="relative z-10">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p
              className="text-[11px] font-bold tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: force.color }}
            >
              {force.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[20px] font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: force.color, lineHeight: 1 }}
              >
                {force.severity}
              </span>
              <div>
                <p
                  className="text-[9px]"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                >
                  /100
                </p>
                <p
                  className="text-[9px] font-bold"
                  style={{ fontFamily: 'var(--font-mono)', color: force.color }}
                >
                  {force.severityLabel}
                </p>
              </div>
            </div>
          </div>
          <SeverityArc severity={force.severity} color={force.color} />
        </div>

        {/* Description */}
        <p
          className="text-[10px] leading-relaxed mb-3"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
        >
          {force.description}
        </p>

        {/* Severity bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: force.color }}
            initial={{ width: 0 }}
            animate={{ width: `${force.severity}%` }}
            transition={{ duration: 1, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Sources */}
        <div className="flex flex-wrap gap-1 mb-2">
          {force.sources.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded text-[8px]"
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Departments */}
        <p
          className="text-[9px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          <span style={{ color: force.color, fontWeight: 600 }}>Depts: </span>
          {force.departments.join(', ')}
        </p>
      </div>
    </motion.div>
  );
};

const DarkEnergyReport: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="rounded-2xl overflow-hidden"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-1)',
      borderLeft: '2px solid #a78bfa',
      boxShadow: 'var(--shadow-lg)',
    }}
  >
    {/* Header */}
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid var(--border-1)' }}
    >
      <div className="flex items-center gap-2">
        <ScanEye size={14} style={{ color: '#a78bfa' }} />
        <span
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Dark Energy Report
        </span>
        <span
          className="text-[9px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          AI-surfaced invisible organisational forces
        </span>
      </div>
      <div
        className="px-2.5 py-1 rounded-lg"
        style={{
          background: 'rgba(167,139,250,0.1)',
          border: '1px solid rgba(167,139,250,0.25)',
        }}
      >
        <span
          className="text-[9px] font-bold"
          style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}
        >
          NLP + Longitudinal Analysis
        </span>
      </div>
    </div>

    {/* 2x2 grid */}
    <div className="grid grid-cols-2 gap-4 p-5">
      {FORCES.map((force, i) => (
        <ForceCard key={force.title} force={force} index={i} />
      ))}
    </div>
  </motion.div>
);

export default DarkEnergyReport;

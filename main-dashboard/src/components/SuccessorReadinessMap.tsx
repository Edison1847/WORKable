import React from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';

/* Pentagon: 5 vertices, angles in degrees starting at top (270°), going CW by 72° */
const PENTAGON_ANGLES_DEG = [270, 342, 54, 126, 198];
const AXES = ['Leadership', 'Technical', 'Strategic', 'People', 'Execution'];
const CX = 80;
const CY = 80;
const MAX_R = 60;

function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function scoresToPoints(scores: number[]): string {
  return scores
    .map((s, i) => {
      const r = (s / 100) * MAX_R;
      const pt = polarToXY(PENTAGON_ANGLES_DEG[i], r);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');
}

/* Full outer pentagon (100% radius) for reference */
const outerPoints = PENTAGON_ANGLES_DEG.map((a) => {
  const pt = polarToXY(a, MAX_R);
  return `${pt.x},${pt.y}`;
}).join(' ');

/* Axis label offset — push slightly beyond MAX_R */
const LABEL_EXTRA_R = MAX_R + 14;

interface RoleData {
  title: string;
  readiness: number;
  months: number;
  roleFingerprint: number[];
  candidateFingerprint: number[];
  color: string;
  gaps: string[];
}

const ROLES: RoleData[] = [
  {
    title: 'Head of Operations',
    readiness: 76,
    months: 8,
    roleFingerprint: [85, 78, 82, 90, 88],
    candidateFingerprint: [72, 58, 68, 86, 74],
    color: '#38bdf8',
    gaps: ['Strategic Planning', 'Technical Depth', 'Process Design'],
  },
  {
    title: 'Head of Engineering',
    readiness: 58,
    months: 14,
    roleFingerprint: [75, 95, 80, 72, 92],
    candidateFingerprint: [48, 62, 52, 68, 72],
    color: '#fb923c',
    gaps: ['Leadership Presence', 'Strategic Vision', 'Team Management'],
  },
  {
    title: 'CFO Successor',
    readiness: 42,
    months: 22,
    roleFingerprint: [88, 85, 92, 80, 86],
    candidateFingerprint: [38, 45, 44, 52, 58],
    color: '#f43f5e',
    gaps: ['Financial Acumen', 'Board Communication', 'Risk Governance'],
  },
];

const RoleCard: React.FC<{ role: RoleData; index: number }> = ({ role, index }) => {
  const rolePts      = scoresToPoints(role.roleFingerprint);
  const candidatePts = scoresToPoints(role.candidateFingerprint);

  return (
    <motion.div
      className="rounded-xl overflow-hidden flex-1"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${role.color}30`,
        minWidth: 0,
      }}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Role title */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${role.color}25` }}
      >
        <div
          className="inline-block px-2 py-0.5 rounded mb-1"
          style={{
            background: `${role.color}18`,
            border: `1px solid ${role.color}35`,
          }}
        >
          <span
            className="text-[9px] font-bold tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: role.color }}
          >
            {role.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[22px] font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: role.color, lineHeight: 1 }}
          >
            {role.readiness}%
          </span>
          <div>
            <p className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Readiness
            </p>
            <p className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {role.months} months to ready
            </p>
          </div>
        </div>
      </div>

      {/* Pentagon radar */}
      <div className="flex justify-center py-3">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          {/* Axis grid lines (dim) */}
          {PENTAGON_ANGLES_DEG.map((a, i) => {
            const outer = polarToXY(a, MAX_R);
            return (
              <line
                key={`axis-${i}`}
                x1={CX}
                y1={CY}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Outer reference pentagon (role profile) */}
          <polygon
            points={outerPoints}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
            fill="none"
          />

          {/* Role fingerprint polygon (dashed, dim) */}
          <polygon
            points={rolePts}
            stroke={role.color}
            strokeWidth="1.5"
            strokeDasharray="3 2"
            fill={`${role.color}08`}
            opacity="0.5"
          />

          {/* Candidate fingerprint polygon (solid, coloured) */}
          <motion.polygon
            points={candidatePts}
            stroke={role.color}
            strokeWidth="2"
            fill={`${role.color}20`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          {/* Axis labels */}
          {AXES.map((ax, i) => {
            const pt = polarToXY(PENTAGON_ANGLES_DEG[i], LABEL_EXTRA_R);
            return (
              <text
                key={ax}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="rgba(255,255,255,0.4)"
                fontFamily="var(--font-mono)"
              >
                {ax}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Gaps */}
      <div
        className="px-4 pb-4"
        style={{ borderTop: `1px solid ${role.color}20`, paddingTop: 10 }}
      >
        <p
          className="text-[8.5px] font-bold tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
        >
          DEVELOPMENT GAPS
        </p>
        <div className="space-y-1">
          {role.gaps.map((g) => (
            <div key={g} className="flex items-center gap-2">
              <div
                className="rounded-full shrink-0"
                style={{ width: 5, height: 5, background: role.color, opacity: 0.7 }}
              />
              <span
                className="text-[9.5px]"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
              >
                {g}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SuccessorReadinessMap: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="rounded-2xl overflow-hidden"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-1)',
      borderLeft: '2px solid #38bdf8',
      boxShadow: 'var(--shadow-lg)',
    }}
  >
    {/* Header */}
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid var(--border-1)' }}
    >
      <div className="flex items-center gap-2">
        <Network size={14} style={{ color: '#38bdf8' }} />
        <span
          className="text-sm font-bold text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Successor Readiness Map
        </span>
      </div>
      <span
        className="text-[10px]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
      >
        Signal fingerprint similarity vs. role profile
      </span>
    </div>

    {/* Legend */}
    <div
      className="flex items-center gap-5 px-6 py-2.5"
      style={{ borderBottom: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.015)' }}
    >
      <div className="flex items-center gap-2">
        <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
        <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Role Profile</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#38bdf8" strokeWidth="2" /></svg>
        <span className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Candidate Signal</span>
      </div>
    </div>

    {/* Role cards */}
    <div className="flex gap-4 p-5">
      {ROLES.map((role, i) => (
        <RoleCard key={role.title} role={role} index={i} />
      ))}
    </div>
  </motion.div>
);

export default SuccessorReadinessMap;

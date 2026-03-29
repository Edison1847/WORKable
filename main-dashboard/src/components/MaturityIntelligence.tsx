import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, DollarSign, Sparkles,
  BarChart2, Activity, ArrowRight, Star, Flame, RefreshCw,
  Network, Eye, FileText
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, LineChart,
  Line, CartesianGrid, ReferenceLine, Cell,
} from 'recharts';
import {
  DEPARTMENTS, MATURITY_LEVELS, DEMO_SCORES, UNLOCK_CONDITIONS,
  BLOCKER_RELATIONS, ROI_DATA, SHADOW_MATURITY,
  scoreToLevel, computeOrgScore,
} from '../data/maturityData';
import type { ScoresMap } from '../data/maturityData';

// ─────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────
const EMERALD  = '#10b981';
const EMERALD_DIM  = 'rgba(16,185,129,0.08)';
const EMERALD_GLOW = 'rgba(16,185,129,0.18)';
const SCALE_LABELS = ['', 'Not at all', 'Rarely', 'Sometimes', 'Mostly', 'Completely'];

const SECTION_FADE = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ─────────────────────────────────────────────────────────────────
//  SectionHeader
// ─────────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; sub: string; badge?: string }> = ({ icon, title, sub, badge }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: EMERALD_DIM, border: `1px solid ${EMERALD_GLOW}` }}>
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>
      </div>
    </div>
    {badge && (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: EMERALD_DIM, color: EMERALD, border: `1px solid ${EMERALD_GLOW}`, fontFamily: 'var(--font-mono)' }}>
        {badge}
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────
//  Assessment Modal
// ─────────────────────────────────────────────────────────────────
interface AssessmentModalProps {
  deptId: string;
  existingAnswers?: Record<string, number>;
  onSubmit: (deptId: string, answers: Record<string, number>) => void;
  onClose: () => void;
}
const AssessmentModal: React.FC<AssessmentModalProps> = ({ deptId, existingAnswers, onSubmit, onClose }) => {
  const dept = DEPARTMENTS.find(d => d.id === deptId);
  if (!dept) return null;

  const [answers, setAnswers] = useState<Record<string, number>>(existingAnswers ?? {});
  const allAnswered = dept.questions.every(q => answers[q.id] !== undefined);
  const progress = (Object.keys(answers).length / dept.questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 24, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: `1px solid ${dept.borderColor}`, boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${dept.borderColor}` }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4" style={{ background: dept.bgColor, borderBottom: '1px solid var(--border-1)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dept.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: dept.color, fontFamily: 'var(--font-mono)' }}>Maturity Assessment</span>
                {dept.isSpecial && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${dept.color}22`, color: dept.color, fontFamily: 'var(--font-mono)' }}>Special</span>}
              </div>
              <h2 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{dept.name}</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{dept.description}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}>
              <X size={15} />
            </button>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>{Object.keys(answers).length}/{dept.questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: dept.color }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          <div className="grid grid-cols-5 gap-1 text-[9px] text-center mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 28 }}>
            {SCALE_LABELS.slice(1).map((l, i) => <span key={i}>{l}</span>)}
          </div>
          {dept.questions.map((q, idx) => (
            <div key={q.id}>
              <div className="flex gap-3 mb-2.5">
                <span className="text-[11px] font-semibold w-5 shrink-0 pt-0.5 text-right" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{idx + 1}</span>
                <p className="text-sm flex-1 leading-snug" style={{ color: answers[q.id] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{q.text}</p>
              </div>
              <div className="flex gap-1.5 pl-8">
                {[1, 2, 3, 4, 5].map(val => (
                  <button key={val} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      background: answers[q.id] === val ? `${dept.color}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${answers[q.id] === val ? dept.color : 'rgba(255,255,255,0.06)'}`,
                      color: answers[q.id] === val ? dept.color : 'var(--text-muted)',
                      boxShadow: answers[q.id] === val ? `0 0 16px ${dept.color}22` : 'none',
                      transition: 'all 0.15s ease',
                    }}>{val}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-1)', background: 'var(--bg-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {allAnswered ? 'All questions answered — ready to score' : `${dept.questions.length - Object.keys(answers).length} remaining`}
          </p>
          <button
            onClick={() => { if (allAnswered) onSubmit(deptId, answers); }}
            disabled={!allAnswered}
            className="px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
            style={{
              fontFamily: 'var(--font-display)',
              background: allAnswered ? EMERALD : 'rgba(255,255,255,0.04)',
              color: allAnswered ? '#000' : 'var(--text-muted)',
              opacity: allAnswered ? 1 : 0.5,
              transition: 'all 0.15s',
            }}>
            Calculate Score →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Maturity Level Badge
// ─────────────────────────────────────────────────────────────────
const LevelBadge: React.FC<{ level: number; score?: number; size?: 'sm' | 'md' | 'lg' }> = ({ level, score, size = 'md' }) => {
  const lvl = MATURITY_LEVELS[level];
  const px = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : size === 'lg' ? 'px-4 py-2 text-xs' : 'px-3 py-1 text-[10px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-bold ${px}`}
      style={{ background: lvl.bgColor, border: `1px solid ${lvl.borderColor}`, color: lvl.color, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lvl.color }} />
      L{level} · {lvl.name}
      {score !== undefined && <span style={{ opacity: 0.7 }}>({score.toFixed(1)})</span>}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Compute org-level insights
// ─────────────────────────────────────────────────────────────────
function computeInsights(scores: ScoresMap) {
  const deptScores = DEPARTMENTS.map(d => ({
    dept: d,
    score: scores[d.id]?.score ?? 0,
    level: scoreToLevel(scores[d.id]?.score ?? 0),
  }));

  const orgScore = computeOrgScore(scores);
  const orgLevel = scoreToLevel(orgScore);

  const atLevel1 = deptScores.filter(d => d.level === 1);
  const atLevel2 = deptScores.filter(d => d.level === 2);
  const atLevel3Plus = deptScores.filter(d => d.level >= 3);
  const lowest = [...deptScores].sort((a, b) => a.score - b.score).slice(0, 3);
  const highest = [...deptScores].sort((a, b) => b.score - a.score).slice(0, 3);

  const reasons: string[] = [];
  if (atLevel1.length > 0) reasons.push(`${atLevel1.map(d => d.dept.shortName).join(' & ')} ${atLevel1.length === 1 ? 'is' : 'are'} at critical Level 1 — dragging the organisation score down`);
  if (atLevel2.length > 6) reasons.push(`${atLevel2.length} departments are stuck at Level 2 — lacking standardised processes and consistent measurement`);
  if (atLevel3Plus.length < 4) reasons.push(`Only ${atLevel3Plus.length} department${atLevel3Plus.length !== 1 ? 's' : ''} ${atLevel3Plus.length !== 1 ? 'have' : 'has'} reached Level 3 — the organisation lacks a defined core`);
  if (deptScores.every(d => d.level < 4)) reasons.push('No department has reached Level 4 (Advanced) — predictive and optimising capability is completely absent');
  reasons.push(`Average org score of ${orgScore.toFixed(2)} puts the organisation firmly in "${MATURITY_LEVELS[orgLevel].name}" — ${MATURITY_LEVELS[orgLevel].tagline}`);

  const nextLevelThreshold = orgLevel < 5 ? [0, 1.8, 2.6, 3.4, 4.2, 5][orgLevel + 1] : 5;
  const gapToNextLevel = nextLevelThreshold - orgScore;

  const topPriorities: string[] = [];
  lowest.forEach(d => {
    const targetLevel = Math.min(d.level + 1, 5) as 2 | 3 | 4 | 5;
    const unlocks = UNLOCK_CONDITIONS[d.dept.id]?.[targetLevel];
    if (unlocks?.[0]) topPriorities.push(`[${d.dept.shortName}] ${unlocks[0]}`);
  });

  return { orgScore, orgLevel, deptScores, atLevel1, atLevel2, atLevel3Plus, lowest, highest, reasons, topPriorities, gapToNextLevel };
}

// ─────────────────────────────────────────────────────────────────
//  Department Assessment Card
// ─────────────────────────────────────────────────────────────────
const DeptCard: React.FC<{
  deptId: string;
  score: number;
  completedAt?: string;
  onAssess: () => void;
}> = ({ deptId, score, completedAt, onAssess }) => {
  const dept = DEPARTMENTS.find(d => d.id === deptId)!;
  const level = scoreToLevel(score);
  const lvl = MATURITY_LEVELS[level];
  const pct = ((score - 1) / 4) * 100;
  const nextLevel = Math.min(level + 1, 5);
  const nextThreshold = [0, 1.8, 2.6, 3.4, 4.2, 5][nextLevel] ?? 5;
  const gapPct = nextLevel <= 5 ? Math.round(((score - (nextThreshold - 1)) / 1) * 100) : 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onAssess}
      className="rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', transition: 'border-color 0.2s' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300" style={{ background: `radial-gradient(circle at center, ${dept.color}, transparent)` }} />
      
      <div className="p-4 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dept.color, boxShadow: `0 0 8px ${dept.color}` }} />
            <div>
              <p className="text-xs font-bold text-white leading-tight pr-2" style={{ fontFamily: 'var(--font-display)' }}>{dept.name}</p>
              {completedAt && <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Assessed {completedAt}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-end text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Maturity Level {level}</span>
            <span className="font-bold text-xs" style={{ color: lvl.color }}>{score.toFixed(1)}<span className="text-[9px] text-gray-500 font-normal">/5</span></span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${lvl.color}, ${dept.color})` }} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-1)' }}>
           <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
              {completedAt ? 'Re-assess' : 'Start Audit'}
           </span>
           <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-800 group-hover:bg-accent transition-colors">
             <ChevronRight size={12} className="text-gray-400 group-hover:text-white" />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  SVG Blocker Network
// ─────────────────────────────────────────────────────────────────
const NODE_POS: Record<string, { x: number; y: number }> = {
  it:        { x: 360, y: 190 },
  digital:   { x: 210, y: 320 },
  ai:        { x: 510, y: 320 },
  hr:        { x: 80,  y: 110 },
  finance:   { x: 80,  y: 260 },
  operations:{ x: 170, y: 390 },
  supply:    { x: 330, y: 390 },
  sales:     { x: 620, y: 200 },
  marketing: { x: 610, y: 330 },
  cs:        { x: 490, y: 410 },
  product:   { x: 520, y: 100 },
  rnd:       { x: 370, y: 55  },
  strategy:  { x: 230, y: 55  },
  legal:     { x: 100, y: 380 },
};

const BlockerNetwork: React.FC<{ scores: ScoresMap }> = ({ scores }) => {
  const SEVERITY_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

  function getEdge(from: string, to: string) {
    const a = NODE_POS[from], b = NODE_POS[to];
    if (!a || !b) return null;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist, ny = dy / dist;
    const R = 28;
    return { x1: a.x + nx * R, y1: a.y + ny * R, x2: b.x - nx * (R + 10), y2: b.y - ny * (R + 10) };
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
      <div className="px-5 pt-5 pb-3">
        <SectionHeader
          icon={<Network size={15} style={{ color: EMERALD }} />}
          title="Maturity Blocker Network"
          sub="Departments blocking each other from advancing — fix upstream to unlock downstream"
          badge="12 Dependencies"
        />
      </div>
      <div className="px-5 pb-5">
        <div className="relative w-full overflow-x-auto">
          <svg width="100%" viewBox="0 0 700 450" style={{ minWidth: 600 }}>
            <defs>
              {['high', 'medium', 'low'].map(sev => (
                <marker key={sev} id={`arrow-${sev}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                  <path d="M0,0 L7,2.5 L0,5 Z" fill={SEVERITY_COLOR[sev]} />
                </marker>
              ))}
            </defs>

            {/* Edges */}
            {BLOCKER_RELATIONS.map((rel, i) => {
              const edge = getEdge(rel.from, rel.to);
              if (!edge) return null;
              const col = SEVERITY_COLOR[rel.severity];
              return (
                <line key={i}
                  x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                  stroke={col} strokeWidth={rel.severity === 'high' ? 1.8 : 1.2}
                  strokeOpacity={0.65} strokeDasharray={rel.severity === 'low' ? '4 3' : undefined}
                  markerEnd={`url(#arrow-${rel.severity})`}
                />
              );
            })}

            {/* Nodes */}
            {DEPARTMENTS.map(dept => {
              const pos = NODE_POS[dept.id];
              if (!pos) return null;
              const score = scores[dept.id]?.score ?? 0;
              const level = scoreToLevel(score);
              const lvlColor = MATURITY_LEVELS[level].color;
              return (
                <g key={dept.id} transform={`translate(${pos.x},${pos.y})`}>
                  <circle r={28} fill={dept.bgColor} stroke={dept.borderColor} strokeWidth={1} />
                  <circle r={28} fill="none" stroke={lvlColor} strokeWidth={1.5} strokeOpacity={0.5} />
                  <text x={0} y={-4} textAnchor="middle" fill={dept.color} fontSize={9} fontFamily="var(--font-display)" fontWeight={700}>
                    {dept.shortName}
                  </text>
                  <text x={0} y={8} textAnchor="middle" fill={lvlColor} fontSize={8} fontFamily="var(--font-mono)">
                    L{level}·{score.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2">
          {(['high', 'medium', 'low'] as const).map(sev => (
            <div key={sev} className="flex items-center gap-2">
              <div className="w-8 h-px" style={{ background: SEVERITY_COLOR[sev] }} />
              <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sev} dependency</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Custom Tooltip
// ─────────────────────────────────────────────────────────────────
const ChartTooltip: React.FC<{ active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-2)', boxShadow: 'var(--shadow-md)' }}>
      <p className="text-[10px] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: p.color || 'white', fontFamily: 'var(--font-mono)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────
const MaturityIntelligence: React.FC = () => {
  const [scores, setScores] = useState<ScoresMap>(DEMO_SCORES);
  const [assessingDept, setAssessingDept] = useState<string | null>(null);
  const [justScored, setJustScored] = useState<string | null>(null);

  const insights = useMemo(() => computeInsights(scores), [scores]);

  const handleAssessmentSubmit = (deptId: string, answers: Record<string, number>) => {
    const vals = Object.values(answers);
    const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    setScores(prev => ({
      ...prev,
      [deptId]: { departmentId: deptId, answers, score: avg, completedAt: new Date().toISOString().slice(0, 10) },
    }));
    setAssessingDept(null);
    setJustScored(deptId);
    setTimeout(() => setJustScored(null), 3000);
  };

  const groupedDepts = useMemo(() => {
    const groups: Record<number, typeof DEPARTMENTS> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    DEPARTMENTS.forEach(dept => {
      const lvl = scoreToLevel(scores[dept.id]?.score ?? 0);
      groups[lvl].push(dept);
    });
    return groups;
  }, [scores]);

  // Chart data
  const radarData = DEPARTMENTS.map(d => ({
    dept: d.shortName,
    score: scores[d.id]?.score ?? 0,
    fullMark: 5,
  }));

  const shadowData = DEPARTMENTS.map(d => ({
    name: d.shortName,
    Actual: scores[d.id]?.score ?? 0,
    Perceived: SHADOW_MATURITY[d.id] ?? 0,
  }));

  const roiData = DEPARTMENTS.map(d => {
    const lvl = scoreToLevel(scores[d.id]?.score ?? 0);
    const nextLvl = Math.min(lvl + 1, 5);
    const r = ROI_DATA[d.id]?.[nextLvl];
    return { name: d.shortName, value: r?.annual ?? 0, color: d.color };
  }).sort((a, b) => b.value - a.value);

  const timeMachineData = [
    { period: "Sep'25", actual: 1.9 },
    { period: "Oct'25", actual: 2.0 },
    { period: "Nov'25", actual: 2.1 },
    { period: "Dec'25", actual: 2.1 },
    { period: "Jan'26", actual: 2.2 },
    { period: "Feb'26", actual: 2.2 },
    { period: "Mar'26", actual: insights.orgScore },
    { period: "Apr'26", base: insights.orgScore + 0.05, optimistic: insights.orgScore + 0.10 },
    { period: "Jun'26", base: insights.orgScore + 0.12, optimistic: insights.orgScore + 0.28 },
    { period: "Sep'26", base: insights.orgScore + 0.22, optimistic: insights.orgScore + 0.52 },
    { period: "Dec'26", base: insights.orgScore + 0.34, optimistic: insights.orgScore + 0.74 },
    { period: "Mar'27", base: insights.orgScore + 0.46, optimistic: insights.orgScore + 0.92 },
    { period: "Sep'27", base: insights.orgScore + 0.62, optimistic: insights.orgScore + 1.18 },
  ];

  const survivalData = [
    { year: 'Now',   current: 0,  improved: 0  },
    { year: 'Yr 1',  current: 8,  improved: 2  },
    { year: 'Yr 2',  current: 19, improved: 5  },
    { year: 'Yr 3',  current: 34, improved: 10 },
    { year: 'Yr 4',  current: 49, improved: 16 },
    { year: 'Yr 5',  current: 63, improved: 22 },
  ];

  const weatherData = DEPARTMENTS.map(d => {
    const s = scores[d.id]?.score ?? 0;
    const lvl = scoreToLevel(s);
    const nextThresh = [0, 1.8, 2.6, 3.4, 4.2, 5][Math.min(lvl + 1, 5)] ?? 5;
    const gap = nextThresh - s;
    const prob = gap < 0.2 ? 88 : gap < 0.4 ? 68 : gap < 0.6 ? 46 : gap < 0.8 ? 28 : 12;
    return { name: d.shortName, probability: prob, color: d.color };
  });

  const totalRoiIfLevel3 = DEPARTMENTS.reduce((sum, d) => {
    const lvl = scoreToLevel(scores[d.id]?.score ?? 0);
    if (lvl < 3) { sum += ROI_DATA[d.id]?.[3]?.annual ?? 0; }
    return sum;
  }, 0);

  const orgLevel = insights.orgLevel;
  const orgScore = insights.orgScore;
  const orgLvl = MATURITY_LEVELS[orgLevel];
  const nextOrgLevel = Math.min(orgLevel + 1, 5);
  const nextOrgLvl = MATURITY_LEVELS[nextOrgLevel];

  return (
    <div className="space-y-8">

      {/* ── Assessment modal ──────────────────────────────── */}
      <AnimatePresence>
        {assessingDept && (
          <AssessmentModal
            deptId={assessingDept}
            existingAnswers={scores[assessingDept]?.answers}
            onSubmit={handleAssessmentSubmit}
            onClose={() => setAssessingDept(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Hero: OMS + Reasons + Next Level Goals ─────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" className="grid grid-cols-5 gap-5">

        {/* Left: Current State */}
        <div className="col-span-3 rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: `1px solid ${orgLvl.borderColor}`, boxShadow: `0 0 60px ${orgLvl.color}0a` }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(ellipse at top left, ${orgLvl.color}08, transparent 65%)` }} />

          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Organisation Maturity Score</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black leading-none" style={{ fontFamily: 'var(--font-display)', color: orgLvl.color }}>{orgScore.toFixed(1)}</span>
                  <span className="text-xl text-white/40">/5.0</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <LevelBadge level={orgLevel} size="lg" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{orgLvl.tagline}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'At Level 1', value: insights.atLevel1.length, color: '#ef4444' },
                  { label: 'At Level 2', value: insights.atLevel2.length, color: '#f59e0b' },
                  { label: 'Level 3+',   value: insights.atLevel3Plus.length, color: EMERALD },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
                    <p className="text-2xl font-black leading-none mb-1" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-level progress track */}
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map(lvl => {
                const l = MATURITY_LEVELS[lvl];
                const filled = lvl <= orgLevel;
                const partial = lvl === orgLevel;
                return (
                  <div key={lvl} className="flex-1 rounded-lg overflow-hidden">
                    <div className="h-2 rounded-lg" style={{ background: filled ? l.color : 'rgba(255,255,255,0.05)' }} />
                    <p className="text-[8px] text-center mt-1" style={{ color: partial ? l.color : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{l.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Why section */}
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Why this score</p>
              <div className="space-y-2">
                {insights.reasons.map((r, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <AlertTriangle size={11} className="shrink-0 mt-0.5" style={{ color: i === 0 ? '#ef4444' : '#f59e0b' }} />
                    <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Path to next level */}
        <div className="col-span-2 rounded-2xl p-6 flex flex-col" style={{ background: 'var(--bg-card)', border: `1px solid ${nextOrgLvl.borderColor}` }}>
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Next Target</p>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Path to Level {nextOrgLevel}: <span style={{ color: nextOrgLvl.color }}>{nextOrgLvl.name}</span>
            </h3>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{nextOrgLvl.description}</p>
          </div>

          {/* Gap to next level */}
          <div className="rounded-xl p-3 mb-4" style={{ background: `${nextOrgLvl.color}08`, border: `1px solid ${nextOrgLvl.borderColor}` }}>
            <div className="flex justify-between text-[10px] mb-1.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              <span>Current: {orgScore.toFixed(2)}</span>
              <span>Target: {([0, 1.8, 2.6, 3.4, 4.2, 5][nextOrgLevel] ?? 5).toFixed(1)}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(((orgScore - 1) / 4) * 100, 100)}%`, background: `linear-gradient(90deg, ${orgLvl.color}, ${nextOrgLvl.color})` }} />
            </div>
            <p className="text-[10px] mt-1.5 text-center font-semibold" style={{ color: nextOrgLvl.color, fontFamily: 'var(--font-mono)' }}>
              Gap: +{insights.gapToNextLevel.toFixed(2)} points needed
            </p>
          </div>

          {/* Priority action list */}
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Critical Actions</p>
            <div className="space-y-2">
              {insights.topPriorities.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex gap-2.5 items-start p-2.5 rounded-xl"
                  style={{ background: `${nextOrgLvl.color}06`, border: `1px solid ${nextOrgLvl.color}18` }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: `${nextOrgLvl.color}18` }}>
                    <span className="text-[8px] font-black" style={{ color: nextOrgLvl.color }}>{i + 1}</span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{p}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Potential ROI unlock */}
          <div className="mt-4 rounded-xl p-3" style={{ background: EMERALD_DIM, border: `1px solid ${EMERALD_GLOW}` }}>
            <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>Total ROI if all depts reach L3</p>
            <p className="text-lg font-black" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>
              +${(totalRoiIfLevel3 / 1000).toFixed(0)}K<span className="text-xs font-normal text-white/40">/year</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Department Assessment Hub ──────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.05 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<BarChart2 size={15} style={{ color: EMERALD }} />}
          title="Department Assessment Hub"
          sub="Identify systemic capability gaps by maturity cohort. Click any capability node to audit."
          badge={`${Object.keys(scores).length}/${DEPARTMENTS.length} audited`}
        />

        <div className="mt-6 flex flex-col gap-6">
          {[1, 2, 3, 4, 5].map(level => {
            const depts = groupedDepts[level];
            if (depts.length === 0) return null;
            
            const lvlInfo = MATURITY_LEVELS[level];
            
            return (
              <div key={level}>
                <div className="flex items-center gap-3 mb-3 border-b border-gray-800 pb-2">
                   <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: `${lvlInfo.color}15`, border: `1px solid ${lvlInfo.color}33` }}>
                      <span className="text-[10px] font-black" style={{ color: lvlInfo.color }}>L{level}</span>
                   </div>
                   <h4 className="text-sm font-bold text-white tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)' }}>{lvlInfo.name}</h4>
                   <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{depts.length} Nodes</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {depts.map(dept => {
                    const s = scores[dept.id];
                    const isNew = justScored === dept.id;
                    return (
                      <motion.div key={dept.id}
                        animate={isNew ? { scale: [1, 1.04, 1], boxShadow: [`0 0 0px ${dept.color}00`, `0 0 24px ${dept.color}55`, `0 0 0px ${dept.color}00`] } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <DeptCard
                          deptId={dept.id}
                          score={s?.score ?? 2}
                          completedAt={s?.completedAt}
                          onAssess={() => setAssessingDept(dept.id)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Maturity Atlas ─────────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.08 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<Activity size={15} style={{ color: EMERALD }} />}
          title="Maturity Atlas"
          sub="Capability landscape across all 14 departments — shaped like your competitive moat"
        />
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="dept" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <Radar name="Maturity Score" dataKey="score" stroke={EMERALD} fill={EMERALD} fillOpacity={0.12} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 space-y-2.5">
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Department Rankings</p>
            {insights.deptScores.sort((a, b) => b.score - a.score).map(({ dept, score, level }) => {
              const pct = ((score - 1) / 4) * 100;
              const l = MATURITY_LEVELS[level];
              return (
                <div key={dept.id}>
                  <div className="flex justify-between text-[10px] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: dept.color }}>{dept.shortName}</span>
                    <span style={{ color: l.color }}>L{level} · {score.toFixed(1)}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: dept.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Blocker Network ────────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <BlockerNetwork scores={scores} />
      </motion.div>

      {/* ── Shadow Maturity ────────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.12 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<Eye size={15} style={{ color: EMERALD }} />}
          title="Shadow Maturity — The Gap"
          sub="What leadership believes vs. what the data shows — the most dangerous blind spot in any organisation"
          badge="Perception Gap"
        />
        <div className="mb-3 flex gap-5">
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 rounded" style={{ background: EMERALD }} /><span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Measured Actual</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 rounded" style={{ background: '#8b5cf6' }} /><span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Leadership Perceived</span></div>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shadowData} barSize={12} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={2.6} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 3" />
              <Bar dataKey="Actual"    fill={EMERALD}    radius={[3, 3, 0, 0]} fillOpacity={0.85} />
              <Bar dataKey="Perceived" fill="#8b5cf6"    radius={[3, 3, 0, 0]} fillOpacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
          Dashed line = Level 3 threshold (2.60). Leadership overestimates maturity by an average of <span style={{ color: '#ef4444' }}>+{(
            DEPARTMENTS.reduce((s, d) => s + (SHADOW_MATURITY[d.id] ?? 0) - (scores[d.id]?.score ?? 0), 0) / DEPARTMENTS.length
          ).toFixed(2)} points</span> — a significant blind spot.
        </p>
      </motion.div>

      {/* ── ROI Engine ─────────────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.14 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<DollarSign size={15} style={{ color: EMERALD }} />}
          title="Maturity ROI Engine"
          sub="Annual financial value unlocked by advancing each department to its next maturity level"
          badge={`$${(roiData.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}K total`}
        />
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiData} layout="vertical" barSize={14} margin={{ left: 40 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v}K`} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {roiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Time Machine ───────────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.16 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<Clock size={15} style={{ color: EMERALD }} />}
          title="Maturity Time Machine"
          sub="Historical trajectory + projected future with and without intervention — choose your path"
        />
        <div className="flex gap-5 mb-3">
          {[
            { label: 'Historical', color: EMERALD },
            { label: 'Base trajectory', color: '#f59e0b' },
            { label: 'With full programme', color: '#8b5cf6' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="w-4 h-0.5 rounded" style={{ background: l.color }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{l.label}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeMachineData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="period" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={2.6} stroke="rgba(16,185,129,0.25)" strokeDasharray="4 3" label={{ value: 'L3', position: 'right', fill: EMERALD, fontSize: 9, fontFamily: 'var(--font-mono)' }} />
              <ReferenceLine y={3.4} stroke="rgba(6,182,212,0.25)" strokeDasharray="4 3" label={{ value: 'L4', position: 'right', fill: '#06b6d4', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
              <Line type="monotone" dataKey="actual" stroke={EMERALD} strokeWidth={2} dot={{ fill: EMERALD, r: 3 }} connectNulls={false} name="Actual" />
              <Line type="monotone" dataKey="base" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Base" />
              <Line type="monotone" dataKey="optimistic" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Optimistic" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Survival Curve ─────────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.18 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<Flame size={15} style={{ color: '#ef4444' }} />}
          title="Competitive Displacement Survival Curve"
          sub="Probability of competitive obsolescence if maturity gaps are not addressed — actuarial model"
          badge="Board-Level Risk"
        />
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={survivalData}>
                <defs>
                  <linearGradient id="gcurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gimproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={EMERALD} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={EMERALD} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="current"  stroke="#ef4444" fill="url(#gcurrent)"  strokeWidth={1.5} name="Current trajectory" />
                <Area type="monotone" dataKey="improved" stroke={EMERALD}  fill="url(#gimproved)" strokeWidth={1.5} name="With maturity programme" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 flex flex-col justify-center space-y-4">
            {[
              { label: 'Yr 3 risk (current path)', value: '34%', color: '#ef4444', sub: 'Probability of falling behind key competitors' },
              { label: 'Yr 5 risk (current path)', value: '63%', color: '#ef4444', sub: 'Probability of competitive displacement' },
              { label: 'Yr 5 risk (with programme)', value: '22%', color: EMERALD, sub: 'Risk reduced by 65% with maturity investment' },
              { label: 'Risk reduction value', value: `$${(totalRoiIfLevel3 * 3 / 1000).toFixed(0)}K`, color: '#06b6d4', sub: '3-year NPV of maturity programme' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
                <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</p>
                <p className="text-xl font-black mb-0.5" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Countdown Clocks ───────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<Clock size={15} style={{ color: EMERALD }} />}
          title="Maturity Countdown"
          sub="Estimated days to reach next level per department at current improvement velocity"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DEPARTMENTS.map(dept => {
            const s = scores[dept.id]?.score ?? 0;
            const lvl = scoreToLevel(s);
            const nextThresh = [0, 1.8, 2.6, 3.4, 4.2, 5.0][Math.min(lvl + 1, 5)] ?? 5;
            const gap = Math.max(0, nextThresh - s);
            const days = lvl >= 5 ? 0 : Math.round((gap / 0.05) * 30);
            const l = MATURITY_LEVELS[lvl];
            const urgency = days < 90 ? EMERALD : days < 180 ? '#f59e0b' : '#ef4444';
            return (
              <div key={dept.id} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-surface)', border: `1px solid ${dept.borderColor}` }}>
                <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: dept.color, fontFamily: 'var(--font-mono)' }}>{dept.shortName}</p>
                <p className="text-2xl font-black leading-none mb-0.5" style={{ color: urgency, fontFamily: 'var(--font-display)' }}>{days < 1 ? '★' : days}</p>
                <p className="text-[8px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{days < 1 ? 'Max level' : 'days'}</p>
                <div className="mt-1.5 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(((s - 1) / 4) * 100, 100)}%`, background: l.color }} />
                </div>
                <p className="text-[8px] mt-1" style={{ color: l.color, fontFamily: 'var(--font-mono)' }}>→ L{Math.min(lvl + 1, 5)}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Weather Forecast ───────────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.22 }}
        className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
        <SectionHeader
          icon={<Sparkles size={15} style={{ color: EMERALD }} />}
          title="Maturity Weather Forecast"
          sub="Probability of reaching the next level within 12 months at current trajectory — probabilistic model"
          badge="12-Month Outlook"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weatherData.map(d => {
            const color = d.probability >= 70 ? EMERALD : d.probability >= 45 ? '#f59e0b' : '#ef4444';
            const dept = DEPARTMENTS.find(dep => dep.shortName === d.name)!;
            return (
              <div key={d.name} className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: `1px solid ${dept?.borderColor ?? 'var(--border-1)'}` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold" style={{ color: dept?.color ?? EMERALD, fontFamily: 'var(--font-mono)' }}>{d.name}</p>
                  <span className="text-[8px] font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{d.probability}%</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: color }}
                      initial={{ width: 0 }} animate={{ width: `${d.probability}%` }} transition={{ delay: 0.3, duration: 0.6 }} />
                  </div>
                  <p className="text-[8px] text-center" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {d.probability >= 70 ? '☀ Likely' : d.probability >= 45 ? '⛅ Possible' : '⛈ Unlikely'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Executive Action Plan ──────────────────────────── */}
      <motion.div variants={SECTION_FADE} initial="hidden" animate="visible" transition={{ delay: 0.24 }}
        className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${EMERALD_GLOW}` }}>

        {/* Plan header */}
        <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.06))' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} style={{ color: EMERALD }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>Executive Action Plan</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: EMERALD_DIM, color: EMERALD, fontFamily: 'var(--font-mono)' }}>Board Ready</span>
              </div>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>Maturity Improvement Programme · FY2026</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Confidential — For Board and Executive Leadership Review</p>
            </div>
            <div className="text-right">
              <p className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Assessed: Mar 2026</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>14 departments · 210 data points</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6" style={{ background: 'var(--bg-card)' }}>

          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Org Maturity Score',    value: `${orgScore.toFixed(1)}/5.0`, sub: `Level ${orgLevel}: ${orgLvl.name}`,      color: orgLvl.color      },
              { label: 'Departments at Risk',   value: `${insights.atLevel1.length + insights.atLevel2.length}`,       sub: 'Need immediate action',          color: '#ef4444'         },
              { label: 'Annual ROI Unlockable', value: `$${(totalRoiIfLevel3 / 1000).toFixed(0)}K`, sub: 'If all reach Level 3', color: EMERALD           },
              { label: 'Yr 5 Risk (no action)', value: '63%', sub: 'Competitive displacement prob.',  color: '#ef4444'         },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</p>
                <p className="text-2xl font-black" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Current state narrative */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: orgLvl.color, fontFamily: 'var(--font-mono)' }}>Current State Assessment</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The organisation scores <strong style={{ color: orgLvl.color }}>{orgScore.toFixed(2)}/5.0</strong>, placing it at{' '}
              <strong style={{ color: orgLvl.color }}>Level {orgLevel}: {orgLvl.name}</strong> — {orgLvl.description.toLowerCase()}{' '}
              {insights.atLevel1.length > 0 && (
                <><strong style={{ color: '#ef4444' }}>{insights.atLevel1.map(d => d.dept.name).join(' and ')}</strong> are critically underdeveloped at Level 1, representing the most acute risk to organisational performance. </>
              )}
              Only <strong style={{ color: EMERALD }}>{insights.atLevel3Plus.length} of {DEPARTMENTS.length} departments</strong> have reached Level 3 (Defined).{' '}
              No department has yet achieved Level 4 (Advanced) or Level 5 (Transcendent). The organisation's growth is being constrained by systemic capability gaps across multiple functions.
            </p>
          </div>

          {/* Priority actions by department */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>
              Strategic Improvement Roadmap — Priority Actions by Department
            </p>
            <div className="space-y-3">
              {insights.lowest.concat(insights.deptScores.filter(d => scoreToLevel(d.score) === 1)).slice(0, 6).map(({ dept, score, level }) => {
                const nextLvl = Math.min(level + 1, 5) as 2 | 3 | 4 | 5;
                const unlocks = UNLOCK_CONDITIONS[dept.id]?.[nextLvl] ?? [];
                const roi = ROI_DATA[dept.id]?.[nextLvl];
                const l = MATURITY_LEVELS[level];
                return (
                  <div key={dept.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${dept.borderColor}` }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: dept.bgColor }}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: dept.color }} />
                        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{dept.name}</span>
                        <LevelBadge level={level} score={score} size="sm" />
                        <ArrowRight size={11} style={{ color: 'var(--text-muted)' }} />
                        <LevelBadge level={nextLvl} size="sm" />
                      </div>
                      {roi && <span className="text-xs font-bold" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>{roi.value} ROI</span>}
                    </div>
                    <div className="px-4 py-3 grid grid-cols-2 gap-2">
                      {unlocks.slice(0, 4).map((u, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <CheckCircle2 size={11} className="shrink-0 mt-0.5" style={{ color: l.color }} />
                          <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{u}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 90-day sprint */}
          <div className="rounded-xl p-4" style={{ background: `${EMERALD}08`, border: `1px solid ${EMERALD_GLOW}` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>90-Day Sprint — Start Here</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { num: 1, title: 'Appoint CDO & fund Digital Strategy', dept: 'Digital', impact: 'Unblocks AI readiness — highest systemic leverage', days: '0–30' },
                { num: 2, title: 'Launch HR Analytics & Succession Planning', dept: 'HR/People', impact: 'Unblocks operational advancement — people capability', days: '0–30' },
                { num: 3, title: 'Build Sales Methodology & CRM hygiene', dept: 'Sales', impact: 'Highest direct revenue impact — unlocks RevOps', days: '30–90' },
              ].map(s => (
                <div key={s.num} className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: EMERALD, color: '#000', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 900 }}>{s.num}</div>
                    <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Day {s.days}</span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>{s.title}</p>
                  <p className="text-[9px] mb-1.5" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>{s.dept}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-1)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              WORKable Intelligence · Maturity Report v1.0 · Confidential
            </p>
            <div className="flex items-center gap-2">
              <Star size={10} style={{ color: EMERALD }} />
              <span className="text-[10px]" style={{ color: EMERALD, fontFamily: 'var(--font-mono)' }}>Generated by WORKable Intelligence Platform</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom padding */}
      <div className="h-4" />
    </div>
  );
};

export default MaturityIntelligence;

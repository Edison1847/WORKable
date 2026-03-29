import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Zap, Calendar, Users, Eye, ChevronDown,
  Lock, ArrowRight, CheckCircle, Clock, X, Play,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type NudgeStatus = 'pending' | 'accepted' | 'inprogress' | 'completed' | 'dismissed';

interface Nudge {
  id: string;
  type: string;
  typeColor: string;
  title: string;
  dept: string;
  manager: string;
  signalChain: string[];           // ["Time (Q3: 38%)", "High Time–Low Value", "Redesign"]
  detail: string;
  impactAnnual: number;
  dailyCost: number;
  requiresFirst?: string;          // nudge id that must be accepted first
  conflictsWith?: string;
  conflictNote?: string;
}

interface Band {
  id: string;
  icon: React.ElementType;
  label: string;
  sub: string;
  color: string;
  bg: string;
  border: string;
  nudges: Nudge[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_BANDS: Band[] = [
  {
    id: 'now', icon: Zap, label: 'Act Now',
    sub: 'Signals worsening · highest financial impact',
    color: '#f43f5e', bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.2)',
    nudges: [
      {
        id: 'n1', type: 'Redesign', typeColor: '#f43f5e',
        title: 'Sprint planning process — Engineering',
        dept: 'Engineering', manager: 'Sarah Chen · Engineering Lead',
        signalChain: ['Time (Q3: 38%)', 'High Friction (Q7: 6.8/10)', 'Broken Process → Redesign'],
        detail: 'Sprint ceremonies consuming 38% of productive time with no measurable output improvement. Process redesign targeting ceremony structure will recover ~$142K/yr in Engineering capacity.',
        impactAnnual: 142000, dailyCost: 389,
      },
      {
        id: 'n2', type: 'Redesign', typeColor: '#f43f5e',
        title: 'Weekly reporting pipeline — Operations',
        dept: 'Operations', manager: 'James Okonkwo · Ops Lead',
        signalChain: ['Friction (Q7: 7.1/10)', 'Manual aggregation loop', 'High Time–Low Value → Redesign'],
        detail: 'Manual data aggregation runs 3× per week consuming 14 hrs of senior Ops time. Automated pipeline eliminates this with a one-time 2-week build.',
        impactAnnual: 98000, dailyCost: 268,
        conflictsWith: 'n7', conflictNote: 'Re-scope (n7) must resolve before this redesign can take full effect — overlapping scope in Ops allocation.',
      },
      {
        id: 'n3', type: 'Reallocate', typeColor: '#f43f5e',
        title: 'Senior Data Engineers — critical path underresourced',
        dept: 'Engineering', manager: 'Sarah Chen · Engineering Lead',
        signalChain: ['Value (Q2: 8.4/10)', 'Time (Q3: 8%)', 'Under-resourced Critical Work → Reallocate'],
        detail: 'Highest-value work (data platform) receives only 8% of team time despite 8.4/10 strategic value rating. Reallocation from low-value ceremony time recovers $186K in effective output.',
        impactAnnual: 186000, dailyCost: 509,
      },
      {
        id: 'n4', type: 'Reallocate', typeColor: '#f43f5e',
        title: 'Product strategy capacity — chronically underweighted',
        dept: 'Product', manager: 'Tom Rivera · Product Lead',
        signalChain: ['Value (Q2: 7.9/10)', 'Time (Q3: 11%)', 'Activity–Skill Mismatch → Reallocate'],
        detail: 'Product strategy allocated 11% of PM time versus 7.9/10 value rating. Senior PMs spend majority in execution — realignment to strategy increases both morale and output quality.',
        impactAnnual: 100000, dailyCost: 274,
      },
    ],
  },
  {
    id: 'quarter', icon: Calendar, label: 'Plan This Quarter',
    sub: 'Clear diagnosis · ready to sequence',
    color: '#fb923c', bg: 'rgba(251,146,60,0.05)', border: 'rgba(251,146,60,0.18)',
    nudges: [
      {
        id: 'n5', type: 'Automate', typeColor: '#fb923c',
        title: 'Manual reporting — Finance consolidation',
        dept: 'Finance', manager: 'Lisa Park · Finance Lead',
        signalChain: ['Time (Q3: 31%)', 'Repetitive low-value task', 'High Time–Low Value → Automate'],
        detail: 'Finance team runs weekly manual consolidation taking 8 hrs/cycle. Automation via existing data stack requires ~3-week build. Zero ongoing cost once deployed.',
        impactAnnual: 74000, dailyCost: 203,
      },
      {
        id: 'n6', type: 'Eliminate', typeColor: '#fb923c',
        title: 'Redundant approval tiers — cross-department',
        dept: 'Operations', manager: 'James Okonkwo · Ops Lead',
        signalChain: ['Friction (Q7: 6.9/10)', 'Decision latency 4.2 days avg', 'Process Bloat → Eliminate'],
        detail: 'Three-tier approval for decisions under $5K adds average 4.2-day delay with no risk reduction. Eliminating middle tier saves $52K and reduces decision fatigue.',
        impactAnnual: 52000, dailyCost: 142,
      },
      {
        id: 'n7', type: 'Re-scope', typeColor: '#fb923c',
        title: 'Q2 delivery targets — Operations unrealistic',
        dept: 'Operations', manager: 'James Okonkwo · Ops Lead',
        signalChain: ['Target Unrealism (Q9: 2.1/10)', 'Burnout ↑ correlation 0.81', 'Target Unrealism → Re-scope'],
        detail: 'Q2 targets set at 140% of realistic capacity given current headcount. Sustained overcommitment is driving the burnout signal. Re-scope releases $62K in recovered cognitive capacity.',
        impactAnnual: 62000, dailyCost: 170,
        conflictsWith: 'n3', conflictNote: 'Reallocate (n3) draws from same Ops pool — sequence Re-scope first to set correct capacity baseline.',
      },
    ],
  },
  {
    id: 'people', icon: Users, label: 'People Actions',
    sub: 'Manager conversations · no budget required',
    color: '#38bdf8', bg: 'rgba(56,189,248,0.04)', border: 'rgba(56,189,248,0.16)',
    nudges: [
      {
        id: 'n8', type: 'Clarify', typeColor: '#38bdf8',
        title: 'Role expectations — Operations frontline',
        dept: 'Operations', manager: 'James Okonkwo · Ops Lead',
        signalChain: ['Goals Clarity (Q4: 3.2/10)', 'Motivation ↓ correlation', 'Low Goals Clarity → Clarify'],
        detail: 'Frontline Operations team scoring 3.2/10 on goals clarity — below crisis threshold. Manager must set explicit weekly success criteria. Unlocks Coach action (n10) once resolved.',
        impactAnnual: 38000, dailyCost: 104,
      },
      {
        id: 'n9', type: 'Support', typeColor: '#38bdf8',
        title: 'Overload intervention — Customer Success',
        dept: 'Customer Success', manager: 'Amy Torres · CS Lead',
        signalChain: ['Support Void (Q6: 3.8/10)', 'Burnout Risk 79%', 'Support Void Under Load → Support'],
        detail: 'CS team carrying 127% of manageable load with no escalation path. Manager support conversation + load redistribution is a zero-cost, immediate intervention.',
        impactAnnual: 32000, dailyCost: 88,
      },
      {
        id: 'n10', type: 'Coach/Review', typeColor: '#38bdf8',
        title: 'Accountability conversation — Engineering',
        dept: 'Engineering', manager: 'Sarah Chen · Engineering Lead',
        signalChain: ['Accountability Gap (Q8: 3.9/10)', 'Ownership diffusion detected', 'Accountability Gap → Coach/Review'],
        detail: 'Ownership diffusion across 3 Engineering squads. Structured coaching conversation to clarify RACI — must follow Clarify action (n8) to set correct context first.',
        impactAnnual: 40000, dailyCost: 110,
        requiresFirst: 'n8',
      },
    ],
  },
  {
    id: 'monitor', icon: Eye, label: 'Monitor',
    sub: 'Signals stable · resurface at next audit',
    color: 'rgba(255,255,255,0.3)', bg: 'transparent', border: 'var(--border-1)',
    nudges: [
      {
        id: 'n11', type: 'Watch', typeColor: 'rgba(255,255,255,0.3)',
        title: 'Finance process friction — early signal',
        dept: 'Finance', manager: 'Lisa Park · Finance Lead',
        signalChain: ['Friction (Q7: 5.1/10)', 'Stable — no escalation', 'Watch'],
        detail: 'Friction score elevated but within acceptable range. No intervention required this cycle. Flag if score exceeds 6.0 before next audit.',
        impactAnnual: 0, dailyCost: 0,
      },
    ],
  },
];

const INITIAL_STATES: Record<string, NudgeStatus> = {
  n1: 'pending', n2: 'accepted', n3: 'inprogress', n4: 'pending',
  n5: 'pending', n6: 'pending', n7: 'pending',
  n8: 'pending', n9: 'accepted', n10: 'pending',
  n11: 'pending',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const statusConfig: Record<NudgeStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)'  },
  accepted:   { label: 'Accepted',    color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  inprogress: { label: 'In Progress', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
  completed:  { label: 'Completed',   color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  dismissed:  { label: 'Dismissed',   color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
};

const formatMoney = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

// ─── Main Component ───────────────────────────────────────────────────────────

const ActionCommandCentre: React.FC = () => {
  const [states, setStates]           = useState<Record<string, NudgeStatus>>(INITIAL_STATES);
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());
  const [tick, setTick]               = useState(0);

  const [selectedBandId, setSelectedBandId] = useState<string | null>(null);
  const selectedBand = ALL_BANDS.find(b => b.id === selectedBandId);

  // Inaction clock — increments every 8s to simulate cost accumulating
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(id);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const setStatus = useCallback((id: string, status: NudgeStatus) => {
    setStates(prev => ({ ...prev, [id]: status }));
    // Auto-collapse detail after action
    setExpanded(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const isLocked = (nudge: Nudge) =>
    !!nudge.requiresFirst && states[nudge.requiresFirst] === 'pending';

  // Totals
  const allNudges   = ALL_BANDS.flatMap(b => b.nudges);
  const activeCount = allNudges.filter(n => !['completed', 'dismissed'].includes(states[n.id])).length;
  const totalValue  = allNudges.reduce((s, n) => s + n.impactAnnual, 0);
  const pendingCost = allNudges
    .filter(n => states[n.id] === 'pending')
    .reduce((s, n) => s + n.dailyCost * tick, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="space-y-6 rounded-2xl p-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-2)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: '#0ea5e9' }} />
          <h2 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
            STRATEGIC ACTION CENTRE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={12} className="text-white/40" />
          <span className="text-[10px] eyebrow uppercase tracking-widest text-white/40">Real-time Monitor</span>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: formatMoney(Math.max(0, pendingCost)), l: 'INACTION COST', c: '#f43f5e', bg: 'rgba(244,63,94,0.03)' },
          { v: formatMoney(totalValue), l: 'RECOVERABLE', c: '#34d399', bg: 'rgba(52,211,153,0.03)' },
          { v: String(activeCount), l: 'ACTIVE NUDGES', c: '#38bdf8', bg: 'rgba(56,189,248,0.03)' },
        ].map((k, i) => (
          <div key={i} className="rounded-xl py-3 px-4 flex flex-col items-center justify-center relative overflow-hidden group"
            style={{ background: k.bg, border: '1px solid var(--border-1)' }}>
            <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${k.c}33, transparent)` }} />
            <p className="data-lg" style={{ color: k.c, fontSize: '1.25rem' }}>{k.v}</p>
            <p className="eyebrow mt-1 opacity-50" style={{ fontSize: '8px' }}>{k.l}</p>
          </div>
        ))}
      </div>

      {/* Priority Bands List */}
      <div className="space-y-3">
        {ALL_BANDS.map(band => {
          const BandIcon = band.icon;
          const bandActive = band.nudges.filter(n => !['completed', 'dismissed'].includes(states[n.id])).length;
          
          return (
            <div key={band.id}
              onClick={() => setSelectedBandId(band.id)}
              className="rounded-xl overflow-hidden border transition-all duration-300 group/band cursor-pointer hover:border-white/20"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderLeft: `3px solid ${band.color}`,
                borderColor: 'var(--border-1)',
              }}
            >
              <div className="w-full flex items-center justify-between p-4 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="p-1.5 rounded-lg transition-colors group-hover/band:bg-white/[0.04]"
                    style={{ background: `${band.color}15`, border: `1px solid ${band.color}30` }}>
                    <BandIcon size={12} style={{ color: band.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em]"
                        style={{ fontFamily: 'var(--font-display)', color: band.color }}>
                        {band.label}
                      </span>
                    </div>
                    <p className="text-[10px] mt-0.5 opacity-50 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {band.sub}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-white">${(band.nudges.reduce((s, n) => s + n.impactAnnual, 0) / 1000).toFixed(0)}K</p>
                    <p className="text-[8px] eyebrow opacity-40 uppercase">Impact</p>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    <span className="text-[9px] font-bold text-white whitespace-nowrap">{bandActive} ACTIVE</span>
                  </div>
                  <ArrowRight size={12} className="text-white/20 group-hover/band:text-white/60 transition-colors group-hover/band:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution Summary */}
      <div>
        <div className="flex h-1 rounded-full overflow-hidden gap-px">
          <div style={{ width: '40%', background: '#f43f5e', borderRadius: '99px 0 0 99px' }} />
          <div style={{ width: '34%', background: '#fb923c' }} />
          <div style={{ width: '26%', background: '#38bdf8', borderRadius: '0 99px 99px 0' }} />
        </div>
        <div className="flex justify-between mt-1.5 px-1">
          <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>ACT NOW 40%</span>
          <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: '#fb923c', fontFamily: 'var(--font-mono)' }}>PLAN QUARTER 34%</span>
          <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>PEOPLE 26%</span>
        </div>
      </div>

      {/* Deep Dive Popup Modal */}
      <AnimatePresence>
        {selectedBand && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBandId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-[12px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2.5rem]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-2)',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Modal Header */}
              <div className="p-8 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{ background: `${selectedBand.color}15`, border: `1px solid ${selectedBand.color}30` }}>
                    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${selectedBand.color}, transparent)` }} />
                    {React.createElement(selectedBand.icon, { size: 24, style: { color: selectedBand.color } })}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        {selectedBand.label}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-white/5 border border-white/10 text-white/60">
                        {selectedBand.nudges.length} NUDGES
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {selectedBand.sub}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBandId(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <X size={18} className="text-white/40" />
                </button>
              </div>

              {/* Scrollable Interventions List */}
              <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
                <div className="space-y-3">
                  {selectedBand.nudges.map(nudge => {
                    const status = states[nudge.id];
                    const sCfg = statusConfig[status];
                    const isDone = status === 'completed' || status === 'dismissed';
                    const isExpanded = expanded.has(nudge.id);
                    const locked = isLocked(nudge);

                    return (
                      <div key={nudge.id}
                        className="rounded-2xl overflow-hidden transition-all duration-300"
                        style={{
                          background: locked ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${locked ? 'rgba(255,255,255,0.05)' : isExpanded ? nudge.typeColor + '40' : 'rgba(255,255,255,0.06)'}`,
                          opacity: locked || isDone ? 0.7 : 1,
                        }}
                      >
                        <button
                          onClick={() => !locked && toggleExpand(nudge.id)}
                          disabled={locked}
                          className="w-full flex items-center gap-4 px-5 py-4 text-left group/row"
                          style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
                        >
                          {locked ? (
                            <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}>
                              <Lock size={12} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          ) : (
                            <span className="shrink-0 text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-[0.1em]"
                              style={{
                                fontFamily: 'var(--font-mono)',
                                background: `${nudge.typeColor}18`,
                                color: nudge.typeColor,
                                border: `1px solid ${nudge.typeColor}33`,
                              }}>
                              {nudge.type}
                            </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold leading-tight"
                              style={{ fontFamily: 'var(--font-display)', color: locked || isDone ? 'var(--text-muted)' : 'white' }}>
                              {nudge.title}
                            </p>
                            <p className="text-[11px] mt-1 opacity-50 font-mono" style={{ color: 'var(--text-secondary)' }}>
                              {nudge.manager.split(' · ')[0]} · {nudge.dept}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-4">
                             {status === 'pending' && nudge.dailyCost > 0 && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                <Clock size={10} className="text-rose-400" />
                                <span className="text-[10px] font-bold text-rose-400 font-mono">
                                  ${nudge.dailyCost}/d
                                </span>
                              </div>
                            )}

                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight font-mono"
                              style={{ color: sCfg.color, background: sCfg.bg }}>
                              {sCfg.label}
                            </span>

                            {nudge.impactAnnual > 0 && !isDone && (
                              <span className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-display)', color: nudge.typeColor }}>
                                {formatMoney(nudge.impactAnnual)}
                              </span>
                            )}

                            {!locked && (
                              <ChevronDown size={14} className="text-white/20 group-hover/row:text-white/40 transition-colors" style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              }} />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && !locked && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-white/[0.01]"
                            >
                              <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                                <div>
                                  <p className="text-[8px] eyebrow mb-2 opacity-30">SIGNAL CHAIN</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {nudge.signalChain.map((link, idx) => (
                                      <React.Fragment key={idx}>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono"
                                          style={{ color: nudge.typeColor }}>
                                          {link}
                                        </span>
                                        {idx < nudge.signalChain.length - 1 && (
                                          <ArrowRight size={10} className="text-white/10" />
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </div>

                                <p className="text-[13px] leading-relaxed text-white/60">
                                  {nudge.detail}
                                </p>

                                <div className="flex items-center gap-3 pt-2">
                                  {status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => setStatus(nudge.id, 'accepted')}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold text-white transition-all bg-[#0ea5e9] shadow-[0_8px_24px_-6px_rgba(14,165,233,0.3)]"
                                      >
                                        <Play size={10} fill="currentColor" />
                                        ACCEPT STRATEGY
                                      </button>
                                      <button
                                        onClick={() => setStatus(nudge.id, 'dismissed')}
                                        className="px-5 py-3 rounded-xl text-[10px] font-bold border border-white/10 hover:bg-white/5 text-white/40 transition-colors uppercase tracking-widest"
                                      >
                                        Dismiss
                                      </button>
                                    </>
                                  )}
                                  {status === 'accepted' && (
                                    <button
                                      onClick={() => setStatus(nudge.id, 'inprogress')}
                                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold text-white transition-all bg-[#38bdf8] shadow-[0_8px_24px_-6px_rgba(56,189,248,0.3)]"
                                    >
                                      <Play size={10} fill="currentColor" />
                                      MARK AS IN PROGRESS
                                    </button>
                                  )}
                                  {status === 'inprogress' && (
                                    <button
                                      onClick={() => setStatus(nudge.id, 'completed')}
                                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold text-white transition-all bg-[#34d399] shadow-[0_8px_24px_-6px_rgba(52,211,153,0.2)]"
                                    >
                                      <CheckCircle size={14} />
                                      MARK AS RESOLVED
                                    </button>
                                  )}
                                  {isDone && (
                                    <div className="flex-1 py-3 text-center text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] bg-white/[0.03] border border-white/5 rounded-xl">
                                      {status === 'completed' ? 'INTERVENTION LOGGED' : 'ACTION ARCHIVED'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Total Impact Summary */}
              <div className="p-8 pt-4 border-t border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-[10px] eyebrow opacity-40 uppercase">Total Analysed Impact</p>
                    <p className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      {formatMoney(selectedBand.nudges.reduce((s, n) => s + n.impactAnnual, 0))}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBandId(null)}
                    className="px-8 py-3 rounded-xl text-[12px] font-bold text-white bg-white/10 hover:bg-white/15 transition-all border border-white/10"
                  >
                    Close Analysis
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ActionCommandCentre;

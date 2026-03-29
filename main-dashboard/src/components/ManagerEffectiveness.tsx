import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Zap, Target, Brain, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp
} from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

/* ── Helpers ─────────────────────────────────────────────── */
const meiColor = (v: number) =>
  v >= 75 ? '#34d399' : v >= 55 ? '#38bdf8' : v >= 35 ? '#fb923c' : '#f43f5e';

const riskColor = (r: string) =>
  r === 'critical' ? '#f43f5e' : r === 'high' ? '#fb923c' : r === 'moderate' ? '#fbbf24' : '#34d399';

const bsColor = (s: number) =>
  s <= 1.5 ? '#34d399' : s <= 3.0 ? '#fb923c' : s <= 5.0 ? '#f97316' : '#f43f5e';

const bsLabel = (s: number) =>
  s <= 1.5 ? 'Self-Aware' : s <= 3.0 ? 'Moderate' : s <= 5.0 ? 'High' : 'Critical';

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

/* ── Mini metric bar ─────────────────────────────────────── */
const MetricBar: React.FC<{
  label: string;
  icon:  React.ReactNode;
  value: number;
  delay: number;
}> = ({ label, icon, value, delay }) => {
  const color = value >= 70 ? '#34d399' : value >= 45 ? '#38bdf8' : value >= 25 ? '#fb923c' : '#f43f5e';
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1">
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
          <span className="text-[9px]" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>{label}</span>
        </div>
        <span className="text-[9px] font-bold" style={{ fontFamily: 'var(--font-mono)', color }}>{value}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

/* ── Types ───────────────────────────────────────────────── */
interface ManagerProfile {
  name:              string;
  dept:              string;
  burnout:           number;
  capGap:            number;
  targetClarity:     number;
  orgHealth:         number;
  weeklyHrs:         number;
  enthusiasm:        number;
  meetingsPct:       number;
  targetsAchievable: string;
  whoReviews:        string;
  blockers:          string;
  improvements:      string;
  selfHealth:        number;
  clarityScore:      number;
  capabilityScore:   number;
  engagementScore:   number;
  focusScore:        number;
  mei:               number;
  riskScore:         number;
  retentionRisk:     'low' | 'moderate' | 'high' | 'critical';
  flags:             string[];
}

/* ── Component ───────────────────────────────────────────── */
const ManagerEffectiveness: React.FC = () => {
  const [expandedMgr, setExpandedMgr] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { data } = useIntakeData();

  const diags = (data?.all_diagnostics || []) as any[];
  const supervisors = diags.filter(d => d.type === 'supervisor');
  const workers = diags.filter(d => d.type === 'worker');
  const ceoDiags = diags.filter(d => d.type === 'ceo_audit');

  /* ── Build manager profiles ── */
  const managers: ManagerProfile[] = useMemo(() => {
    return supervisors.map(s => {
      const p1 = s.payload?.p1 || s.p1 || {};
      const p3 = s.payload?.p3 || s.p3 || {};
      
      const burnout = p1.burnout || 0;
      const capGap = p1.capGap || p1.capabilityGap || 0;
      const targetClarity = p1.targetClarity || p1.clarity || 0;
      
      const selfHealth = Math.round((5 - Math.min(burnout, 5)) / 5 * 100);
      const clarityScore = Math.round(Math.min(targetClarity, 10) / 10 * 100);
      const capabilityScore = Math.round((10 - Math.min(capGap, 10)) / 10 * 100);
      const engagementScore = Math.round(Math.min(p3.enthusiasm || 10, 25) / 25 * 100);
      const focusScore = Math.max(0, Math.round(100 - Math.min(p3.meetingsVsFocus || 50, 100)));

      const mei = Math.round(selfHealth * 0.25 + clarityScore * 0.25 + capabilityScore * 0.15 + engagementScore * 0.20 + focusScore * 0.15);

      const flags: string[] = [];
      if (burnout >= 3) flags.push('Burnout');
      if ((p3.meetingsVsFocus || 0) >= 60) flags.push('Meetings Trap');
      if (capGap >= 6) flags.push('Skill Gap');

      const riskScore = Math.round((burnout / 5) * 35 + (capGap / 10) * 20 + ((p3.meetingsVsFocus || 0) / 100) * 20);
      const retentionRisk = riskScore > 55 ? 'critical' : riskScore > 38 ? 'high' : riskScore > 22 ? 'moderate' : 'low';

      return {
        name: s.employee_name || 'Unknown',
        dept: s.dept || 'General',
        burnout, capGap, targetClarity, orgHealth: p1.orgHealth || 0,
        weeklyHrs: p1.weeklyHrs || 0, enthusiasm: p3.enthusiasm || 0,
        meetingsPct: p3.meetingsVsFocus || 50, targetsAchievable: p3.targetsAchievable || 'Neutral',
        whoReviews: p3.whoReviews || '', blockers: p3.blockers || '', improvements: p3.improvements || '',
        selfHealth, clarityScore, capabilityScore, engagementScore, focusScore,
        mei, riskScore, retentionRisk, flags,
      };
    });
  }, [supervisors]);

  /* ── Departmental Aggregation ── */
  const deptMatrix = useMemo(() => {
    const groups: Record<string, { totalMei: number; totalRisk: number; count: number }> = {};
    managers.forEach(m => {
        if (!groups[m.dept]) groups[m.dept] = { totalMei: 0, totalRisk: 0, count: 0 };
        groups[m.dept].totalMei += m.mei;
        groups[m.dept].totalRisk += m.riskScore;
        groups[m.dept].count++;
    });
    return Object.entries(groups).map(([dept, info]) => ({
        dept,
        avgMei: Math.round(info.totalMei / info.count),
        avgRisk: Math.round(info.totalRisk / info.count),
        count: info.count
    })).sort((a,b) => b.avgMei - a.avgMei);
  }, [managers]);

  /* ── CEO Blindspot Analysis ── */
  const blindspotData = useMemo(() => {
    return ceoDiags
      .map((cd: any) => {
        const wd = workers.find((w: any) =>
          w.employee_name?.toLowerCase() === cd.employee_name?.toLowerCase(),
        );
        if (!wd) return null;
        const score = parseFloat(Math.abs((cd.p1?.clarity || 0) - (wd.p1?.targetClarity || 0)).toFixed(1));
        return { name: cd.employee_name || '—', score };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score) as { name: string; score: number }[];
  }, [ceoDiags, workers]);

  const sorted = useMemo(() => [...managers].sort((a, b) => b.mei - a.mei), [managers]);
  const displayList = showAll ? sorted : [...sorted.slice(0, 3), ...sorted.slice(-3)];

  if (supervisors.length === 0) return (
    <div className="rounded-2xl p-12 text-center border border-dashed border-white/10" style={{ background: 'var(--bg-card)' }}>
        <p className="text-xs text-white/40 uppercase tracking-widest">Awaiting Manager Diagnostics...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #a78bfa', boxShadow: 'var(--shadow-lg)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}>
            <Lock size={9} style={{ color: '#a78bfa' }} />
            <span className="text-[8.5px] font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>Private Executive View</span>
          </div>
          <div>
            <span className="text-sm font-bold text-white">Manager Performance Matrix</span>
            <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>· {managers.length} leaders</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-8">
        
        {/* Departmental Heatmap Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deptMatrix.map(d => (
                <div key={d.dept} className="rounded-xl p-4 flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-1)', borderLeft: `3px solid ${meiColor(d.avgMei)}` }}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{d.dept}</span>
                        <span className="text-[9px] text-white/30">{d.count} Leads</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                             <p className="text-[8px] text-white/40 uppercase font-mono">Avg MEI</p>
                             <p className="text-xl font-bold font-mono" style={{ color: meiColor(d.avgMei) }}>{d.avgMei}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[8px] text-white/40 uppercase font-mono">Retention Risk</p>
                             <p className="text-xs font-bold font-mono" style={{ color: riskColor(d.avgRisk > 40 ? 'high' : 'low') }}>{d.avgRisk}%</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Exceptions View (Individual Highlights) */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Key Performance Exceptions</span>
                <button onClick={() => setShowAll(!showAll)} className="text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-wider transition-colors">
                    {showAll ? 'Collapse' : `View All ${managers.length}`}
                </button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                {displayList.map((mgr, i) => (
                    <motion.div key={mgr.name + i} onClick={() => setExpandedMgr(expandedMgr === mgr.name ? null : mgr.name)}
                        className="rounded-xl p-3 cursor-pointer hover:bg-white/[0.04] transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-1)', borderTop: `2px solid ${meiColor(mgr.mei)}` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{ background: `${meiColor(mgr.mei)}15`, color: meiColor(mgr.mei), border: `1px solid ${meiColor(mgr.mei)}30` }}>
                                {initials(mgr.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-white truncate">{mgr.name}</p>
                                <p className="text-[9px] text-white/40">{mgr.dept}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold font-mono leading-none" style={{ color: meiColor(mgr.mei) }}>{mgr.mei}</p>
                                <p className="text-[9px] font-bold" style={{ color: riskColor(mgr.retentionRisk) }}>{mgr.retentionRisk.toUpperCase()}</p>
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expandedMgr === mgr.name && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                    <MetricBar label="Self Health" icon={<ShieldCheck size={8} />} value={mgr.selfHealth} delay={0.1} />
                                    <MetricBar label="Direction" icon={<Target size={8} />} value={mgr.clarityScore} delay={0.1} />
                                    <MetricBar label="Engagement" icon={<Zap size={8} />} value={mgr.engagementScore} delay={0.1} />
                                    {mgr.flags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {mgr.flags.map(f => (
                                                <span key={f} className="text-[7px] px-1.5 py-0.5 rounded-full font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-widest">{f}</span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* CEO Blindspot (Bottom section) */}
        {blindspotData.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 20 }}>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={11} style={{ color: '#a78bfa' }} />
              <p className="text-[9px] font-bold tracking-widest uppercase text-white/40">CEO Blind-Spot Analysis</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {blindspotData.slice(0, 4).map((m, i) => (
                <div key={m.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-bold text-white mb-1 truncate">{m.name}</p>
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] text-white/30 uppercase font-mono">{bsLabel(m.score)} Gap</span>
                        <span className="text-lg font-bold font-mono" style={{ color: bsColor(m.score) }}>{m.score.toFixed(1)}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full" style={{ background: bsColor(m.score), width: `${(m.score/10)*100}%` }} />
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footnote */}
        <p className="text-[8.5px] leading-relaxed text-white/30 pt-6 border-t border-white/5">
          MEI = Manager Effectiveness Index. Weighted composite of Self Health (25%), Direction Clarity (25%),
          Engagement (20%), Capability (15%), Focus Time (15%). View aggregates top/bottom 3 results by default.
          Live diagnostic data sync · {new Date().toLocaleTimeString()} 
        </p>

      </div>
    </motion.div>
  );
};

export default ManagerEffectiveness;

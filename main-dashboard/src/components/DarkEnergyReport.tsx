import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanEye, Loader2 } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

interface DarkForce {
  title: string;
  severity: number;
  severityLabel: string;
  description: string;
  sources: string[];
  departments: string[];
  color: string;
}


// Minimal glassmorphism radial progress
const SeverityRadial: React.FC<{ severity: number; color: string; label: string }> = ({ severity, color, label }) => {
  const radius = 20;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = circumference - (severity / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
      <svg height={48} width={48}>
        <circle
          stroke="rgba(255,255,255,0.10)"
          fill="none"
          strokeWidth={stroke}
          cx={24}
          cy={24}
          r={normalizedRadius}
        />
        <motion.circle
          stroke={color}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          cx={24}
          cy={24}
          r={normalizedRadius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1 }}
          style={{ filter: 'drop-shadow(0 2px 8px ' + color + '33)' }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
};


const ForceCard: React.FC<{ force: DarkForce; index: number }> = ({ force, index }) => {
  const [expanded, setExpanded] = useState(false);
  const isCritical = force.severity >= 70;
  return (
    <motion.div
      className="rounded-2xl p-4 relative overflow-visible shadow-lg backdrop-blur-md border border-white/10 bg-white/10 transition-all duration-300 group"
      style={{ minHeight: 120, boxShadow: isCritical ? `0 0 0 2px ${force.color}44` : undefined }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      tabIndex={0}
      aria-expanded={expanded}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v); }}
      role="button"
    >
      <div className="flex items-center gap-4">
        <SeverityRadial severity={force.severity} color={force.color} label={force.severityLabel} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: force.color }}>{force.title}</span>
            {isCritical && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-400/30">Critical</span>}
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {force.sources.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-white/20 border border-white/20 text-gray-200 font-mono">{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <span className="uppercase tracking-wider">Impact:</span>
            <span style={{ color: force.color }}>{force.departments.join(', ')}</span>
          </div>
        </div>
        <button
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
          className="ml-2 rounded-full p-1 bg-white/10 hover:bg-white/20 border border-white/20 transition"
          tabIndex={-1}
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
        >
          <span className="inline-block transition-transform" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            ▶
          </span>
        </button>
      </div>
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        className="overflow-hidden transition-all duration-300"
      >
        <div className="mt-3 text-sm leading-relaxed text-gray-100" style={{ fontFamily: 'var(--font-body)' }}>
          {force.description}
        </div>
      </motion.div>
    </motion.div>
  );
};

const DarkEnergyReport: React.FC = () => {
  const { data, loading } = useIntakeData();

  const forces = useMemo(() => {
    if (!data?.all_diagnostics || data.all_diagnostics.length === 0) {
      return [];
    }

    const workers = data.all_diagnostics.filter((d: any) => d.type === 'worker');
    const supervisors = data.all_diagnostics.filter((d: any) => d.type === 'supervisor');

    if (workers.length === 0) return [];

    // Calculate aggregate metrics
    let totalOrgHealth = 0;
    let totalBurnout = 0;
    let totalCapGap = 0;
    let totalLegacyBurden = 0;
    let totalTargetClarity = 0;
    let lowEnergyActivities = 0;
    let totalActivities = 0;
    let meetingHeavyWorkers = 0;

    // Department aggregation
    const deptIssues: Record<string, { burnout: number; count: number; legacy: number }> = {};

    workers.forEach((w: any) => {
      const p1 = w.payload?.p1 || w.p1 || {};
      const acts = w.payload?.activityDetails || w.activityDetails || [];
      const dept = w.department || 'General';

      if (!deptIssues[dept]) {
        deptIssues[dept] = { burnout: 0, count: 0, legacy: 0 };
      }

      totalOrgHealth += p1.orgHealth || 5;
      totalBurnout += p1.burnout || 3;
      totalCapGap += p1.capGap || 5;
      totalLegacyBurden += p1.legacyBurden || 50;
      totalTargetClarity += p1.targetClarity || 5;

      deptIssues[dept].burnout += p1.burnout || 0;
      deptIssues[dept].legacy += p1.legacyBurden || 0;
      deptIssues[dept].count += 1;

      acts.forEach((a: any) => {
        totalActivities++;
        if (a.energy <= 2) lowEnergyActivities++;
      });

      if ((p1.meetingRatio || 0) > 0.5) meetingHeavyWorkers++;
    });

    const avgOrgHealth = totalOrgHealth / workers.length;
    const avgBurnout = totalBurnout / workers.length;
    const avgLegacyBurden = totalLegacyBurden / workers.length;
    const avgTargetClarity = totalTargetClarity / workers.length;

    // Find worst departments
    const worstDepts = Object.entries(deptIssues)
      .map(([name, stats]) => ({
        name,
        avgBurnout: stats.burnout / stats.count,
        avgLegacy: stats.legacy / stats.count,
      }))
      .sort((a, b) => b.avgBurnout - a.avgBurnout)
      .slice(0, 3)
      .map(d => d.name);

    // Calculate supervisor voice suppression
    let voiceSuppressionScore = 0;
    if (supervisors.length > 0) {
      const totalComfort = supervisors.reduce((sum: number, s: any) => {
        const p1 = s.payload?.p1 || s.p1 || {};
        return sum + (p1.comfortRaisingConcerns || 5);
      }, 0);
      const avgComfort = totalComfort / supervisors.length;
      voiceSuppressionScore = Math.round((10 - avgComfort) * 10);
    } else {
      // Estimate from worker orgHealth and meeting ratios
      voiceSuppressionScore = Math.round((10 - avgOrgHealth) * 8 + (meetingHeavyWorkers / workers.length) * 20);
    }

    // Calculate friction tolerance from legacy burden
    const frictionToleranceScore = Math.round(avgLegacyBurden * 0.9);

    // Calculate role ambiguity from target clarity
    const roleAmbiguityScore = Math.round((10 - avgTargetClarity) * 10);

    // Calculate ambient fear from burnout and low energy ratio
    const lowEnergyRatio = totalActivities > 0 ? lowEnergyActivities / totalActivities : 0;
    const ambientFearScore = Math.round(avgBurnout * 8 + lowEnergyRatio * 20);

    const FORCES: DarkForce[] = [
      {
        title: 'VOICE SUPPRESSION',
        severity: Math.min(100, voiceSuppressionScore),
        severityLabel: voiceSuppressionScore >= 70 ? 'Critical' : voiceSuppressionScore >= 50 ? 'High' : voiceSuppressionScore >= 30 ? 'Moderate' : 'Low',
        description: voiceSuppressionScore >= 70
          ? `Employees consistently self-censor in cross-functional settings. Only ${Math.round(10 - voiceSuppressionScore / 10)}/10 comfort raising concerns.`
          : voiceSuppressionScore >= 50
            ? 'Notable hesitation in challenging decisions. Psychological safety gaps detected.'
            : 'Voice suppression within manageable range. Monitor for escalation.',
        sources: supervisors.length > 0 ? ['Supervisor diagnostics', 'Comfort scores'] : ['Worker orgHealth', 'Meeting patterns'],
        departments: worstDepts.length > 0 ? worstDepts : ['All departments'],
        color: voiceSuppressionScore >= 70 ? '#dc2626' : voiceSuppressionScore >= 50 ? '#f43f5e' : '#fb923c',
      },
      {
        title: 'AMBIENT FEAR CULTURE',
        severity: Math.min(100, ambientFearScore),
        severityLabel: ambientFearScore >= 70 ? 'Critical' : ambientFearScore >= 50 ? 'High' : ambientFearScore >= 30 ? 'Moderate' : 'Low',
        description: ambientFearScore >= 70
          ? `Punitive attribution detected — ${Math.round(lowEnergyRatio * 100)}% of activities show fear-driven disengagement. Psychological safety deficit.`
          : ambientFearScore >= 50
            ? 'Elevated caution in decision-making. Fear patterns emerging.'
            : 'Fear culture not significantly detected. Healthy risk tolerance.',
        sources: ['Burnout scores', 'Energy patterns', 'Activity analysis'],
        departments: worstDepts.slice(0, 2).length > 0 ? worstDepts.slice(0, 2) : ['Organization-wide'],
        color: ambientFearScore >= 70 ? '#dc2626' : ambientFearScore >= 50 ? '#f43f5e' : '#fb923c',
      },
      {
        title: 'ROLE AMBIGUITY ACCUMULATION',
        severity: Math.min(100, roleAmbiguityScore),
        severityLabel: roleAmbiguityScore >= 70 ? 'Critical' : roleAmbiguityScore >= 50 ? 'High' : roleAmbiguityScore >= 30 ? 'Moderate' : 'Low',
        description: roleAmbiguityScore >= 70
          ? `${Math.round((10 - avgTargetClarity) * 10)}% of workers cannot clearly define decision-making authority. Boundary confusion widespread.`
          : roleAmbiguityScore >= 50
            ? 'Notable uncertainty in role boundaries. Escalation patterns unclear.'
            : 'Role clarity adequate. Authority boundaries well understood.',
        sources: ['Target clarity scores', 'Decision patterns'],
        departments: ['All departments'],
        color: roleAmbiguityScore >= 70 ? '#a78bfa' : roleAmbiguityScore >= 50 ? '#8b5cf6' : '#6366f1',
      },
      {
        title: 'CHRONIC FRICTION TOLERANCE',
        severity: Math.min(100, frictionToleranceScore),
        severityLabel: frictionToleranceScore >= 70 ? 'Critical' : frictionToleranceScore >= 50 ? 'High' : frictionToleranceScore >= 30 ? 'Moderate' : 'Low',
        description: frictionToleranceScore >= 70
          ? `Workers normalized ${Math.round(avgLegacyBurden)}% legacy process burden. Friction no longer triggers escalation — dangerous adaptation.`
          : frictionToleranceScore >= 50
            ? 'Elevated tolerance for systemic blockers. Process debt accumulating.'
            : 'Healthy friction sensitivity. Blockers trigger appropriate escalation.',
        sources: ['Legacy burden scores', 'Process friction index'],
        departments: worstDepts.length > 0 ? worstDepts : ['Operations', 'Engineering'],
        color: frictionToleranceScore >= 70 ? '#dc2626' : frictionToleranceScore >= 50 ? '#ef4444' : '#f97316',
      },
    ];

    return FORCES.sort((a, b) => b.severity - a.severity);
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.15)' }}>
        <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: '#f43f5e' }} />
        <span className="text-xs text-gray-500">Analyzing dark energy patterns...</span>
      </div>
    );
  }

  if (forces.length === 0) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.15)' }}>
        <div className="flex items-center gap-2 mb-4">
          <ScanEye size={14} style={{ color: '#f43f5e' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Dark Energy Report</span>
        </div>
        <p className="text-xs text-gray-500 text-center py-4">
          Insufficient diagnostic data to analyze dark energy patterns.
        </p>
      </div>
    );
  }

  return (
    <section
      className="rounded-3xl overflow-visible p-0 mb-6 shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
      aria-label="Dark Energy Report"
      style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)' }}
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/10">
        <div className="flex items-center gap-3">
          <ScanEye size={18} style={{ color: '#f43f5e' }} />
          <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Dark Energy Report</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— hidden systemic forces</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-pink-600/20 text-pink-300 border border-pink-400/30">Live</span>
          <span className="text-xs font-bold" style={{ color: '#f43f5e' }}>
            {forces.filter(f => f.severity >= 70).length} critical
          </span>
        </div>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forces.map((force, index) => (
            <ForceCard key={force.title} force={force} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DarkEnergyReport;

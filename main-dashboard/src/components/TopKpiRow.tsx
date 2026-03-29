import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

const TopKpiRow: React.FC = () => {
  const { data } = useIntakeData();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // Ensure we only use real diagnostics from the database
  const liveDiagnostics = (data?.all_diagnostics || []);
  const workerDiags = liveDiagnostics.filter((d: any) => d.type === 'worker');

  const calculateAvg = (key: string, path: string = '') => {
    if (workerDiags.length === 0) return 0;
    const sum = workerDiags.reduce((acc: number, r: any) => {
      const parent = path ? r[path] : r;
      const val = parent?.[key] || 0;
      return acc + val;
    }, 0);
    return sum / workerDiags.length;
  };

  // Modern HSI Logic Mapping
  const avgMeaning = (calculateAvg('orgHealth', 'p1') + calculateAvg('targetClarity', 'p1')) / 2;
  const avgEnergy = 10 - calculateAvg('burnout', 'p1');
  const avgSustainability = 10 - calculateAvg('capGap', 'p1');
  
  const rawHsiValue = ((avgMeaning + avgEnergy + avgSustainability) / 30) * 100;
  
  const hsiValue = workerDiags.length > 0 ? Math.round(rawHsiValue) : 0;
  const hsiStatus = hsiValue > 80 ? 'Optimal' : hsiValue > 60 ? 'Stable' : 'Critical';
  const hsiColor = hsiValue > 80 ? '#34d399' : hsiValue > 60 ? '#fb923c' : '#f43f5e';

  const supervisorData = data?.live?.supervisor_diagnostic || {};
  
  // CEO Alignment Logic
  const ceoDiags = liveDiagnostics.filter((d: any) => d.type === 'ceo_audit');
  
  let blindspotSum = 0, blindspotCount = 0;
  ceoDiags.forEach((cd: any) => {
    const wd = workerDiags.find((w: any) => w.employee_name?.toLowerCase() === cd.employee_name?.toLowerCase());
    if (wd) {
        const ceoVal = cd.p1?.clarity || cd.clarity || 0;
        const wrkVal = wd.p1?.targetClarity || wd.targetClarity || 0;
        blindspotSum += Math.abs(ceoVal - wrkVal);
        blindspotCount++;
    }
  });
  const blindspotValue = blindspotCount > 0 ? (blindspotSum / blindspotCount).toFixed(1) : '0.0';

  // Value Leak Logic
  let lowCritTime = 0, totalTime = 0;
  liveDiagnostics.forEach((d: any) => {
    (d.activityDetails || []).forEach((a: any) => {
        totalTime += (a.percentTime || 0);
        if (a.criticality === 'Low') lowCritTime += (a.percentTime || 0);
    });
  });
  const leakValue = totalTime > 0 ? Math.round((lowCritTime / totalTime) * 100) : 0;

  // Strategic Alignment Logic (Average Gap)
  let alignSum = 0, alignCount = 0;
  const supervisorDiags = liveDiagnostics.filter((d: any) => d.type === 'supervisor');
  supervisorDiags.forEach((sd: any) => {
      const wd = workerDiags.find((w: any) => w.employee_name?.toLowerCase() === sd.employee_name?.toLowerCase());
      if (wd) {
          const sVal = sd.q2_criticalScore || sd.p1?.criticalScore || 5;
          const wVal = wd.p1?.orgHealth || wd.orgHealth || 5; 
          alignSum += Math.abs(sVal - wVal);
          alignCount++;
      }
  });
  const alignmentGap = alignCount > 0 ? Math.round((alignSum / alignCount) * 10) : 15;

  // Crisis Proximity Index Logic
  const supervisorDiags2 = liveDiagnostics.filter((d: any) => d.type === 'supervisor');
  const allDiags = [...workerDiags, ...supervisorDiags2];
  const avgBurnout   = allDiags.length > 0 ? allDiags.reduce((s: number, d: any) => s + (d.p1?.burnout || 0), 0) / allDiags.length : 0;
  const avgCapGap    = workerDiags.length > 0 ? workerDiags.reduce((s: number, d: any) => s + (d.p1?.capGap || 0), 0) / workerDiags.length : 0;
  const overloadPct  = workerDiags.length > 0 ? (workerDiags.filter((d: any) => (d.p1?.weeklyHrs || 0) > 45).length / workerDiags.length) * 100 : 0;
  const avgLegacy    = workerDiags.length > 0 ? workerDiags.reduce((s: number, d: any) => s + (d.p1?.legacyBurden || 0), 0) / workerDiags.length : 0;
  const supWithEnth  = supervisorDiags2.filter((d: any) => d.p3?.enthusiasm !== undefined);
  const avgEnth      = supWithEnth.length > 0 ? supWithEnth.reduce((s: number, d: any) => s + (d.p3?.enthusiasm || 0), 0) / supWithEnth.length : 12;
  const enthScore    = Math.max(0, 100 - (avgEnth / 25) * 100);
  const cpiValue     = liveDiagnostics.length > 0
    ? Math.round((avgBurnout / 5) * 100 * 0.35 + (avgCapGap / 10) * 100 * 0.25 + overloadPct * 0.15 + avgLegacy * 0.15 + enthScore * 0.10)
    : 0;
  const cpiColor  = cpiValue > 70 ? '#f43f5e' : cpiValue > 45 ? '#fb923c' : cpiValue > 25 ? '#38bdf8' : '#34d399';
  const cpiStatus = cpiValue > 70 ? 'Critical' : cpiValue > 45 ? 'Escalated' : cpiValue > 25 ? 'Monitored' : 'Stable';

  const dynamicKpis = [
    {
      label: 'Human System Index',
      value: `${hsiValue}`,
      unit: '',
      sub: hsiStatus,
      color: hsiColor,
      bg: 'rgba(52,211,153,0.06)',
      border: 'rgba(52,211,153,0.15)',
      topLine: 'rgba(52,211,153,0.5)',
      type: 'ring',
      ring: hsiValue,
      trend: null,
      dynamicIcon: hsiValue > 80 ? <ShieldCheck size={14} /> : hsiValue > 60 ? <Shield size={14} /> : <ShieldAlert size={14} />,
      tooltip: "A comprehensive health score of the human system, combining burnout risk, role clarity, and capability match. Higher scores indicate an organization that is both productive and sustainable.",
    },
    {
      label: 'Weekly Expectation',
      value: supervisorData.q3_timeExpectation ? `${supervisorData.q3_timeExpectation}h` : '--',
      unit: '',
      sub: supervisorData.q3_timeExpectation ? 'Managerial Setting' : 'Data Pending',
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.05)',
      border: 'var(--border-1)',
      topLine: 'rgba(251,146,60,0.4)',
      type: 'stat',
      trend: supervisorData.q3_timeExpectation ? 'up-bad' : 'neutral',
      dynamicIcon: <Shield size={14} />,
      tooltip: "The official weekly hour expectation set by management for the department.",
    },
    {
      label: 'Recovery Capacity',
      value: workerDiags.length > 0 ? `${Math.round((calculateAvg('enthusiasm', 'p4') / 21) * 100)}%` : '--',
      unit: '',
      sub: (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 75 ? 'Optimal Flow' : (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 45 ? 'Elevated Pressure' : 'High Exhaustion',
      color: (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 75 ? '#34d399' : (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 45 ? '#fb923c' : '#f43f5e',
      bg: (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 75 ? 'rgba(52,211,153,0.08)' : (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 45 ? 'rgba(251,146,60,0.08)' : 'rgba(244,63,94,0.08)',
      border: (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 75 ? 'rgba(52,211,153,0.15)' : (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 45 ? 'rgba(251,146,60,0.15)' : 'rgba(244,63,94,0.15)',
      topLine: (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 75 ? 'rgba(52,211,153,0.5)' : (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 45 ? 'rgba(251,146,60,0.5)' : 'rgba(244,63,94,0.5)',
      type: 'battery',
      ring: (calculateAvg('enthusiasm', 'p4') / 21) * 100,
      trend: 'neutral',
      dynamicIcon: (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 75 ? <ShieldCheck size={14} /> : (calculateAvg('enthusiasm', 'p4') / 21) * 100 > 45 ? <Shield size={14} /> : <ShieldAlert size={14} />,
      tooltip: "A live indicator of your organization's battery level. Measured by self-reported days of high enthusiasm vs. burnout risk, this represents the capacity of staff to rebound from stress and maintain creative energy.",
    },
     {
      label: 'Voice Suppression',
      value: workerDiags.length > 0 ? `${Math.round(calculateAvg('ps1_voiceSuppression', 'p1'))}/10` : '--',
      unit: '',
      sub: (calculateAvg('ps1_voiceSuppression', 'p1')) > 4 ? 'Silent Risk' : 'Healthy Safety',
      color: (calculateAvg('ps1_voiceSuppression', 'p1')) > 4 ? '#f43f5e' : '#34d399',
      bg: (calculateAvg('ps1_voiceSuppression', 'p1')) > 4 ? 'rgba(244,63,94,0.06)' : 'rgba(52,211,153,0.04)',
      border: (calculateAvg('ps1_voiceSuppression', 'p1')) > 4 ? 'rgba(244,63,94,0.15)' : 'rgba(52,211,153,0.1)',
      topLine: (calculateAvg('ps1_voiceSuppression', 'p1')) > 4 ? 'rgba(244,63,94,0.5)' : 'rgba(52,211,153,0.3)',
      type: 'stat',
      trend: (calculateAvg('ps1_voiceSuppression', 'p1')) > 4 ? 'up-bad' : 'neutral',
      dynamicIcon: (calculateAvg('ps1_voiceSuppression', 'p1')) > 4 ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />,
      tooltip: "Measures the degree to which employees feel they must withhold critical feedback or concerns. A score above 4 indicates significant information bottleneck and cultural risk.",
    },
    {
      label: 'Strategic Alignment',
      value: `${alignmentGap}%`,
      unit: '',
      sub: alignmentGap > 20 ? 'Action Needed' : 'In Sync',
      color: alignmentGap > 30 ? '#f43f5e' : alignmentGap > 15 ? '#fb923c' : '#34d399',
      bg: alignmentGap > 30 ? 'rgba(244,63,94,0.06)' : 'rgba(251,146,60,0.06)',
      border: 'rgba(167,139,250,0.15)',
      topLine: 'rgba(167,139,250,0.5)',
      type: 'stat',
      trend: alignmentGap > 30 ? 'up-bad' : alignmentGap > 15 ? 'up-bad' : 'neutral',
      dynamicIcon: alignmentGap > 30 ? <ShieldAlert size={14} /> : alignmentGap > 15 ? <Shield size={14} /> : <ShieldCheck size={14} />,
      tooltip: "The delta between what leadership prioritizes and where workers actually spend their time. Large gaps indicate strategic drift.",
    },
    {
      label: 'CEO Blindspot',
      value: `${blindspotValue}%`,
      unit: '',
      sub: parseFloat(blindspotValue) > 25 ? 'High Delta' : 'Calibrated',
      color: parseFloat(blindspotValue) > 30 ? '#f43f5e' : parseFloat(blindspotValue) > 15 ? '#fb923c' : '#34d399',
      bg: parseFloat(blindspotValue) > 30 ? 'rgba(244,63,94,0.06)' : 'rgba(251,146,60,0.06)',
      border: 'rgba(59,130,246,0.15)',
      topLine: 'rgba(59,130,246,0.5)',
      type: 'stat',
      trend: parseFloat(blindspotValue) > 20 ? 'up-bad' : 'neutral',
      dynamicIcon: parseFloat(blindspotValue) > 30 ? <ShieldAlert size={14} /> : parseFloat(blindspotValue) > 15 ? <Shield size={14} /> : <ShieldCheck size={14} />,
      tooltip: "The variance between executive perception of organizational health and the frontline worker's reality. High scores mean leadership is flying blind.",
    },
    {
        label: 'Value Leak',
        value: `${leakValue}%`,
        unit: '',
        sub: 'Low-Crit Hours',
        color: leakValue > 20 ? '#f43f5e' : '#fb923c',
        bg: leakValue > 20 ? 'rgba(244,63,94,0.06)' : 'rgba(251,146,60,0.06)',
        border: 'rgba(251,146,60,0.15)',
        topLine: 'rgba(251,146,60,0.5)',
        type: 'stat',
        trend: leakValue > 15 ? 'up-bad' : 'neutral',
        dynamicIcon: leakValue > 20 ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />,
        tooltip: "Total organizational time spent on low-criticality activities. Represents the magnitude of optimization potential.",
    },
    {
      label: 'Crisis Proximity',
      value: `${cpiValue}`,
      unit: '',
      sub: cpiStatus,
      color: cpiColor,
      bg: `${cpiColor}0f`,
      border: `${cpiColor}26`,
      topLine: `${cpiColor}80`,
      type: 'stat',
      trend: cpiValue > 45 ? 'up-bad' : 'neutral',
      dynamicIcon: cpiValue > 70 ? <ShieldAlert size={14} /> : cpiValue > 25 ? <Shield size={14} /> : <ShieldCheck size={14} />,
      tooltip: cpiValue > 70
        ? `The organisation is in critical territory. Burnout, capability gaps, and overload have stacked on top of each other. Without immediate executive intervention, you are weeks away from involuntary attrition and system failure.`
        : cpiValue > 45
        ? `Risk indicators are elevated and converging. The organisation is not yet in crisis but is heading there. This is the window to act — intervention now costs a fraction of what recovery will.`
        : cpiValue > 25
        ? `Stress signals are present but manageable. The organisation has runway. Addressing the top contributing factors now will prevent these from compounding into a harder problem.`
        : `The organisation is in a healthy state. No critical risk clusters detected. Continue monitoring cadence and address any emerging signals early.`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4">
      {dynamicKpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl p-6 flex flex-col overflow-hidden"
          style={{ background: `var(--bg-card)`, border: `1px solid ${k.border}`, boxShadow: 'var(--shadow-md)', cursor: (k as any).tooltip ? 'default' : undefined }}
          onMouseEnter={() => (k as any).tooltip && setHoveredLabel(k.label)}
          onMouseLeave={() => setHoveredLabel(null)}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-4 right-4 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${k.topLine}, transparent)` }} />
          {/* Color wash */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: k.bg }} />

          <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
            <p className="eyebrow flex-1 leading-tight">{k.label}</p>
            {(k as any).dynamicIcon && <span className="shrink-0" style={{ color: k.color, opacity: 0.8 }}>{(k as any).dynamicIcon}</span>}
          </div>

          {k.type === 'ring' ? (
            <div className="relative z-10 flex items-center gap-3">
              <div className="relative w-[52px] h-[52px] shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${k.color}33 0%, transparent 70%)` }}
                />
                
                <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                  <motion.circle 
                    cx="26" cy="26" r="21" fill="none" stroke={k.color} strokeWidth="4"
                    initial={{ strokeDashoffset: 131.9 }}
                    animate={{ strokeDashoffset: 131.9 * (1 - k.ring! / 100) }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    strokeDasharray="131.9"
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${k.color}88)` }} 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span className="data-sm text-white font-bold">{k.value}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold leading-tight mb-1" style={{ fontFamily: 'var(--font-display)', color: k.color }}>{k.sub}</p>
                <div className="flex items-center gap-1">
                  <Activity size={8} style={{ color: '#34d399' }} />
                  <span className="text-[8px] font-mono opacity-50">Live</span>
                </div>
              </div>
            </div>
          ) : k.type === 'battery' ? (
            <div className="relative z-10 flex flex-col flex-1 justify-between">
              <div className="flex items-center gap-3">
                 <div className="relative flex-shrink-0 w-8 h-10 bg-white/5 border border-white/10 rounded-md p-1 overflow-hidden">
                   <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-white/20 rounded-full" />
                   <div className="relative h-full w-full bg-black/20 rounded-[3px] overflow-hidden">
                      <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${k.ring}%` }}
                          transition={{ duration: 2, ease: "circOut" }}
                          className="absolute bottom-0 left-0 right-0"
                          style={{ 
                              background: `linear-gradient(180deg, ${k.color}, ${k.color}aa)`,
                              boxShadow: `0 0 10px ${k.color}66` 
                          }}
                      />
                   </div>
                 </div>
                 <div className="flex-1">
                    <span className="data-xl text-white leading-none">{k.value}</span>
                 </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2.5">
                  <Activity size={10} style={{ color: k.color }} />
                  <p className="text-[10px] font-medium leading-tight" style={{ color: k.color, fontFamily: 'var(--font-body)' }}>{k.sub}</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col justify-between flex-1">
              <div className="flex items-baseline gap-1">
                <span className="data-xl text-white">{k.value}</span>
                {k.unit && <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.unit}</span>}
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                {k.trend === 'up-bad'   && <TrendingUp   size={10} style={{ color: k.color }} />}
                {k.trend === 'down-bad' && <TrendingDown  size={10} style={{ color: k.color }} />}
                {k.trend === 'neutral'  && <Minus         size={10} style={{ color: 'var(--text-muted)' }} />}
                <span className="text-[10px] font-medium"
                  style={{ color: k.trend === 'neutral' ? 'var(--text-muted)' : k.color, fontFamily: 'var(--font-body)' }}>
                  {k.sub}
                </span>
              </div>
            </div>
          )}

          <AnimatePresence>
            {(k as any).tooltip && hoveredLabel === k.label && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-2xl flex items-center justify-center p-5 text-center"
                style={{ background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(6px)', zIndex: 20, border: `1px solid ${k.color}44` }}
              >
                <p className="text-[9px] leading-relaxed text-white/70 font-medium">{(k as any).tooltip}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}


export default TopKpiRow;

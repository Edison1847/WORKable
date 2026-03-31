import React from 'react';
import { ResponsiveContainer, PolarGrid, PolarAngleAxis, RadarChart, Radar, Tooltip, PolarRadiusAxis } from 'recharts';
import { ShieldAlert } from 'lucide-react';

const score = (v: number) => v >= 80 ? '#f43f5e' : v >= 60 ? '#fb923c' : '#34d399';

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { subject, A } = payload[0].payload;
  return (
    <div style={{ background: '#0e1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', fontFamily: 'var(--font-body)' }}>
      <p className="text-xs font-semibold text-white mb-0.5">{subject}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: score(A) }}>{A}<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</span></p>
    </div>
  );
};

const RiskRadar: React.FC<{ data: any }> = ({ data }) => {
  const workerDiags = data?.all_diagnostics?.filter((d: any) => d.type === 'worker') || [];
  const supervisorData = data?.supervisor || {};

  const radarData = React.useMemo(() => {
    const calculateAvg = (key: string, path: string = '') => {
        if (workerDiags.length === 0) return 0;
        const sum = workerDiags.reduce((acc: number, r: any) => {
            const parent = path ? r[path] : r;
            const val = parent?.[key] || 0;
            return acc + val;
        }, 0);
        return sum / workerDiags.length;
    };

    const workerHealth = calculateAvg('orgHealth', 'p1');
    const supHealth = supervisorData.globalOrgHealth || supervisorData.p1?.clarity || 5;
    const blindspot = Math.abs(workerHealth - supHealth) / 10 * 100;
    const burnout = calculateAvg('burnout', 'p1') / 5 * 100;
    const capGap = calculateAvg('capGap', 'p1') / 10 * 100;
    const legacy = calculateAvg('legacyBurden', 'p1');
    const voiceSup = calculateAvg('voiceSuppression', 'p4') / 10 * 100;
    const targets = (10 - calculateAvg('targetClarity', 'p1')) / 10 * 100;

    return [
      { subject: 'Burnout Risk',   A: Math.round(burnout) },
      { subject: 'Target Deficit', A: Math.round(targets) },
      { subject: 'Cap. Friction',  A: Math.round(capGap) },
      { subject: 'Legacy Burden',  A: Math.round(legacy) },
      { subject: 'Voice Suppression', A: Math.round(voiceSup) },
      { subject: 'Mgr Blind-Spot', A: Math.round(blindspot) },
    ];
  }, [workerDiags, supervisorData]);

  if (workerDiags.length === 0) return (
    <div className="rounded-2xl p-10 text-center border border-dashed border-white/10" style={{ background: 'var(--bg-card)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <p className="text-xs text-white/40 uppercase tracking-widest">Scanning System Risks...</p>
    </div>
  );

  return (
    <div className="rounded-2xl p-5 h-full flex flex-col"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #fb923c', boxShadow: 'var(--shadow-md)' }}>
  
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={13} style={{ color: '#fb923c' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>System Risk Radar</span>
        </div>
        <span className="badge badge-amber">6 Dimensions</span>
      </div>
  
      {/* Chart */}
      <div style={{ minHeight: 240 }}>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 9.5, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="A" stroke="#fb923c" fill="#fb923c" fillOpacity={0.14} strokeWidth={1.5} isAnimationActive />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
  
      {/* Score grid */}
      <div className="grid grid-cols-2 gap-1.5 mt-3">
        {radarData.map(d => (
          <div key={d.subject} className="flex items-center justify-between px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-1)' }}>
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              {d.subject}
            </span>
            <span className="data-sm" style={{ color: score(d.A) }}>{d.A}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskRadar;

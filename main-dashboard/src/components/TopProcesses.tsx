import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Users, Activity, Medal } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

const scoreColor = (v: number) =>
  v >= 80 ? '#34d399' : v >= 60 ? '#38bdf8' : v >= 40 ? '#fb923c' : '#f43f5e';

const ProgressBar: React.FC<{ value: number; color: string; delay?: number }> = ({ value, color, delay = 0 }) => (
  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
    <motion.div
      className="h-full rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  </div>
);

const MedalIcon: React.FC<{ rank: number }> = ({ rank }) => {
  const colors = ['#fbbf24', '#94a3b8', '#d97706'];
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: rank * 0.15 }}
      whileHover={{ scale: 1.1 }}
      className="flex items-center justify-center w-10 h-10 rounded-lg cursor-default"
      style={{ background: `${colors[rank]}15` }}
    >
      <Medal size={20} style={{ color: colors[rank] }} />
    </motion.div>
  );
};

const StatBadge: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = '#fff' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="text-center"
  >
    <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-sm font-bold font-mono"
      style={{ color: color || 'inherit' }}
    >
      {value}
    </motion.p>
  </motion.div>
);

const TopProcesses: React.FC = () => {
  const { data } = useIntakeData();
  
  const processes = React.useMemo(() => {
    const diags = data?.all_diagnostics || [];
    const workers = diags.filter((d: any) => d.type === 'worker');
    if (workers.length === 0) return [];
    
    const deptMap: Record<string, {
      totalEnthusiasm: number;
      totalCapGap: number;
      totalMeetings: number;
      totalBurnout: number;
      count: number;
      name: string;
    }> = {};
    
    workers.forEach((w: any) => {
      const dept = w.department_name || w.dept || 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { totalEnthusiasm: 0, totalCapGap: 0, totalMeetings: 0, totalBurnout: 0, count: 0, name: dept };
      }
      const p1 = w.payload?.p1 || w.p1 || {};
      const p4 = w.payload?.p4 || w.p4 || {};
      
      deptMap[dept].totalEnthusiasm += (p1.enthusiasm || p4.enthusiasm || 10);
      deptMap[dept].totalCapGap += (p1.capGap || p1.capabilityGap || 5);
      deptMap[dept].totalMeetings += (p4.meetingRatio || 50);
      deptMap[dept].totalBurnout += (p1.burnout || 2);
      deptMap[dept].count++;
    });
    
    return Object.values(deptMap).map((dept, i) => {
      const avgEnthusiasm = dept.totalEnthusiasm / dept.count;
      const avgCapGap = dept.totalCapGap / dept.count;
      const avgMeetings = dept.totalMeetings / dept.count;
      
      const engagement = Math.round((avgEnthusiasm / 21) * 100);
      const efficiency = Math.round(Math.max(0, 100 - (avgCapGap * 8) - (avgMeetings * 0.3)));
      const hsi = Math.round(engagement * 0.35 + efficiency * 0.65);
      
      const generateInsight = () => {
        const positives: string[] = [];
        const negatives: string[] = [];
        
        if (engagement >= 70) positives.push('high engagement');
        else if (engagement < 50) negatives.push('low engagement');
        
        if (efficiency >= 70) positives.push('efficient');
        else if (efficiency < 50) negatives.push('inefficient');
        
        if (avgCapGap <= 3) positives.push('good capabilities');
        else if (avgCapGap >= 6) negatives.push('skill gaps');
        
        if (negatives.length === 0 && positives.length >= 2) {
          return `Top performer: ${positives.join(', ')}`;
        } else if (negatives.length >= 2) {
          return `Needs attention: ${negatives.join(', ')}`;
        } else if (negatives.length > 0) {
          return `${positives.join(', ')} but ${negatives.join(', ')}`;
        }
        return `Solid performance: ${positives.join(', ')}`;
      };
      
      return {
        id: i + 1,
        name: dept.name,
        hsi,
        engagement,
        efficiency,
        people: dept.count,
        insight: generateInsight(),
      };
    }).sort((a, b) => b.hsi - a.hsi).slice(0, 3);
  }, [data]);
  
  if (processes.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center border border-dashed border-white/10" style={{ background: 'var(--bg-card)' }}>
        <Activity size={28} className="mx-auto mb-3 text-white/20" />
        <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Awaiting Process Data</p>
      </div>
    );
  }
  
  const avgHsi = Math.round(processes.reduce((s, p) => s + p.hsi, 0) / processes.length);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-1)',
      }}
    >
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(56,189,248,0.1)' }}
          >
            <GitBranch size={16} style={{ color: '#38bdf8' }} />
          </motion.div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Top 3 processes</h2>
            <p className="text-[10px] text-white/40">By HSI score</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <StatBadge label="Avg HSI" value={avgHsi} color={scoreColor(avgHsi)} />
          <div className="w-px h-8 bg-white/10" />
          <StatBadge label="Total" value={`${processes.reduce((s, p) => s + p.people, 0)} people`} />
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-3">
          {processes.map((proc, i) => {
            return (
              <motion.div
                key={proc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.04)' }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-5 px-4 py-3 rounded-xl cursor-pointer relative group"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }}
              >
                {/* Tooltip */}
                <div className="absolute left-4 bottom-full mb-2 px-3 py-2 rounded-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        maxWidth: '220px',
                    }}>
                    {proc.insight}
                    <div className="absolute left-4 -bottom-1 w-2 h-2 rotate-45" style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                <MedalIcon rank={i} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[13px] font-semibold text-white truncate">{proc.name}</h3>
                    <span className="text-[11px] font-mono font-bold" style={{ color: scoreColor(proc.hsi) }}>HSI {proc.hsi}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-white/40">Engagement</span>
                        <span className="font-mono" style={{ color: scoreColor(proc.engagement) }}>{proc.engagement}%</span>
                      </div>
                      <ProgressBar value={proc.engagement} color={scoreColor(proc.engagement)} delay={i * 0.1 + 0.3} />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-white/40">Efficiency</span>
                        <span className="font-mono" style={{ color: scoreColor(proc.efficiency) }}>{proc.efficiency}%</span>
                      </div>
                      <ProgressBar value={proc.efficiency} color={scoreColor(proc.efficiency)} delay={i * 0.1 + 0.4} />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-white/50">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} />
                    <span className="text-[11px] font-mono">{proc.people}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default TopProcesses;

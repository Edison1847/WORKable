import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import useIntakeData from '../hooks/useIntakeData';

interface Opportunity {
  id: number;
  role: string;
  department: string;
  issue: string;
  cur: number;
  opt: number;
  gain: string;
  activities: string[];
}

const GreenRowsOpportunity: React.FC = () => {
  const { data, loading } = useIntakeData();

  const { opportunities, totalUpside } = useMemo(() => {
    if (!data?.all_diagnostics || data.all_diagnostics.length === 0) {
      return { opportunities: [], totalUpside: 0 };
    }

    const workers = data.all_diagnostics.filter((d: any) => d.type === 'worker');
    
    // Find "green row" opportunities - high energy + high skill match activities
    // that have low time allocation
    const opps: Opportunity[] = [];
    let oppId = 1;

    // Helper to parse skill match
    const isHighSkillMatch = (skillMatch: any): boolean => {
      const val = typeof skillMatch === 'string' ? parseInt(skillMatch) : skillMatch;
      return val >= 4;
    };

    // Find high potential / low allocation opportunities
    workers.forEach((w: any) => {
      const acts = w.payload?.activityDetails || w.activityDetails || [];
      const dept = w.department_name || w.department || 'General';
      const role = w.role || w.jobRole || 'Team Member';

      acts.forEach((a: any) => {
        const energyVal = typeof a.energy === 'string' ? parseInt(a.energy) : a.energy;
        
        // Green row: high energy (>=4) + high skill match (>=4) + low contribution
        if (energyVal >= 4 && isHighSkillMatch(a.skillMatch) && a.contrib === 'Low') {
          const currentAllocation = a.percentTime || 10;
          const optimalAllocation = Math.min(currentAllocation * 3, 75);
          const gain = ((optimalAllocation - currentAllocation) / 100) * 75000;

          const existing = opps.find(o => o.role === role && o.department === dept);
          if (!existing) {
            opps.push({
              id: oppId++,
              role: role.length > 25 ? role.substring(0, 25) + '...' : role,
              department: dept,
              issue: 'High Potential – Low Allocation',
              cur: currentAllocation,
              opt: Math.round(optimalAllocation),
              gain: `+$${(gain / 1000).toFixed(0)}k`,
              activities: [a.name || a.activityName || 'Activity'],
            });
          } else {
            existing.activities.push(a.activityName || 'Activity');
            const currentGain = parseInt(existing.gain.replace(/[^0-9]/g, ''));
            existing.gain = `+$${(currentGain + (gain / 1000)).toFixed(0)}k`;
          }
        }
      });
    });

    // Also find skill underutilization (high skill match, low energy means misalignment)
    workers.forEach((w: any) => {
      const acts = w.payload?.activityDetails || w.activityDetails || [];
      const dept = w.department_name || w.department || 'General';
      const role = w.role || w.jobRole || 'Team Member';

      acts.forEach((a: any) => {
        const energyVal = typeof a.energy === 'string' ? parseInt(a.energy) : a.energy;
        
        if (isHighSkillMatch(a.skillMatch) && energyVal <= 2 && a.percentTime > 20) {
          const currentAllocation = a.percentTime || 30;
          const optimalAllocation = Math.max(currentAllocation * 0.5, 10);
          const gain = ((currentAllocation - optimalAllocation) / 100) * 50000;

          const existing = opps.find(o => o.role === role && o.department === dept && o.issue.includes('Skill'));
          if (!existing) {
            opps.push({
              id: oppId++,
              role: role.length > 25 ? role.substring(0, 25) + '...' : role,
              department: dept,
              issue: 'Skill Underutilisation',
              cur: currentAllocation,
              opt: Math.round(optimalAllocation),
              gain: `+$${(gain / 1000).toFixed(0)}k`,
              activities: [a.name || a.activityName || 'Activity'],
            });
          } else {
            existing.activities.push(a.activityName || 'Activity');
            const currentGain = parseInt(existing.gain.replace(/[^0-9]/g, ''));
            existing.gain = `+$${(currentGain + (gain / 1000)).toFixed(0)}k`;
          }
        }
      });
    });

    // Sort by gain (highest first) and take top 3
    const sortedOpps = opps
      .sort((a, b) => parseInt(b.gain.replace(/[^0-9]/g, '')) - parseInt(a.gain.replace(/[^0-9]/g, '')))
      .slice(0, 3);

    const totalGain = sortedOpps.reduce((sum, o) => sum + parseInt(o.gain.replace(/[^0-9]/g, '')), 0);

    return { opportunities: sortedOpps, totalUpside: totalGain };
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: '#34d399' }} />
        <span className="text-xs text-gray-500">Analyzing opportunities...</span>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={13} style={{ color: '#34d399' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Value Opportunities</span>
          <span className="badge badge-green">Live</span>
        </div>
        <p className="text-xs text-gray-500 text-center py-4">
          No significant optimization opportunities detected. Current allocation appears optimal.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid rgba(52,211,153,0.15)', boxShadow: 'var(--shadow-md)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={13} style={{ color: '#34d399' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Value Opportunities</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>— high-potential reallocations</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green">Live</span>
          <span className="text-[11px] font-bold" style={{ color: '#34d399' }}>+${totalUpside}k / yr upside</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {opportunities.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="relative p-5 group cursor-pointer overflow-hidden"
            style={{
              borderRight: i < opportunities.length - 1 ? '1px solid var(--border-1)' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.03)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)' }} />

            <div className="relative z-10">
              {/* Role header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{o.role}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{o.department}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#34d399' }}>{o.issue}</p>
                </div>
                <ArrowRight size={13} style={{ color: '#34d399', flexShrink: 0 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </div>

              {/* Allocation visual */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="eyebrow">Current</span>
                  <span className="eyebrow">Optimal</span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}>
                  {/* Optimal fill */}
                  <motion.div className="absolute inset-y-0 left-0 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${o.opt}%` }}
                    transition={{ duration: 0.9, delay: i * 0.1 }}
                    style={{ background: 'rgba(52,211,153,0.15)' }} />
                  {/* Current fill */}
                  <motion.div className="absolute inset-y-0 left-0 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${o.cur}%` }}
                    transition={{ duration: 0.65, delay: i * 0.1 }}
                    style={{ background: 'linear-gradient(90deg, #34d399, #6ee7b7)', boxShadow: '0 0 8px rgba(52,211,153,0.5)' }} />
                  {/* Optimal marker */}
                  <div className="absolute top-0 bottom-0 w-px"
                    style={{ left: `${o.opt}%`, background: 'rgba(52,211,153,0.5)' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="data-sm" style={{ color: 'var(--text-secondary)' }}>{o.cur}%</span>
                  <span className="data-sm" style={{ color: '#34d399' }}>{o.opt}%</span>
                </div>
              </div>

              {/* Activities */}
              {o.activities.length > 0 && (
                <div className="mb-2">
                  <p className="text-[8px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    Affected Activities
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {o.activities.slice(0, 2).map((act, idx) => (
                      <span key={idx} className="text-[8px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                        {act.length > 20 ? act.substring(0, 20) + '...' : act}
                      </span>
                    ))}
                    {o.activities.length > 2 && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        +{o.activities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Gain */}
              <div>
                <p className="eyebrow mb-0.5">Annual potential</p>
                <p className="data-lg" style={{ color: '#34d399', textShadow: '0 0 12px rgba(52,211,153,0.3)' }}>{o.gain}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GreenRowsOpportunity;

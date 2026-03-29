import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';

const opps = [
  { id: 1, role: 'Senior Developer', issue: 'High Value – Low Time Allocation',  cur: 12, opt: 40, gain: '+$210k' },
  { id: 2, role: 'Product Manager',  issue: 'Under-Supported Critical Work',      cur: 25, opt: 60, gain: '+$185k' },
  { id: 3, role: 'Data Scientist',   issue: 'Skill Underutilisation',              cur: 30, opt: 75, gain: '+$140k' },
];

const GreenRowsOpportunity: React.FC = () => (
  <div className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bg-card)', border: '1px solid rgba(52,211,153,0.15)', boxShadow: 'var(--shadow-md)' }}>

    {/* Header */}
    <div className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: '1px solid var(--border-1)' }}>
      <div className="flex items-center gap-2">
        <TrendingUp size={13} style={{ color: '#34d399' }} />
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Value Opportunities</span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>— underutilised high-value roles</span>
      </div>
      <span className="badge badge-green">+$535k / yr upside</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3">
      {opps.map((o, i) => (
        <motion.div
          key={o.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="relative p-5 group cursor-pointer overflow-hidden"
          style={{
            borderRight: i < opps.length - 1 ? '1px solid var(--border-1)' : 'none',
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
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{o.issue}</p>
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

export default GreenRowsOpportunity;

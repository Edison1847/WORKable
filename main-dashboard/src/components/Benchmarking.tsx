import React from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, AlertOctagon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import FutureStateEngine from './FutureStateEngine';
import EconomicStressCorrelator from './EconomicStressCorrelator';
import InnovationPotential from './InnovationPotential';
import PeerPlaybook from './PeerPlaybook';
import IndustryDiscourseLayer from './IndustryDiscourseLayer';
import EmployerBrandHealth from './EmployerBrandHealth';

const benchmarks = [
  { metric: 'Wasted Salary Ratio', ourScore: '14.2%', industryAvg: '18.5%', status: 'better', impact: '+$840k', label: 'Advantage', delta: '−4.3pp', bar: 77 },
  { metric: 'Burnout Risk Index',  ourScore: '28%',   industryAvg: '22%',   status: 'worse',  impact: '−$1.2M', label: 'Exposure',  delta: '+6pp',   bar: 28 },
  { metric: 'Manager Blind-Spot',  ourScore: '31%',   industryAvg: '35%',   status: 'better', impact: '+4%',    label: 'Alignment', delta: '−4pp',   bar: 89 },
];

const Benchmarking: React.FC = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">

    {/* [HIDDEN] Row 1: Industry Norm Deviation + Talent Movement — hardcoded benchmark/market data */}
    {false && <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Industry Norm Deviation */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #38bdf8', boxShadow: 'var(--shadow-md)' }}>

        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <Globe size={13} style={{ color: '#38bdf8' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Industry Norm Deviation</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border-1)' }}>
          {benchmarks.map((b, i) => {
            const good = b.status === 'better';
            const c = good ? '#34d399' : '#f43f5e';
            return (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="px-5 py-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: good ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)' }}>
                      {good ? <ArrowUpRight size={11} style={{ color: '#34d399' }} /> : <ArrowDownRight size={11} style={{ color: '#f43f5e' }} />}
                    </div>
                    <span className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{b.metric}</span>
                  </div>
                  <span className="badge" style={{
                    background: good ? 'rgba(52,211,153,0.08)' : 'rgba(244,63,94,0.08)',
                    color: c, border: `1px solid ${c}28`,
                  }}>{b.delta}</span>
                </div>
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="data-md" style={{ color: c }}>{b.ourScore}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>vs industry avg</span>
                  <span className="data-sm" style={{ color: 'var(--text-muted)' }}>{b.industryAvg}</span>
                </div>
                <div className="progress-track">
                  <motion.div className="progress-fill"
                    initial={{ width: 0 }} animate={{ width: `${b.bar}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ background: `linear-gradient(90deg, ${c}88, ${c})`, boxShadow: `0 0 6px ${c}44` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>Percentile rank</span>
                  <span className="eyebrow" style={{ color: c }}>{b.impact} {b.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Talent Movement Intelligence */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #fb923c', boxShadow: 'var(--shadow-md)' }}>

        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
          <TrendingUp size={13} style={{ color: '#fb923c' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Talent Movement Intelligence</span>
        </div>

        <div className="p-5 space-y-3">
          {[
            {
              icon: AlertOctagon,
              color: '#f43f5e',
              title: 'Competitor Aggression Detected',
              body: <>
                <span className="font-semibold text-white">Fintech Innovators LLC</span> increased targeted recruitment for Senior Data Engineers by{' '}
                <span className="font-semibold" style={{ color: '#f43f5e' }}>400%</span> in 14 days — overlapping our highest-capability cohort.{' '}
                <span className="font-semibold text-white">12 individuals</span> require retention intervention.
              </>,
              badge: '⚠ Urgent',
              badgeColor: '#f43f5e',
            },
            {
              icon: Globe,
              color: '#38bdf8',
              title: 'External Employer Brand Gap',
              body: <>
                Internal HSI shows culture strengthening{' '}
                <span className="font-semibold" style={{ color: '#34d399' }}>(+4.2)</span>, but Glassdoor sentiment declined{' '}
                <span className="font-semibold" style={{ color: '#f43f5e' }}>(−1.1)</span> citing Role Ambiguity — conflicting with Q5 internal metrics.
              </>,
              badge: '○ Monitor',
              badgeColor: '#38bdf8',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-xl p-4"
                style={{ background: `${item.color}06`, border: `1px solid ${item.color}18` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color: item.color, flexShrink: 0 }} />
                    <p className="text-[12px] font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</p>
                  </div>
                  <span className="text-[9px] font-bold shrink-0" style={{ fontFamily: 'var(--font-mono)', color: item.badgeColor }}>{item.badge}</span>
                </div>
                <p className="text-[11px] leading-relaxed pl-5" style={{ color: 'var(--text-secondary)' }}>{item.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>}

    {/* [HIDDEN] Row 2: Future State Engine — hardcoded projection data */}
    {false && <FutureStateEngine />}

    {/* [HIDDEN] Row 3: Economic Stress Correlator + Innovation Potential — hardcoded macro data */}
    {false && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EconomicStressCorrelator />
        <InnovationPotential />
      </div>
    )}

    {/* [HIDDEN] Row 4: Peer Playbook + Industry Discourse Layer — hardcoded peer/discourse data */}
    {false && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PeerPlaybook />
        <IndustryDiscourseLayer />
      </div>
    )}

    {/* [HIDDEN] Row 5: Employer Brand Health — hardcoded brand sentiment data */}
    {false && <EmployerBrandHealth />}

  </motion.div>
);

export default Benchmarking;

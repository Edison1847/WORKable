import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, TrendingUp, Clock, Building } from 'lucide-react';

const plays = [
  {
    company: 'SaaS Co. (Series C, 280 staff)',
    signal: 'High Friction + Low Motivation',
    action: 'Eliminated 3 weekly all-hands; replaced with async signal digest. Redesigned approval chains from 4 steps to 2.',
    outcome: 'Friction signal −38% within 1 cycle. Motivation recovered +14pts over 2 cycles.',
    timeToImpact: '1 cycle',
    outcomeColor: '#34d399',
    similarity: 94,
  },
  {
    company: 'FinServ Mid-Market (410 staff)',
    signal: 'Burnout Risk >60% + High Time Waste',
    action: 'Mandatory recovery buffer policy: 20% protected deep-work time. Reduced meeting load by 30% via AI scheduling.',
    outcome: 'Burnout index dropped from 64% to 41% in 2 cycles. Wasted salary recovered $640K/yr.',
    timeToImpact: '2 cycles',
    outcomeColor: '#34d399',
    similarity: 88,
  },
  {
    company: 'Professional Services (190 staff)',
    signal: 'Perception Gap >35pts + Voice Suppression rising',
    action: 'Anonymous signal review sessions with facilitators. Manager blind-spot coaching for top 8 managers.',
    outcome: 'Perception gap closed to 18pts. Voice suppression index fell from 58% to 34% in 3 cycles.',
    timeToImpact: '3 cycles',
    outcomeColor: '#38bdf8',
    similarity: 81,
  },
];

const PeerPlaybook: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', borderLeft: '2px solid #34d399', boxShadow: 'var(--shadow-md)' }}>

      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-2">
          <BookOpen size={13} style={{ color: '#34d399' }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Peer Playbook</span>
        </div>
        <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>What similar companies did</span>
      </div>

      <div className="p-5 space-y-3">
        {plays.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-1)' }}>

            {/* Header */}
            <button className="w-full flex items-center gap-3 p-3.5 text-left"
              style={{ background: expanded === i ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)' }}
              onClick={() => setExpanded(expanded === i ? null : i)}>
              <Building size={12} style={{ color: '#34d399', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>{p.company}</p>
                <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Signal: {p.signal}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ fontFamily: 'var(--font-mono)', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                  {p.similarity}% match
                </span>
                <ChevronRight size={12} style={{ color: 'var(--text-muted)', transform: expanded === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </button>

            <AnimatePresence>
              {expanded === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border-1)' }}>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="eyebrow mb-1.5" style={{ color: '#38bdf8' }}>Action Taken</p>
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.action}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 rounded-lg p-2.5" style={{ background: `${p.outcomeColor}08`, border: `1px solid ${p.outcomeColor}1a` }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp size={10} style={{ color: p.outcomeColor }} />
                          <p className="eyebrow" style={{ color: p.outcomeColor }}>Outcome</p>
                        </div>
                        <p className="text-[9px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.outcome}</p>
                      </div>
                      <div className="rounded-lg p-2.5 text-center shrink-0" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', minWidth: 72 }}>
                        <Clock size={10} style={{ color: '#a78bfa', margin: '0 auto 4px' }} />
                        <p className="text-[10px] font-bold" style={{ color: '#a78bfa', fontFamily: 'var(--font-display)' }}>{p.timeToImpact}</p>
                        <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>impact</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PeerPlaybook;
